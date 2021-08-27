#!/usr/bin/env node
/*eslint no-console: 0, no-process-exit:0*/
/*eslint-env node, es6, module */

import * as base from '../utils/base.js'
import * as versionCheck from '../utils/versionCheck.js'
import updateNotifier from 'update-notifier'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import 'console.table'
require('yargonaut')
    .style('blue')
    .helpStyle('green')
    .errorsStyle('red')

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { commands } from './indexTest.js'

versionCheck.checkVersion().then(async () => {

    // @ts-ignore
    const pkg = require('../package.json')
    await updateNotifier({ pkg }).notify({ isGlobal: true })

    /**
     * Custom error handler catch all
     * @param {*} err 
     */
    const errorHandler = err => {
        base.error(err)
        process.exit(1)
    }
/*     process.on('uncaughtException', errorHandler)
    process.on('unhandledRejection', errorHandler) */

    yargs(hideBin(process.argv))
        .scriptName('hana-cli')
        .usage(base.bundle.getText("usage"))
        .demandCommand(1, "")
        .command(commands)
        .option('h', {
            alias: 'help',
            description: base.bundle.getText("help")
        })
        .help('help').alias('help', 'h')
        .example([[base.colors.green("connect:"), base.bundle.getText("example")]])
        .epilog(base.bundle.getText("epilog"))
        .version(false)
        .completion()
        .argv
})

