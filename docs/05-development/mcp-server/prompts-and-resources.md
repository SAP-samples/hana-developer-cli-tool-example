# Prompts and Resources

Understanding MCP Resources and Prompts - advanced features that help AI agents discover and learn.

## What Are MCP Resources?

Resources are named, readable content that AI agents can discover and browse directly, similar to how humans browse documentation.

### Key Differences from Tools

| Feature | Tools | Resources |
| --------- | ------- | ----------- |
| **Purpose** | Execute commands | Read documentation |
| **Input** | Required parameters | Resource URI |
| **Output** | Command results | Document content |
| **Use Case** | Actions | Learning and discovery |
| **Agent Behavior** | Call with parameters | Browse and read |

### How Agents Use Resources

Instead of searching or guessing:

```bash
Agent: "I want to import data but I'm not sure how"

Traditional (without resources):
- Agent calls hana_search_docs → finds import.md
- Agent guesses at parameters
- Agent tries import (may fail)

With Resources:
- Agent lists available resources
- Agent reads hana://docs/commands/import
- Agent learns correct usage
- Agent succeeds first time
```

## Available Resources

### Core Documentation Resources

#### Project Overview

- `hana://docs/overview` - Project introduction and features
- `hana://docs/getting-started` - Installation and setup guide

#### Connection and Setup

- `hana://docs/connection-guide` - 7-step connection resolution
- `hana://docs/security` - Security best practices
- `hana://docs/parameters` - Standard parameter conventions

#### Architecture and Design

- `hana://docs/best-practices` - Naming conventions and patterns
- `hana://docs/project-structure` - Project folder organization
- `hana://docs/implementation` - Technical implementation details

### Category Guides

Organized by functionality:

- `hana://docs/categories/data-quality` - Data validation, profiling, duplicates
- `hana://docs/categories/performance` - Performance analysis and tuning
- `hana://docs/categories/data-operations` - Import, export, sync
- `hana://docs/categories/inspection` - Schema, table, view exploration
- `hana://docs/categories/backup` - Backup and recovery operations
- `hana://docs/categories/security` - User management and security
- `hana://docs/categories/btp` - SAP BTP integration

### Command Documentation

Individual command guides (available for all 150+ commands):

- `hana://docs/commands/import` - Import command with examples
- `hana://docs/commands/export` - Export command with examples
- `hana://docs/commands/dataValidator` - Data validation guide
- `hana://docs/commands/dataProfile` - Data profiling guide
- `hana://docs/commands/compareSchema` - Schema comparison guide
- `hana://docs/commands/[any-command]` - Any command documentation

**Each command resource includes:**

- Detailed description
- All parameters explained
- Use cases and examples
- Common issues and solutions
- Related commands

### Examples and Presets

- `hana://examples/import` - 5 real-world import scenarios
- `hana://examples/export` - 3 export scenarios
- `hana://examples/data-migration` - Migration examples
- `hana://presets/safe-import` - Safe import parameter template
- `hana://presets/quick-export` - Quick export template

### Workflow Resources

Pre-built task sequences:

- `hana://workflows/data-quality-check` - Data quality check workflow
- `hana://workflows/schema-migration` - Schema migration workflow
- `hana://workflows/performance-baseline` - Performance baseline workflow
- `hana://prompts` - All available prompts and guide workflows

## What Are MCP Prompts?

Prompts are guided conversation templates that help AI agents follow structured workflows for common tasks.

### How Prompts Work

Prompts provide:

1. **Multi-step guidance** - Step-by-step instructions
2. **Context preservation** - Information carries through steps
3. **Best practices** - Baked-in standards
4. **Error prevention** - Validation and checks
5. **Learning support** - Explanations and tips

### Example Prompt Flow

**User:** "Help me safely import customer data"

**System:** Invokes `import-data` prompt

**Prompt Steps:**

```bash
📋 SAFE DATA IMPORT WORKFLOW

Step 1: Verify Source File
└─ Review file location and format
   └─ Expected: CSV, Excel, or TSV file

Step 2: Inspect Target Table
└─ Examine table structure and constraints
   └─ Required: INSERT privilege on table

Step 3: Preview Import (Dry Run)
└─ Run import in preview mode
   └─ Shows what would be imported without actual changes

Step 4: Review Errors
└─ Check dry run results
   └─ Decide: Proceed or fix data issues

Step 5: Execute Import
└─ Run actual import with selected options
   └─ Progress tracking and error handling

Step 6: Validate Results
└─ Verify imported data
   └─ Check count and sample records
   └─ Run quality checks if needed
```

## Available Prompts

### 1. Explore Database (`explore-database`)

**Duration:** 15-30 minutes

**Parameters:**

- `schema` (optional) - Specific schema to explore

**Guided Steps:**

1. Verify database connection
2. Check database version and system info
3. List all schemas
4. For each interesting schema:
   - List tables
   - Inspect some table structures
5. Profile data quality if interested
6. Summarize findings

**Outcomes:**

- Understanding of database structure
- Schema catalog
- Sample table definitions
- Data quality overview

### 2. Import Data Safely (`import-data`)

**Duration:** 20-40 minutes

**Parameters:**

- `filename` (required) - File to import
- `table` (optional) - Target table
- `schema` (optional) - Target schema

**Guided Steps:**

1. Verify file exists and is readable
2. Inspect target table structure
3. Preview import with dry-run
4. Review and resolve errors
5. Execute actual import (if approved)
6. Validate imported data
7. Generate import report

**Outcomes:**

- Successful safe import
- Error documentation
- Validation report

### 3. Troubleshoot Connection (`troubleshoot-connection`)

**Duration:** 20-40 minutes

**Parameters:** None required

**Guided Steps:**

1. Check basic connectivity
2. Verify credentials
3. Test database connection
4. Review user privileges
5. Check schema access
6. Diagnose specific issues
7. Provide remediation steps

**Outcomes:**

- Diagnosed connection issue
- Recommended solutions
- Verified working connection

### 4. Validate Data Quality (`validate-data-quality`)

**Duration:** 30-60 minutes

**Parameters:**

- `table` (required) - Table to validate
- `schema` (optional) - Target schema

**Guided Steps:**

1. Profile the table (data distribution, nulls, etc.)
2. Check for duplicate records
3. Run data validator
4. Analyze issues found
5. Get recommendations
6. Generate quality report

**Outcomes:**

- Data quality assessment
- Issue prioritization
- Remediation recommendations

### 5. Quick Start (`quickstart`)

**Duration:** 15-30 minutes

**Parameters:** None required

**Perfect for:** First-time users

**Teaches:**

1. `hana_status` - Verify connection
2. `hana_version` - Check database version
3. `hana_schemas` - List schemas
4. `hana_tables` - Explore tables
5. `hana_inspectTable` - View table structure
6. `hana_healthCheck` - System health

**Outcomes:**

- Understanding of basic commands
- Confidence in CLI usage
- Ready for advanced workflows

### 6. Export Data Safely (`export-data`)

**Duration:** 20-40 minutes

**Parameters:**

- `table` (required) - Table to export
- `schema` (optional) - Source schema
- `format` (optional) - CSV, Excel, or TSV

**Guided Steps:**

1. Verify source table exists
2. Check user has SELECT privilege
3. Configure export format
4. Preview export
5. Execute export
6. Verify export file
7. Validate data integrity

**Outcomes:**

- Successfully exported file
- Export validation report
- Format verification

## How Agents Use Resources and Prompts

### Resource Discovery Workflow

```bash
1. Agent: "I need help with..."
   
2. System: Lists available resources
   - hana://docs/getting-started
   - hana://docs/commands/import
   - hana://examples/import
   - hana://workflows/data-migration
   
3. Agent: "Show me hana://docs/commands/import"
   
4. System: Reads and formats resource
   - Title, description
   - All parameters explained
   - 5 usage scenarios
   - Common issues
   
5. Agent: Confident in tool usage
   
6. Agent: Runs import command
```

### Prompt-Guided Workflow

```bash
1. User: "Help me explore the database"
   
2. Agent: Invokes explore-database prompt
   
3. System: Returns structured guidance
   Step 1: Verify connection
   Step 2: Check version
   Step 3: List schemas
   ...
   
4. Agent: Follows steps in order
   - Runs each command
   - Reviews results
   - Proceeds to next step
   
5. System: Automatically suggests next steps
   based on results
   
6. User: Gets clear understanding
   of database structure
```

## Combining Resources and Prompts

### Example: Learn Import by Resources, Execute by Prompt

```bash
Step 1: Resources (Learning)
- Agent reads hana://docs/commands/import
- Agent reviews hana://examples/import
- Agent understands options and best practices

Step 2: Prompt (Execution)
- Agent invokes "import-data" prompt
- Follows step-by-step guidance
- Ensures safe import

Step 3: Resources (Validation)
- If issues arise, agent reads hana://docs/troubleshooting
- Gets solutions from resources
- Applies fixes
```

### Example: Performance Tuning

```bash
Step 1: Understand
- Agent reads hana://docs/categories/performance
- Agent reviews hana://workflows/performance-baseline
- Agent learns approach

Step 2: Execute
- Agent invokes relevant workflow
- Gets structured guidance
- Collects metrics

Step 3: Interpret
- Agent reads performance results
- Gets recommendations
- Plans improvements

Step 4: Implement & Verify
- Agent follows hana_get_template("performance-tuning")
- Implements suggestions
- Re-measures and compares
```

## Best Practices

### For Agent Developers

1. **Start with Resource Discovery**

   ```typescript
   resources = await listResources()
   // Shows available learning material
   ```

2. **Use Prompts for Complex Tasks**

   ```typescript
   await invokePrompt('import-data', { file: 'data.csv' })
   // Provides structured guidance
   ```

3. **Chain Resources and Prompts**

   ```bash
   Read resource → Invoke prompt → Execute → Validate
   ```

4. **Leverage Context**
   - Resources provide context
   - Prompts build on context
   - Results inform next steps

### For Users (Best Practices)

1. **Explore Resources First**
   - Get familiar with available help
   - Learn best practices
   - See examples

2. **Use Prompts for New Tasks**
   - Follow guided workflows
   - Avoid mistakes
   - Learn as you work

3. **Combine Both**
   - Resources for learning
   - Prompts for execution
   - Both for confidence

## Benefits

### For AI Agents

✅ **Reduced tool calls** - Read documentation instead of searching
✅ **Better context** - Full information available
✅ **Guided workflows** - Structured multi-step processes
✅ **Error prevention** - Validation steps built in
✅ **Better outcomes** - Follows best practices

### For Users

✅ **Self-service learning** - Agents can learn from resources
✅ **Structured guidance** - Prompts prevent mistakes
✅ **Quick results** - Faster task completion
✅ **Best practices** - Guided toward optimal approaches
✅ **Confidence** - Clear steps and expectations

## Future Enhancements

Potential additions to resources and prompts:

1. **Video Tutorials**
   - `hana://videos/import-guide`
   - `hana://videos/performance-tuning`

2. **Interactive Guides**
   - Better step feedback
   - Real-time validation
   - Progress tracking

3. **Custom Resources**
   - User-created guides
   - Organization-specific docs
   - Custom workflows

4. **Smart Recommendations**
   - Context-aware prompts
   - Personalized workflows
   - Adaptive guidance

## Next Steps

- **[Discovery Tools](./discovery-tools.md)** - Finding commands by intent
- **[Advanced Features](./advanced-features.md)** - Workflows and interpretation
- **[Implementation Phases](./implementation-phases.md)** - Technical details
- **[Main Documentation Index](./index.md)** - Overview of all features
