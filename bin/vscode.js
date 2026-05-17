// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
import { execFileSync } from 'child_process'
import { existsSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const EXTENSION_ID = 'SAP-samples.hana-cli'
const VSIX_DIR = join(__dirname, '..', 'vscode-extension')
const IS_WINDOWS = process.platform === 'win32'

export const command = 'vscode [action]'
export const aliases = ['code', 'extension']
export const describe = baseLite.bundle.getText("vscode")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  insiders: {
    type: 'boolean',
    default: false,
    desc: 'Use code-insiders instead of code'
  }
}, false))
  .positional('action', {
    describe: 'Action to perform',
    choices: ['install', 'uninstall', 'status'],
    default: 'status'
  })
  .example('hana-cli vscode status', 'Check if the extension is installed')
  .example('hana-cli vscode install', 'Install the extension from local .vsix or show marketplace instructions')
  .example('hana-cli vscode uninstall', 'Uninstall the extension')
  .epilog(buildDocEpilogue('vscode', 'developer-tools', []))

export let inputPrompts = {}

/**
 * Execute a command safely using execFileSync.
 * On Windows, VS Code ships as .cmd scripts which require cmd.exe to run.
 * We invoke cmd.exe /c <command> <args> to avoid shell injection while
 * supporting .cmd wrappers. Arguments are passed as an array (no string concat).
 * @param {string} cmd - The command name (e.g., 'code')
 * @param {string[]} args - Command arguments
 * @param {object} [options] - execFileSync options
 * @returns {string}
 */
function runCmd(cmd, args, options = {}) {
  const opts = { encoding: 'utf-8', stdio: 'pipe', timeout: 30000, ...options }
  if (IS_WINDOWS) {
    // On Windows, invoke via cmd.exe /c to support .cmd wrappers
    return /** @type {string} */ (execFileSync(
      process.env.ComSpec || 'cmd.exe',
      ['/c', cmd, ...args],
      opts
    ))
  }
  return /** @type {string} */ (execFileSync(cmd, args, opts))
}

/**
 * Detect the VS Code CLI executable.
 * Tries: code-insiders (if --insiders), code, codium, code-insiders
 * @param {boolean} preferInsiders
 * @returns {string|null}
 */
function detectCodeCli(preferInsiders) {
  const candidates = preferInsiders
    ? ['code-insiders', 'code', 'codium']
    : ['code', 'codium', 'code-insiders']

  for (const candidate of candidates) {
    try {
      runCmd(candidate, ['--version'], { timeout: 10000 })
      return candidate
    } catch {
      // not found or not working, try next
    }
  }
  return null
}

/**
 * Find a .vsix file in the vscode-extension directory.
 * @returns {string|null}
 */
function findVsix() {
  if (!existsSync(VSIX_DIR)) return null
  const files = readdirSync(VSIX_DIR)
  const vsix = files.find(f => f.endsWith('.vsix'))
  return vsix ? join(VSIX_DIR, vsix) : null
}

export function handler(argv) {
  const action = argv.action || 'status'
  const codeCli = detectCodeCli(argv.insiders)

  if (!codeCli) {
    console.log('Could not find VS Code CLI (code, codium, or code-insiders) in PATH.')
    console.log('')
    console.log('Manual instructions:')
    console.log('  1. Open VS Code')
    console.log('  2. Go to Extensions (Ctrl+Shift+X)')
    console.log(`  3. Search for "${EXTENSION_ID}"`)
    console.log('  4. Click Install')
    console.log('')
    console.log('Or install the VS Code CLI:')
    console.log('  VS Code > Command Palette > "Shell Command: Install \'code\' command in PATH"')
    return
  }

  switch (action) {
    case 'install':
      installExtension(codeCli)
      break
    case 'uninstall':
      uninstallExtension(codeCli)
      break
    case 'status':
      checkStatus(codeCli)
      break
  }
}

/**
 * Install the extension from a local .vsix or show marketplace instructions.
 * @param {string} codeCli
 */
function installExtension(codeCli) {
  const vsixPath = findVsix()
  if (vsixPath) {
    console.log(`Installing extension from: ${vsixPath}`)
    try {
      const output = runCmd(codeCli, ['--install-extension', vsixPath])
      console.log(output.trim())
      console.log('Extension installed successfully.')
    } catch (err) {
      console.error(`Failed to install extension: ${err.message}`)
    }
  } else {
    console.log('No local .vsix file found in vscode-extension/ directory.')
    console.log('')
    console.log('To install from the marketplace:')
    console.log(`  ${codeCli} --install-extension ${EXTENSION_ID}`)
    console.log('')
    console.log('Or build the .vsix locally:')
    console.log('  cd vscode-extension && npm install && npx vsce package')
  }
}

/**
 * Uninstall the extension.
 * @param {string} codeCli
 */
function uninstallExtension(codeCli) {
  console.log(`Uninstalling extension: ${EXTENSION_ID}`)
  try {
    const output = runCmd(codeCli, ['--uninstall-extension', EXTENSION_ID])
    console.log(output.trim())
    console.log('Extension uninstalled successfully.')
  } catch (err) {
    console.error(`Failed to uninstall extension: ${err.message}`)
  }
}

/**
 * Check if the extension is installed.
 * @param {string} codeCli
 */
function checkStatus(codeCli) {
  try {
    const output = runCmd(codeCli, ['--list-extensions', '--show-versions'])
    const lines = output.split('\n')
    const match = lines.find(line => line.toLowerCase().includes('hana-cli'))
    if (match) {
      console.log(`Extension installed: ${match.trim()}`)
    } else {
      console.log('Extension is not installed.')
      console.log(`  To install: hana-cli vscode install`)
    }
  } catch (err) {
    console.error(`Failed to check extension status: ${err.message}`)
  }
}
