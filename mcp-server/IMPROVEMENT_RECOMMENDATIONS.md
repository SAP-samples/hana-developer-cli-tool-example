# MCP Server Improvement Recommendations

## Executive Summary

The current MCP server implementation is robust with 150+ commands, comprehensive metadata, and discovery tools. These recommendations focus on enhancing discoverability, parameter guidance, and conversational flow for AI agents.

---

## 1. Enhanced Discovery Tools

### 1.1 Intent-Based Command Recommendation

**Problem:** Agents may not know which command to use for a specific task.

**Solution:** Add a `hana_recommend` tool that uses natural language intent matching.

```typescript
// New tool: hana_recommend
{
  name: 'hana_recommend',
  description: 'Get command recommendations based on what you want to accomplish. Use natural language to describe your goal.',
  inputSchema: {
    type: 'object',
    properties: {
      intent: {
        type: 'string',
        description: 'What you want to do (e.g., "find duplicate rows", "check database version", "export table to CSV")'
      }
    },
    required: ['intent']
  }
}
```

**Implementation:**

- Use keyword matching against command descriptions, tags, and use cases
- Return top 3-5 most relevant commands with confidence scores
- Include example parameters for each suggested command

### 1.2 Quick Start Commands

**Problem:** New users don't know where to start.

**Solution:** Add a `hana_quickstart` tool with common first commands.

```typescript
// New tool: hana_quickstart
{
  name: 'hana_quickstart',
  description: 'Get recommended first commands to verify connection and explore the database',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
}
```

**Returns:**

1. `hana_status` - Verify connection
2. `hana_version` - Check database version
3. `hana_schemas` - List available schemas
4. `hana_systemInfo` - View system information
5. `hana_healthCheck` - Quick health check

### 1.3 Example Library

**Problem:** Agents need concrete examples to understand command usage.

**Solution:** Add a `hana_examples` tool.

```typescript
// New tool: hana_examples
{
  name: 'hana_examples',
  description: 'Get real-world usage examples for a specific command, including common parameter combinations',
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'Command name (without hana_ prefix)'
      }
    },
    required: ['command']
  }
}
```

**Example response for `hana_import`:**

```json
{
  "command": "import",
  "examples": [
    {
      "scenario": "Basic CSV import",
      "parameters": {
        "filename": "data.csv",
        "table": "MY_TABLE",
        "schema": "MY_SCHEMA"
      },
      "notes": "Simplest import - auto-detects column mapping"
    },
    {
      "scenario": "Import with error handling",
      "parameters": {
        "filename": "data.csv",
        "table": "MY_TABLE",
        "schema": "MY_SCHEMA",
        "skipWithErrors": true,
        "maxErrorsAllowed": 100,
        "dryRun": true
      },
      "notes": "Use dryRun first to preview, then run without it"
    }
  ]
}
```

---

## 2. Better Parameter Discovery

### 2.1 Parameter Validation with Examples

**Problem:** Agent doesn't know valid parameter values or formats.

**Solution:** Enhance JSON Schema with examples and constraints.

**Current:**

```json
{
  "type": "string",
  "description": "Table name"
}
```

**Enhanced:**

```json
{
  "type": "string",
  "description": "Table name (case-sensitive, must exist in schema)",
  "examples": ["CUSTOMERS", "SALES_DATA", "ORDERS"],
  "pattern": "^[A-Za-z0-9_]+$",
  "minLength": 1,
  "maxLength": 127
}
```

### 2.2 Parameter Presets

**Problem:** Commands have many parameters; agents need guidance on common combinations.

**Solution:** Add a `hana_parameter_presets` tool.

```typescript
// New tool: hana_parameter_presets
{
  name: 'hana_parameter_presets',
  description: 'Get parameter presets/templates for common use cases of a command',
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'Command name'
      },
      useCase: {
        type: 'string',
        description: 'Optional: specific use case (e.g., "quick-import", "safe-import", "large-file")'
      }
    },
    required: ['command']
  }
}
```

**Example for `import` command:**

```json
{
  "command": "import",
  "presets": {
    "quick-import": {
      "description": "Fast import for small files with known good data",
      "parameters": {
        "filename": "<your-file.csv>",
        "table": "<table-name>",
        "schema": "<schema-name>"
      }
    },
    "safe-import": {
      "description": "Cautious import with validation and error handling",
      "parameters": {
        "filename": "<your-file.csv>",
        "table": "<table-name>",
        "schema": "<schema-name>",
        "dryRun": true,
        "skipWithErrors": true,
        "maxErrorsAllowed": 10
      },
      "notes": "Run twice: first with dryRun:true, then with dryRun:false"
    },
    "large-file": {
      "description": "Import large files with memory protection",
      "parameters": {
        "filename": "<your-file.csv>",
        "table": "<table-name>",
        "schema": "<schema-name>",
        "maxFileSizeMB": 500,
        "timeoutSeconds": 3600
      }
    }
  }
}
```

### 2.3 Parameter Dependencies

**Problem:** Some parameters depend on others; agents don't know the relationships.

**Solution:** Add parameter dependency metadata.

```typescript
// In command-parser.ts
export interface ParameterDependency {
  parameter: string;
  requires?: string[];  // Must be present with these
  conflicts?: string[];  // Cannot be used with these
  requiredWhen?: {
    parameter: string;
    value: any;
  };
}

// Example for import command
const importDependencies: ParameterDependency[] = [
  {
    parameter: 'maxErrorsAllowed',
    requires: ['skipWithErrors'],
    note: 'maxErrorsAllowed only works when skipWithErrors is true'
  },
  {
    parameter: 'dryRun',
    conflicts: ['commit'],
    note: 'Cannot use dryRun and commit together'
  }
];
```

---

## 3. Improved Conversational Usage

### 3.1 Context-Aware Next Steps

**Problem:** After executing a command, agent doesn't know what to do next.

**Solution:** Add suggested next steps to command responses.

**Enhance executor.ts:**

```typescript
export function formatResult(result: CommandResult): string {
  let output = result.output;
  
  // Add suggested next steps based on command
  const nextSteps = getSuggestedNextSteps(result.command, result.output);
  if (nextSteps.length > 0) {
    output += '\n\n## Suggested Next Steps:\n';
    nextSteps.forEach((step, i) => {
      output += `${i + 1}. ${step.description} → Use \`hana_${step.command}\`\n`;
      if (step.parameters) {
        output += `   Parameters: ${JSON.stringify(step.parameters)}\n`;
      }
    });
  }
  
  return output;
}

function getSuggestedNextSteps(command: string, output: string): NextStep[] {
  const suggestions: Record<string, NextStep[]> = {
    'status': [
      { command: 'schemas', description: 'Explore available schemas' },
      { command: 'healthCheck', description: 'Check system health' }
    ],
    'schemas': [
      { command: 'tables', description: 'List tables in a schema', parameters: { schema: '<name>' } }
    ],
    'dataProfile': [
      { command: 'duplicateDetection', description: 'Find duplicate records' },
      { command: 'dataValidator', description: 'Validate data quality' }
    ],
    'export': [
      { command: 'import', description: 'Import the exported data elsewhere' }
    ]
  };
  
  return suggestions[command] || [];
}
```

### 3.2 Interactive Error Resolution

**Problem:** Error messages don't help agents fix the problem.

**Solution:** Enhanced error messages with actionable suggestions.

**Current:**

```bash
Error: Table not found: MY_TABLE
```

**Enhanced:**

```json
{
  "error": "Table not found: MY_TABLE",
  "errorCode": "TABLE_NOT_FOUND",
  "suggestions": [
    {
      "action": "List available tables",
      "command": "hana_tables",
      "parameters": { "schema": "MY_SCHEMA" }
    },
    {
      "action": "Check if schema exists",
      "command": "hana_schemas",
      "parameters": {}
    }
  ],
  "possibleCauses": [
    "Table name is case-sensitive - check capitalization",
    "Table may be in different schema",
    "Table may not exist yet - create it first"
  ]
}
```

### 3.3 Conversation Templates

**Problem:** Agents need guidance on how to have effective conversations.

**Solution:** Add conversation templates/prompts for the MCP server.

**New tool: `hana_conversation_templates`**

```typescript
{
  name: 'hana_conversation_templates',
  description: 'Get conversation templates for common scenarios (useful for agent prompts)',
  inputSchema: {
    type: 'object',
    properties: {
      scenario: {
        type: 'string',
        enum: ['data-exploration', 'troubleshooting', 'data-migration', 'performance-tuning'],
        description: 'The conversation scenario'
      }
    },
    required: ['scenario']
  }
}
```

**Example template for "data-exploration":**

```bash
Conversation Template: Data Exploration

1. Start by checking connection status
   → hana_status

2. Understand the environment
   → hana_version
   → hana_systemInfo

3. Discover schemas
   → hana_schemas

4. For each interesting schema:
   → hana_tables (schema: <name>)
   → hana_inspectTable (table: <name>, schema: <name>)

5. Profile interesting tables
   → hana_dataProfile (table: <name>, schema: <name>)

6. Follow up based on findings:
   - High duplicate count? → hana_duplicateDetection
   - Need to validate? → hana_dataValidator
   - Performance issues? → hana_memoryAnalysis
```

### 3.4 Command History and Learning

**Problem:** Agent repeats failed commands or doesn't learn from past executions.

**Solution:** Add session memory capabilities (if supported by MCP).

**New tool: `hana_recent_commands`**

```typescript
{
  name: 'hana_recent_commands',
  description: 'Get recently executed commands in this session with their outcomes',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        default: 10,
        description: 'Number of recent commands to return'
      }
    }
  }
}
```

---

## 4. Documentation Enhancements

### 4.1 Inline Command Help

**Problem:** Tool descriptions are too brief; agents need more context.

**Solution:** Enhance tool descriptions with more structure.

**Current:**

```bash
"Import data from file to database table"
```

**Enhanced:**

```bash
"Import data from CSV/Excel file to database table. 
Supports: CSV, Excel (.xlsx), TSV formats.
Features: Auto column mapping, error handling, dry-run mode, custom delimiters.
Common use: Data migration, bulk data loading, ETL processes.
Prerequisites: Table must exist, user needs INSERT privilege.
Tip: Use dryRun:true first to validate before actual import."
```

### 4.2 Command Constraints

**Problem:** Agents don't know when commands will fail.

**Solution:** Add constraint metadata.

```typescript
export interface CommandConstraints {
  command: string;
  requiredPrivileges?: string[];
  minVersion?: string;
  maxExecutionTime?: string;
  resourceIntensive?: boolean;
  prerequisites?: string[];
  limitations?: string[];
}

const commandConstraints: Record<string, CommandConstraints> = {
  'backup': {
    requiredPrivileges: ['BACKUP ADMIN'],
    resourceIntensive: true,
    maxExecutionTime: '2-4 hours for large databases',
    prerequisites: [
      'Sufficient disk space on backup location',
      'Database not in read-only mode',
      'No other backup currently running'
    ],
    limitations: [
      'Cannot backup during system replication',
      'Locks may affect concurrent operations'
    ]
  }
};
```

### 4.3 Troubleshooting Tips

**New tool: `hana_troubleshoot`**

```typescript
{
  name: 'hana_troubleshoot',
  description: 'Get troubleshooting guide for common issues with a specific command',
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'Command name'
      },
      error: {
        type: 'string',
        description: 'Optional: specific error message encountered'
      }
    },
    required: ['command']
  }
}
```

---

## 5. Smart Features

### 5.1 Command Chaining Support

**Problem:** Multi-step workflows require multiple separate tool calls.

**Solution:** Add workflow execution tool.

**New tool: `hana_execute_workflow`**

```typescript
{
  name: 'hana_execute_workflow',
  description: 'Execute a complete workflow with parameter substitution. Runs multiple commands in sequence.',
  inputSchema: {
    type: 'object',
    properties: {
      workflowId: {
        type: 'string',
        description: 'Workflow ID from hana_workflows'
      },
      parameters: {
        type: 'object',
        description: 'Parameters to substitute in workflow commands (e.g., {table: "CUSTOMERS", schema: "SALES"})'
      },
      stopOnError: {
        type: 'boolean',
        default: true,
        description: 'Stop workflow if any command fails'
      }
    },
    required: ['workflowId', 'parameters']
  }
}
```

### 5.2 Dry Run for All Commands

**Problem:** Only some commands support dry run mode.

**Solution:** Add universal dry run wrapper.

```typescript
interface DryRunResult {
  command: string;
  parameters: any;
  validationResults: {
    parameterValidation: 'passed' | 'failed';
    environmentValidation: 'passed' | 'failed';
    prerequisiteCheck: 'passed' | 'failed';
    estimatedExecutionTime?: string;
    resourceRequirements?: {
      memory: string;
      disk: string;
      cpu: string;
    };
  };
  warnings: string[];
  suggestions: string[];
  wouldExecute: boolean;
}
```

### 5.3 Result Interpretation

**Problem:** Agents get raw output and don't know what it means.

**Solution:** Add interpretation layer.

**New tool: `hana_interpret_result`**

```typescript
{
  name: 'hana_interpret_result',
  description: 'Get AI-friendly interpretation of command results with insights and recommendations',
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The command that was executed'
      },
      result: {
        type: 'string',
        description: 'The command output'
      }
    },
    required: ['command', 'result']
  }
}
```

**Example response:**

```json
{
  "command": "memoryAnalysis",
  "summary": "Memory usage analysis completed for 47 tables",
  "insights": [
    "Table 'LARGE_TABLE' uses 42% of total memory (4.2GB)",
    "Top 5 tables account for 78% of memory usage",
    "12 tables have unused space that could be reclaimed"
  ],
  "recommendations": [
    {
      "priority": "high",
      "action": "Consider partitioning LARGE_TABLE",
      "reason": "Single table using >40% memory",
      "command": "hana_partitionAnalysis",
      "parameters": { "table": "LARGE_TABLE" }
    }
  ],
  "normalBehavior": "Top 20% of tables typically use 80% of memory",
  "concernsDetected": [
    "Unusual memory concentration in single table"
  ]
}
```

### 5.4 Smart Search

**New tool: `hana_smart_search`**

```typescript
{
  name: 'hana_smart_search',
  description: 'Comprehensive search across commands, parameters, workflows, and examples using natural language',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language search query'
      },
      scope: {
        type: 'string',
        enum: ['all', 'commands', 'workflows', 'parameters', 'examples'],
        default: 'all',
        description: 'What to search'
      }
    },
    required: ['query']
  }
}
```

---

## 6. Implementation Priority

### Phase 1: High Impact, Low Effort

1. **Parameter Presets** - Add preset configurations
2. **Enhanced Descriptions** - Improve tool descriptions with structured format
3. **Error Enhancement** - Better error messages with suggestions
4. **Examples Library** - Add command examples

### Phase 2: Medium Impact, Medium Effort

1. **Command Recommendation** - Intent-based discovery
2. **Quick Start** - Beginner-friendly entry point
3. **Next Steps** - Context-aware suggestions
4. **Troubleshooting Tips** - Command-specific help

### Phase 3: High Impact, Higher Effort

1. **Workflow Execution** - Automated multi-step processes
2. **Result Interpretation** - AI-friendly output analysis
3. **Smart Search** - Comprehensive search across all resources
4. **Conversation Templates** - Guided interaction patterns

---

## 7. Example Enhanced Tool Definition

Here's how an enhanced tool definition would look:

```typescript
{
  name: 'hana_import',
  description: `Import data from CSV/Excel/TSV file to database table.
    
**Features:** Auto column mapping, error handling, dry-run validation, custom delimiters
**Supports:** CSV (.csv), Excel (.xlsx), TSV (.tsv)
**Prerequisites:** Table exists, user has INSERT privilege
**Related:** hana_export, hana_tableCopy, hana_dataValidator

**Common Use Cases:**
- Data migration from external systems
- Bulk data loading
- ETL pipeline integration
- Testing with sample data

**Pro Tips:**
- Always use dryRun:true first to validate
- Set maxErrorsAllowed to prevent bad data loading
- Use matchMode:'name' for flexible column mapping`,
  
  inputSchema: {
    type: 'object',
    properties: {
      filename: {
        type: 'string',
        description: 'Path to file (relative or absolute). Supports CSV, Excel, TSV',
        examples: ['data.csv', './imports/customers.xlsx', 'C:\\data\\export.tsv']
      },
      table: {
        type: 'string',
        description: 'Target table name (case-sensitive, must exist)',
        examples: ['CUSTOMERS', 'SALES_DATA'],
        pattern: '^[A-Za-z0-9_]+$'
      },
      schema: {
        type: 'string',
        description: 'Target schema name (case-sensitive)',
        examples: ['SALES', 'PRODUCTION', 'DEV']
      },
      dryRun: {
        type: 'boolean',
        default: false,
        description: 'Preview import without writing to database (RECOMMENDED: use true first)',
        examples: [true, false]
      },
      matchMode: {
        type: 'string',
        enum: ['order', 'name', 'auto'],
        default: 'auto',
        description: 'How to match file columns to table columns. order=by position, name=by header name, auto=smart detection',
        examples: ['auto', 'name', 'order']
      }
    },
    required: ['filename', 'table', 'schema']
  },
  
  metadata: {
    category: 'data-operations',
    tags: ['import', 'data', 'csv', 'excel', 'etl'],
    estimatedTime: '1-30 minutes depending on file size',
    resourceIntensive: true,
    examples: [
      {
        name: 'Basic CSV import',
        parameters: {
          filename: 'customers.csv',
          table: 'CUSTOMERS',
          schema: 'SALES'
        }
      },
      {
        name: 'Safe import with validation',
        parameters: {
          filename: 'data.csv',
          table: 'MY_TABLE',
          schema: 'TEST',
          dryRun: true,
          skipWithErrors: true,
          maxErrorsAllowed: 10
        }
      }
    ],
    nextSteps: [
      { command: 'dataValidator', description: 'Validate imported data' },
      { command: 'dataProfile', description: 'Profile imported data' }
    ]
  }
}
```

---

## 8. Metrics to Track Success

After implementing improvements, track:

1. **Discovery Efficiency**
   - % of commands found on first try
   - Average number of discovery tool calls before command execution

2. **Parameter Success Rate**
   - % of commands that succeed on first execution
   - Reduction in parameter-related errors

3. **Conversation Quality**
   - Average commands per goal achievement
   - Workflow completion rates

4. **Error Recovery**
   - Time from error to successful retry
   - % of errors resolved with suggestions

---

## Conclusion

These improvements will make the MCP server significantly more agent-friendly by:

- **Reducing guesswork** with intent-based discovery
- **Preventing errors** with parameter presets and validation
- **Guiding conversations** with templates and next steps
- **Accelerating learning** with examples and troubleshooting tips
- **Enabling autonomy** with workflow execution and result interpretation

**Recommended First Steps:**

1. Implement parameter presets (quick win)
2. Enhance tool descriptions (high impact)
3. Add examples library (valuable reference)
4. Build intent-based recommendation system (game changer)
