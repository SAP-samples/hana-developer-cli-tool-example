#!/usr/bin/env node
/*eslint no-console: 0, no-process-exit:0*/
/*eslint-env node, es6, module */
// @ts-check

import * as base from '../utils/base-lite.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import package.json for version info
const pkg = base.require('../package.json')

const errorHandler = err => {
    base.error(err)
    process.exit(1)
}
process.on('uncaughtException', errorHandler)

// Command file mapping for lazy loading
const commandMap = {
    'activateHDI': './activateHDI.js',
    'adminHDI': './adminHDI.js',
    'adminHDIGroup': './adminHDIGroup.js',
    'btp': './btp.js',
    'btpSubs': './btpSubs.js',
    'btpInfo': './btpInfo.js',
    'callProcedure': './callProcedure.js',
    'call': './callProcedure.js',
    'certificates': './certificates.js',
    'certificatesUI': './certificatesUI.js',
    'cds': './cds.js',
    'openChangeLog': './openChangeLog.js',
    'changeLog': './changeLog.js',
    'changelog': './changeLog.js',
    'changeLogUI': './changeLogUI.js',
    'connect': './connect.js',
    'c': './connect.js',
    'containers': './containers.js',
    'containersUI': './containersUI.js',
    'copy2DefaultEnv': './copy2DefaultEnv.js',
    'copy2Env': './copy2Env.js',
    'copy2Secrets': './copy2Secrets.js',
    'createGroup': './createGroup.js',
    'createContainer': './createContainer.js',
    'createContainerUsers': './createContainerUsers.js',
    'createJWT': './createJWT.js',
    'createModule': './createModule.js',
    'createXSAAdmin': './createXSAAdmin.js',
    'dataTypes': './dataTypes.js',
    'dataTypesUI': './dataTypesUI.js',
    'dataVolumes': './dataVolumes.js',
    'disks': './disks.js',
    'dropGroup': './dropGroup.js',
    'dropContainer': './dropContainer.js',
    'features': './features.js',
    'featuresUI': './featuresUI.js',
    'featureUsage': './featureUsage.js',
    'featureUsageUI': './featureUsageUI.js',
    'functions': './functions.js',
    'f': './functions.js',
    'functionsUI': './functionsUI.js',
    'hanaCloudHDIInstances': './hanaCloudHDIInstances.js',
    'hanaCloudHDIInstancesUI': './hanaCloudHDIInstancesUI.js',
    'hanaCloudInstances': './hanaCloudInstances.js',
    'hanaCloudStart': './hanaCloudStart.js',
    'hanaCloudStop': './hanaCloudStop.js',
    'hdbsql': './hdbsql.js',
    'hostInformation': './hostInformation.js',
    'indexes': './indexes.js',
    'indexesUI': './indexesUI.js',
    'iniContents': './iniContents.js',
    'iniFiles': './iniFiles.js',
    'ini': './iniFiles.js',
    'inspectFunction': './inspectFunction.js',
    'if': './inspectFunction.js',
    'inspectIndex': './inspectIndex.js',
    'inspectJWT': './inspectJWT.js',
    'inspectLibMember': './inspectLibMember.js',
    'inspectLibrary': './inspectLibrary.js',
    'inspectProcedure': './inspectProcedure.js',
    'ip': './inspectProcedure.js',
    'inspectTable': './inspectTable.js',
    'it': './inspectTable.js',
    'inspectTableUI': './inspectTableUI.js',
    'inspectTrigger': './inspectTrigger.js',
    'inspectUser': './inspectUser.js',
    'inspectView': './inspectView.js',
    'iv': './inspectView.js',
    'issue': './issue.js',
    'libraries': './libraries.js',
    'massConvert': './massConvert.js',
    'massConvertUI': './massConvertUI.js',
    'massRename': './massRename.js',
    'massUsers': './massUsers.js',
    'objects': './objects.js',
    'openBAS': './openBAS.js',
    'openDBExplorer': './openDBExplorer.js',
    'opendbx': './openDBExplorer.js',
    'ports': './ports.js',
    'privilegeError': './privilegeError.js',
    'procedures': './procedures.js',
    'p': './procedures.js',
    'querySimple': './querySimple.js',
    'querySimpleUI': './querySimpleUI.js',
    'readMe': './readMe.js',
    'readme': './readMe.js',
    'readMeUI': './readMeUI.js',
    'openReadMe': './openReadMe.js',
    'reclaim': './reclaim.js',
    'rick': './rick.js',
    'roles': './roles.js',
    'hanaCloudSBSSInstances': './hanaCloudSBSSInstances.js',
    'hanaCloudSBSSInstancesUI': './hanaCloudSBSSInstancesUI.js',
    'schemas': './schemas.js',
    's': './schemas.js',
    'schemasUI': './schemasUI.js',
    'hanaCloudSchemaInstances': './hanaCloudSchemaInstances.js',
    'hanaCloudSchemaInstancesUI': './hanaCloudSchemaInstancesUI.js',
    'hanaCloudSecureStoreInstances': './hanaCloudSecureStoreInstances.js',
    'hanaCloudSecureStoreInstancesUI': './hanaCloudSecureStoreInstancesUI.js',
    'connectViaServiceKey': './connectViaServiceKey.js',
    'sequences': './sequences.js',
    'status': './status.js',
    'synonyms': './synonyms.js',
    'systemInfo': './systemInfo.js',
    'systemInfoUI': './systemInfoUI.js',
    'tables': './tables.js',
    't': './tables.js',
    'listTables': './tables.js',
    'listtables': './tables.js',
    'tablesPG': './tablesPG.js',
    'tablesSQLite': './tablesSQLite.js',
    'tablesUI': './tablesUI.js',
    'traces': './traces.js',
    'traceContents': './traceContents.js',
    'triggers': './triggers.js',
    'UI': './UI.js',
    'hanaCloudUPSInstances': './hanaCloudUPSInstances.js',
    'hanaCloudUPSInstancesUI': './hanaCloudUPSInstancesUI.js',
    'users': './users.js',
    'version': './version.js',
    'views': './views.js',
    'v': './views.js'
}

// Find which command is being requested
const args = hideBin(process.argv)
const requestedCommand = args[0]

// If a known command is requested, load only that command
if (requestedCommand && commandMap[requestedCommand]) {
    base.debug(`Lazy loading command: ${requestedCommand}`)
    const commandModule = await import(commandMap[requestedCommand])
    
    base.debug(`Before Yargs`)
    // @ts-ignore
    const yargsInstance = yargs(args)
        .scriptName(base.colors.blue('hana-cli'))
        .usage(base.colors.blue(base.bundle.getText("usage")))
        .demandCommand(1, "")
        .strictCommands()
        .command(commandModule)
        .option('h', {
            alias: 'help',
            description: base.colors.green(base.bundle.getText("help"))
        })
        .help('help').alias('help', 'h')
        .example([[base.colors.green("connect:"), base.bundle.getText("example")]])
        .epilog(base.colors.blue(base.bundle.getText("epilog")))
        .version(pkg.version).alias('version', 'V')
        .completion()
        .check((argv) => {
            // Get builder options from command module
            const builder = typeof commandModule.builder === 'function' 
                ? {} 
                : (commandModule.builder || {})
            
            // Helper to convert camelCase to kebab-case
            const toKebab = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
            
            // Collect all known option keys and their aliases
            const knownKeys = new Set(['_', '$0', 'help', 'h', 'version', 'V'])
            Object.entries(builder).forEach(([key, value]) => {
                knownKeys.add(key)
                knownKeys.add(toKebab(key)) // Add kebab-case version
                if (value && typeof value === 'object' && value.alias) {
                    const aliases = Array.isArray(value.alias) ? value.alias : [value.alias]
                    aliases.forEach(a => {
                        knownKeys.add(a)
                        knownKeys.add(toKebab(a))
                    })
                }
            })
            
            // Check for unknown options in argv
            const unknownOptions = Object.keys(argv).filter(key => !knownKeys.has(key))
            
            if (unknownOptions.length > 0) {
                unknownOptions.forEach(opt => {
                    console.warn(base.colors.yellow(base.bundle.getText("cli.unknownOptionWarning", [opt])))
                })
            }
            
            return true // Allow execution to continue
        })
        .fail((msg, err) => {
            if (err) {
                console.error(base.colors.red(err.message))
            } else if (msg) {
                console.error(base.colors.red(msg))
            }
            process.exit(1)
        })
    
    await yargsInstance.argv
    base.debug(`After Yargs`)
} else {
    // For help, version, or unknown commands, load all commands
    base.debug(`Loading all commands for help/discovery`)
    const index = await import('./index.js')
    
    base.debug(`Before Yargs`)
    // @ts-ignore
    const yargsInstance = yargs(hideBin(process.argv))
        .scriptName(base.colors.blue('hana-cli'))
        .usage(base.colors.blue(base.bundle.getText("usage")))
        .demandCommand(1, "")
        .strictCommands()
        .command(await index.init())
        .option('h', {
            alias: 'help',
            description: base.colors.green(base.bundle.getText("help"))
        })
        .help('help').alias('help', 'h')
        .example([[base.colors.green("connect:"), base.bundle.getText("example")]])
        .epilog(base.colors.blue(base.bundle.getText("epilog")))
        .version(pkg.version).alias('version', 'V')
        .completion()
        .check((argv) => {
            // For load-all path, we rely on yargs strict mode behavior
            // This path is only used for help/version/discovery, not regular commands
            return true
        })
        .fail((msg, err) => {
            if (err) {
                console.error(base.colors.red(err.message))
            } else if (msg) {
                console.error(base.colors.red(msg))
            }
            process.exit(1)
        })
    
    await yargsInstance.argv
    base.debug(`After Yargs`)
}

//versionCheck.checkVersion().then(async () => {

// @ts-ignore
//   const pkg = base.require('../package.json')
//  const notifier =  updateNotifier({ pkg }).notify({ isGlobal: true })
//  base.debug(notifier.update)

/*
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
}) */