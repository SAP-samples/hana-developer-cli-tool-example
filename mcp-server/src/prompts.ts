/**
 * MCP Prompts for SAP HANA CLI
 * 
 * Prompts are reusable templates that guide agents through multi-step workflows.
 * They provide structured conversation templates for common tasks.
 */

import type { GetPromptResult, PromptMessage } from '@modelcontextprotocol/sdk/types.js';

export interface Prompt {
  name: string;
  description: string;
  arguments?: PromptArgument[];
}

export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
}

/**
 * List all available prompts
 */
export function listPrompts(): Prompt[] {
  return [
    {
      name: 'explore-database',
      description: 'Step-by-step guide to explore an SAP HANA database. Helps you discover schemas, tables, and data.',
      arguments: [
        {
          name: 'schema',
          description: 'Specific schema to explore (optional). If not provided, will explore all schemas.',
          required: false,
        },
      ],
    },
    {
      name: 'import-data',
      description: 'Guided workflow for importing data from CSV/Excel/TSV files with validation and error handling.',
      arguments: [
        {
          name: 'filename',
          description: 'Path to the file to import (required)',
          required: true,
        },
        {
          name: 'table',
          description: 'Target table name (optional). If not provided, will help determine the table.',
          required: false,
        },
        {
          name: 'schema',
          description: 'Target schema name (optional). If not provided, will help determine the schema.',
          required: false,
        },
      ],
    },
    {
      name: 'troubleshoot-connection',
      description: 'Help diagnose and fix database connection problems. Guides through common connection issues.',
      arguments: [],
    },
    {
      name: 'validate-data-quality',
      description: 'Comprehensive data quality validation workflow. Checks for duplicates, nulls, patterns, and data issues.',
      arguments: [
        {
          name: 'table',
          description: 'Table to validate (required)',
          required: true,
        },
        {
          name: 'schema',
          description: 'Schema name (optional). If not provided, will help determine the schema.',
          required: false,
        },
      ],
    },
    {
      name: 'quickstart',
      description: "Beginner's guide with recommended first commands. Perfect for users new to hana-cli.",
      arguments: [],
    },
    {
      name: 'export-data',
      description: 'Safe data export workflow with format selection and validation.',
      arguments: [
        {
          name: 'table',
          description: 'Table to export (required)',
          required: true,
        },
        {
          name: 'schema',
          description: 'Schema name (optional)',
          required: false,
        },
        {
          name: 'format',
          description: 'Output format: csv, excel, or tsv (optional)',
          required: false,
        },
      ],
    },
  ];
}

/**
 * Get a specific prompt template
 */
export function getPrompt(name: string, args?: Record<string, string>): GetPromptResult {
  if (name === 'explore-database') {
    return getExploreDatabasePrompt(args);
  }
  
  if (name === 'import-data') {
    return getImportDataPrompt(args);
  }
  
  if (name === 'troubleshoot-connection') {
    return getTroubleshootConnectionPrompt();
  }
  
  if (name === 'validate-data-quality') {
    return getValidateDataQualityPrompt(args);
  }
  
  if (name === 'quickstart') {
    return getQuickstartPrompt();
  }
  
  if (name === 'export-data') {
    return getExportDataPrompt(args);
  }
  
  throw new Error(`Unknown prompt: ${name}`);
}

function getExploreDatabasePrompt(args?: Record<string, string>): GetPromptResult {
  const schema = args?.schema || '[SCHEMA_NAME]';
  const hasSchema = schema !== '[SCHEMA_NAME]';
  
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `I want to explore the SAP HANA database${hasSchema ? ` focusing on schema ${schema}` : ''}.`,
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: `I'll guide you through exploring the database. Here's the recommended workflow:

**Step 1: Verify Connection** 🔌
First, let's confirm we can connect to the database.
→ I'll use \`hana_status\` to check the connection status.
→ This ensures we have valid credentials and network access.

**Step 2: Understand the Environment** 📊
Next, let's gather basic information about the database.
→ I'll use \`hana_version\` to see the SAP HANA version.
→ I'll use \`hana_systemInfo\` for system details (memory, CPUs, etc.).
→ This helps understand the database capabilities and configuration.

**Step 3: Discover Schemas** 🗂️
Now let's see what data is available.
${hasSchema 
  ? `→ We'll focus on schema: **${schema}**` 
  : '→ I\'ll use `hana_schemas` to list all available schemas.\n→ We can then pick interesting schemas to explore further.'}

**Step 4: Explore Tables** 📋
${hasSchema 
  ? `→ I'll use \`hana_tables\` with schema="${schema}" to list all tables.\n→ I'll use \`hana_inspectTable\` to see detailed information about interesting tables.` 
  : '→ Once we identify schemas of interest, I\'ll use `hana_tables` to see their tables.\n→ I\'ll use `hana_inspectTable` for detailed table information (columns, types, indexes).'}

**Step 5: Analyze Data** 🔍 (optional)
For tables that look interesting:
→ I can use \`hana_dataProfile\` to analyze data quality and patterns.
→ This shows statistics, null counts, duplicate detection, and value distributions.

**Step 6: Follow Up** ➡️
Based on what we find, I can:
- Check for duplicates with \`hana_duplicateDetection\`
- Validate data quality with \`hana_dataValidator\`
- Analyze performance with \`hana_memoryAnalysis\`
- Export data with \`hana_export\`

${!hasSchema ? '\n⚠️  **Note:** If you want to focus on a specific schema, let me know and I can adjust the exploration.' : ''}

Let's start! Should I begin with the connection check?`,
        },
      },
    ],
  };
}

function getImportDataPrompt(args?: Record<string, string>): GetPromptResult {
  const filename = args?.filename || '[FILE_PATH]';
  const table = args?.table || '[TABLE_NAME]';
  const schema = args?.schema || '[SCHEMA_NAME]';
  const hasFilename = filename !== '[FILE_PATH]';
  const hasTable = table !== '[TABLE_NAME]';
  const hasSchema = schema !== '[SCHEMA_NAME]';
  
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `I want to import data from ${filename}${hasTable ? ` into table ${table}` : ''}${hasSchema ? ` in schema ${schema}` : ''}.`,
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: `I'll help you import the data safely with validation. Here's the recommended workflow:

**Step 1: Preview with Dry Run** 🔍 (CRITICAL - Don't skip!)
Before importing anything, let's validate the file and see what will happen.
→ I'll use \`hana_import\` with \`dryRun: true\` to preview the import.
→ This shows column mappings and any potential issues **WITHOUT modifying the database**.

**Why this matters:**
- Prevents importing into wrong table
- Catches data type mismatches
- Shows how columns will be mapped
- Validates file format and encoding

**Step 2: Review the Preview** ✅
We'll carefully check:
- ✓ Column mappings are correct (file columns → table columns)
- ✓ Data types are compatible (no truncation or conversion errors)
- ✓ No validation errors reported
- ✓ Row count matches expectations
- ✓ Sample data looks correct

**Step 3: Actual Import** 💾 (with safety measures)
Once the preview looks good, I'll import with error handling:
→ Set \`dryRun: false\` to actually import
→ Set \`skipWithErrors: true\` to continue even if some rows fail
→ Set \`maxErrorsAllowed: 100\` to abort if too many errors occur
→ The tool will save an error report for review

**Step 4: Validate Imported Data** 🔍
After import completes, let's verify data quality:
→ I'll use \`hana_dataValidator\` to check for data issues
→ I'll use \`hana_dataProfile\` to get statistics and patterns
→ This ensures the import was successful and data is clean

**Step 5: Handle Any Issues** 🔧
If problems are found:
→ Review the error log for failed rows
→ Use \`hana_duplicateDetection\` to find duplicates
→ Fix source data and re-import failed rows
→ Use \`hana_compareData\` to verify against source if needed

**Important Parameters:**
- \`matchMode\`: How to map columns
  - \`'auto'\` - Smart detection (recommended)
  - \`'name'\` - Match by column header names
  - \`'order'\` - Match by position (no headers)
${!hasFilename ? '\n⚠️  **Missing:** Please provide the filename to import.' : ''}
${!hasTable ? '\n⚠️  **Missing:** Please provide the target table name.' : ''}
${!hasSchema ? '\n⚠️  **Missing:** Please provide the target schema name.' : ''}

${hasFilename && hasTable && hasSchema 
  ? 'Ready to start with the dry run preview?' 
  : 'Once you provide the required information, I\'ll begin with the dry run preview.'}`,
        },
      },
    ],
  };
}

function getTroubleshootConnectionPrompt(): GetPromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: "I'm having trouble connecting to the SAP HANA database.",
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: `I'll help you diagnose the connection issue. Let's go through the troubleshooting steps:

**Step 1: Check Current Status** 🔍
→ I'll use \`hana_status\` to see the current connection state and any error messages.
→ This will tell us exactly what's failing.

**Step 2: Understand Connection Resolution** 📋
The hana-cli looks for credentials in this priority order:

1. **--admin flag** - For HDI container admin credentials
2. **@sap/cds bind** - For CAP projects (automatically generates connection)
3. **.env file** - In current directory
4. **--conn parameter** - Explicit connection string
5. **default-env.json** - In user's home directory (~/.hana-cli/default-env.json)
6. **default-env.json** - In current working directory
7. **Environment variables** - HANA_HOST, HANA_USER, HANA_PASSWORD, etc.

**Step 3: Verify Configuration Files** 📁
Let me check which method you're using:
→ Are you using a CAP project? (Project with package.json and @sap/cds)
→ Do you have a .env file?
→ Do you have a default-env.json file?
→ Are you using environment variables?

**Step 4: Validate Connection Details** ✅
Your connection file needs these fields:
\`\`\`json
{
  "host": "your-hana-host.com",
  "port": 443,  // Cloud: 443, On-premise: 30015+
  "user": "your-username",
  "password": "your-password",
  "encrypt": true,  // For cloud connections
  "sslValidateCertificate": false  // If using self-signed certs
}
\`\`\`

Or for cloud with certificate:
\`\`\`json
{
  "host": "your-hana-cloud.com",
  "port": 443,
  "user": "your-username",
  "certificate": "-----BEGIN CERTIFICATE-----...",
  "key": "-----BEGIN PRIVATE KEY-----..."
}
\`\`\`

**Common Issues & Solutions:**

1. **"Connection refused" or "Cannot connect"**
   - ✓ Check hostname is correct
   - ✓ Verify port number (cloud: 443, on-premise: 3XX15)
   - ✓ Ensure network/VPN connection
   - ✓ Check firewall rules

2. **"Authentication failed"**
   - ✓ Verify username and password
   - ✓ Check if user account is locked
   - ✓ Ensure user has HANA_DATABASE access

3. **"Connection file not found"**
   - ✓ Create default-env.json in current directory
   - ✓ Or use --conn parameter
   - ✓ Or set environment variables

4. **"SSL/Certificate errors"**
   - ✓ Set \`sslValidateCertificate: false\` for testing
   - ✓ Or install proper CA certificates
   - ✓ For cloud, ensure \`encrypt: true\`

5. **HDI Container Connection**
   - ✓ Use \`--admin\` flag for admin credentials
   - ✓ Or use \`cds bind\` for CAP projects
   - ✓ Check HDI container credentials in BTP cockpit

**Step 5: Test the Fix** 🔧
Once we identify and fix the issue:
→ I'll run \`hana_status\` again to verify the connection
→ Then I'll run \`hana_version\` to confirm we can query the database

Let me start by checking the current status to see what error we're getting. What error message are you seeing?`,
        },
      },
    ],
  };
}

function getValidateDataQualityPrompt(args?: Record<string, string>): GetPromptResult {
  const table = args?.table || '[TABLE_NAME]';
  const schema = args?.schema || '[SCHEMA_NAME]';
  const hasTable = table !== '[TABLE_NAME]';
  const hasSchema = schema !== '[SCHEMA_NAME]';
  
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `I want to validate the data quality of table ${table}${hasSchema ? ` in schema ${schema}` : ''}.`,
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: `I'll guide you through a comprehensive data quality validation. Here's the workflow:

**Step 1: Profile the Data** 📊
First, let's get an overview of the data patterns and statistics.
→ I'll use \`hana_dataProfile\` with table="${table}"${hasSchema ? ` and schema="${schema}"` : ''}
→ This provides:
  - Row count and column statistics
  - Null value counts and percentages
  - Data type distribution
  - Value patterns and ranges
  - Potential data quality issues

**Step 2: Detect Duplicates** 🔍
Check for duplicate rows that might indicate data quality problems.
→ I'll use \`hana_duplicateDetection\` to find exact and partial duplicates
→ Configure threshold: How similar should rows be to count as duplicates?
→ Results show duplicate groups and counts

**Step 3: Validate Data Rules** ✅
Run comprehensive data validation checks.
→ I'll use \`hana_dataValidator\` to validate:
  - Required fields are not null
  - Data types are consistent
  - Value ranges are valid
  - Referential integrity (if configured)
  - Business rule compliance

**Step 4: Analyze Results** 📈
Review the findings:
- **Profile Results**: Look for unexpected nulls, outliers, or patterns
- **Duplicate Results**: Determine if duplicates are valid or errors
- **Validation Results**: Identify rule violations and data issues

**Step 5: Take Action** 🔧
Based on findings, I can help you:
- Export problematic rows with \`hana_export\` (with filter)
- Fix issues with SQL updates
- Remove duplicates with \`hana_duplicateDetection\` (delete mode)
- Document data quality metrics

**Optional Advanced Checks:**

**Data Lineage** 🌳
→ \`hana_dataLineage\` - Trace where data came from

**Referential Integrity** 🔗
→ \`hana_referentialCheck\` - Validate foreign key relationships

**Compare with Source** ⚖️
→ \`hana_compareData\` - Compare with original data source
${!hasTable ? '\n⚠️  **Missing:** Please provide the table name to validate.' : ''}
${!hasSchema ? '\n⚠️  **Tip:** Providing the schema name will make the validation more accurate.' : ''}

${hasTable 
  ? 'Ready to start with data profiling?' 
  : 'Once you provide the table name, I\'ll begin with data profiling.'}`,
        },
      },
    ],
  };
}

function getQuickstartPrompt(): GetPromptResult {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: "I'm new to hana-cli. What should I do first?",
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: `Welcome to hana-cli! I'll guide you through the essential first commands. Here's the beginner's workflow:

**Step 1: Verify Connection** 🔌 [MOST IMPORTANT]
→ Use \`hana_status\` to check if you can connect to the database.
→ **Purpose:** Ensures your credentials are configured correctly.
→ **What to expect:** Connection details, HANA version, user info.
→ **Tip:** If this fails, use the "troubleshoot-connection" prompt for help.

**Step 2: Check Database Version** ℹ️
→ Use \`hana_version\` to see the SAP HANA version and edition.
→ **Purpose:** Understand what features are available.
→ **What to expect:** HANA version number, edition (Express, Cloud, On-Premise).

**Step 3: View System Information** 💻
→ Use \`hana_systemInfo\` to get system details.
→ **Purpose:** Understand the database size, memory, and configuration.
→ **What to expect:** Memory usage, CPU count, database size, host info.

**Step 4: Discover Schemas** 🗂️
→ Use \`hana_schemas\` to list all available schemas.
→ **Purpose:** See what data you have access to.
→ **What to expect:** List of schema names with descriptions.
→ **Tip:** System schemas (SYS, _SYS_*) are internal - focus on business schemas.

**Step 5: Explore Tables** 📋
→ Pick an interesting schema and use \`hana_tables\` with schema="SCHEMA_NAME"
→ **Purpose:** See what tables exist in a schema.
→ **What to expect:** Table names, types, row counts, memory usage.

**Step 6: Inspect a Table** 🔍
→ Pick an interesting table and use \`hana_inspectTable\`
→ **Purpose:** See detailed table structure.
→ **What to expect:** Columns, data types, indexes, constraints, sample data.

**Quick Reference:**

\`\`\`
1. hana_status       → "Am I connected?"
2. hana_version      → "What version is this?"
3. hana_systemInfo   → "How big is the database?"
4. hana_schemas      → "What schemas exist?"
5. hana_tables       → "What tables are in schema X?"
6. hana_inspectTable → "What's in table Y?"
\`\`\`

**What to do after this:**

**Explore Data Quality:**
- \`hana_dataProfile\` - Analyze data patterns
- \`hana_duplicateDetection\` - Find duplicate rows
- \`hana_dataValidator\` - Validate data quality

**Work with Data:**
- \`hana_export\` - Export data to CSV/Excel
- \`hana_import\` - Import data from files
- \`hana_tableCopy\` - Copy data between tables

**Analyze Performance:**
- \`hana_healthCheck\` - Check system health
- \`hana_memoryAnalysis\` - Analyze memory usage
- \`hana_expensiveStatements\` - Find slow queries

**Get Help:**
- \`hana_discover_categories\` - Browse commands by category
- \`hana_recommend\` - Get command suggestions
- \`hana_examples\` - See usage examples

Ready to start? I'll begin by checking the connection with \`hana_status\`.`,
        },
      },
    ],
  };
}

function getExportDataPrompt(args?: Record<string, string>): GetPromptResult {
  const table = args?.table || '[TABLE_NAME]';
  const schema = args?.schema || '[SCHEMA_NAME]';
  const format = args?.format || 'csv';
  const hasTable = table !== '[TABLE_NAME]';
  const hasSchema = schema !== '[SCHEMA_NAME]';
  
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `I want to export data from table ${table}${hasSchema ? ` in schema ${schema}` : ''} to ${format} format.`,
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: `I'll help you export the data safely. Here's the workflow:

**Step 1: Verify Table Exists** ✅
First, let's confirm the table exists and check its size.
${hasTable && hasSchema 
  ? `→ I'll use \`hana_inspectTable\` with table="${table}" and schema="${schema}"` 
  : '→ I need the table and schema name to proceed'}
→ This shows row count, columns, and estimated export size.

**Step 2: Choose Export Options** ⚙️
Based on the table size, I'll recommend:

**For small tables (< 10K rows):**
- Export entire table
- Simple CSV/Excel format
- Quick and straightforward

**For large tables (> 10K rows):**
- Consider filtering with WHERE clause
- Use batch export for very large tables
- Compress output if needed

**Step 3: Configure Export** 📋
Key parameters to consider:
- \`format\`: ${format} ✓ ${format !== 'csv' && format !== 'excel' && format !== 'tsv' ? '(Note: Valid formats are csv, excel, tsv)' : ''}
- \`filename\`: Where to save the file
- \`query\`: Optional - Custom SQL to filter/transform data
- \`mimetype\`: For Excel, affects formatting

**Step 4: Execute Export** 💾
→ I'll use \`hana_export\` with the configured parameters.
→ The tool will:
  - Stream data efficiently
  - Show progress for large exports
  - Handle special characters and encoding
  - Create the output file

**Step 5: Verify Export** ✅
After export completes:
→ Check file size and row count
→ Open file to verify format and data
→ Confirm all expected columns are present

**Advanced Options:**

**Custom Query Export:**
Instead of full table, export specific columns or filtered rows:
\`\`\`sql
SELECT col1, col2, col3 
FROM ${hasTable ? table : 'TABLE_NAME'} 
WHERE condition = true
\`\`\`

**Multiple Table Export:**
Export related tables together:
→ Use joins in custom query
→ Or export tables separately and relate them

**Scheduled Export:**
Set up recurring exports:
→ Combine with cron/Task Scheduler
→ Automate export pipelines
${!hasTable ? '\n⚠️  **Missing:** Please provide the table name to export.' : ''}
${!hasSchema ? '\n⚠️  **Tip:** Providing the schema name ensures we export from the correct table.' : ''}

${hasTable && hasSchema
  ? 'Ready to start by inspecting the table?'
  : 'Once you provide the table and schema, I\'ll begin by checking the table details.'}`,
        },
      },
    ],
  };
}
