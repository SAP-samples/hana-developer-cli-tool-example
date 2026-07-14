import * as esbuild from 'esbuild'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const production = process.argv.includes('--production')
const projectRoot = path.resolve(__dirname, '..')

// Copy the built Vue webview assets into the extension so a packaged .vsix is
// self-contained. At runtime htmlProvider prefers vscode-extension/webview-dist
// and only falls back to ../app/vue/dist-vscode when running from source (F5).
// Without this copy, an installed .vsix would resolve to VS Code's extensions
// dir where the sibling app/ tree does not exist → blank webviews.
function copyWebviewAssets() {
  const src = path.resolve(projectRoot, 'app', 'vue', 'dist-vscode')
  const dest = path.resolve(__dirname, 'webview-dist')
  if (!fs.existsSync(path.join(src, 'assets', 'index.js'))) {
    console.warn(
      `[esbuild] Vue webview assets not found at ${src}.\n` +
      `          Run "npm run build:vscode" from the project root first, ` +
      `or the packaged .vsix will have no UI.`
    )
    return
  }
  fs.rmSync(dest, { recursive: true, force: true })
  fs.cpSync(src, dest, { recursive: true })
  console.log(`[esbuild] Copied Vue webview assets → ${dest}`)
}

copyWebviewAssets()

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
    // @sap/cds and its compiler use lazy CommonJS sub-module loading via a
    // `module.require(...)` proxy (see cds.compile.to.* and the openapi getter
    // in bin/inspectTable.js / bin/inspectView.js). When esbuild INLINES these
    // packages, the synthetic CJS module object it substitutes has no working
    // `.require` method, so the proxy throws "TypeError: e.require is not a
    // function" — surfacing as a 500 on every inspect route. Keeping them
    // external leaves the real Node CommonJS loader (with a working
    // module.require) in place. These are SHIPPED inside the .vsix (see
    // package.json dependencies + .vscodeignore) so `require` resolves at
    // runtime from the extension's own node_modules.
    '@sap/cds',
    '@sap/cds-compiler',
    '@sap/cds-dk',
    // Optional/dynamic dependencies from the parent project's node_modules
    // that are not needed at runtime in the VS Code extension context
    //
    // sqlite3 is optionally require()d by @sap/cds (lib/srv/middlewares/trace.js)
    // but never installed here; keep it external so esbuild leaves the guarded
    // require in place instead of failing the build.
    'sqlite3',
    // better-sqlite3 is NOT a dependency of this project and is NOT bundled,
    // shipped, or executed. It is an OPTIONAL peer of @cap-js/sqlite that that
    // package references by name in a driver lookup table
    // (node_modules/@cap-js/sqlite/lib/SQLiteService.js: drivers['better-sqlite3']).
    // esbuild statically sees that string as a require target and would fail the
    // build trying to resolve the (uninstalled) module. Marking it external is a
    // build-time stub only: at runtime we force driver='node' (see
    // utils/database/index.js) so CAP 10's built-in node:sqlite is always used
    // and the better-sqlite3 branch is dead code. Nothing better-sqlite3 ends up
    // in the .vsix.
    'better-sqlite3',
    // generic-pool is an OPTIONAL peer of @cap-js/db-service (CAP 10). Its
    // require() is guarded behind the legacy `use_new_pool === false` path;
    // CAP 10 defaults to the built-in pool, so it is never loaded. Not
    // installed in the tree — keep external so esbuild leaves the guarded
    // require in place instead of failing the build.
    'generic-pool',
    '@cap-js/cds-test',
    '@sap-cloud-sdk/connectivity',
    '@sap-cloud-sdk/http-client',
    '@sap-cloud-sdk/http-client/package.json',
    'tar',
    // terminal-kit stays external: its package ships a README without extension esbuild cannot parse.
    // Lazy Proxy in base.js means it never loads at extension activation, so the console fallback keeps the extension working.
    'terminal-kit',
  ],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: !production,
  minify: production,
  treeShaking: true,
  plugins: [resolveRoutesPlugin, stripCLIBootstrapPlugin, dynamicImportPlugin],
  // Shim import.meta.url/dirname/filename for CJS output — route/util modules use it for __dirname
  banner: {
    js: 'var importMetaUrl = require("url").pathToFileURL(__filename).href;var importMetaDirname = __dirname;var importMetaFilename = __filename;',
  },
  define: {
    'import.meta.url': 'importMetaUrl',
    // CJS output: bundled source uses import.meta.dirname/filename (Node 20.11+).
    // esbuild does not auto-shim these for CJS, so map them to banner variables.
    // We cannot use '__dirname'/'__filename' directly here because esbuild renames
    // local `const __dirname = import.meta.dirname` declarations — the define
    // replacement would produce `const __dirname = __dirname` (self-reference,
    // evals to undefined). Instead we use stable banner variable names that are
    // never renamed by esbuild's minifier.
    'import.meta.dirname': 'importMetaDirname',
    'import.meta.filename': 'importMetaFilename',
  },
  // Treat non-JS files (like README) that get pulled in as empty
  loader: { '.README': 'empty' },
  logLevel: 'warning',
})
