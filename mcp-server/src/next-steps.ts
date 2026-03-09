/**
 * Next steps suggestions and troubleshooting tips
 * Provides context-aware guidance after command execution
 */

export interface NextStep {
  command: string;
  description: string;
  parameters?: Record<string, string>;
  reason?: string;
}

export interface TroubleshootingTip {
  issue: string;
  solution: string;
  command?: string;
  parameters?: Record<string, any>;
}

export interface TroubleshootingGuide {
  command: string;
  commonIssues: TroubleshootingTip[];
  prerequisites: string[];
  tips: string[];
}

/**
 * Get suggested next steps after executing a command
 */
export function getNextSteps(command: string, output?: string): NextStep[] {
  const nextStepsMap: Record<string, NextStep[]> = {
    'status': [
      {
        command: 'schemas',
        description: 'Explore available schemas',
        reason: 'Now that connection is verified, discover what data you can access',
      },
      {
        command: 'healthCheck',
        description: 'Check system health',
        reason: 'Verify the database is in good condition',
      },
      {
        command: 'version',
        description: 'Check database version',
        reason: 'Understand which HANA version you are on',
      },
    ],
    
    'schemas': [
      {
        command: 'tables',
        description: 'List tables in a schema',
        parameters: { schema: '<schema-name>' },
        reason: 'Explore the tables in one of the schemas you discovered',
      },
      {
        command: 'views',
        description: 'List views in a schema',
        parameters: { schema: '<schema-name>' },
        reason: 'See what views are available',
      },
    ],
    
    'tables': [
      {
        command: 'inspectTable',
        description: 'View detailed table structure',
        parameters: { table: '<table-name>', schema: '<schema-name>' },
        reason: 'Get columns, types, keys, and indexes',
      },
      {
        command: 'dataProfile',
        description: 'Analyze table data distribution',
        parameters: { table: '<table-name>', schema: '<schema-name>' },
        reason: 'Understand data quality and patterns',
      },
    ],
    
    'inspectTable': [
      {
        command: 'dataProfile',
        description: 'Profile the table data',
        parameters: { table: '<table-name>', schema: '<schema-name>' },
        reason: 'Now that you know the structure, analyze the data',
      },
      {
        command: 'export',
        description: 'Export table data',
        parameters: { table: '<table-name>', schema: '<schema-name>', filename: '<output.csv>' },
        reason: 'Extract data for analysis',
      },
    ],
    
    'dataProfile': [
      {
        command: 'duplicateDetection',
        description: 'Find duplicate records',
        parameters: { table: '<table-name>', schema: '<schema-name>' },
        reason: 'If profile shows many duplicates, investigate further',
      },
      {
        command: 'dataValidator',
        description: 'Validate data quality',
        parameters: { table: '<table-name>', schema: '<schema-name>', rulesFile: '<rules.json>' },
        reason: 'Apply validation rules to ensure data quality',
      },
      {
        command: 'export',
        description: 'Export profiled data',
        parameters: { table: '<table-name>', schema: '<schema-name>', filename: '<output.csv>' },
        reason: 'Save the data for further analysis',
      },
    ],
    
    'export': [
      {
        command: 'import',
        description: 'Import the exported data elsewhere',
        parameters: { filename: '<exported-file>', table: '<target-table>', schema: '<target-schema>' },
        reason: 'Load the exported data into another table or database',
      },
    ],
    
    'import': [
      {
        command: 'dataValidator',
        description: 'Validate imported data',
        parameters: { table: '<table-name>', schema: '<schema-name>', rulesFile: '<rules.json>' },
        reason: 'Ensure imported data meets quality standards',
      },
      {
        command: 'dataProfile',
        description: 'Profile the imported data',
        parameters: { table: '<table-name>', schema: '<schema-name>' },
        reason: 'Verify data distribution after import',
      },
      {
        command: 'duplicateDetection',
        description: 'Check for duplicates',
        parameters: { table: '<table-name>', schema: '<schema-name>' },
        reason: 'Ensure no duplicate records were imported',
      },
    ],
    
    'duplicateDetection': [
      {
        command: 'dataValidator',
        description: 'Run comprehensive validation',
        parameters: { table: '<table-name>', schema: '<schema-name>', rulesFile: '<rules.json>' },
        reason: 'Check for other data quality issues beyond duplicates',
      },
    ],
    
    'compareSchema': [
      {
        command: 'schemaClone',
        description: 'Clone schema structure',
        parameters: { sourceSchema: '<source>', targetSchema: '<target>' },
        reason: 'If differences found, you may want to sync schemas',
      },
    ],
    
    'healthCheck': [
      {
        command: 'memoryAnalysis',
        description: 'Analyze memory usage',
        reason: 'If health check shows memory issues, investigate further',
      },
      {
        command: 'alerts',
        description: 'View system alerts',
        reason: 'Check for any active warnings or alerts',
      },
    ],
    
    'memoryAnalysis': [
      {
        command: 'expensiveStatements',
        description: 'Find expensive SQL statements',
        reason: 'Identify queries consuming resources',
      },
      {
        command: 'tableHotspots',
        description: 'Find heavily accessed tables',
        reason: 'Understand which tables are causing memory pressure',
      },
    ],
    
    'backup': [
      {
        command: 'backupStatus',
        description: 'Monitor backup progress',
        reason: 'Check that backup is proceeding successfully',
      },
      {
        command: 'backupList',
        description: 'Verify backup in catalog',
        reason: 'Confirm backup was completed and cataloged',
      },
    ],
  };
  
  return nextStepsMap[command] || [];
}

/**
 * Get troubleshooting guide for a command
 */
export function getTroubleshootingGuide(command: string): TroubleshootingGuide | null {
  const guides: Record<string, TroubleshootingGuide> = {
    'import': {
      command: 'import',
      commonIssues: [
        {
          issue: 'Column mismatch error',
          solution: 'Use matchMode parameter to control how columns are matched. Try matchMode="name" to match by column name instead of position.',
          command: 'import',
          parameters: { matchMode: 'name' },
        },
        {
          issue: 'File not found',
          solution: 'Use absolute file paths instead of relative paths. Check that file exists at the specified location.',
        },
        {
          issue: 'Import takes too long',
          solution: 'For large files, increase timeout and set memory limits.',
          command: 'import',
          parameters: { maxFileSizeMB: 500, timeoutSeconds: 3600 },
        },
        {
          issue: 'Some rows fail to import',
          solution: 'Use skipWithErrors and maxErrorsAllowed to continue import despite errors. Run with dryRun first to preview issues.',
          command: 'import',
          parameters: { skipWithErrors: true, maxErrorsAllowed: 100, dryRun: true },
        },
        {
          issue: 'Data types don\'t match',
          solution: 'Check table structure first with inspectTable. Ensure CSV data types match table column types.',
          command: 'inspectTable',
          parameters: { table: '<table-name>', schema: '<schema-name>' },
        },
      ],
      prerequisites: [
        'Target table must exist',
        'User must have INSERT privilege on table',
        'File must be accessible from server',
        'Sufficient disk space for temporary files',
      ],
      tips: [
        'Always use dryRun:true first to preview the import',
        'Check table structure with inspectTable before importing',
        'For large files, increase timeoutSeconds parameter',
        'Use matchMode="name" if column order differs between file and table',
      ],
    },
    
    'export': {
      command: 'export',
      commonIssues: [
        {
          issue: 'Export file is too large',
          solution: 'Use WHERE clause to filter rows, or export in batches.',
          command: 'export',
          parameters: { where: "DATE >= '2025-01-01'" },
        },
        {
          issue: 'Permission denied writing file',
          solution: 'Check that output directory exists and is writable. Use absolute path.',
        },
        {
          issue: 'Export timeout',
          solution: 'For large tables, consider filtering data or exporting specific columns only.',
        },
      ],
      prerequisites: [
        'User must have SELECT privilege on table',
        'Output directory must be writable',
        'Sufficient disk space for output file',
      ],
      tips: [
        'Use WHERE clause to filter data and reduce file size',
        'Excel files (.xlsx) are limited to ~1 million rows',
        'For large exports, CSV is faster than Excel',
      ],
    },
    
    'dataProfile': {
      command: 'dataProfile',
      commonIssues: [
        {
          issue: 'Profile takes very long on large tables',
          solution: 'Profile specific columns instead of entire table.',
          command: 'dataProfile',
          parameters: { columns: ['COLUMN1', 'COLUMN2'] },
        },
        {
          issue: 'Out of memory error',
          solution: 'Profile fewer columns at a time, or profile a sample of the data.',
        },
      ],
      prerequisites: [
        'User must have SELECT privilege',
        'Sufficient memory for statistics calculation',
      ],
      tips: [
        'Profiling large tables can take several minutes',
        'Use columns parameter to profile only specific columns',
        'Good to run before data validation',
      ],
    },
    
    'tables': {
      command: 'tables',
      commonIssues: [
        {
          issue: 'No tables found',
          solution: 'Check schema name is correct (case-sensitive). Verify user has access to schema.',
          command: 'schemas',
        },
        {
          issue: 'Too many tables returned',
          solution: 'Use table parameter with wildcard to filter results.',
          command: 'tables',
          parameters: { table: 'PREFIX%' },
        },
      ],
      prerequisites: [
        'Schema must exist',
        'User must have CATALOG READ privilege or object privileges',
      ],
      tips: [
        'Schema names are case-sensitive',
        'Use % wildcard in table parameter to filter',
      ],
    },
    
    'status': {
      command: 'status',
      commonIssues: [
        {
          issue: 'Connection refused',
          solution: 'Check database credentials in .env or default-env.json file.',
        },
        {
          issue: 'Authentication failed',
          solution: 'Verify username and password are correct. Check if user account is locked.',
        },
      ],
      prerequisites: [
        'Database must be running',
        'Network connectivity to database',
        'Valid credentials configured',
      ],
      tips: [
        'Run this first to verify connection',
        'Shows current user and granted roles',
      ],
    },
    
    'healthCheck': {
      command: 'healthCheck',
      commonIssues: [
        {
          issue: 'Health check reports issues',
          solution: 'Follow recommendations in the output. Run diagnose for detailed analysis.',
          command: 'diagnose',
        },
        {
          issue: 'Memory alerts',
          solution: 'Run memory analysis to identify memory-intensive tables.',
          command: 'memoryAnalysis',
        },
      ],
      prerequisites: [
        'User needs monitoring privileges',
      ],
      tips: [
        'Run periodically to catch issues early',
        'Pay attention to alerts and warnings',
      ],
    },
  };
  
  return guides[command] || null;
}

/**
 * Get command-specific tips based on output analysis
 */
export function analyzeOutputForTips(command: string, output: string): string[] {
  const tips: string[] = [];
  const outputLower = output.toLowerCase();
  
  // Import-specific tips
  if (command === 'import') {
    if (outputLower.includes('error') || outputLower.includes('failed')) {
      tips.push('💡 Try using dryRun:true to preview issues before actual import');
      tips.push('💡 Use skipWithErrors:true to continue import despite errors');
    }
  }
  
  // Memory-related tips
  if (command === 'memoryAnalysis') {
    if (outputLower.includes('high') || outputLower.includes('memory')) {
      tips.push('💡 Consider running expensiveStatements to find resource-intensive queries');
      tips.push('💡 Check tableHotspots to identify heavily accessed tables');
    }
  }
  
  // Table listing tips
  if (command === 'tables') {
    const tableCount = (output.match(/\│/g) || []).length;
    if (tableCount > 100) {
      tips.push('💡 Many tables found - use table parameter with wildcard to filter (e.g., table="SALES%")');
    }
  }
  
  // Health check tips
  if (command === 'healthCheck') {
    if (outputLower.includes('warning') || outputLower.includes('alert')) {
      tips.push('💡 Run diagnose command for detailed analysis of issues');
      tips.push('💡 Check alerts command for active system alerts');
    }
  }
  
  return tips;
}
