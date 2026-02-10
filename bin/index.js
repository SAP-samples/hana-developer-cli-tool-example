// @ts-check
import * as baseLite from '../utils/base-lite.js'

// Command file paths for lazy loading
const commandFiles = [
    './activateHDI.js', './adminHDI.js', './adminHDIGroup.js', './btp.js', './btpSubs.js',
    './btpInfo.js', './callProcedure.js', './certificates.js', './cds.js', './openChangeLog.js',
    './changeLog.js', './changeLogUI.js', './connect.js', './containers.js', './containersUI.js',
    './copy2DefaultEnv.js', './copy2Env.js', './copy2Secrets.js', './createGroup.js', './createContainer.js',
    './createContainerUsers.js', './createJWT.js', './createModule.js', './createXSAAdmin.js',
    './dataTypes.js', './dataTypesUI.js', './dataVolumes.js', './disks.js', './dropGroup.js',
    './dropContainer.js', './features.js', './featuresUI.js', './featureUsage.js', './featureUsageUI.js',
    './functions.js', './functionsUI.js', './hanaCloudHDIInstances.js', './hanaCloudHDIInstancesUI.js',
    './hanaCloudInstances.js', './hanaCloudStart.js', './hanaCloudStop.js', './hdbsql.js',
    './hostInformation.js', './indexes.js', './indexesUI.js', './iniContents.js', './iniFiles.js',
    './inspectFunction.js', './inspectIndex.js', './inspectJWT.js', './inspectLibMember.js',
    './inspectLibrary.js', './inspectProcedure.js', './inspectTable.js', './inspectTableUI.js',
    './inspectTrigger.js', './inspectUser.js', './inspectView.js', './issue.js', './libraries.js',
    './massConvert.js', './massConvertUI.js', './massRename.js', './massUsers.js', './matrix.js',
    './objects.js', './openBAS.js', './openDBExplorer.js', './ports.js', './privilegeError.js',
    './procedures.js', './querySimple.js', './querySimpleUI.js', './readMe.js', './readMeUI.js',
    './openReadMe.js', './reclaim.js', './rick.js', './roles.js', './hanaCloudSBSSInstances.js',
    './hanaCloudSBSSInstancesUI.js', './schemas.js', './schemasUI.js', './hanaCloudSchemaInstances.js',
    './hanaCloudSchemaInstancesUI.js', './hanaCloudSecureStoreInstances.js', './hanaCloudSecureStoreInstancesUI.js',
    './connectViaServiceKey.js', './sequences.js', './status.js', './synonyms.js', './systemInfo.js',
    './systemInfoUI.js', './tables.js', './tablesPG.js', './tablesSQLite.js', './tablesUI.js',
    './traces.js', './traceContents.js', './triggers.js', './UI.js', './hanaCloudUPSInstances.js',
    './hanaCloudUPSInstancesUI.js', './users.js', './version.js', './views.js'
]

export async function init() {
    baseLite.debug(`Command Init`)
    
    // Load all command modules in parallel
    const lazyCommands = await Promise.all(commandFiles.map(file => import(file)))
    
    baseLite.debug(`Command Init End`)
    return lazyCommands
}