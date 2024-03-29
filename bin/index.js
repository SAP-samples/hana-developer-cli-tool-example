// @ts-check
import * as base from '../utils/base.js'
export async function init() {
    base.debug(`Command Init`)
     const [
        activateHDI, adminHDI, adminHDIGroup, callProcedure, certificates, cds, openChangeLog,
        changeLog, changeLogUI, connect, containers, containersUI, copy2DefaultEnv, copy2Env,
        copy2Secrets, createGroup, createContainer, createContainerUsers, createJWT, createModule,
        createXSAAdmin, dataTypes, dataTypesUI, dataVolumes, disks, dropGroup, dropContainer, features,
        featuresUI, featureUsage, featureUsageUI, functions, functionsUI, hanaCloudHDIInstances,
        hanaCloudHDIInstancesUI, hanaCloudInstances, hanaCloudStart, hanaCloudStop, hdbsql,
        hostInformation, indexes, indexesUI, iniContents, iniFiles, inspectFunction,
        inspectIndex, inspectJWT, inspectLibMember, inspectLibrary, inspectProcedure,
        inspectTable, inspectTableUI, inspectTrigger, inspectUser, inspectView,
        libraries, massConvert, massConvertUI, massRename, massUsers, matrix, objects,
        openBAS, openDBExplorer, ports, privilegeError, procedures, querySimple, querySimpleUI, readMe, readMeUI,
        openReadMe, reclaim, rick, roles, hanaCloudSBSSInstances, hanaCloudSBSSInstancesUI,
        schemas, schemasUI, hanaCloudSchemaInstances, hanaCloudSchemaInstancesUI,
        hanaCloudSecureStoreInstances, hanaCloudSecureStoreInstancesUI, connectViaServiceKey,
        sequences, status, synonyms, systemInfo, systemInfoUI, tables, tablesPG, tablesSQLite, tablesUI, //test,
        traces, traceContents, triggers, UI, hanaCloudUPSInstances, hanaCloudUPSInstancesUI,
        users, version, views, btp, btpSubs, btpInfo, issue
    ] = await Promise.all([
        import('./activateHDI.js'),
        import('./adminHDI.js'),
        import('./adminHDIGroup.js'),
        import('./callProcedure.js'),
        import('./certificates.js'),
        import('./cds.js'),
        import('./openChangeLog.js'),
        import('./changeLog.js'),
        import('./changeLogUI.js'),
        import('./connect.js'),
        import('./containers.js'),
        import('./containersUI.js'),
        import('./copy2DefaultEnv.js'),
        import('./copy2Env.js'),
        import('./copy2Secrets.js'),
        import('./createContainer.js'),
        import('./createGroup.js'),
        import('./createContainerUsers.js'),
        import('./createJWT.js'),
        import('./createModule.js'),
        import('./createXSAAdmin.js'),
        import('./dataTypes.js'),
        import('./dataTypesUI.js'),
        import('./dataVolumes.js'),
        import('./disks.js'),
        import('./dropContainer.js'),
        import('./dropGroup.js'),
        import('./features.js'),
        import('./featuresUI.js'),
        import('./featureUsage.js'),
        import('./featureUsageUI.js'),
        import('./functions.js'),
        import('./functionsUI.js'),
        import('./hanaCloudHDIInstances.js'),
        import('./hanaCloudHDIInstancesUI.js'),
        import('./hanaCloudInstances.js'),
        import('./hanaCloudStart.js'),
        import('./hanaCloudStop.js'),
        import('./hdbsql.js'),
        import('./hostInformation.js'),
        import('./indexes.js'),
        import('./indexesUI.js'),
        import('./iniContents.js'),
        import('./iniFiles.js'),
        import('./inspectFunction.js'),
        import('./inspectIndex.js'),
        import('./inspectJWT.js'),
        import('./inspectLibMember.js'),
        import('./inspectLibrary.js'),
        import('./inspectProcedure.js'),
        import('./inspectTable.js'),
        import('./inspectTableUI.js'),
        import('./inspectTrigger.js'),
        import('./inspectUser.js'),
        import('./inspectView.js'),
        import('./libraries.js'),
        import('./massConvert.js'),
        import('./massConvertUI.js'),
        import('./massRename.js'),
        import('./massUsers.js'),
        import('./matrix.js'),
        import('./objects.js'),
        import('./openBAS.js'),
        import('./openDBExplorer.js'),
        import('./ports.js'),
        import('./privilegeError.js'),
        import('./procedures.js'),
        import('./querySimple.js'),
        import('./querySimpleUI.js'),
        import('./readMe.js'),
        import('./readMeUI.js'),
        import('./openReadMe.js'),
        import('./reclaim.js'),
        import('./rick.js'),
        import('./roles.js'),
        import('./hanaCloudSBSSInstances.js'),
        import('./hanaCloudSBSSInstancesUI.js'),
        import('./schemas.js'),
        import('./schemasUI.js'),
        import('./hanaCloudSchemaInstances.js'),
        import('./hanaCloudSchemaInstancesUI.js'),
        import('./hanaCloudSecureStoreInstances.js'),
        import('./hanaCloudSecureStoreInstancesUI.js'),
        import('./connectViaServiceKey.js'),
        import('./sequences.js'),
        import('./status.js'),
        import('./synonyms.js'),
        import('./systemInfo.js'),
        import('./systemInfoUI.js'),
        import('./tables.js'),
        import('./tablesPG.js'),
        import('./tablesSQLite.js'),
        import('./tablesUI.js'),
        //import('./test.js'),
        import('./traces.js'),
        import('./traceContents.js'),
        import('./triggers.js'),
        import('./UI.js'),
        import('./hanaCloudUPSInstances.js'),
        import('./hanaCloudUPSInstancesUI.js'),
        import('./users.js'),
        import('./version.js'),
        import('./views.js'),
        import('./btp.js'),
        import('./btpSubs.js'),
        import('./btpInfo.js'),
        import('./issue.js')
    ])
    base.debug(`Command Init End`)
    return [
        activateHDI, adminHDI, adminHDIGroup, btp, btpSubs, btpInfo, callProcedure, certificates, cds, openChangeLog,
        changeLog, changeLogUI, connect, containers, containersUI, copy2DefaultEnv, copy2Env,
        copy2Secrets, createGroup, createContainer, createContainerUsers, createJWT, createModule,
        createXSAAdmin, dataTypes, dataTypesUI, dataVolumes, disks, dropGroup, dropContainer, features,
        featuresUI, featureUsage, featureUsageUI, functions, functionsUI, hanaCloudHDIInstances,
        hanaCloudHDIInstancesUI, hanaCloudInstances, hanaCloudStart, hanaCloudStop, hdbsql,
        hostInformation, indexes, indexesUI, iniContents, iniFiles, inspectFunction,
        inspectIndex, inspectJWT, inspectLibMember, inspectLibrary, inspectProcedure,
        inspectTable, inspectTableUI, inspectTrigger, inspectUser, inspectView,
        issue, libraries, massConvert, massConvertUI, massRename, massUsers, matrix, objects,
        openBAS, openDBExplorer, ports, privilegeError, procedures, querySimple, querySimpleUI, readMe, readMeUI,
        openReadMe, reclaim, rick, roles, hanaCloudSBSSInstances, hanaCloudSBSSInstancesUI,
        schemas, schemasUI, hanaCloudSchemaInstances, hanaCloudSchemaInstancesUI,
        hanaCloudSecureStoreInstances, hanaCloudSecureStoreInstancesUI, connectViaServiceKey,
        sequences, status, synonyms, systemInfo, systemInfoUI, tables, tablesPG, tablesSQLite, tablesUI, //test,
        traces, traceContents, triggers, UI, hanaCloudUPSInstances, hanaCloudUPSInstancesUI,
        users, version, views
    ]  
}