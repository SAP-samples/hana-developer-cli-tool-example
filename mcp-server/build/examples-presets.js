/**
 * Command examples and parameter presets for better discoverability
 */
/**
 * Command examples library
 */
export const COMMAND_EXAMPLES = {
    import: [
        {
            scenario: 'Basic CSV import',
            description: 'Simplest import - auto-detects column mapping',
            parameters: {
                filename: 'data.csv',
                table: 'MY_TABLE',
                schema: 'MY_SCHEMA',
            },
            notes: 'Use this for straightforward imports where file columns match table columns',
            expectedOutput: 'Success message with number of rows imported',
        },
        {
            scenario: 'Import with dry run',
            description: 'Preview import without committing to database',
            parameters: {
                filename: 'data.csv',
                table: 'MY_TABLE',
                schema: 'MY_SCHEMA',
                dryRun: true,
            },
            notes: 'Always recommended to run this first to validate data and mappings',
            expectedOutput: 'Preview of what would be imported, including any errors',
        },
        {
            scenario: 'Import with error handling',
            description: 'Continue import even if some rows fail',
            parameters: {
                filename: 'data.csv',
                table: 'MY_TABLE',
                schema: 'MY_SCHEMA',
                skipWithErrors: true,
                maxErrorsAllowed: 100,
            },
            notes: 'Useful for large imports where you want to skip bad rows and review later',
            expectedOutput: 'Success with count of imported rows and skipped errors',
        },
        {
            scenario: 'Large file import',
            description: 'Import large file with memory protection',
            parameters: {
                filename: 'large_data.csv',
                table: 'BIG_TABLE',
                schema: 'MY_SCHEMA',
                maxFileSizeMB: 500,
                timeoutSeconds: 3600,
            },
            notes: 'Prevents memory issues and timeout errors with large files',
            expectedOutput: 'Success message after extended processing time',
        },
        {
            scenario: 'Import with column name matching',
            description: 'Match file columns to table columns by name (not position)',
            parameters: {
                filename: 'data.csv',
                table: 'MY_TABLE',
                schema: 'MY_SCHEMA',
                matchMode: 'name',
            },
            notes: 'Use when file column order differs from table column order',
            expectedOutput: 'Success with columns matched by header names',
        },
    ],
    export: [
        {
            scenario: 'Basic table export',
            description: 'Export entire table to CSV',
            parameters: {
                table: 'CUSTOMERS',
                schema: 'SALES',
                filename: 'customers_export.csv',
            },
            expectedOutput: 'CSV file with all table data',
        },
        {
            scenario: 'Export with filter',
            description: 'Export subset of data using WHERE clause',
            parameters: {
                table: 'ORDERS',
                schema: 'SALES',
                filename: 'recent_orders.csv',
                where: "ORDER_DATE >= '2025-01-01'",
            },
            notes: 'Use SQL WHERE syntax to filter rows',
            expectedOutput: 'CSV file with filtered data only',
        },
        {
            scenario: 'Export to Excel',
            description: 'Export table to Excel format',
            parameters: {
                table: 'SALES_DATA',
                schema: 'ANALYTICS',
                filename: 'sales_report.xlsx',
            },
            notes: 'Automatically formats as Excel if filename ends in .xlsx',
            expectedOutput: 'Excel file with formatted data',
        },
    ],
    tables: [
        {
            scenario: 'List all tables in schema',
            description: 'View all tables in a specific schema',
            parameters: {
                schema: 'MY_SCHEMA',
            },
            expectedOutput: 'Table with all table names, types, and sizes',
        },
        {
            scenario: 'Search for tables by pattern',
            description: 'Find tables matching a name pattern',
            parameters: {
                schema: 'MY_SCHEMA',
                table: 'SALES%',
            },
            notes: 'Use % as wildcard, similar to SQL LIKE',
            expectedOutput: 'Filtered list of matching tables',
        },
    ],
    inspectTable: [
        {
            scenario: 'View table structure',
            description: 'Get complete table metadata including columns and constraints',
            parameters: {
                table: 'CUSTOMERS',
                schema: 'SALES',
            },
            expectedOutput: 'Detailed table structure with columns, types, keys, and indexes',
        },
    ],
    dataProfile: [
        {
            scenario: 'Profile complete table',
            description: 'Analyze data distribution and statistics',
            parameters: {
                table: 'SALES_DATA',
                schema: 'ANALYTICS',
            },
            notes: 'May take several minutes for large tables',
            expectedOutput: 'Statistics for each column: distinct values, nulls, min/max, etc.',
        },
        {
            scenario: 'Profile specific columns',
            description: 'Analyze only selected columns',
            parameters: {
                table: 'CUSTOMERS',
                schema: 'SALES',
                columns: ['COUNTRY', 'REGION', 'SEGMENT'],
            },
            notes: 'Faster than profiling entire table',
            expectedOutput: 'Statistics for specified columns only',
        },
    ],
    dataValidator: [
        {
            scenario: 'Validate with rules file',
            description: 'Apply validation rules from JSON file',
            parameters: {
                table: 'CUSTOMERS',
                schema: 'SALES',
                rulesFile: 'validation_rules.json',
            },
            notes: 'Rules file defines constraints like required fields, ranges, patterns',
            expectedOutput: 'List of validation failures with row numbers',
        },
    ],
    duplicateDetection: [
        {
            scenario: 'Find duplicates across all columns',
            description: 'Identify duplicate records',
            parameters: {
                table: 'CUSTOMERS',
                schema: 'SALES',
            },
            expectedOutput: 'List of duplicate records grouped by matching values',
        },
        {
            scenario: 'Find duplicates by key columns',
            description: 'Check for duplicates using specific columns',
            parameters: {
                table: 'ORDERS',
                schema: 'SALES',
                keyColumns: ['ORDER_ID', 'LINE_ITEM'],
            },
            notes: 'More precise than checking all columns',
            expectedOutput: 'Duplicates based on specified key columns',
        },
    ],
    compareSchema: [
        {
            scenario: 'Compare two schemas',
            description: 'Find differences between source and target schemas',
            parameters: {
                sourceSchema: 'DEV_SCHEMA',
                targetSchema: 'PROD_SCHEMA',
            },
            expectedOutput: 'Detailed diff showing added, modified, and deleted objects',
        },
    ],
    schemaClone: [
        {
            scenario: 'Clone schema structure',
            description: 'Copy schema structure without data',
            parameters: {
                sourceSchema: 'PROD_SCHEMA',
                targetSchema: 'TEST_SCHEMA',
            },
            notes: 'Clones tables, views, stored procedures, but not data',
            expectedOutput: 'New schema with identical structure',
        },
    ],
    tableCopy: [
        {
            scenario: 'Copy table with data',
            description: 'Clone table including data',
            parameters: {
                sourceTable: 'CUSTOMERS',
                sourceSchema: 'PROD',
                targetTable: 'CUSTOMERS_BACKUP',
                targetSchema: 'BACKUP',
            },
            expectedOutput: 'New table with copied data',
        },
    ],
    status: [
        {
            scenario: 'Check connection',
            description: 'Verify database connection and view current user',
            parameters: {},
            notes: 'First command to run when connecting',
            expectedOutput: 'Current user, roles, and connection details',
        },
    ],
    healthCheck: [
        {
            scenario: 'System health check',
            description: 'Comprehensive system health assessment',
            parameters: {},
            expectedOutput: 'Health status with warnings and recommendations',
        },
    ],
    memoryAnalysis: [
        {
            scenario: 'Analyze memory usage',
            description: 'View memory consumption by tables',
            parameters: {},
            notes: 'Identifies memory-intensive tables',
            expectedOutput: 'List of tables sorted by memory usage',
        },
    ],
    expensiveStatements: [
        {
            scenario: 'Find slow queries',
            description: 'Identify expensive SQL statements',
            parameters: {
                limit: 10,
            },
            notes: 'Shows statements from SQL plan cache',
            expectedOutput: 'Top expensive queries with execution metrics',
        },
    ],
};
/**
 * Parameter presets for common use cases
 */
export const COMMAND_PRESETS = {
    import: [
        {
            name: 'quick-import',
            description: 'Fast import for small files with known good data',
            parameters: {
                filename: '<your-file.csv>',
                table: '<table-name>',
                schema: '<schema-name>',
            },
            whenToUse: 'Small files (<10MB) with clean, validated data',
        },
        {
            name: 'safe-import',
            description: 'Cautious import with validation and error handling',
            parameters: {
                filename: '<your-file.csv>',
                table: '<table-name>',
                schema: '<schema-name>',
                dryRun: true,
                skipWithErrors: true,
                maxErrorsAllowed: 10,
            },
            notes: 'Run twice: first with dryRun:true, then with dryRun:false',
            whenToUse: 'Unvalidated data or first-time imports',
        },
        {
            name: 'large-file',
            description: 'Import large files with memory protection',
            parameters: {
                filename: '<your-file.csv>',
                table: '<table-name>',
                schema: '<schema-name>',
                maxFileSizeMB: 500,
                timeoutSeconds: 3600,
            },
            whenToUse: 'Files >100MB or expected long-running imports',
        },
        {
            name: 'flexible-mapping',
            description: 'Import with flexible column matching',
            parameters: {
                filename: '<your-file.csv>',
                table: '<table-name>',
                schema: '<schema-name>',
                matchMode: 'name',
            },
            whenToUse: 'File columns in different order than table columns',
        },
    ],
    export: [
        {
            name: 'full-table',
            description: 'Export complete table',
            parameters: {
                table: '<table-name>',
                schema: '<schema-name>',
                filename: '<output-file.csv>',
            },
            whenToUse: 'Need all data from table',
        },
        {
            name: 'filtered-export',
            description: 'Export with WHERE clause',
            parameters: {
                table: '<table-name>',
                schema: '<schema-name>',
                filename: '<output-file.csv>',
                where: '<your-condition>',
            },
            whenToUse: 'Only need subset of data',
        },
        {
            name: 'excel-export',
            description: 'Export to Excel format',
            parameters: {
                table: '<table-name>',
                schema: '<schema-name>',
                filename: '<output-file.xlsx>',
            },
            whenToUse: 'Need Excel format for business users',
        },
    ],
    dataProfile: [
        {
            name: 'full-profile',
            description: 'Profile all columns',
            parameters: {
                table: '<table-name>',
                schema: '<schema-name>',
            },
            whenToUse: 'Initial data exploration',
        },
        {
            name: 'quick-profile',
            description: 'Profile specific columns only',
            parameters: {
                table: '<table-name>',
                schema: '<schema-name>',
                columns: ['<column1>', '<column2>'],
            },
            whenToUse: 'Large tables where full profile is too slow',
        },
    ],
    duplicateDetection: [
        {
            name: 'all-columns',
            description: 'Check for complete duplicate rows',
            parameters: {
                table: '<table-name>',
                schema: '<schema-name>',
            },
            whenToUse: 'Find exact duplicate records',
        },
        {
            name: 'key-based',
            description: 'Check duplicates on key columns',
            parameters: {
                table: '<table-name>',
                schema: '<schema-name>',
                keyColumns: ['<key-column>'],
            },
            whenToUse: 'Find duplicate business keys',
        },
    ],
    compareSchema: [
        {
            name: 'standard-compare',
            description: 'Compare two schemas',
            parameters: {
                sourceSchema: '<source-schema>',
                targetSchema: '<target-schema>',
            },
            whenToUse: 'Check differences between environments',
        },
    ],
    schemaClone: [
        {
            name: 'structure-only',
            description: 'Clone schema without data',
            parameters: {
                sourceSchema: '<source-schema>',
                targetSchema: '<new-schema>',
            },
            whenToUse: 'Create test environment with same structure',
        },
    ],
};
/**
 * Get examples for a command
 */
export function getCommandExamples(command) {
    return COMMAND_EXAMPLES[command] || [];
}
/**
 * Get presets for a command
 */
export function getCommandPresets(command) {
    return COMMAND_PRESETS[command] || [];
}
/**
 * Check if command has examples
 */
export function hasExamples(command) {
    return command in COMMAND_EXAMPLES && COMMAND_EXAMPLES[command].length > 0;
}
/**
 * Check if command has presets
 */
export function hasPresets(command) {
    return command in COMMAND_PRESETS && COMMAND_PRESETS[command].length > 0;
}
/**
 * Get all commands with examples
 */
export function getCommandsWithExamples() {
    return Object.keys(COMMAND_EXAMPLES);
}
/**
 * Get all commands with presets
 */
export function getCommandsWithPresets() {
    return Object.keys(COMMAND_PRESETS);
}
//# sourceMappingURL=examples-presets.js.map