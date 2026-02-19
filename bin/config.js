// @ts-check
import * as baseLite from '../utils/base-lite.js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

export const command = 'config [action]'
export const aliases = ['cfg']
export const describe = baseLite.bundle.getText("config")
export const builder = (yargs) => yargs
    .options(baseLite.getBuilder({
        edit: {
            alias: ['e'],
            type: 'boolean',
            default: false,
            desc: baseLite.bundle.getText("config.editDesc")
        },
        global: {
            alias: ['g'],
            type: 'boolean',
            default: false,
            desc: baseLite.bundle.getText("config.globalDesc")
        },
        path: {
            alias: ['p'],
            type: 'boolean',
            default: false,
            desc: baseLite.bundle.getText("config.pathDesc")
        },
        reset: {
            type: 'boolean',
            default: false,
            desc: baseLite.bundle.getText("config.resetDesc")
        }
    }, false))
    .positional('action', {
        desc: 'Action: show (default), list, paths, or edit',
        type: 'string'
    })
    .example('hana-cli config', 'Display current configuration')
    .example('hana-cli config -e', 'Edit configuration in default editor')
    .example('hana-cli config --path', 'Show configuration file paths')

export async function handler(argv) {
    const base = await import('../utils/base.js')
    base.promptHandler(argv, configOutput, argv, false)
}

export async function configOutput(argv) {
    const base = await import('../utils/base.js')
    base.debug('configOutput')

    const action = argv.action || 'show'
    const cwd = process.cwd()
    const homeDir = os.homedir()

    // Define config file paths
    const projectConfigPaths = [
        path.join(cwd, '.hana-cli-config'),
        path.join(cwd, 'hana-cli.config.js')
    ]
    const globalConfigPaths = [
        path.join(homeDir, '.hana-cli-config'),
        path.join(homeDir, 'hana-cli.config.js')
    ]

    // Helper to load and parse config
    async function loadConfigFile(filePath) {
        if (!fs.existsSync(filePath)) return null
        try {
            if (filePath.endsWith('.config.js')) {
                const config = await import(`file://${filePath}?t=${Date.now()}`)
                return config.default || config
            } else {
                const content = fs.readFileSync(filePath, 'utf-8')
                return JSON.parse(content)
            }
        } catch (err) {
            console.error(`Failed to load ${filePath}: ${err.message}`)
            return null
        }
    }

    // Helper to find existing config file
    async function findExistingConfig() {
        for (const filePath of projectConfigPaths) {
            if (fs.existsSync(filePath)) return filePath
        }
        for (const filePath of globalConfigPaths) {
            if (fs.existsSync(filePath)) return filePath
        }
        return null
    }

    // Helper to format config for display
    function formatConfig(config) {
        const result = []
        const formatValue = (val) => {
            if (val === null || val === undefined) return baseLite.bundle.getText("config.notFoundShort")
            if (typeof val === 'object') return JSON.stringify(val, null, 2)
            return String(val)
        }

        for (const [key, value] of Object.entries(config || {})) {
            if (typeof value === 'object' && value !== null) {
                result.push(`${key}:`)
                result.push(`  ${formatValue(value)}`)
            } else {
                result.push(`${key}: ${formatValue(value)}`)
            }
        }
        return result.join('\n')
    }

    try {
        if (action === 'paths' || argv.path) {
            // Show available config paths
            console.log('\n' + baseLite.bundle.getText("config.locations"))
            console.log(`\n${baseLite.bundle.getText("config.projectLevel")} (${cwd}):`)
            projectConfigPaths.forEach(p => {
                const exists = fs.existsSync(p) ? ` ${baseLite.bundle.getText("config.fileExists")}` : ''
                console.log(`  ${p}${exists}`)
            })
            console.log(`\n${baseLite.bundle.getText("config.globalLevel")} (${homeDir}):`)
            globalConfigPaths.forEach(p => {
                const exists = fs.existsSync(p) ? ` ${baseLite.bundle.getText("config.fileExists")}` : ''
                console.log(`  ${p}${exists}`)
            })
            return
        }

        if (argv.reset) {
            // Reset config
            const existingConfig = await findExistingConfig()
            if (existingConfig) {
                fs.unlinkSync(existingConfig)
                console.log(baseLite.bundle.getText("config.removed") + `: ${existingConfig}`)
            } else {
                console.log(baseLite.bundle.getText("config.notFound"))
            }
            return
        }

        const configFile = argv.global ? 
            (fs.existsSync(globalConfigPaths[0]) ? globalConfigPaths[0] : globalConfigPaths[1]) :
            (fs.existsSync(projectConfigPaths[0]) ? projectConfigPaths[0] : projectConfigPaths[1])

        if (argv.edit || action === 'edit') {
            // Open in editor
            let targetFile = configFile
            
            // If no config exists, create a template
            if (!fs.existsSync(targetFile)) {
                const templateJson = {
                    defaultSchema: 'MYSCHEMA',
                    defaultProfile: 'development',
                    outputFormat: 'json',
                    language: 'en',
                    logLevel: 'info',
                    timeout: 30000,
                    admin: false,
                    debug: false,
                    disableVerbose: false
                }
                
                // Use JSON format for new config
                if (targetFile.endsWith('.config.js')) {
                    targetFile = targetFile.replace('.config.js', '')
                    targetFile = targetFile === path.join(cwd, 'hana-cli') ? 
                        path.join(cwd, '.hana-cli-config') :
                        path.join(homeDir, '.hana-cli-config')
                }
                
                fs.writeFileSync(targetFile, JSON.stringify(templateJson, null, 2))
                console.log(baseLite.bundle.getText("config.created") + `: ${targetFile}`)
            }

            // Open editor
            const editor = process.env.EDITOR || process.env.VISUAL || 'code'
            const child = spawn(editor, [targetFile], { stdio: 'inherit' })
            return new Promise((resolve, reject) => {
                child.on('exit', (code) => {
                    if (code === 0) {
                        console.log(`\n${baseLite.bundle.getText("config.updated")}: ${targetFile}`)
                    }
                    resolve()
                })
                child.on('error', reject)
            })
        }

        // Show config (default action)
        console.log('\n' + baseLite.bundle.getText("config.current"))
        console.log('======================\n')

        // Load and display project config
        let foundProjectConfig = false
        for (const filePath of projectConfigPaths) {
            if (fs.existsSync(filePath)) {
                const config = await loadConfigFile(filePath)
                if (config) {
                    console.log(`${baseLite.bundle.getText("config.projectConfig")} (${path.relative(cwd, filePath)}):\n`)
                    console.log(formatConfig(config))
                    foundProjectConfig = true
                    break
                }
            }
        }

        if (!foundProjectConfig) {
            console.log(`${baseLite.bundle.getText("config.projectConfig")}: ${baseLite.bundle.getText("config.notFoundShort")}`)
        }

        console.log('\n')

        // Load and display global config
        let foundGlobalConfig = false
        for (const filePath of globalConfigPaths) {
            if (fs.existsSync(filePath)) {
                const config = await loadConfigFile(filePath)
                if (config) {
                    console.log(`${baseLite.bundle.getText("config.globalConfig")} (${path.relative(homeDir, filePath)}):\n`)
                    console.log(formatConfig(config))
                    foundGlobalConfig = true
                    break
                }
            }
        }

        if (!foundGlobalConfig) {
            console.log(`${baseLite.bundle.getText("config.globalConfig")}: ${baseLite.bundle.getText("config.notFoundShort")}`)
        }

        console.log('\n' + baseLite.colors.blue(baseLite.bundle.getText("config.editHint")))
        console.log(baseLite.colors.blue(baseLite.bundle.getText("config.pathHint") + '\n'))

    } catch (err) {
        base.error(err)
    }
}
