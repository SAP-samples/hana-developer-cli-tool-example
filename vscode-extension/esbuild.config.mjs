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

// utils/base.js and utils/base-lite.js load @sap/textbundle via a
// createRequire(import.meta.url) require:
//   const require = createRequire(import.meta.url)
//   const TextBundle = require('@sap/textbundle').TextBundle
// esbuild does NOT trace createRequire()-based requires into the bundle — it
// emits them as runtime require("@sap/textbundle") calls resolved against the
// bundle's own location. The installed .vsix ships no node_modules, so that
// runtime require throws MODULE_NOT_FOUND at module-load time, before
// activate() runs → extension stuck "Activating…", every command "not found".
// (This masked itself in local testing because loading from vscode-extension/
// resolves up into the parent project's node_modules.)
// Fix: rewrite that specific require into a static ESM import so esbuild pulls
// @sap/textbundle into the bundle. Source files are untouched — createRequire
// is correct when the same modules run from the CLI.
const bundleTextBundlePlugin = {
  name: 'bundle-textbundle',
  setup(build) {
    build.onLoad({ filter: /[\\/]utils[\\/]base(-lite)?\.js$/ }, async (args) => {
      let contents = fs.readFileSync(args.path, 'utf8')
      if (contents.includes("require('@sap/textbundle')")) {
        contents =
          "import { TextBundle as __ESBUILD_TextBundle } from '@sap/textbundle'\n" +
          contents.replace(
            /const\s+TextBundle\s*=\s*require\('@sap\/textbundle'\)\.TextBundle/g,
            'const TextBundle = __ESBUILD_TextBundle'
          )
      }
      return { contents, loader: 'js', resolveDir: path.dirname(args.path) }
    })
  },
}

// terminal-kit is a CLI-only dependency used for fancy table/progress-bar
// output in the terminal. utils/base.js has a STATIC top-level
// `import terminalKit from 'terminal-kit'` which fires at module load. The
// extension bundle pulls base.js in via the routes chain, so that require
// runs during activate(). Marking terminal-kit `external` (it can't be
// bundled — its package ships a README without extension that esbuild can't
// parse) means the .vsix, which ships no node_modules, hits an unresolvable
// require('terminal-kit') at load time → activate() never completes →
// "command not found" for every hana-cli.* command. The extension never
// needs terminal output (routes return JSON to the webview), so we resolve
// terminal-kit to a safe stub. base.js reads `terminalKit.terminal`; the stub
// provides a no-op terminal so the happy path works without throwing.
const stubTerminalKitPlugin = {
  name: 'stub-terminal-kit',
  setup(build) {
    build.onResolve({ filter: /^terminal-kit$/ }, () => ({
      path: 'terminal-kit',
      namespace: 'stub-terminal-kit',
    }))
    build.onLoad({ filter: /.*/, namespace: 'stub-terminal-kit' }, () => ({
      contents: `
        const noopProgressBar = () => ({ startItem() {}, itemDone() {}, stop() {} })
        const terminal = { table() {}, progressBar: noopProgressBar }
        export default { terminal }
      `,
      loader: 'js',
    }))
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
    //
    // sqlite3 is optionally require()d by @sap/cds (lib/srv/middlewares/trace.js)
    // but never installed here; keep it external so esbuild leaves the guarded
    // require in place instead of failing the build.
    'sqlite3',
    // better-sqlite3 is a native (.node) module. We force @cap-js/sqlite to use
    // Node's built-in node:sqlite driver (see utils/database/index.js), so the
    // better-sqlite3 require path is never executed at runtime. Marking it
    // external keeps its platform-specific binary out of the bundle, making the
    // .vsix OS-portable (no per-OS rebuild). node:sqlite is a Node builtin and
    // is external automatically.
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
  ],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: !production,
  minify: production,
  treeShaking: true,
  plugins: [resolveRoutesPlugin, stripCLIBootstrapPlugin, dynamicImportPlugin, bundleTextBundlePlugin, stubTerminalKitPlugin],
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
