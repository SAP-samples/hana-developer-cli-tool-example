#!/usr/bin/env node
/*eslint no-console: 0, no-process-exit:0*/
/*eslint-env node, es6, module */
// @ts-check

// Ultra-fast path for -V or --version FLAG ONLY (not the version command)
// This provides quick version lookup for scripts without loading the full CLI
const args = process.argv.slice(2)
if (args.length > 0 && (args[0] === '--version' || args[0] === '-V')) {
    // Only load what we absolutely need - avoid all imports
    const { createRequire } = await import('module')
    const require = createRequire(import.meta.url)
    const packageInfo = require('../package.json')
    console.log(packageInfo.version)
    process.exit(0)
}

// Defer all imports until after --version fast path
import * as base from '../utils/base-lite.js'
import { commandMap } from './commandMap.js'

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

// Find which command is being requested
const requestedCommand = args[0]

// Load yargs only when needed
if (!yargs) {
    const yargsModule = await import('yargs')
    yargs = yargsModule.default
    const helpers = await import('yargs/helpers')
    hideBin = helpers.hideBin
}

const yargsArgs = hideBin(process.argv)

// Helper to create yargs instance with common configuration
function createYargsInstance(yargsArgs) {
    return yargs(yargsArgs)
        .scriptName(base.colors.blue('hana-cli'))
        .usage(base.colors.blue(base.bundle.getText("usage")))
        .help('help').alias('help', 'h')
        .version(pkg.version).alias('version', 'V')
        .example([[base.colors.green("connect:"), base.bundle.getText("example")]])
        .epilog(base.colors.blue(base.bundle.getText("epilog")))
        .fail((msg, err) => {
            if (err) {
                console.error(base.colors.red(err.message))
            } else if (msg) {
                console.error(base.colors.red(msg))
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

