// @ts-check
/**
 * Unit tests for UI commands (browser-based commands)
 * These commands launch a web server to provide browser-based interfaces
 */

import * as assert from 'assert'

describe('UI Commands', function () {

    describe('UI (main UI launcher)', function () {
        let UI

        before(async function () {
            UI = await import('../bin/UI.js')
        })

        it('should export command', function () {
            assert.strictEqual(UI.command, 'UI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(UI.aliases))
            assert.ok(UI.aliases.includes('ui'))
            assert.ok(UI.aliases.includes('gui'))
            assert.ok(UI.aliases.includes('GUI'))
            assert.ok(UI.aliases.includes('launchpad'))
        })

        it('should export describe', function () {
            assert.ok(typeof UI.describe === 'string')
        })

        it('should export builder', function () {
            assert.ok(typeof UI.builder === 'object')
        })

        it('should export handler function', function () {
            assert.ok(typeof UI.handler === 'function')
        })

        it('should export main UI function', function () {
            assert.ok(typeof UI.UI === 'function')
        })
    })

    describe('changeLogUI', function () {
        let changeLogUI

        before(async function () {
            changeLogUI = await import('../bin/changeLogUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(changeLogUI.command, 'changesUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(changeLogUI.aliases))
            assert.ok(changeLogUI.aliases.includes('chgUI'))
            assert.ok(changeLogUI.aliases.includes('changeLogUI'))
        })

        it('should export describe', function () {
            assert.ok(typeof changeLogUI.describe === 'string')
        })

        it('should export handler function', function () {
            assert.ok(typeof changeLogUI.handler === 'function')
        })

        it('should export getChangeLog function', function () {
            assert.ok(typeof changeLogUI.getChangeLog === 'function')
        })
    })

    describe('containersUI', function () {
        let containersUI

        before(async function () {
            containersUI = await import('../bin/containersUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(containersUI.command, 'containersUI [containerGroup] [container]')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(containersUI.aliases))
            assert.ok(containersUI.aliases.includes('containersui'))
            assert.ok(containersUI.aliases.includes('contUI'))
            assert.ok(containersUI.aliases.includes('listContainersUI'))
        })

        it('should export describe', function () {
            assert.ok(typeof containersUI.describe === 'string')
        })

        it('should export builder', function () {
            assert.ok(typeof containersUI.builder === 'object')
        })

        it('should export handler function', function () {
            assert.ok(typeof containersUI.handler === 'function')
        })

        it('should export getContainers function', function () {
            assert.ok(typeof containersUI.getContainers === 'function')
        })
    })

    describe('dataTypesUI', function () {
        let dataTypesUI

        before(async function () {
            dataTypesUI = await import('../bin/dataTypesUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(dataTypesUI.command, 'dataTypesUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(dataTypesUI.aliases))
            assert.ok(dataTypesUI.aliases.includes('datatypesui'))
            assert.ok(dataTypesUI.aliases.includes('dtui'))
        })

        it('should export dbStatus function', function () {
            assert.ok(typeof dataTypesUI.dbStatus === 'function')
        })
    })

    describe('featuresUI', function () {
        let featuresUI

        before(async function () {
            featuresUI = await import('../bin/featuresUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(featuresUI.command, 'featuresUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(featuresUI.aliases))
            assert.ok(featuresUI.aliases.includes('featuresui'))
            assert.ok(featuresUI.aliases.includes('feui'))
        })

        it('should export dbStatus function', function () {
            assert.ok(typeof featuresUI.dbStatus === 'function')
        })
    })

    describe('featureUsageUI', function () {
        let featureUsageUI

        before(async function () {
            featureUsageUI = await import('../bin/featureUsageUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(featureUsageUI.command, 'featureUsageUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(featureUsageUI.aliases))
            assert.ok(featureUsageUI.aliases.includes('featureusageui'))
            assert.ok(featureUsageUI.aliases.includes('fuui'))
        })

        it('should export dbStatus function', function () {
            assert.ok(typeof featureUsageUI.dbStatus === 'function')
        })
    })

    describe('functionsUI', function () {
        let functionsUI

        before(async function () {
            functionsUI = await import('../bin/functionsUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(functionsUI.command, 'functionsUI [schema] [function]')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(functionsUI.aliases))
            assert.ok(functionsUI.aliases.includes('fui'))
            assert.ok(functionsUI.aliases.includes('listFunctionsUI'))
        })

        it('should export getFunctions function', function () {
            assert.ok(typeof functionsUI.getFunctions === 'function')
        })
    })

    describe('hanaCloudHDIInstancesUI', function () {
        let hdiUI

        before(async function () {
            hdiUI = await import('../bin/hanaCloudHDIInstancesUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(hdiUI.command, 'hdiUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(hdiUI.aliases))
            assert.ok(hdiUI.aliases.includes('hdiInstancesUI'))
            assert.ok(hdiUI.aliases.includes('hdiinstancesui'))
        })

        it('should export listInstances function', function () {
            assert.ok(typeof hdiUI.listInstances === 'function')
        })
    })

    describe('hanaCloudSBSSInstancesUI', function () {
        let sbssUI

        before(async function () {
            sbssUI = await import('../bin/hanaCloudSBSSInstancesUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(sbssUI.command, 'sbssUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(sbssUI.aliases))
            assert.ok(sbssUI.aliases.includes('sbssInstancesUI'))
            assert.ok(sbssUI.aliases.includes('sbssinstancesui'))
        })

        it('should export listInstances function', function () {
            assert.ok(typeof sbssUI.listInstances === 'function')
        })
    })

    describe('hanaCloudSchemaInstancesUI', function () {
        let schemaUI

        before(async function () {
            schemaUI = await import('../bin/hanaCloudSchemaInstancesUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(schemaUI.command, 'schemaInstancesUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(schemaUI.aliases))
            assert.ok(schemaUI.aliases.includes('schemainstancesui'))
            assert.ok(schemaUI.aliases.includes('schemaServicesUI'))
        })

        it('should export listInstances function', function () {
            assert.ok(typeof schemaUI.listInstances === 'function')
        })
    })

    describe('hanaCloudSecureStoreInstancesUI', function () {
        let secureStoreUI

        before(async function () {
            secureStoreUI = await import('../bin/hanaCloudSecureStoreInstancesUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(secureStoreUI.command, 'securestoreUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(secureStoreUI.aliases))
            assert.ok(secureStoreUI.aliases.includes('secureStoreUI'))
            assert.ok(secureStoreUI.aliases.includes('securestoreinstancesui'))
        })

        it('should export listInstances function', function () {
            assert.ok(typeof secureStoreUI.listInstances === 'function')
        })
    })

    describe('hanaCloudUPSInstancesUI', function () {
        let upsUI

        before(async function () {
            upsUI = await import('../bin/hanaCloudUPSInstancesUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(upsUI.command, 'upsUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(upsUI.aliases))
            assert.ok(upsUI.aliases.includes('upsInstancesUI'))
            assert.ok(upsUI.aliases.includes('upsinstancesui'))
        })

        it('should export listInstances function', function () {
            assert.ok(typeof upsUI.listInstances === 'function')
        })
    })

    describe('indexesUI', function () {
        let indexesUI

        before(async function () {
            indexesUI = await import('../bin/indexesUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(indexesUI.command, 'indexesUI [schema] [indexes]')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(indexesUI.aliases))
            assert.ok(indexesUI.aliases.includes('indUI'))
            assert.ok(indexesUI.aliases.includes('listIndexesUI'))
        })

        it('should export getIndexes function', function () {
            assert.ok(typeof indexesUI.getIndexes === 'function')
        })
    })

    describe('inspectTableUI', function () {
        let inspectTableUI

        before(async function () {
            inspectTableUI = await import('../bin/inspectTableUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(inspectTableUI.command, 'inspectTableUI [schema] [table]')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(inspectTableUI.aliases))
            assert.ok(inspectTableUI.aliases.includes('itui'))
            assert.ok(inspectTableUI.aliases.includes('tableUI'))
        })

        it('should export tableInspect function', function () {
            assert.ok(typeof inspectTableUI.tableInspect === 'function')
        })
    })

    describe('massConvertUI', function () {
        let massConvertUI

        before(async function () {
            massConvertUI = await import('../bin/massConvertUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(massConvertUI.command, 'massConvertUI [schema] [table]')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(massConvertUI.aliases))
            assert.ok(massConvertUI.aliases.includes('mcui'))
            assert.ok(massConvertUI.aliases.includes('massconvertui'))
        })

        it('should export handler function', function () {
            assert.ok(typeof massConvertUI.handler === 'function')
        })

        it('should export builder', function () {
            assert.ok(typeof massConvertUI.builder === 'object')
        })
    })

    describe('querySimpleUI', function () {
        let querySimpleUI

        before(async function () {
            querySimpleUI = await import('../bin/querySimpleUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(querySimpleUI.command, 'querySimpleUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(querySimpleUI.aliases))
            assert.ok(querySimpleUI.aliases.includes('qsui'))
            assert.ok(querySimpleUI.aliases.includes('querysimpleui'))
            assert.ok(querySimpleUI.aliases.includes('queryUI'))
            assert.ok(querySimpleUI.aliases.includes('sqlUI'))
        })

        it('should export dbQuery function', function () {
            assert.ok(typeof querySimpleUI.dbQuery === 'function')
        })
    })

    describe('readMeUI', function () {
        let readMeUI

        before(async function () {
            readMeUI = await import('../bin/readMeUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(readMeUI.command, 'readMeUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(readMeUI.aliases))
            assert.ok(readMeUI.aliases.includes('readmeui'))
            assert.ok(readMeUI.aliases.includes('readMeUi'))
        })

        it('should export readMe function', function () {
            assert.ok(typeof readMeUI.readMe === 'function')
        })
    })

    describe('schemasUI', function () {
        let schemasUI

        before(async function () {
            schemasUI = await import('../bin/schemasUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(schemasUI.command, 'schemasUI [schema]')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(schemasUI.aliases))
            assert.ok(schemasUI.aliases.includes('schui'))
            assert.ok(schemasUI.aliases.includes('getSchemasUI'))
        })

        it('should export getSchemas function', function () {
            assert.ok(typeof schemasUI.getSchemas === 'function')
        })
    })

    describe('systemInfoUI', function () {
        let systemInfoUI

        before(async function () {
            systemInfoUI = await import('../bin/systemInfoUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(systemInfoUI.command, 'systemInfoUI')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(systemInfoUI.aliases))
            assert.ok(systemInfoUI.aliases.includes('sysUI'))
            assert.ok(systemInfoUI.aliases.includes('sysinfoui'))
        })

        it('should export sysInfo function', function () {
            assert.ok(typeof systemInfoUI.sysInfo === 'function')
        })
    })

    describe('tablesUI', function () {
        let tablesUI

        before(async function () {
            tablesUI = await import('../bin/tablesUI.js')
        })

        it('should export command', function () {
            assert.strictEqual(tablesUI.command, 'tablesUI [schema] [table]')
        })

        it('should export aliases', function () {
            assert.ok(Array.isArray(tablesUI.aliases))
            assert.ok(tablesUI.aliases.includes('tui'))
            assert.ok(tablesUI.aliases.includes('listTablesUI'))
        })

        it('should export getTables function', function () {
            assert.ok(typeof tablesUI.getTables === 'function')
        })
    })

    describe('Command Structure Validation', function () {
        it('should verify all UI commands follow consistent patterns', async function () {
            const uiCommands = [
                '../bin/UI.js',
                '../bin/changeLogUI.js',
                '../bin/containersUI.js',
                '../bin/dataTypesUI.js',
                '../bin/featuresUI.js',
                '../bin/featureUsageUI.js',
                '../bin/functionsUI.js',
                '../bin/hanaCloudHDIInstancesUI.js',
                '../bin/hanaCloudSBSSInstancesUI.js',
                '../bin/hanaCloudSchemaInstancesUI.js',
                '../bin/hanaCloudSecureStoreInstancesUI.js',
                '../bin/hanaCloudUPSInstancesUI.js',
                '../bin/indexesUI.js',
                '../bin/inspectTableUI.js',
                '../bin/massConvertUI.js',
                '../bin/querySimpleUI.js',
                '../bin/readMeUI.js',
                '../bin/schemasUI.js',
                '../bin/systemInfoUI.js',
                '../bin/tablesUI.js'
            ]

            for (const commandPath of uiCommands) {
                const command = await import(commandPath)
                
                // All UI commands should have these exports
                assert.ok(typeof command.command === 'string', `${commandPath} should export command string`)
                assert.ok(Array.isArray(command.aliases), `${commandPath} should export aliases array`)
                assert.ok(typeof command.describe === 'string', `${commandPath} should export describe string`)
                assert.ok(typeof command.handler === 'function', `${commandPath} should export handler function`)
                
                // All UI commands should have builder (though some may use different patterns)
                // Some commands may not have builder property if they import it from elsewhere
            }
        })

        it('should verify all UI commands have at least one alias', async function () {
            const uiCommands = [
                '../bin/UI.js',
                '../bin/changeLogUI.js',
                '../bin/containersUI.js',
                '../bin/dataTypesUI.js',
                '../bin/featuresUI.js',
                '../bin/featureUsageUI.js',
                '../bin/functionsUI.js',
                '../bin/hanaCloudHDIInstancesUI.js',
                '../bin/hanaCloudSBSSInstancesUI.js',
                '../bin/hanaCloudSchemaInstancesUI.js',
                '../bin/hanaCloudSecureStoreInstancesUI.js',
                '../bin/hanaCloudUPSInstancesUI.js',
                '../bin/indexesUI.js',
                '../bin/inspectTableUI.js',
                '../bin/massConvertUI.js',
                '../bin/querySimpleUI.js',
                '../bin/readMeUI.js',
                '../bin/schemasUI.js',
                '../bin/systemInfoUI.js',
                '../bin/tablesUI.js'
            ]

            for (const commandPath of uiCommands) {
                const command = await import(commandPath)
                assert.ok(command.aliases.length > 0, `${commandPath} should have at least one alias`)
            }
        })
    })
})
