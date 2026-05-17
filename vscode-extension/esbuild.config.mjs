import * as esbuild from 'esbuild'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const production = process.argv.includes('--production')
const projectRoot = path.resolve(__dirname, '..')

// The route modules in src/server/routes.ts import from '../../routes/*.js'
// which TypeScript preserves as-is (@ts-ignore). From the compiled location
// (out/server/), these paths don't resolve correctly. This plugin redirects
// them to the actual project root routes/ directory.
const resolveRoutesPlugin = {
  name: 'resolve-parent-routes',
  setup(build) {
    build.onResolve({ filter: /^\.\.\/\.\.\/routes\// }, (args) => {
      const routeFile = args.path.replace('../../routes/', '')
      return { path: path.resolve(projectRoot, 'routes', routeFile) }
    })
  },
}

// bin/ modules have a CLI direct-execution block at the bottom that uses
// top-level await (for yargs). This is incompatible with CJS output.
// Routes only use the exported functions, so we strip the bootstrap block.
// Some bin/ files (like tablesSQLite.js, tablesPG.js) have top-level await
// that can't be stripped — these are CLI-only variants never called by routes,
// so we stub them out entirely.
const stripCLIBootstrapPlugin = {
  name: 'strip-cli-bootstrap',
  setup(build) {
    build.onLoad({ filter: /[\\/]bin[\\/].*\.js$/ }, async (args) => {
      let contents = fs.readFileSync(args.path, 'utf8')

      // Strip direct execution blocks:
      //   if (import.meta.url === `file://${process.argv[1]}` ...) { ... }
      const marker = /^if\s*\(\s*import\.meta\.url\s*===\s*[`"']/m
      const idx = contents.search(marker)
      if (idx !== -1) {
        contents = contents.slice(0, idx)
      }

      // If top-level await remains after stripping, this file is a CLI-only
      // variant (e.g. tablesPG.js, tablesSQLite.js) that routes never call.
      // Stub it out to avoid CJS incompatibility.
      // Only match non-indented lines (truly top-level, not inside functions).
      if (/^(?:const|let|var)\s+\w+\s*=\s*await\s/m.test(contents)) {
        contents = '// Stubbed: CLI-only module with top-level await\nexport {}\n'
      }

      return { contents, loader: 'js', resolveDir: path.dirname(args.path) }
    })
  },
}

// Route handlers use dynamic import() with template literals like:
//   await import(`${lib}.js`)  where lib = "../bin/version"
// esbuild can't resolve template-literal imports at build time.
// This plugin rewrites route files to use a static lookup map instead.
const dynamicImportPlugin = {
  name: 'resolve-dynamic-bin-imports',
  setup(build) {
    const routeFiles = ['hanaList.js', 'hanaInspect.js', 'hanaQueryPlan.js']
    const routeFilter = new RegExp(`routes[\\\\/](${routeFiles.join('|')})$`)

    build.onLoad({ filter: routeFilter }, async (args) => {
      let contents = fs.readFileSync(args.path, 'utf8')

      // Collect all bin/ module references from handler call sites
      // Pattern: listHandler(res, "../bin/xxx", 'funcName')
      const binRefs = new Set()
      const utilRefs = new Set()

      // Match handler calls: "../bin/xxx" (without .js extension)
      for (const m of contents.matchAll(/["'](\.\.\/bin\/[^"']+)["']/g)) {
        const ref = m[1]
        if (!ref.endsWith('.js')) {
          binRefs.add(ref)
        }
      }

      // Match static dynamic imports: await import('../bin/xxx.js')
      for (const m of contents.matchAll(/await import\(['"](\.\.\/bin\/[^'"]+\.js)['"]\)/g)) {
        binRefs.add(m[1].replace(/\.js$/, ''))
      }

      // Match dynamic imports of utils: await import('../utils/xxx.js')
      for (const m of contents.matchAll(/await import\(['"](\.\.\/utils\/[^'"]+)\.js['"]\)/g)) {
        utilRefs.add(m[1])
      }

      // Build static import lines and lookup map
      const imports = []
      const mapEntries = []

      for (const ref of binRefs) {
        const modName = ref.replace('../bin/', '')
        const safe = modName.replace(/[^a-zA-Z0-9]/g, '_')
        imports.push(`import * as __bin_${safe} from '${ref}.js'`)
        mapEntries.push(`  '${ref}': __bin_${safe}`)
      }
      for (const ref of utilRefs) {
        const modName = ref.replace('../utils/', '')
        const safe = modName.replace(/[^a-zA-Z0-9]/g, '_')
        imports.push(`import * as __util_${safe} from '${ref}.js'`)
        mapEntries.push(`  '${ref}': __util_${safe}`)
      }

      const preamble = imports.length > 0
        ? `${imports.join('\n')}\nconst __cmdMap = {\n${mapEntries.join(',\n')}\n};\n`
        : ''

      // Replace template-literal dynamic imports with map lookup
      // await import(`${lib}.js`) → (__cmdMap[lib])
      contents = contents.replace(
        /await import\(`\$\{(\w+)\}\.js`\)/g,
        '(__cmdMap[$1])'
      )

      // Replace static-path dynamic imports with map lookup
      // await import('../bin/xxx.js') → (__cmdMap['../bin/xxx'])
      contents = contents.replace(
        /await import\(['"](\.\.\/(?:bin|utils)\/[^'"]+)\.js['"]\)/g,
        (_, modPath) => `(__cmdMap['${modPath}'])`
      )

      return {
        contents: preamble + contents,
        loader: 'js',
        resolveDir: path.dirname(args.path),
      }
    })
  },
}

await esbuild.build({
  entryPoints: ['./out/extension.js'],
  bundle: true,
  outfile: './dist/extension.js',
  external: [
    'vscode',
    // Optional/dynamic dependencies from the parent project's node_modules
    // that are not needed at runtime in the VS Code extension context
    'sqlite3',
    '@cap-js/cds-test',
    '@sap-cloud-sdk/connectivity',
    '@sap-cloud-sdk/http-client',
    '@sap-cloud-sdk/http-client/package.json',
    'tar',
    // terminal-kit has a README file without extension that esbuild
    // cannot parse; it's only used for CLI interactive mode
    'terminal-kit',
  ],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: !production,
  minify: production,
  treeShaking: true,
  plugins: [resolveRoutesPlugin, stripCLIBootstrapPlugin, dynamicImportPlugin],
  // Shim import.meta.url for CJS output — route/util modules use it for __dirname
  banner: {
    js: 'var importMetaUrl = require("url").pathToFileURL(__filename).href;',
  },
  define: {
    'import.meta.url': 'importMetaUrl',
  },
  // Treat non-JS files (like README) that get pulled in as empty
  loader: { '.README': 'empty' },
  logLevel: 'warning',
})
