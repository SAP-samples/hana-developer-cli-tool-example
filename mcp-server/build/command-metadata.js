/**
 * Command metadata mapping - categorizes commands and provides discovery information
 * Categories help agents understand available functionality at a glance
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { commandMetadata: CLI_COMMAND_METADATA } = require('../../bin/commandMetadata.js');
/**
 * Category definitions with descriptions
 */
export const CATEGORIES = {
    'data-tools': {
        name: 'Data Tools',
        description: 'Import, export, compare, validate, and manage data across systems',
    },
    'schema-tools': {
        name: 'Schema Tools',
        description: 'Explore schemas, tables, views, and database object metadata',
    },
    'object-inspection': {
        name: 'Object Inspection',
        description: 'Inspect tables, views, procedures, indexes, and related objects',
    },
    'analysis-tools': {
        name: 'Analysis Tools',
        description: 'Analyze dependencies, privileges, calculations, and relationships',
    },
    'performance-monitoring': {
        name: 'Performance Monitoring',
        description: 'Monitor performance, expensive operations, and system bottlenecks',
    },
    'backup-recovery': {
        name: 'Backup & Recovery',
        description: 'Create backups, manage restores, and verify recovery readiness',
    },
    'system-admin': {
        name: 'System Administration',
        description: 'System health, configuration, diagnostics, and maintenance',
    },
    'system-tools': {
        name: 'System Tools',
        description: 'System diagnostics, logs, host info, and runtime utilities',
    },
    'security': {
        name: 'Security',
        description: 'User, role, privilege, and security audit management',
    },
    'mass-operations': {
        name: 'Mass Operations',
        description: 'Bulk operations for grants, updates, deletions, and conversions',
    },
    'connection-auth': {
        name: 'Connection & Auth',
        description: 'Connection setup, authentication helpers, and configuration tools',
    },
    'btp-integration': {
        name: 'BTP Integration',
        description: 'SAP BTP integration tools and account management utilities',
    },
    'hana-cloud': {
        name: 'HANA Cloud',
        description: 'Manage SAP HANA Cloud instances and related services',
    },
    'hdi-management': {
        name: 'HDI Management',
        description: 'Manage HDI containers, groups, and deployment operations',
    },
    'developer-tools': {
        name: 'Developer Tools',
        description: 'Developer utilities, templates, docs, and interactive helpers',
    },
};
/**
 * Complete command metadata registry
 * Organized by command name for quick lookup
 */
const ENRICHED_COMMAND_METADATA = {
    // Database Information
    'status': {
        category: 'database-info',
        tags: ['connection', 'user', 'session', 'roles', 'diagnostic'],
        useCases: ['Check current database user and connection', 'View granted roles', 'Verify database connection'],
        prerequisites: ['Active database connection'],
        relatedCommands: ['systemInfo', 'healthCheck'],
    },
    'version': {
        category: 'database-info',
        tags: ['version', 'build', 'platform'],
        useCases: ['Check HANA version', 'Verify platform information'],
        prerequisites: ['Active database connection'],
    },
    'schemas': {
        category: 'database-info',
        tags: ['schema', 'metadata', 'structure'],
        useCases: ['List all schemas', 'Discover database structure'],
        prerequisites: ['Active database connection'],
        relatedCommands: ['tables', 'views', 'objects'],
    },
    'tables': {
        category: 'database-info',
        tags: ['table', 'metadata', 'structure', 'catalog'],
        useCases: ['Find tables in schema', 'Analyze table properties'],
        prerequisites: ['Active database connection'],
        relatedCommands: ['views', 'schemas', 'inspectTable', 'indexes'],
    },
    'views': {
        category: 'database-info',
        tags: ['view', 'metadata', 'structure'],
        useCases: ['List views', 'Analyze view definitions'],
        relatedCommands: ['tables', 'inspectView', 'dependencies'],
    },
    'procedures': {
        category: 'database-info',
        tags: ['procedure', 'metadata', 'sql'],
        useCases: ['Find stored procedures', 'Analyze procedure definitions'],
        relatedCommands: ['functions', 'callProcedure', 'inspectProcedure'],
    },
    'functions': {
        category: 'database-info',
        tags: ['function', 'metadata', 'sql'],
        useCases: ['List functions', 'Analyze function definitions'],
        relatedCommands: ['procedures', 'inspectFunction'],
    },
    'indexes': {
        category: 'database-info',
        tags: ['index', 'metadata', 'performance'],
        useCases: ['List indexes on tables', 'Analyze index definitions'],
        relatedCommands: ['ftIndexes', 'inspectIndex', 'indexTest'],
    },
    'objects': {
        category: 'database-info',
        tags: ['object', 'metadata', 'catalog'],
        useCases: ['List all database objects', 'Search by object type'],
    },
    'sequences': {
        category: 'database-info',
        tags: ['sequence', 'metadata'],
        useCases: ['List sequences'],
    },
    'synonyms': {
        category: 'database-info',
        tags: ['synonym', 'metadata'],
        useCases: ['List synonyms'],
    },
    'dependencies': {
        category: 'database-info',
        tags: ['dependency', 'metadata', 'analysis'],
        useCases: ['Find object dependencies', 'Understand impact of drops'],
    },
    'triggers': {
        category: 'database-info',
        tags: ['trigger', 'metadata'],
        useCases: ['List triggers on tables'],
        relatedCommands: ['inspectTrigger'],
    },
    // Data Quality & Validation
    'dataValidator': {
        category: 'data-quality',
        tags: ['validation', 'quality', 'rules', 'checking'],
        useCases: ['Validate data against rules', 'Check data quality', 'Find invalid records'],
        prerequisites: ['Active database connection', 'Target table exists', 'Validation rules defined'],
        relatedCommands: ['dataProfile', 'duplicateDetection', 'referentialCheck'],
    },
    'dataProfile': {
        category: 'data-quality',
        tags: ['profiling', 'statistics', 'data-analysis'],
        useCases: ['Profile table data', 'Analyze column distributions', 'Identify data patterns'],
        prerequisites: ['Active database connection', 'Target table exists'],
        relatedCommands: ['dataValidator', 'columnStats'],
    },
    'duplicateDetection': {
        category: 'data-quality',
        tags: ['duplicates', 'quality', 'anomaly'],
        useCases: ['Find duplicate records', 'Identify data redundancy'],
        prerequisites: ['Active database connection', 'Target table exists'],
        relatedCommands: ['dataValidator', 'dataProfile'],
    },
    'referentialCheck': {
        category: 'data-quality',
        tags: ['referential-integrity', 'foreign-keys', 'validation'],
        useCases: ['Check foreign key integrity', 'Find orphaned records'],
        prerequisites: ['Active database connection', 'Foreign key constraints defined'],
        relatedCommands: ['dataValidator'],
    },
    // Data Operations
    'import': {
        category: 'data-operations',
        tags: ['import', 'upload', 'load-data', 'csv', 'excel'],
        useCases: ['Load data from CSV/Excel', 'Upload data to table'],
        prerequisites: ['Active database connection', 'Target table exists with compatible structure', 'CSV or Excel file available'],
        relatedCommands: ['export', 'tableCopy', 'dataSync'],
    },
    'export': {
        category: 'data-operations',
        tags: ['export', 'download', 'extract', 'csv', 'excel'],
        useCases: ['Extract table data to file', 'Download data'],
        prerequisites: ['Active database connection', 'Source table exists'],
        relatedCommands: ['import', 'tableCopy'],
    },
    'tableCopy': {
        category: 'data-operations',
        tags: ['copy', 'transfer', 'data-movement'],
        useCases: ['Copy table between schemas', 'Copy table to another system'],
        prerequisites: ['Active database connection', 'Source table exists', 'Target schema accessible'],
        relatedCommands: ['import', 'export', 'dataSync'],
    },
    'dataSync': {
        category: 'data-operations',
        tags: ['sync', 'synchronization', 'replication'],
        useCases: ['Synchronize data between tables', 'Replicate data'],
        prerequisites: ['Active database connection', 'Source and target tables exist'],
        relatedCommands: ['tableCopy', 'import', 'replicationStatus'],
    },
    'dataMask': {
        category: 'data-operations',
        tags: ['masking', 'anonymization', 'privacy'],
        useCases: ['Mask sensitive data', 'Anonymize personal information'],
    },
    'massDelete': {
        category: 'data-operations',
        tags: ['delete', 'bulk-operation', 'purge'],
        useCases: ['Delete records in bulk', 'Purge old data'],
    },
    'massUpdate': {
        category: 'data-operations',
        tags: ['update', 'bulk-operation'],
        useCases: ['Update many records at once'],
    },
    'massExport': {
        category: 'data-operations',
        tags: ['export', 'bulk-operation', 'extract'],
        useCases: ['Export multiple tables at once'],
        relatedCommands: ['massImport', 'export'],
    },
    // Performance Analysis
    'memoryAnalysis': {
        category: 'performance-analysis',
        tags: ['memory', 'performance', 'resource-usage'],
        useCases: ['Analyze memory consumption', 'Find memory-heavy tables'],
        relatedCommands: ['memoryLeaks', 'systemInfo'],
    },
    'memoryLeaks': {
        category: 'performance-analysis',
        tags: ['memory', 'memory-leak', 'diagnostics'],
        useCases: ['Find potential memory leaks', 'Monitor memory issues'],
        relatedCommands: ['memoryAnalysis', 'diagnostics'],
    },
    'expensiveStatements': {
        category: 'performance-analysis',
        tags: ['performance', 'sql', 'slow-queries'],
        useCases: ['Find expensive SQL statements', 'Identify performance problems'],
        relatedCommands: ['queryPlan', 'longRunning'],
    },
    'tableHotspots': {
        category: 'performance-analysis',
        tags: ['hotspot', 'high-load', 'performance'],
        useCases: ['Identify heavily accessed tables', 'Find performance bottlenecks'],
    },
    'queryPlan': {
        category: 'performance-analysis',
        tags: ['execution-plan', 'sql-analysis', 'performance'],
        useCases: ['Analyze query execution plan', 'Optimize queries'],
        relatedCommands: ['expensiveStatements', 'querySimple'],
    },
    'longRunning': {
        category: 'performance-analysis',
        tags: ['long-running', 'slow', 'performance'],
        useCases: ['Find long-running operations', 'Monitor slow processes'],
        relatedCommands: ['expensiveStatements'],
    },
    'columnStats': {
        category: 'performance-analysis',
        tags: ['statistics', 'column-analysis'],
        useCases: ['Analyze column statistics', 'Update column statistics'],
    },
    'fragmentationCheck': {
        category: 'performance-analysis',
        tags: ['fragmentation', 'performance', 'diagnostics'],
        useCases: ['Check table fragmentation', 'Monitor storage efficiency'],
    },
    // Schema Management
    'schemaClone': {
        category: 'schema-management',
        tags: ['clone', 'copy-schema', 'replication'],
        useCases: ['Clone entire schema', 'Duplicate schema structure'],
        prerequisites: ['Active database connection', 'Source schema exists', 'SCHEMA admin privileges'],
        relatedCommands: ['compareSchema'],
    },
    'compareSchema': {
        category: 'schema-management',
        tags: ['compare', 'diff', 'analysis'],
        useCases: ['Compare two schemas', 'Find schema differences'],
        prerequisites: ['Active database connection', 'Both schemas exist'],
        relatedCommands: ['schemaClone'],
    },
    'erdDiagram': {
        category: 'schema-management',
        tags: ['diagram', 'entity-relationship', 'visualization'],
        useCases: ['Generate ER diagram', 'Visualize schema structure'],
    },
    'graphWorkspaces': {
        category: 'schema-management',
        tags: ['graph', 'visualization'],
        useCases: ['Explore graph workspaces'],
    },
    // Security & Access Control
    'users': {
        category: 'security',
        tags: ['user', 'access-control', 'administration'],
        useCases: ['List database users', 'Manage user access'],
        relatedCommands: ['roles', 'massGrant', 'privilegeAnalysis'],
    },
    'roles': {
        category: 'security',
        tags: ['role', 'access-control', 'administration'],
        useCases: ['List database roles', 'Manage role assignments'],
        relatedCommands: ['users', 'massGrant', 'privilegeAnalysis'],
    },
    'massGrant': {
        category: 'security',
        tags: ['grant', 'permission', 'bulk-operation'],
        useCases: ['Grant permissions in bulk', 'Bulk privilege assignment'],
        relatedCommands: ['roles', 'users'],
    },
    'privilegeAnalysis': {
        category: 'security',
        tags: ['privilege', 'security', 'analysis'],
        useCases: ['Analyze privilege distribution', 'Find over-privileged users'],
        relatedCommands: ['securityScan', 'users', 'roles'],
    },
    'securityScan': {
        category: 'security',
        tags: ['security', 'scan', 'compliance'],
        useCases: ['Run security scan', 'Check security settings'],
        relatedCommands: ['privilegeAnalysis', 'auditLog'],
    },
    'auditLog': {
        category: 'security',
        tags: ['audit', 'logging', 'compliance'],
        useCases: ['View audit logs', 'Track changes'],
        relatedCommands: ['changeLog'],
    },
    'certificates': {
        category: 'security',
        tags: ['certificate', 'ssl', 'encryption'],
        useCases: ['Manage certificates', 'Check SSL certificates'],
    },
    'encryptionStatus': {
        category: 'security',
        tags: ['encryption', 'security', 'diagnostics'],
        useCases: ['Check encryption status'],
    },
    'pwdPolicy': {
        category: 'security',
        tags: ['password', 'policy', 'security'],
        useCases: ['Manage password policies'],
    },
    // Backup & Recovery
    'backup': {
        category: 'backup-recovery',
        tags: ['backup', 'recovery'],
        useCases: ['Create backup', 'Start backup process'],
        prerequisites: ['Active database connection', 'Sufficient disk space', 'BACKUP admin privileges'],
        relatedCommands: ['restore', 'backupStatus', 'backupList'],
    },
    'restore': {
        category: 'backup-recovery',
        tags: ['restore', 'recovery'],
        useCases: ['Restore from backup', 'Recover database'],
        prerequisites: ['Active database connection', 'Backup file available', 'Database access privileges'],
        relatedCommands: ['backup', 'backupStatus'],
    },
    'backupStatus': {
        category: 'backup-recovery',
        tags: ['backup', 'status', 'monitoring'],
        useCases: ['Check backup status', 'Monitor backup progress'],
        prerequisites: ['Active database connection'],
        relatedCommands: ['backup', 'backupList'],
    },
    'backupList': {
        category: 'backup-recovery',
        tags: ['backup', 'list', 'catalog'],
        useCases: ['List available backups', 'View backup history'],
        prerequisites: ['Active database connection'],
        relatedCommands: ['backup', 'backupStatus'],
    },
    // System Administration
    'systemInfo': {
        category: 'system-admin',
        tags: ['system', 'info', 'diagnostics', 'hardware'],
        useCases: ['View system information', 'Check hardware resources'],
        relatedCommands: ['status', 'healthCheck', 'hostInformation'],
    },
    'healthCheck': {
        category: 'system-admin',
        tags: ['health', 'check', 'diagnostics'],
        useCases: ['Perform system health check', 'Verify system status'],
        relatedCommands: ['systemInfo', 'status', 'diagnose'],
    },
    'diagnose': {
        category: 'system-admin',
        tags: ['diagnose', 'troubleshoot', 'issues'],
        useCases: ['Run diagnostics', 'Troubleshoot problems'],
        relatedCommands: ['healthCheck', 'issue'],
    },
    'hostInformation': {
        category: 'system-admin',
        tags: ['host', 'hardware', 'system'],
        useCases: ['Get host information', 'Check hardware details'],
        relatedCommands: ['systemInfo', 'disks', 'ports'],
    },
    'disks': {
        category: 'system-admin',
        tags: ['disk', 'storage', 'resource'],
        useCases: ['Check disk usage', 'Monitor storage capacity'],
    },
    'ports': {
        category: 'system-admin',
        tags: ['port', 'network', 'connectivity'],
        useCases: ['Check open ports', 'Verify network connectivity'],
    },
    'reclaim': {
        category: 'system-admin',
        tags: ['reclaim', 'cleanup', 'maintenance'],
        useCases: ['Reclaim unused space', 'Perform maintenance'],
    },
    'dataVolumes': {
        category: 'system-admin',
        tags: ['volume', 'storage', 'data'],
        useCases: ['Check data volumes', 'Analyze storage distribution'],
    },
    'recommendations': {
        category: 'system-admin',
        tags: ['recommendation', 'optimization', 'best-practices'],
        useCases: ['Get system recommendations', 'Find optimization opportunities'],
    },
    'features': {
        category: 'system-admin',
        tags: ['feature', 'capability', 'version'],
        useCases: ['List available features', 'Check feature support'],
    },
    'featureUsage': {
        category: 'system-admin',
        tags: ['feature', 'usage', 'analytics'],
        useCases: ['Check feature usage', 'Understand feature adoption'],
    },
    // Monitoring & Diagnostics
    'alerts': {
        category: 'monitoring-diagnostics',
        tags: ['alert', 'event', 'monitoring'],
        useCases: ['View system alerts', 'Monitor events'],
        relatedCommands: ['auditLog', 'diagnose'],
    },
    'blocking': {
        category: 'monitoring-diagnostics',
        tags: ['blocking', 'lock', 'session'],
        useCases: ['Find blocking locks', 'Identify deadlocks'],
        relatedCommands: ['deadlocks', 'traces'],
    },
    'deadlocks': {
        category: 'monitoring-diagnostics',
        tags: ['deadlock', 'lock', 'session'],
        useCases: ['Find deadlock information', 'Analyze lock contention'],
        relatedCommands: ['blocking', 'traces'],
    },
    'traces': {
        category: 'monitoring-diagnostics',
        tags: ['trace', 'sql-trace', 'sql-plan-cache'],
        useCases: ['Manage system traces', 'Analyze SQL execution'],
        relatedCommands: ['traceContents', 'queryPlan'],
    },
    'traceContents': {
        category: 'monitoring-diagnostics',
        tags: ['trace', 'content', 'analysis'],
        useCases: ['View trace contents', 'Analyze trace data'],
        relatedCommands: ['traces'],
    },
    'crashDumps': {
        category: 'monitoring-diagnostics',
        tags: ['crash', 'dump', 'diagnostics'],
        useCases: ['Check crash dumps', 'Diagnose crashes'],
    },
    'changeLog': {
        category: 'monitoring-diagnostics',
        tags: ['changelog', 'audit', 'tracking'],
        useCases: ['View change log', 'Track database changes'],
        relatedCommands: ['auditLog'],
    },
    'replicationStatus': {
        category: 'monitoring-diagnostics',
        tags: ['replication', 'status', 'monitoring'],
        useCases: ['Check replication status', 'Monitor data replication'],
        relatedCommands: ['dataSync'],
    },
    // HDI Management
    'activateHDI': {
        category: 'hdi-management',
        tags: ['hdi', 'deployment', 'activation'],
        useCases: ['Activate HDI deployment', 'Deploy HDI changes'],
        relatedCommands: ['adminHDI', 'containers'],
    },
    'adminHDI': {
        category: 'hdi-management',
        tags: ['hdi', 'administration', 'management'],
        useCases: ['Administer HDI', 'Manage HDI settings'],
        relatedCommands: ['activateHDI', 'adminHDIGroup', 'containers'],
    },
    'adminHDIGroup': {
        category: 'hdi-management',
        tags: ['hdi', 'group', 'administration'],
        useCases: ['Manage HDI groups', 'Administer HDI group'],
        relatedCommands: ['adminHDI', 'createGroup', 'dropGroup'],
    },
    'containers': {
        category: 'hdi-management',
        tags: ['container', 'hdi', 'deployment'],
        useCases: ['List HDI containers', 'Manage containers'],
        relatedCommands: ['createContainer', 'dropContainer', 'activateHDI'],
    },
    'createContainer': {
        category: 'hdi-management',
        tags: ['container', 'create', 'hdi'],
        useCases: ['Create new HDI container'],
        relatedCommands: ['containers', 'dropContainer'],
    },
    'dropContainer': {
        category: 'hdi-management',
        tags: ['container', 'drop', 'hdi'],
        useCases: ['Drop HDI container'],
        relatedCommands: ['containers', 'createContainer'],
    },
    'createGroup': {
        category: 'hdi-management',
        tags: ['group', 'create', 'hdi'],
        useCases: ['Create HDI group'],
        relatedCommands: ['dropGroup', 'adminHDIGroup'],
    },
    'dropGroup': {
        category: 'hdi-management',
        tags: ['group', 'drop', 'hdi'],
        useCases: ['Drop HDI group'],
        relatedCommands: ['createGroup', 'adminHDIGroup'],
    },
    // Cloud Management
    'hanaCloudInstances': {
        category: 'cloud-management',
        tags: ['cloud', 'instance', 'management'],
        useCases: ['List HANA Cloud instances', 'View cloud databases'],
        relatedCommands: ['hanaCloudStart', 'hanaCloudStop'],
    },
    'hanaCloudStart': {
        category: 'cloud-management',
        tags: ['cloud', 'start', 'instance'],
        useCases: ['Start HANA Cloud instance'],
        relatedCommands: ['hanaCloudInstances', 'hanaCloudStop'],
    },
    'hanaCloudStop': {
        category: 'cloud-management',
        tags: ['cloud', 'stop', 'instance'],
        useCases: ['Stop HANA Cloud instance'],
        relatedCommands: ['hanaCloudInstances', 'hanaCloudStart'],
    },
    'hanaCloudHDIInstances': {
        category: 'cloud-management',
        tags: ['cloud', 'hdi', 'instance'],
        useCases: ['List HANA Cloud HDI instances'],
    },
    'hanaCloudSchemaInstances': {
        category: 'cloud-management',
        tags: ['cloud', 'schema', 'instance'],
        useCases: ['List HANA Cloud schema instances'],
    },
    'hanaCloudSBSSInstances': {
        category: 'cloud-management',
        tags: ['cloud', 'sbss', 'instance'],
        useCases: ['List HANA Cloud SBSS instances'],
    },
    'hanaCloudSecureStoreInstances': {
        category: 'cloud-management',
        tags: ['cloud', 'secure-store', 'instance'],
        useCases: ['List HANA Cloud Secure Store instances'],
    },
    'hanaCloudUPSInstances': {
        category: 'cloud-management',
        tags: ['cloud', 'ups', 'instance'],
        useCases: ['List HANA Cloud UPS instances'],
    },
    'btpSubs': {
        category: 'cloud-management',
        tags: ['btp', 'subscription', 'cloud'],
        useCases: ['List BTP subscriptions'],
        relatedCommands: ['btp', 'btpInfo'],
    },
    'btp': {
        category: 'cloud-management',
        tags: ['btp', 'cloud', 'platform'],
        useCases: ['Manage BTP connections', 'Configure BTP'],
        relatedCommands: ['btpSubs', 'btpInfo'],
    },
    'btpInfo': {
        category: 'cloud-management',
        tags: ['btp', 'info', 'cloud'],
        useCases: ['Get BTP information'],
        relatedCommands: ['btp', 'btpSubs'],
    },
    'btpTarget': {
        category: 'cloud-management',
        tags: ['btp', 'target', 'cloud'],
        useCases: ['Set BTP target'],
        relatedCommands: ['btp', 'btpInfo'],
    },
    // Utilities & Tools
    'generateDocs': {
        category: 'utilities',
        tags: ['documentation', 'generate', 'docs'],
        useCases: ['Generate documentation', 'Create docs from schema'],
    },
    'generateTestData': {
        category: 'utilities',
        tags: ['test-data', 'generate', 'sample'],
        useCases: ['Generate test data', 'Create sample records'],
    },
    'massConvert': {
        category: 'utilities',
        tags: ['convert', 'bulk-operation', 'data-type'],
        useCases: ['Convert data types', 'Bulk data conversion'],
    },
    'massRename': {
        category: 'utilities',
        tags: ['rename', 'bulk-operation'],
        useCases: ['Rename objects in bulk'],
    },
    'codeTemplate': {
        category: 'utilities',
        tags: ['template', 'code-generation'],
        useCases: ['Generate code templates'],
    },
    // Other/Miscellaneous
    'connect': {
        category: 'system-admin',
        tags: ['connect', 'connection', 'configuration'],
        useCases: ['Configure database connection'],
    },
    'connections': {
        category: 'system-admin',
        tags: ['connection', 'configuration', 'management'],
        useCases: ['Manage saved connections'],
    },
    'connectViaServiceKey': {
        category: 'system-admin',
        tags: ['connect', 'service-key', 'configuration'],
        useCases: ['Connect using service key'],
    },
    'hdbsql': {
        category: 'system-admin',
        tags: ['sql', 'query', 'execution'],
        useCases: ['Execute SQL directly'],
    },
    'querySimple': {
        category: 'system-admin',
        tags: ['query', 'sql', 'execution'],
        useCases: ['Run simple queries'],
        relatedCommands: ['hdbsql', 'queryPlan'],
    },
    'callProcedure': {
        category: 'system-admin',
        tags: ['procedure', 'execution', 'call'],
        useCases: ['Call stored procedure', 'Execute procedure'],
        relatedCommands: ['procedures', 'inspectProcedure'],
    },
    'cds': {
        category: 'system-admin',
        tags: ['cds', 'cap', 'data-model'],
        useCases: ['Work with CDS models'],
    },
    'sdiTasks': {
        category: 'utilities',
        tags: ['sdi', 'task', 'data-provisioning'],
        useCases: ['Manage SDI tasks', 'Monitor data provisioning'],
    },
    'kafkaConnect': {
        category: 'utilities',
        tags: ['kafka', 'streaming', 'integration'],
        useCases: ['Manage Kafka connections'],
    },
    'workloadManagement': {
        category: 'system-admin',
        tags: ['workload', 'resource', 'management'],
        useCases: ['Manage workload assignments'],
    },
    'spatialData': {
        category: 'database-info',
        tags: ['spatial', 'geometry', 'gis'],
        useCases: ['Work with spatial data'],
    },
    'timeSeriesTools': {
        category: 'database-info',
        tags: ['time-series', 'temporal'],
        useCases: ['Work with time series data'],
    },
    'calcViewAnalyzer': {
        category: 'database-info',
        tags: ['calc-view', 'analysis'],
        useCases: ['Analyze calculation views'],
    },
    'tableGroups': {
        category: 'database-info',
        tags: ['table-group', 'organization'],
        useCases: ['View table groups'],
    },
    'grantChains': {
        category: 'security',
        tags: ['grant', 'privilege', 'chain'],
        useCases: ['Analyze privilege grant chains'],
    },
    'libraries': {
        category: 'database-info',
        tags: ['library', 'managed-library'],
        useCases: ['List managed libraries'],
    },
    'xsaServices': {
        category: 'utilities',
        tags: ['xsa', 'service'],
        useCases: ['Manage XSA services'],
    },
    'createXSAAdmin': {
        category: 'security',
        tags: ['xsa', 'admin', 'user'],
        useCases: ['Create XSA admin user'],
    },
    'createJWT': {
        category: 'security',
        tags: ['jwt', 'token', 'authentication'],
        useCases: ['Create JWT token'],
    },
    'inspectJWT': {
        category: 'security',
        tags: ['jwt', 'token', 'analysis'],
        useCases: ['Analyze JWT token'],
    },
    'inspectTable': {
        category: 'database-info',
        tags: ['table', 'inspection', 'analysis'],
        useCases: ['Inspect table structure and properties'],
        relatedCommands: ['tables', 'tableHotspots'],
    },
    'inspectIndex': {
        category: 'database-info',
        tags: ['index', 'inspection', 'analysis'],
        useCases: ['Inspect index details'],
        relatedCommands: ['indexes'],
    },
    'inspectProcedure': {
        category: 'database-info',
        tags: ['procedure', 'inspection'],
        useCases: ['Inspect procedure details'],
        relatedCommands: ['procedures', 'callProcedure'],
    },
    'inspectFunction': {
        category: 'database-info',
        tags: ['function', 'inspection'],
        useCases: ['Inspect function details'],
        relatedCommands: ['functions'],
    },
    'inspectView': {
        category: 'database-info',
        tags: ['view', 'inspection'],
        useCases: ['Inspect view details'],
        relatedCommands: ['views'],
    },
    'inspectUser': {
        category: 'security',
        tags: ['user', 'inspection'],
        useCases: ['Inspect user details and privileges'],
        relatedCommands: ['users'],
    },
    'inspectTrigger': {
        category: 'database-info',
        tags: ['trigger', 'inspection'],
        useCases: ['Inspect trigger details'],
        relatedCommands: ['triggers'],
    },
    'inspectLibrary': {
        category: 'database-info',
        tags: ['library', 'inspection'],
        useCases: ['Inspect library details'],
    },
    'inspectLibMember': {
        category: 'database-info',
        tags: ['library', 'member'],
        useCases: ['Inspect library member details'],
    },
    'copy2DefaultEnv': {
        category: 'system-admin',
        tags: ['configuration', 'environment'],
        useCases: ['Copy settings to default environment'],
    },
    'copy2Env': {
        category: 'system-admin',
        tags: ['configuration', 'environment'],
        useCases: ['Copy settings to environment file'],
    },
    'copy2Secrets': {
        category: 'system-admin',
        tags: ['configuration', 'secrets'],
        useCases: ['Copy settings to secrets file'],
    },
    'iniFiles': {
        category: 'system-admin',
        tags: ['configuration', 'ini-file'],
        useCases: ['Manage INI files'],
    },
    'iniContents': {
        category: 'system-admin',
        tags: ['configuration', 'ini-file'],
        useCases: ['View INI file contents'],
    },
    'readMe': {
        category: 'utilities',
        tags: ['readme', 'documentation'],
        useCases: ['View help documentation'],
    },
    'issue': {
        category: 'utilities',
        tags: ['issue', 'report', 'help'],
        useCases: ['Report issues or get help'],
    },
};
const CLI_COMMANDS = CLI_COMMAND_METADATA;
export const COMMAND_METADATA_MAP = Object.fromEntries(Object.entries(CLI_COMMANDS).map(([command, metadata]) => {
    const enriched = ENRICHED_COMMAND_METADATA[command];
    const tags = (enriched?.tags ?? []).map(tag => tag.toLowerCase());
    return [
        command,
        {
            category: metadata.category,
            tags,
            useCases: enriched?.useCases,
            prerequisites: enriched?.prerequisites,
            relatedCommands: metadata.relatedCommands ?? enriched?.relatedCommands,
        },
    ];
}));
/**
 * Workflow registry - common multi-step tasks
 */
export const WORKFLOWS = {
    'validate-and-profile': {
        id: 'validate-and-profile',
        name: 'Validate and Profile Data',
        description: 'Complete data quality assessment: profile table data, then validate against rules',
        goal: 'Understand data quality and identify issues',
        tags: ['data-quality', 'analysis', 'validation'],
        estimatedTime: '5-10 minutes',
        steps: [
            {
                order: 1,
                command: 'dataProfile',
                description: 'Profile the table to understand distributions and patterns',
                keyParameters: { table: '<table_name>', schema: '<schema>' },
                expectedOutput: 'Data distribution statistics for all columns',
            },
            {
                order: 2,
                command: 'duplicateDetection',
                description: 'Find duplicate records in the table',
                keyParameters: { table: '<table_name>', schema: '<schema>' },
                expectedOutput: 'Count and details of duplicate records',
            },
            {
                order: 3,
                command: 'dataValidator',
                description: 'Apply validation rules to data',
                keyParameters: { table: '<table_name>', schema: '<schema>', rulesFile: '<rules.json>' },
                expectedOutput: 'List of invalid records and validation failures',
            },
        ],
    },
    'export-and-import': {
        id: 'export-and-import',
        name: 'Export and Import Data',
        description: 'Export data from source table and import to target table',
        goal: 'Transfer data between tables or systems',
        tags: ['data-operations', 'migration', 'copy'],
        estimatedTime: '10-30 minutes',
        steps: [
            {
                order: 1,
                command: 'export',
                description: 'Export data from source table to file',
                keyParameters: { table: '<source_table>', schema: '<source_schema>', filename: '<export.csv>' },
                expectedOutput: 'CSV/Excel file with exported data',
            },
            {
                order: 2,
                command: 'import',
                description: 'Import the exported file to target table',
                keyParameters: { filename: '<export.csv>', table: '<target_table>', schema: '<target_schema>' },
                expectedOutput: 'Success confirmation with row count',
            },
        ],
    },
    'compare-and-clone-schema': {
        id: 'compare-and-clone-schema',
        name: 'Compare and Clone Schema',
        description: 'Compare two schemas for differences, then clone one to another location',
        goal: 'Replicate and synchronize schema structures',
        tags: ['schema-management', 'migration', 'comparison'],
        estimatedTime: '15-45 minutes',
        steps: [
            {
                order: 1,
                command: 'compareSchema',
                description: 'Compare source and target schemas',
                keyParameters: { sourceSchema: '<source>', targetSchema: '<target>' },
                expectedOutput: 'Detailed list of differences (added, modified, deleted objects)',
            },
            {
                order: 2,
                command: 'schemaClone',
                description: 'Clone schema structure to new location',
                keyParameters: { sourceSchema: '<source>', targetSchema: '<new_target>' },
                expectedOutput: 'New schema with identical structure',
            },
        ],
    },
    'performance-analysis': {
        id: 'performance-analysis',
        name: 'Analyze System Performance',
        description: 'Comprehensive performance diagnostic: memory, expensive queries, hotspots',
        goal: 'Identify performance bottlenecks and optimization opportunities',
        tags: ['performance', 'diagnostics', 'optimization'],
        estimatedTime: '15-30 minutes',
        steps: [
            {
                order: 1,
                command: 'memoryAnalysis',
                description: 'Analyze memory consumption by tables',
                keyParameters: {},
                expectedOutput: 'List of tables with memory usage statistics',
            },
            {
                order: 2,
                command: 'expensiveStatements',
                description: 'Find expensive SQL statements',
                keyParameters: { limit: '10' },
                expectedOutput: 'Top expensive operations with execution metrics',
            },
            {
                order: 3,
                command: 'tableHotspots',
                description: 'Identify heavily accessed tables',
                keyParameters: {},
                expectedOutput: 'Tables with high access rates',
            },
        ],
    },
    'security-audit': {
        id: 'security-audit',
        name: 'Security Audit',
        description: 'Complete security check: scan for issues, analyze privileges, check encryption',
        goal: 'Verify security posture and identify vulnerabilities',
        tags: ['security', 'compliance', 'audit'],
        estimatedTime: '20-40 minutes',
        steps: [
            {
                order: 1,
                command: 'securityScan',
                description: 'Run comprehensive security scan',
                keyParameters: {},
                expectedOutput: 'List of security issues and recommendations',
            },
            {
                order: 2,
                command: 'privilegeAnalysis',
                description: 'Analyze privilege distribution',
                keyParameters: {},
                expectedOutput: 'Over-privileged users and role analysis',
            },
            {
                order: 3,
                command: 'encryptionStatus',
                description: 'Check encryption status',
                keyParameters: {},
                expectedOutput: 'Encryption configuration and status',
            },
        ],
    },
    'backup-and-verify': {
        id: 'backup-and-verify',
        name: 'Backup and Verify',
        description: 'Create backup and verify its status',
        goal: 'Ensure reliable backup availability',
        tags: ['backup', 'recovery', 'maintenance'],
        estimatedTime: '30-120 minutes',
        steps: [
            {
                order: 1,
                command: 'backup',
                description: 'Create database backup',
                keyParameters: {},
                expectedOutput: 'Backup process initiated',
            },
            {
                order: 2,
                command: 'backupStatus',
                description: 'Monitor backup progress',
                keyParameters: {},
                expectedOutput: 'Current backup status and progress percentage',
            },
            {
                order: 3,
                command: 'backupList',
                description: 'Verify backup in catalog',
                keyParameters: {},
                expectedOutput: 'List of backups including newly created one',
            },
        ],
    },
    'troubleshoot-issues': {
        id: 'troubleshoot-issues',
        name: 'Troubleshoot System Issues',
        description: 'Diagnose and investigate system problems',
        goal: 'Identify root cause of issues',
        tags: ['diagnostics', 'troubleshooting', 'monitoring'],
        estimatedTime: '10-30 minutes',
        steps: [
            {
                order: 1,
                command: 'healthCheck',
                description: 'Perform system health check',
                keyParameters: {},
                expectedOutput: 'Health check results with any issues',
            },
            {
                order: 2,
                command: 'diagnose',
                description: 'Run system diagnostics',
                keyParameters: {},
                expectedOutput: 'Diagnostic report with identified issues',
            },
            {
                order: 3,
                command: 'alerts',
                description: 'View active system alerts',
                keyParameters: {},
                expectedOutput: 'List of alerts with severity levels',
            },
        ],
    },
};
/**
 * Get all commands grouped by category
 */
export function getCommandsByCategory() {
    const grouped = {};
    for (const [command, metadata] of Object.entries(COMMAND_METADATA_MAP)) {
        const category = metadata.category;
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push({ command, ...metadata });
    }
    return grouped;
}
/**
 * Search commands by tags
 */
export function searchCommandsByTag(tag) {
    return Object.entries(COMMAND_METADATA_MAP)
        .filter(([, metadata]) => metadata.tags.includes(tag.toLowerCase()))
        .map(([command, metadata]) => ({ command, ...metadata }));
}
/**
 * Get commands in a specific category
 */
export function getCommandsInCategory(category) {
    return Object.entries(COMMAND_METADATA_MAP)
        .filter(([, metadata]) => metadata.category === category)
        .map(([command, metadata]) => ({ command, ...metadata }));
}
/**
 * Get all workflows
 */
export function getAllWorkflows() {
    return Object.values(WORKFLOWS);
}
/**
 * Search workflows by tag
 */
export function searchWorkflowsByTag(tag) {
    return Object.values(WORKFLOWS).filter(workflow => workflow.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase())));
}
/**
 * Get workflow by ID
 */
export function getWorkflowById(id) {
    return WORKFLOWS[id];
}
//# sourceMappingURL=command-metadata.js.map