#!/usr/bin/env node
/*eslint no-console: 0, no-process-exit:0*/
// @ts-check

// Parse initial args before yargs
const args = process.argv.slice(2)

// Defer all imports until after --version fast path
import * as base from '../utils/base-lite.js'
import { commandMap } from './commandMap.js'
import { getSuggestionMessage } from '../utils/commandSuggestions.js'
import { loadConfig, applyConfigToEnv } from '../utils/config-loader.js'

// Load configuration early - before any command processing
const config = await loadConfig()
applyConfigToEnv(config)
base.setConfig(config)

// Defer yargs import until after fast-path checks (saves ~77ms)
let yargs, hideBin

// Import package.json for version info
const pkg = base.require('../package.json')

// Error handler setup
const errorHandler = err => {
    base.error(err)
    process.exit(1)
}
process.on('uncaughtException', errorHandler)

// Convert --version or -V flags to version command
if (args.length > 0 && (args[0] === '--version' || args[0] === '-V')) {
    args[0] = 'version'
}

// Find which command is being requested
const requestedCommand = args[0]

// Load yargs only when needed
if (!yargs) {
    const yargsModule = await import('yargs')
    yargs = yargsModule.default
    const helpers = await import('yargs/helpers')
    hideBin = helpers.hideBin
}

// Reconstruct argv with the potentially modified args
const processArgv = [...process.argv.slice(0, 2), ...args]
const yargsArgs = hideBin(processArgv)

// Helper to create yargs instance with common configuration
function createYargsInstance(yargsArgs) {
    return yargs(yargsArgs)
        .scriptName(base.colors.blue('hana-cli'))
        .usage(base.colors.blue(base.bundle.getText("usage")))
        .wrap(160)
        .help('help').alias('help', 'h')
        .version(false) // Disable default version handler, use version command instead
        .alias('version', 'V')
        .example([[base.colors.green("connect:"), base.bundle.getText("example")]])
        .epilog(base.colors.blue(base.bundle.getText("epilog")))
        .fail((msg, err) => {
            if (err) {
                console.error(base.colors.red(err.message))
            } else if (msg) {
                // Check if this is an unknown command error and translate it
                const unknownCommandMatch = msg.match(/Unknown (?:command|argument): (\S+)/)
                if (unknownCommandMatch) {
                    const unknownCommand = unknownCommandMatch[1]
                    // Replace yargs' English message with our translated version
                    const translatedMsg = base.bundle.getText("unknownCommand", [unknownCommand])
                    console.error(base.colors.red(translatedMsg))
                    
                    // Add suggestion if available
                    const suggestionMsg = getSuggestionMessage(unknownCommand, base.bundle)
                    if (suggestionMsg) {
                        console.error(base.colors.yellow(suggestionMsg))
                    }
                } else {
                    // For other errors, display as-is
                    console.error(base.colors.red(msg))
                }
            }
            process.exit(1)
        })
}

// If a known command is requested, load only that command
if (requestedCommand && commandMap[requestedCommand]) {
    base.debug(base.bundle.getText("debug.cli.lazyLoad", [requestedCommand]))
    const commandModule = await import(commandMap[requestedCommand])
    
    base.debug(base.bundle.getText("debug.cli.beforeYargs"))
    // @ts-ignore
    const yargsInstance = createYargsInstance(yargsArgs)
        .demandCommand(1, "")
        .strictCommands()
        .command(commandModule)
    
    await yargsInstance.argv
    base.debug(base.bundle.getText("debug.cli.afterYargs"))
} else {
    // For help, unknown commands, or no arguments - load all commands to show full help
    base.debug(base.bundle.getText("debug.cli.loadAll"))
    const index = await import('./index.js')
    
    base.debug(base.bundle.getText("debug.cli.beforeYargs"))
    // @ts-ignore
    const yargsInstance = createYargsInstance(yargsArgs)
        .demandCommand(1, "")
        .strictCommands()
        .command(await index.init())
    
    await yargsInstance.argv
    base.debug(base.bundle.getText("debug.cli.afterYargs"))
}

