// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
import { join, resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import { homedir, platform } from 'os'

const __dirname = import.meta.dirname

export const command = 'mcpServerStatus'
export const aliases = ['mcp-status', 'mcpStatus']
export const describe = baseLite.bundle.getText("mcpServerStatus")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({}, false, false)).wrap(160).example(
    'hana-cli mcpServerStatus',
    baseLite.bundle.getText("mcpServerStatusExample")
).epilog(buildDocEpilogue('mcpServerStatus', 'developer-tools', ['mcpServerInstall']))

export async function handler(argv) {
    const base = await import('../utils/base.js')
    base.promptHandler(argv, mcpStatus, {}, false)
}

function getClientTargets() {
    const home = homedir()
    const os = platform()
    const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming')

    function perOS(win, mac, linux) {
        if (os === 'win32') return win
        if (os === 'darwin') return mac
        return linux
    }

    return [
        {
            name: 'Claude Desktop',
            configKey: 'mcpServers',
            path: perOS(
                join(appData, 'Claude', 'claude_desktop_config.json'),
                join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
                join(home, '.config', 'Claude', 'claude_desktop_config.json')
            ),
        },
        {
            name: 'Claude Code (user)',
            configKey: 'mcpServers',
            path: join(home, '.claude.json'),
        },
        {
            name: 'Claude Code (project)',
            configKey: 'mcpServers',
            path: join(process.cwd(), '.mcp.json'),
        },
        {
            name: 'Cursor',
            configKey: 'mcpServers',
            path: perOS(
                join(appData, 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'settings.json'),
                join(home, 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'settings.json'),
                join(home, '.config', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'settings.json')
            ),
        },
        {
            name: 'Windsurf',
            configKey: 'mcpServers',
            path: join(home, '.codeium', 'windsurf', 'mcp_config.json'),
        },
        {
            name: 'Cline (VS Code)',
            configKey: 'mcpServers',
            path: perOS(
                join(appData, 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
                join(home, 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
                join(home, '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
            ),
        },
        {
            name: 'VS Code (user)',
            configKey: 'servers',
            path: perOS(
                join(appData, 'Code', 'User', 'mcp.json'),
                join(home, 'Library', 'Application Support', 'Code', 'User', 'mcp.json'),
                join(home, '.config', 'Code', 'User', 'mcp.json')
            ),
        },
        {
            name: 'VS Code (workspace)',
            configKey: 'servers',
            path: join(process.cwd(), '.vscode', 'mcp.json'),
        },
        {
            name: 'Continue',
            configKey: 'mcpServers',
            path: join(home, '.continue', 'config.json'),
        },
        {
            name: 'Zed',
            configKey: 'context_servers',
            path: perOS(
                join(appData, 'Zed', 'settings.json'),
                join(home, '.config', 'zed', 'settings.json'),
                join(home, '.config', 'zed', 'settings.json')
            ),
        },
    ]
}

function detectHanaCli(serverConfig) {
    const cfg = /** @type {any} */ (serverConfig)
    if (!cfg) return false
    const args = cfg.args || cfg.arguments || []
    if (Array.isArray(args)) {
        return args.some(a => String(a).includes('hana-cli-mcp-server') || String(a).includes('mcp-server'))
    }
    const cmd = cfg.command || cfg.path || ''
    return String(cmd).includes('hana-cli-mcp-server') || String(cmd).includes('mcp-server')
}

export async function mcpStatus() {
    const base = await import('../utils/base.js')
    base.debug('mcpStatus')

    const colors = baseLite.colors

    const mcpServerPath = resolve(__dirname, '..', 'mcp-server', 'build', 'index.js')
    const mcpBuilt = existsSync(mcpServerPath)

    console.log(colors.bold(baseLite.bundle.getText("mcpServerStatusHeader")))
    console.log()
    console.log(`  ${colors.cyan(baseLite.bundle.getText("mcpServerStatusServerPath"))} ${mcpServerPath}`)
    console.log(`  ${colors.cyan(baseLite.bundle.getText("mcpServerStatusBuilt"))} ${mcpBuilt ? colors.green('yes') : colors.red('no')}`)
    console.log()

    const targets = getClientTargets()

    console.log(colors.bold(baseLite.bundle.getText("mcpServerStatusClients")))
    console.log()

    for (const target of targets) {
        const exists = existsSync(target.path)
        let configured = false
        let configuredName = null

        if (exists) {
            try {
                const content = JSON.parse(readFileSync(target.path, 'utf-8'))
                const serversObj = content[target.configKey]
                if (serversObj && typeof serversObj === 'object') {
                    for (const [serverName, serverConfig] of Object.entries(serversObj)) {
                        if (detectHanaCli(serverConfig)) {
                            configured = true
                            configuredName = serverName
                            break
                        }
                    }
                }
            } catch {
                // Parse error
            }
        }

        const statusIcon = configured ? colors.green('●') : (exists ? colors.dim('○') : colors.dim('–'))
        const statusText = configured
            ? colors.green(`${baseLite.bundle.getText("mcpServerStatusConfigured")} (${configuredName})`)
            : (exists ? colors.dim(baseLite.bundle.getText("mcpServerStatusNotConfigured")) : colors.dim(baseLite.bundle.getText("mcpServerStatusNotFound")))

        console.log(`  ${statusIcon} ${colors.cyan(target.name)}`)
        console.log(`    ${statusText}`)
        console.log(`    ${colors.dim(target.path)}`)
        console.log()
    }

    if (!mcpBuilt) {
        console.log(colors.yellow(baseLite.bundle.getText("mcpServerStatusBuildHint")))
        console.log(colors.dim('  cd mcp-server && npm run build'))
        console.log()
    }

    return base.end()
}
