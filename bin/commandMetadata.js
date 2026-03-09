// @ts-check
/**
 * @module commandMetadata - Central registry for command documentation categories and relationships
 * 
 * This file maps each command to:
 * - Its documentation category (used in URLs)
 * - Related commands (shown in "see also" section)
 * 
 * Easy to maintain mapping for help output generation.
 */

export const commandMetadata = {
    // Data Tools
    import: { category: 'data-tools', relatedCommands: ['export', 'dataValidator'] },
    imp: { category: 'data-tools', relatedCommands: ['export', 'dataValidator'] },
    uploadData: { category: 'data-tools', relatedCommands: ['export', 'dataValidator'] },
    uploaddata: { category: 'data-tools', relatedCommands: ['export', 'dataValidator'] },
    export: { category: 'data-tools', relatedCommands: ['import', 'massExport'] },
    exp: { category: 'data-tools', relatedCommands: ['import', 'massExport'] },
    downloadData: { category: 'data-tools', relatedCommands: ['import', 'massExport'] },
    downloaddata: { category: 'data-tools', relatedCommands: ['import', 'massExport'] },
    compareData: { category: 'data-tools', relatedCommands: ['compareSchema', 'dataDiff'] },
    compareSchema: { category: 'data-tools', relatedCommands: ['compareData', 'schemaClone'] },
    dataDiff: { category: 'data-tools', relatedCommands: ['compareData', 'dataValidator'] },
    dataValidator: { category: 'data-tools', relatedCommands: ['import', 'dataProfile'] },
    dataProfile: { category: 'data-tools', relatedCommands: ['dataValidator', 'duplicateDetection'] },
    dataSync: { category: 'data-tools', relatedCommands: ['import', 'export'] },
    duplicateDetection: { category: 'data-tools', relatedCommands: ['dataProfile', 'dataValidator'] },
    kafkaConnect: { category: 'data-tools', relatedCommands: ['dataSync', 'import'] },
    dataLineage: { category: 'data-tools', relatedCommands: ['dataProfile', 'compareData'] },
    dataMask: { category: 'data-tools', relatedCommands: ['dataValidator', 'import'] },

    // Schema Tools
    tables: { category: 'schema-tools', relatedCommands: ['inspectTable', 'tableGroups', 'schemas'] },
    schemas: { category: 'schema-tools', relatedCommands: ['objects', 'schemaClone', 'tables'] },
    schemaClone: { category: 'schema-tools', relatedCommands: ['schemas', 'tables', 'export'] },
    views: { category: 'schema-tools', relatedCommands: ['inspectView', 'tables', 'procedures'] },
    procedures: { category: 'schema-tools', relatedCommands: ['inspectProcedure', 'functions', 'views'] },
    functions: { category: 'schema-tools', relatedCommands: ['inspectFunction', 'procedures', 'objects'] },
    indexes: { category: 'schema-tools', relatedCommands: ['inspectIndex', 'tables', 'tableHotspots'] },
    objects: { category: 'schema-tools', relatedCommands: ['schemas', 'tables', 'views'] },
    sequences: { category: 'schema-tools', relatedCommands: ['tables', 'objects'] },
    libraries: { category: 'schema-tools', relatedCommands: ['inspectLibrary', 'inspectLibMember'] },
    synonyms: { category: 'schema-tools', relatedCommands: ['tables', 'views', 'procedures'] },
    triggers: { category: 'schema-tools', relatedCommands: ['inspectTrigger', 'procedures', 'tables'] },

    // Object Inspection
    inspectTable: { category: 'object-inspection', relatedCommands: ['tables', 'inspectView', 'columnStats'] },
    inspectView: { category: 'object-inspection', relatedCommands: ['views', 'inspectTable', 'inspectProcedure'] },
    inspectProcedure: { category: 'object-inspection', relatedCommands: ['procedures', 'inspectFunction', 'callProcedure'] },
    inspectFunction: { category: 'object-inspection', relatedCommands: ['functions', 'inspectProcedure'] },
    inspectIndex: { category: 'object-inspection', relatedCommands: ['indexes', 'tables', 'tableHotspots'] },
    inspectJWT: { category: 'object-inspection', relatedCommands: ['createJWT'] },
    inspectLibrary: { category: 'object-inspection', relatedCommands: ['libraries', 'inspectLibMember'] },
    inspectLibMember: { category: 'object-inspection', relatedCommands: ['libraries', 'inspectLibrary'] },
    inspectTrigger: { category: 'object-inspection', relatedCommands: ['triggers', 'inspectProcedure', 'tables'] },
    inspectTableUI: { category: 'object-inspection', relatedCommands: ['tables', 'inspectTable'] },

    // Analysis Tools
    calcViewAnalyzer: { category: 'analysis-tools', relatedCommands: ['views', 'erdDiagram'] },
    erdDiagram: { category: 'analysis-tools', relatedCommands: ['calcViewAnalyzer', 'schemaClone', 'graphWorkspaces'] },
    graphWorkspaces: { category: 'analysis-tools', relatedCommands: ['erdDiagram', 'objects'] },
    privilegeAnalysis: { category: 'analysis-tools', relatedCommands: ['roles', 'users', 'grantChains'] },
    grantChains: { category: 'analysis-tools', relatedCommands: ['privilegeAnalysis', 'privilegeError', 'roles'] },
    privilegeError: { category: 'analysis-tools', relatedCommands: ['grantChains', 'privilegeAnalysis'] },
    referentialCheck: { category: 'analysis-tools', relatedCommands: ['tables', 'compareData', 'dataValidator'] },

    // Performance Monitoring
    expensiveStatements: { category: 'performance-monitoring', relatedCommands: ['longRunning', 'queryPlan', 'blocking'] },
    longRunning: { category: 'performance-monitoring', relatedCommands: ['expensiveStatements', 'deadlocks', 'blocking'] },
    deadlocks: { category: 'performance-monitoring', relatedCommands: ['longRunning', 'blocking', 'healthCheck'] },
    blocking: { category: 'performance-monitoring', relatedCommands: ['deadlocks', 'longRunning', 'connections'] },
    queryPlan: { category: 'performance-monitoring', relatedCommands: ['querySimple', 'expensiveStatements'] },
    querySimple: { category: 'performance-monitoring', relatedCommands: ['queryPlan', 'expensiveStatements'] },
    querySimpleUI: { category: 'performance-monitoring', relatedCommands: ['querySimple'] },
    columnStats: { category: 'performance-monitoring', relatedCommands: ['tables', 'inspectTable', 'tableHotspots'] },
    tableHotspots: { category: 'performance-monitoring', relatedCommands: ['columnStats', 'indexes', 'inspectTable'] },
    indexTest: { category: 'performance-monitoring', relatedCommands: ['indexes', 'tableHotspots'] },
    memoryAnalysis: { category: 'performance-monitoring', relatedCommands: ['memoryLeaks', 'healthCheck', 'systemInfo'] },
    memoryLeaks: { category: 'performance-monitoring', relatedCommands: ['memoryAnalysis', 'healthCheck'] },
    fragmentationCheck: { category: 'performance-monitoring', relatedCommands: ['reclaim', 'healthCheck'] },
    reclaim: { category: 'performance-monitoring', relatedCommands: ['fragmentationCheck', 'dataVolumes'] },

    // Backup & Recovery
    backup: { category: 'backup-recovery', relatedCommands: ['backupStatus', 'backupList', 'restore'] },
    backupStatus: { category: 'backup-recovery', relatedCommands: ['backup', 'backupList', 'replicationStatus'] },
    backupList: { category: 'backup-recovery', relatedCommands: ['backup', 'backupStatus', 'restore'] },
    restore: { category: 'backup-recovery', relatedCommands: ['backup', 'backupList', 'backupStatus'] },
    replicationStatus: { category: 'backup-recovery', relatedCommands: ['backupStatus', 'backup', 'healthCheck'] },

    // System Information
    systemInfo: { category: 'system-admin', relatedCommands: ['status', 'healthCheck', 'version'] },
    systemInfoUI: { category: 'system-admin', relatedCommands: ['systemInfo', 'healthCheck'] },
    status: { category: 'system-admin', relatedCommands: ['systemInfo', 'healthCheck', 'connections'] },
    healthCheck: { category: 'system-admin', relatedCommands: ['systemInfo', 'status', 'diagnose'] },
    version: { category: 'system-tools', relatedCommands: ['systemInfo', 'status'] },
    diagnose: { category: 'system-admin', relatedCommands: ['healthCheck', 'systemInfo', 'status'] },

    // Users & Roles
    users: { category: 'security', relatedCommands: ['roles', 'inspectUser', 'massUsers'] },
    roles: { category: 'security', relatedCommands: ['users', 'inspectUser', 'grantChains'] },
    inspectUser: { category: 'security', relatedCommands: ['users', 'roles', 'pwdPolicy'] },
    massUsers: { category: 'mass-operations', relatedCommands: ['users', 'roles', 'massGrant'] },
    massGrant: { category: 'mass-operations', relatedCommands: ['massUsers', 'users', 'roles'] },
    pwdPolicy: { category: 'security', relatedCommands: ['users', 'inspectUser'] },
    createXSAAdmin: { category: 'security', relatedCommands: ['users', 'roles', 'createGroup'] },
    createGroup: { category: 'security', relatedCommands: ['createXSAAdmin', 'users', 'roles'] },
    dropGroup: { category: 'security', relatedCommands: ['createGroup', 'users', 'roles'] },

    // Mass Operations
    massExport: { category: 'mass-operations', relatedCommands: ['export', 'massDelete'] },
    massDelete: { category: 'mass-operations', relatedCommands: ['massExport', 'massUpdate'] },
    massUpdate: { category: 'mass-operations', relatedCommands: ['massDelete', 'massConvert'] },
    massConvert: { category: 'mass-operations', relatedCommands: ['massUpdate', 'massRename'] },
    massConvertUI: { category: 'mass-operations', relatedCommands: ['massConvert'] },
    massRename: { category: 'mass-operations', relatedCommands: ['massConvert', 'massUpdate'] },

    // Connection & Authentication
    connect: { category: 'connection-auth', relatedCommands: ['connections', 'connectViaServiceKey', 'config'] },
    connections: { category: 'connection-auth', relatedCommands: ['connect', 'connectViaServiceKey', 'status'] },
    connectViaServiceKey: { category: 'connection-auth', relatedCommands: ['connect', 'connections', 'config'] },
    config: { category: 'connection-auth', relatedCommands: ['connect', 'connections'] },
    copy2DefaultEnv: { category: 'connection-auth', relatedCommands: ['connect', 'config', 'copy2Env'] },
    copy2Env: { category: 'connection-auth', relatedCommands: ['connect', 'config', 'copy2Secrets'] },
    copy2Secrets: { category: 'connection-auth', relatedCommands: ['connect', 'copy2Env'] },
    createJWT: { category: 'connection-auth', relatedCommands: ['inspectJWT', 'connectViaServiceKey'] },

    // BTP Integration
    btp: { category: 'btp-integration', relatedCommands: ['btpInfo', 'btpTarget', 'btpSubs', 'hanaCloudInstances'] },
    btpInfo: { category: 'btp-integration', relatedCommands: ['btp', 'btpTarget', 'btpSubs'] },
    btpInfoUI: { category: 'btp-integration', relatedCommands: ['btpInfo', 'btp'] },
    btpTarget: { category: 'btp-integration', relatedCommands: ['btp', 'btpInfo', 'btpSubs'] },
    btpSubs: { category: 'btp-integration', relatedCommands: ['btp', 'btpInfo', 'hanaCloudInstances'] },

    // HANA Cloud
    hanaCloudInstances: { category: 'hana-cloud', relatedCommands: ['hanaCloudStart', 'hanaCloudStop', 'hanaCloudHDIInstances'] },
    hanaCloudStart: { category: 'hana-cloud', relatedCommands: ['hanaCloudStop', 'hanaCloudInstances'] },
    hanaCloudStop: { category: 'hana-cloud', relatedCommands: ['hanaCloudStart', 'hanaCloudInstances'] },
    hanaCloudHDIInstances: { category: 'hana-cloud', relatedCommands: ['hanaCloudInstances', 'adminHDI'] },
    hanaCloudHDIInstancesUI: { category: 'hana-cloud', relatedCommands: ['hanaCloudHDIInstances'] },
    hanaCloudSchemaInstances: { category: 'hana-cloud', relatedCommands: ['hanaCloudInstances', 'schemas'] },
    hanaCloudSchemaInstancesUI: { category: 'hana-cloud', relatedCommands: ['hanaCloudSchemaInstances'] },
    hanaCloudSBSSInstances: { category: 'hana-cloud', relatedCommands: ['hanaCloudInstances'] },
    hanaCloudSBSSInstancesUI: { category: 'hana-cloud', relatedCommands: ['hanaCloudSBSSInstances'] },
    hanaCloudSecureStoreInstances: { category: 'hana-cloud', relatedCommands: ['hanaCloudInstances', 'certificates'] },
    hanaCloudSecureStoreInstancesUI: { category: 'hana-cloud', relatedCommands: ['hanaCloudSecureStoreInstances'] },
    hanaCloudUPSInstances: { category: 'hana-cloud', relatedCommands: ['hanaCloudInstances'] },
    hanaCloudUPSInstancesUI: { category: 'hana-cloud', relatedCommands: ['hanaCloudUPSInstances'] },

    // HDI Management
    adminHDI: { category: 'hdi-management', relatedCommands: ['adminHDIGroup', 'hanaCloudHDIInstances'] },
    adminHDIGroup: { category: 'hdi-management', relatedCommands: ['adminHDI', 'activateHDI'] },
    activateHDI: { category: 'hdi-management', relatedCommands: ['adminHDI', 'adminHDIGroup', 'cds'] },
    createModule: { category: 'developer-tools', relatedCommands: ['generateTestData', 'codeTemplate'] },
    dropContainer: { category: 'hdi-management', relatedCommands: ['createContainer', 'containers'] },
    createContainer: { category: 'hdi-management', relatedCommands: ['dropContainer', 'containers', 'createContainerUsers'] },
    createContainerUsers: { category: 'hdi-management', relatedCommands: ['createContainer', 'users'] },
    containers: { category: 'hdi-management', relatedCommands: ['createContainer', 'dropContainer', 'containersUI'] },
    containersUI: { category: 'hdi-management', relatedCommands: ['containers'] },

    // Development Tools  
    cds: { category: 'developer-tools', relatedCommands: ['activateHDI', 'generateDocs', 'codeTemplate'] },
    codeTemplate: { category: 'developer-tools', relatedCommands: ['createModule', 'generateTestData'] },
    generateTestData: { category: 'developer-tools', relatedCommands: ['codeTemplate', 'import', 'dataProfile'] },
    generateDocs: { category: 'developer-tools', relatedCommands: ['viewDocs', 'helpDocu', 'readMe'] },
    examples: { category: 'developer-tools', relatedCommands: ['viewDocs', 'interactive', 'kb'] },
    callProcedure: { category: 'developer-tools', relatedCommands: ['inspectProcedure', 'procedures'] },
    hdbsql: { category: 'developer-tools', relatedCommands: ['querySimple', 'callProcedure'] },
    test: { category: 'developer-tools', relatedCommands: ['cds', 'activateHDI'] },

    // Security
    certificates: { category: 'security', relatedCommands: ['certificatesUI', 'encryptionStatus'] },
    certificatesUI: { category: 'security', relatedCommands: ['certificates'] },
    encryptionStatus: { category: 'security', relatedCommands: ['certificates', 'healthCheck'] },
    securityScan: { category: 'security', relatedCommands: ['pwdPolicy', 'users', 'healthCheck'] },
    auditLog: { category: 'security', relatedCommands: ['systemInfo', 'securityScan'] },

    // System Tools & Utilities
    hostInformation: { category: 'system-tools', relatedCommands: ['systemInfo', 'disks', 'ports'] },
    disks: { category: 'system-tools', relatedCommands: ['hostInformation', 'dataVolumes', 'ports'] },
    dataVolumes: { category: 'system-tools', relatedCommands: ['disks', 'fragmentationCheck', 'reclaim'] },
    ports: { category: 'system-tools', relatedCommands: ['hostInformation', 'disks', 'systemInfo'] },
    cacheStats: { category: 'system-tools', relatedCommands: ['memoryAnalysis', 'systemInfo'] },
    alerts: { category: 'system-tools', relatedCommands: ['healthCheck', 'systemInfo'] },

    // Database Utilities
    spatialData: { category: 'system-tools', relatedCommands: ['tables', 'dataProfile'] },
    ftIndexes: { category: 'schema-tools', relatedCommands: ['indexes', 'tables'] },
    sdiTasks: { category: 'developer-tools', relatedCommands: ['dataSync', 'connections'] },
    timeSeriesTools: { category: 'developer-tools', relatedCommands: ['tables', 'dataProfile'] },
    workloadManagement: { category: 'system-admin', relatedCommands: ['status', 'longRunning', 'healthCheck'] },
    traceContents: { category: 'system-tools', relatedCommands: ['traces', 'diagnose'] },
    traces: { category: 'system-tools', relatedCommands: ['traceContents', 'healthCheck'] },
    crashDumps: { category: 'system-tools', relatedCommands: ['diagnose', 'healthCheck'] },
    xsaServices: { category: 'system-admin', relatedCommands: ['systemInfo', 'status'] },

    // UI Commands
    UI: { category: 'developer-tools', relatedCommands: ['readMeUI', 'helpDocu'] },
    readMeUI: { category: 'developer-tools', relatedCommands: ['readMe', 'UI', 'openReadMe'] },
    readMe: { category: 'developer-tools', relatedCommands: ['readMeUI', 'helpDocu', 'openReadMe'] },
    openReadMe: { category: 'developer-tools', relatedCommands: ['readMe', 'helpDocu'] },
    helpDocu: { category: 'developer-tools', relatedCommands: ['viewDocs', 'kb', 'readMe'] },
    viewDocs: { category: 'developer-tools', relatedCommands: ['helpDocu', 'kb', 'examples'] },
    kb: { category: 'developer-tools', relatedCommands: ['viewDocs', 'helpDocu', 'examples'] },
    interactive: { category: 'developer-tools', relatedCommands: ['helpDocu', 'examples', 'kb'] },
    openChangeLog: { category: 'system-tools', relatedCommands: ['changeLog', 'version'] },
    changeLog: { category: 'system-tools', relatedCommands: ['changeLogUI', 'openChangeLog', 'version'] },
    changeLogUI: { category: 'system-tools', relatedCommands: ['changeLog'] },
    openDBExplorer: { category: 'schema-tools', relatedCommands: ['tables', 'schemas', 'objects'] },
    openBAS: { category: 'developer-tools', relatedCommands: ['cds', 'activateHDI'] },
    issue: { category: 'developer-tools', relatedCommands: ['diagnose', 'helpDocu'] },

    // UI Feature Flags
    features: { category: 'system-tools', relatedCommands: ['featuresUI', 'systemInfo'] },
    featuresUI: { category: 'system-tools', relatedCommands: ['features'] },
    featureUsage: { category: 'system-tools', relatedCommands: ['featureUsageUI', 'features'] },
    featureUsageUI: { category: 'system-tools', relatedCommands: ['featureUsage'] },

    // Table Utilities
    tableGroups: { category: 'schema-tools', relatedCommands: ['tables', 'objects'] },
    tablesUI: { category: 'schema-tools', relatedCommands: ['tables', 'inspectTable'] },
    tablesPG: { category: 'schema-tools', relatedCommands: ['tables', 'tablesSQLite'] },
    tablesSQLite: { category: 'schema-tools', relatedCommands: ['tables', 'tablesPG'] },
    tableCopy: { category: 'mass-operations', relatedCommands: ['export', 'import', 'tables'] },
    partitions: { category: 'schema-tools', relatedCommands: ['tables', 'inspectTable', 'tableHotspots'] },

    // Data Type Tools
    dataTypes: { category: 'schema-tools', relatedCommands: ['dataTypesUI', 'tables'] },
    dataTypesUI: { category: 'schema-tools', relatedCommands: ['dataTypes'] },
    
    // UI Variants
    functionsUI: { category: 'schema-tools', relatedCommands: ['functions'] },
    importUI: { category: 'data-tools', relatedCommands: ['import'] },
    indexesUI: { category: 'schema-tools', relatedCommands: ['indexes'] },
    schemasUI: { category: 'schema-tools', relatedCommands: ['schemas'] },
    iniContents: { category: 'system-tools', relatedCommands: ['iniFiles', 'config'] },
    iniFiles: { category: 'system-tools', relatedCommands: ['iniContents', 'config'] },
    
    // Special/Legacy
    rick: { category: 'system-tools', relatedCommands: ['version', 'healthCheck'] },

    // Recommendations
    recommendations: { category: 'performance-monitoring', relatedCommands: ['healthCheck', 'expensiveStatements'] },
    dependencies: { category: 'analysis-tools', relatedCommands: ['objects', 'views', 'procedures'] },

    // Add default for any unmapped commands
}

/**
 * Get metadata for a command
 * @param {string} commandName - The command name (including aliases)
 * @returns {Object|null} Metadata object or null if not found
 */
export function getCommandMetadata(commandName) {
    return commandMetadata[commandName] || null
}

/**
 * Get primary command name from alias
 * @param {string} commandOrAlias - The command or alias name
 * @returns {string} The canonical command name
 */
export function getPrimaryCommand(commandOrAlias) {
    const meta = commandMetadata[commandOrAlias]
    if (!meta) return commandOrAlias
    
    // Find the primary (non-alias) command by looking for one without the same metadata in the canonical form
    // For simplicity, return the first one found with this metadata
    for (const [cmd, metadata] of Object.entries(commandMetadata)) {
        if (metadata === meta && !['imp', 'exp', 'uploadData', 'downloadData'].includes(cmd)) {
            return cmd
        }
    }
    return commandOrAlias
}

export default {
    commandMetadata,
    getCommandMetadata,
    getPrimaryCommand
}
