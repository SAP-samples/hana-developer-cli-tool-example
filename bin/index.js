// @ts-check
import * as baseLite from '../utils/base-lite.js'

// Command file paths for lazy loading - ordered alphabetically
const commandFiles = [
    './activateHDI.js', './adminHDI.js', './adminHDIGroup.js', './backup.js', './backupList.js',
    './backupStatus.js', './btp.js', './btpInfo.js', './btpInfoUI.js', './btpSubs.js',
    './cacheStats.js', './calcViewAnalyzer.js', './callProcedure.js', './certificates.js',
    './certificatesUI.js', './cds.js', './changeLog.js', './changeLogUI.js', './columnStats.js',
    './compareData.js', './compareSchema.js', './connect.js', './connectViaServiceKey.js',
    './containers.js', './containersUI.js', './copy2DefaultEnv.js', './copy2Env.js',
    './copy2Secrets.js', './createContainer.js', './createContainerUsers.js', './createGroup.js',
    './createJWT.js', './createModule.js', './createXSAAdmin.js', './dataDiff.js',
    './dataProfile.js', './dataTypes.js', './dataTypesUI.js', './dataVolumes.js', './disks.js',
    './dropContainer.js', './dropGroup.js', './export.js', './expensiveStatements.js',
    './features.js', './featuresUI.js', './featureUsage.js', './featureUsageUI.js', './functions.js',
    './functionsUI.js', './hanaCloudHDIInstances.js', './hanaCloudHDIInstancesUI.js',
    './hanaCloudInstances.js', './hanaCloudSBSSInstances.js', './hanaCloudSBSSInstancesUI.js',
    './hanaCloudSchemaInstances.js', './hanaCloudSchemaInstancesUI.js', './hanaCloudSecureStoreInstances.js',
    './hanaCloudSecureStoreInstancesUI.js', './hanaCloudStart.js', './hanaCloudStop.js',
    './hanaCloudUPSInstances.js', './hanaCloudUPSInstancesUI.js', './hdbsql.js', './hostInformation.js',
    './indexes.js', './indexesUI.js', './iniContents.js', './iniFiles.js', './inspectFunction.js',
    './inspectIndex.js', './inspectJWT.js', './inspectLibMember.js', './inspectLibrary.js',
    './inspectProcedure.js', './inspectTable.js', './inspectTableUI.js', './inspectTrigger.js',
    './inspectUser.js', './inspectView.js', './issue.js', './kafkaConnect.js', './libraries.js',
    './massConvert.js', './massConvertUI.js', './massDelete.js', './massExport.js', './massGrant.js',
    './massRename.js', './massUpdate.js', './massUsers.js', './memoryAnalysis.js', './objects.js',
    './openBAS.js', './openChangeLog.js', './openDBExplorer.js', './openReadMe.js', './ports.js',
    './privilegeError.js', './procedures.js', './queryPlan.js', './querySimple.js',
    './querySimpleUI.js', './readMe.js', './readMeUI.js', './reclaim.js', './restore.js',
    './rick.js', './roles.js', './schemas.js', './schemasUI.js', './sequences.js', './status.js',
    './synonyms.js', './systemInfo.js', './systemInfoUI.js', './tableHotspots.js', './tables.js',
    './tablesPG.js', './tablesSQLite.js', './tablesUI.js', './timeSeriesTools.js', './traces.js',
    './traceContents.js', './triggers.js', './UI.js', './users.js', './version.js', './views.js',
    './xsaServices.js'
]

export async function init() {
    baseLite.debug(`Command Init`)
    
    // Load all command modules in parallel
    const lazyCommands = await Promise.all(commandFiles.map(file => import(file)))
    
    baseLite.debug(`Command Init End`)
    return lazyCommands
}