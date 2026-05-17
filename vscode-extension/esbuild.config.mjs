import * as esbuild from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const production = process.argv.includes('--production')

// The route modules in src/server/routes.ts import from '../../routes/*.js'
// which TypeScript preserves as-is (@ts-ignore). From the compiled location
// (out/server/), these paths don't resolve correctly. This plugin redirects
// them to the actual project root routes/ directory.
const resolveRoutesPlugin = {
  name: 'resolve-parent-routes',
  setup(build) {
    build.onResolve({ filter: /^\.\.\/\.\.\/routes\// }, (args) => {
      const routeFile = args.path.replace('../../routes/', '')
      return { path: path.resolve(__dirname, '..', 'routes', routeFile) }
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
  plugins: [resolveRoutesPlugin],
  // Treat non-JS files (like README) that get pulled in as empty
  loader: { '.README': 'empty' },
  logLevel: 'warning',
})
