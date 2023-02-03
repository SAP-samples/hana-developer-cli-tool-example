#!/usr/bin/env node
/*eslint no-console: 0, no-process-exit:0*/
/*eslint-env node, es6, module */
// @ts-check

import * as base from '../utils/base.js'
import * as versionCheck from '../utils/versionCheck.js'
// @ts-ignore
import updateNotifier from 'update-notifier'
import 'console.table'
//import setDebug from 'debug'

base.require('yargonaut')
    .style('blue')
    .helpStyle('green')
    .errorsStyle('red')

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as index from './index.js' //{ commands } from './index.js'

versionCheck.checkVersion().then(async () => {

    // @ts-ignore
    const pkg = base.require('../package.json')
    const notifier =  updateNotifier({ pkg }).notify({ isGlobal: true })
    base.debug(notifier.update)


    /**
     * Custom error handler catch all
     * @param {*} err 
     */
    const errorHandler = err => {
        base.error(err)
        process.exit(1)
    }
    process.on('uncaughtException', errorHandler)
    process.on('unhandledRejection', errorHandler)

    //setDebug.enable('hana-cli, *')
    base.debug(`Before Yargs`)
    // @ts-ignore
    yargs(hideBin(process.argv))
        .scriptName('hana-cli')
        .usage(base.bundle.getText("usage"))
        .demandCommand(1, "")
        // @ts-ignore
        .command(await index.init())
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
    base.debug(`After Yargs`)
})