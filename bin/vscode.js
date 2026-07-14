// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
import { execFileSync } from 'child_process'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'

const __dirname = import.meta.dirname

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

/**
 * Compare two semver-ish version strings numerically.
 * Missing segments are treated as zero (e.g. "1" === "1.0.0").
 * @param {string} a
 * @param {string} b
 * @returns {number} -1 if a<b, 0 if equal, 1 if a>b
 */
export function compareVersions(a, b) {
  const pa = String(a).split('.').map(n => parseInt(n, 10) || 0)
  const pb = String(b).split('.').map(n => parseInt(n, 10) || 0)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

/**
 * Extract the version from a hana-cli .vsix filename or path.
 * @param {string} vsixPath - e.g. "hana-cli-0.1.7.vsix"
 * @returns {string|null} the version string, or null if not found
 */
export function parseVsixVersion(vsixPath) {
  if (!vsixPath) return null
  const match = /(\d+\.\d+\.\d+)\.vsix$/.exec(String(vsixPath))
  return match ? match[1] : null
}

/**
 * Extract the version from a `code --list-extensions --show-versions` line.
 * @param {string} line - e.g. "SAP-samples.hana-cli@0.1.6"
 * @returns {string|null} the version string, or null if not found
 */
export function parseInstalledVersion(line) {
  if (!line) return null
  const idx = line.indexOf('@')
  if (idx === -1) return null
  const version = line.slice(idx + 1).trim()
  return version || null
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
      // --force upgrades an already-installed extension in place (no uninstall needed)
      const output = runCmd(codeCli, ['--install-extension', vsixPath, '--force'])
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
 * Check if the extension is installed, and whether it is up to date
 * relative to the packaged .vsix (the version this hana-cli ships with).
 * @param {string} codeCli
 */
function checkStatus(codeCli) {
  try {
    const output = runCmd(codeCli, ['--list-extensions', '--show-versions'])
    const lines = output.split('\n')
    const match = lines.find(line => line.toLowerCase().includes('hana-cli'))

    const vsixPath = findVsix()
    const packagedVersion = parseVsixVersion(vsixPath || '')

    if (!match) {
      console.log('Extension is not installed.')
      if (packagedVersion) {
        console.log(`  A packaged version (${packagedVersion}) is available.`)
      }
      console.log(`  To install: hana-cli vscode install`)
      return
    }

    const installedVersion = parseInstalledVersion(match)
    console.log(`Extension installed: ${match.trim()}`)

    if (!packagedVersion) {
      // No local .vsix to compare against — installed is all we can report.
      return
    }

    if (!installedVersion) {
      console.log(`  Packaged version available: ${packagedVersion}`)
      return
    }

    const cmp = compareVersions(installedVersion, packagedVersion)
    if (cmp < 0) {
      console.log('')
      console.log(`  Update available: ${installedVersion} -> ${packagedVersion}`)
      console.log(`  To update: hana-cli vscode install`)
    } else if (cmp > 0) {
      console.log(`  Installed version is newer than the packaged .vsix (${packagedVersion}).`)
    } else {
      console.log(`  Up to date (matches packaged version ${packagedVersion}).`)
    }
  } catch (err) {
    console.error(`Failed to check extension status: ${err.message}`)
  }
}
