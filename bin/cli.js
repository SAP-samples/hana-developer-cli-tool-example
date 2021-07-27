#!/usr/bin/env node
/*eslint no-console: 0, no-process-exit:0*/
/*eslint-env node, es6, module */
// @ts-check

const base = require("../utils/base")
const versionCheck = require("../utils/versionCheck")
versionCheck.checkVersion().then(() => {

    require('console.table')
    require('yargonaut')
        .style('blue')
        .helpStyle('green')
        .errorsStyle('red')

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

    require('yargs')
        .scriptName('hana-cli')
        .usage(base.bundle.getText("usage"))
        .demandCommand(1, "")
        .command(require('./activateHDI'))
        .command(require('./adminHDI'))
        .command(require('./adminHDIGroup'))
        .command(require('./callProcedure'))
        .command(require('./certificates'))
        .command(require('./cds'))
        .command(require('./openChangeLog'))
        .command(require('./changeLog'))
        .command(require('./changeLogUI'))
        .command(require('./connect'))
        .command(require('./containers'))
        .command(require('./containersUI'))
        .command(require('./copy2DefaultEnv'))
        .command(require('./copy2Env'))
        .command(require('./copy2Secrets'))
        .command(require('./createContainer'))
        .command(require('./createContainerUsers'))
        .command(require('./createJWT'))
        .command(require('./createModule'))
        .command(require('./createXSAAdmin'))
        .command(require('./dataTypes'))
        .command(require('./dataTypesUI'))
        .command(require('./dataVolumes'))
        .command(require('./disks'))
        .command(require('./dropContainer'))
        .command(require('./features'))
        .command(require('./featureUsage'))
        .command(require('./functions'))
        .command(require('./hanaCloudHDIInstances'))
        .command(require('./hanaCloudInstances'))
        .command(require('./hanaCloudStart'))
        .command(require('./hanaCloudStop'))
        .command(require('./hdbsql'))
        .command(require('./hostInformation'))
        .command(require('./indexes'))
        .command(require('./iniContents'))
        .command(require('./iniFiles'))
        .command(require('./inspectFunction'))
        .command(require('./inspectIndex'))
        .command(require('./inspectJWT'))
        .command(require('./inspectLibMember'))
        .command(require('./inspectLibrary'))
        .command(require('./inspectProcedure'))
        .command(require('./inspectTable'))
        .command(require('./inspectTrigger'))
        .command(require('./inspectUser'))
        .command(require('./inspectView'))
        .command(require('./libraries'))
        .command(require('./massConvert'))
        .command(require('./massConvertUI'))
        .command(require('./massRename'))
        .command(require('./massUsers'))
        .command(require('./matrix'))
        .command(require('./objects'))
        .command(require('./openDBExplorer'))
        .command(require('./ports'))
        .command(require('./privilegeError'))
        .command(require('./procedures'))
        .command(require('./querySimple'))
        .command(require('./readMe'))
        .command(require('./readMeUI'))
        .command(require('./openReadMe'))
        .command(require('./reclaim'))
        .command(require('./rick'))
        .command(require('./roles'))
        .command(require('./hanaCloudSBSSInstances'))
        .command(require('./schemas'))
        .command(require('./schemasUI'))
        .command(require('./hanaCloudSchemaInstances'))
        .command(require('./hanaCloudSecureStoreInstances'))
        .command(require('./connectViaServiceKey'))
        .command(require('./sequences'))
        .command(require('./status'))
        .command(require('./synonyms'))
        .command(require('./systemInfo'))
        .command(require('./systemInfoUI'))
        .command(require('./tables'))
        .command(require('./tablesUI'))
        //    .command(require('./test'))
        .command(require('./traces'))
        .command(require('./traceContents'))
        .command(require('./triggers'))
        .command(require('./UI'))
        .command(require('./hanaCloudUPSInstances'))
        .command(require('./users'))
        .command(require('./version'))
        .command(require('./views'))
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

