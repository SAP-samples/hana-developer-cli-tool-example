// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { homedir, platform } from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ALL_CLIENT_IDS = ['claude-desktop', 'claude-code', 'cursor', 'windsurf', 'cline', 'vscode', 'continue', 'zed']

/**
 * Client descriptor: declares config file path(s) per OS and the JSON key used for MCP servers.
 * Most clients use { "mcpServers": { name: config } }.
 * VS Code uses { "servers": { name: config } } in a dedicated mcp.json.
 * Zed uses { "context_servers": { name: config } } inside settings.json.
 */
function getClientDescriptors(useGlobal) {
    const home = homedir()
    const os = platform()
    const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming')

    function perOS(win, mac, linux) {
        if (os === 'win32') return win
        if (os === 'darwin') return mac
        return linux
    }

    return {
        'claude-desktop': {
            label: 'Claude Desktop',
            configKey: 'mcpServers',
            path: perOS(
                join(appData, 'Claude', 'claude_desktop_config.json'),
                join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
                join(home, '.config', 'Claude', 'claude_desktop_config.json')
            ),
        },
        'claude-code': {
            label: useGlobal ? 'Claude Code (user)' : 'Claude Code (project)',
            configKey: 'mcpServers',
            path: useGlobal
                ? join(home, '.claude.json')
                : join(process.cwd(), '.mcp.json'),
        },
        'cursor': {
            label: 'Cursor',
            configKey: 'mcpServers',
            path: perOS(
                join(appData, 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'settings.json'),
                join(home, 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'settings.json'),
                join(home, '.config', 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'settings.json')
            ),
        },
        'windsurf': {
            label: 'Windsurf',
            configKey: 'mcpServers',
            path: join(home, '.codeium', 'windsurf', 'mcp_config.json'),
        },
        'cline': {
            label: 'Cline (VS Code)',
            configKey: 'mcpServers',
            path: perOS(
                join(appData, 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
                join(home, 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
                join(home, '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
            ),
        },
        'vscode': {
            label: useGlobal ? 'VS Code (user)' : 'VS Code (workspace)',
            configKey: 'servers',
            path: useGlobal
                ? perOS(
                    join(appData, 'Code', 'User', 'mcp.json'),
                    join(home, 'Library', 'Application Support', 'Code', 'User', 'mcp.json'),
                    join(home, '.config', 'Code', 'User', 'mcp.json')
                )
                : join(process.cwd(), '.vscode', 'mcp.json'),
        },
        'continue': {
            label: 'Continue',
            configKey: 'mcpServers',
            path: join(home, '.continue', 'config.json'),
        },
        'zed': {
            label: 'Zed',
            configKey: 'context_servers',
            path: perOS(
                join(appData, 'Zed', 'settings.json'),
                join(home, '.config', 'zed', 'settings.json'),
                join(home, '.config', 'zed', 'settings.json')
            ),
        },
    }
}

export const command = 'mcpServerInstall'
export const aliases = ['mcp', 'mcpInstall', 'mcp-install']
export const describe = baseLite.bundle.getText("mcpServerInstall")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
    client: {
        alias: ['c'],
        type: 'string',
        choices: [...ALL_CLIENT_IDS, 'auto'],
        default: 'auto',
        describe: baseLite.bundle.getText("mcpServerInstallClient")
    },
    name: {
        alias: ['n'],
        type: 'string',
        default: 'hana-cli',
        describe: baseLite.bundle.getText("mcpServerInstallName")
    },
    dryRun: {
        alias: ['dr'],
        type: 'boolean',
        default: false,
        describe: baseLite.bundle.getText("mcpServerInstallDryRun")
    },
    global: {
        alias: ['g'],
        type: 'boolean',
        default: false,
        describe: baseLite.bundle.getText("mcpServerInstallGlobal")
    }
}, false, false)).wrap(160).example(
    'hana-cli mcpServerInstall --client claude-desktop',
    baseLite.bundle.getText("mcpServerInstallExample1")
).example(
    'hana-cli mcp --dry-run',
    baseLite.bundle.getText("mcpServerInstallExample2")
).example(
    'hana-cli mcp --client claude-code --global',
    baseLite.bundle.getText("mcpServerInstallExample3")
).epilog(buildDocEpilogue('mcpServerInstall', 'developer-tools', ['mcpServerStatus']))

export async function handler(argv) {
    const base = await import('../utils/base.js')
    base.promptHandler(argv, mcpInstall, {
        client: argv.client,
        name: argv.name,
        dryRun: argv.dryRun,
        global: argv.global,
    }, false)
}

function getMcpServerPath() {
    return resolve(__dirname, '..', 'mcp-server', 'build', 'index.js')
}

function buildMcpConfig() {
    return {
        type: 'stdio',
        command: process.execPath,
        args: [getMcpServerPath()],
    }
}

function getTargetClients(client, useGlobal) {
    const descriptors = getClientDescriptors(useGlobal)
    if (client === 'auto') {
        return ALL_CLIENT_IDS.map(id => ({ id, ...descriptors[id] }))
    }
    const desc = descriptors[client]
    return desc ? [{ id: client, ...desc }] : []
}

function mergeConfig(existingContent, serverName, mcpConfig, configKey) {
    let config = {}
    if (existingContent) {
        try {
            config = JSON.parse(existingContent)
        } catch {
            config = {}
        }
    }

    if (!config[configKey]) config[configKey] = {}
    config[configKey][serverName] = mcpConfig

    return JSON.stringify(config, null, 2)
}

export async function mcpInstall(prompts) {
    const base = await import('../utils/base.js')
    base.debug('mcpInstall')

    const colors = baseLite.colors
    const client = prompts.client || 'auto'
    const serverName = prompts.name || 'hana-cli'
    const dryRun = prompts.dryRun || false
    const useGlobal = prompts.global || false

    const mcpServerPath = getMcpServerPath()
    if (!existsSync(mcpServerPath)) {
        console.error(colors.red(baseLite.bundle.getText("mcpServerInstallNotBuilt")))
        console.error(colors.yellow(`  cd mcp-server && npm run build`))
        return base.end()
    }

    const mcpConfig = buildMcpConfig()
    const targets = getTargetClients(client, useGlobal)

    console.log(colors.bold(baseLite.bundle.getText("mcpServerInstallHeader")))
    console.log()
    console.log(`  ${colors.cyan(baseLite.bundle.getText("mcpServerInstallServerPath"))} ${mcpServerPath}`)
    console.log(`  ${colors.cyan(baseLite.bundle.getText("mcpServerInstallServerName"))} ${serverName}`)
    console.log()

    if (dryRun) {
        console.log(colors.yellow(baseLite.bundle.getText("mcpServerInstallDryRunHeader")))
        console.log()

        for (const target of targets) {
            const preview = { [target.configKey]: { [serverName]: mcpConfig } }
            console.log(`  ${colors.cyan(target.label)} ${colors.dim(`(${target.configKey})`)}:`)
            console.log(`    ${baseLite.bundle.getText("mcpServerInstallConfigPath")} ${target.path}`)
            console.log(`    ${baseLite.bundle.getText("mcpServerInstallConfigExists")} ${existsSync(target.path) ? colors.green('yes') : colors.dim('no')}`)
            console.log(colors.dim(JSON.stringify(preview, null, 2).split('\n').map(l => '    ' + l).join('\n')))
            console.log()
        }
        return base.end()
    }

    let installedCount = 0
    for (const target of targets) {
        try {
            let existingContent = null
            if (existsSync(target.path)) {
                existingContent = readFileSync(target.path, 'utf-8')
            }

            if (client === 'auto' && !existingContent) {
                console.log(colors.dim(`  ${target.label}: ${baseLite.bundle.getText("mcpServerInstallSkipped")}`))
                continue
            }

            const configDir = dirname(target.path)
            if (!existsSync(configDir)) {
                mkdirSync(configDir, { recursive: true })
            }

            const newContent = mergeConfig(existingContent, serverName, mcpConfig, target.configKey)
            writeFileSync(target.path, newContent, 'utf-8')
            console.log(colors.green(`  ${target.label}: ${baseLite.bundle.getText("mcpServerInstallSuccess")}`))
            console.log(colors.dim(`    ${target.path}`))
            installedCount++
        } catch (err) {
            console.error(colors.red(`  ${target.label}: ${baseLite.bundle.getText("mcpServerInstallFailed")} ${err.message}`))
        }
    }

    console.log()
    if (installedCount > 0) {
        console.log(colors.green(baseLite.bundle.getText("mcpServerInstallComplete", [installedCount])))
        console.log(colors.dim(baseLite.bundle.getText("mcpServerInstallRestart")))
    } else {
        console.log(colors.yellow(baseLite.bundle.getText("mcpServerInstallNone")))
        console.log(colors.dim(baseLite.bundle.getText("mcpServerInstallNoneHint")))
    }

    return base.end()
}
