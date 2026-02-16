# SAP HANA CLI MCP Server

This MCP (Model Context Protocol) server exposes all SAP HANA CLI commands as tools that can be used by AI assistants like Claude.

## Installation

The server is already built and ready to use. Dependencies are installed automatically via the `prepare` script.

## Configuration

To use this MCP server with Cline/Claude Dev, add the following to your MCP settings file:

**Location:** `C:\Users\I809764\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "hana-cli": {
      "command": "node",
      "args": [
        "D:/projects/hana-developer-cli-tool-example/mcp-server/build/index.js"
      ],
      "env": {}
    }
  }
}
```

## Server Icon

This MCP server publishes an icon via the MCP `serverInfo.icons` metadata. For compatibility, the icon is embedded as a PNG data URI derived from `../app/resources/favicon.ico`. If you want to swap the logo, replace the PNG data URI in `src/index.ts` with a new PNG or SVG data URI and update the `mimeType` accordingly.

## Available Commands

The server exposes all hana-cli commands (150+) with the `hana_` prefix. For example:

- `hana_status` - Check connection status
- `hana_tables` - List database tables
- `hana_schemas` - List database schemas
- `hana_version` - Show version information
- `hana_import` - Import data (with new matchMode, dryRun, and error handling parameters)
- `hana_dataValidator` - Validate data quality
- `hana_healthCheck` - Check system health
- `hana_memoryAnalysis` - Analyze memory consumption
- And 140+ more commands...

All command aliases are also available (e.g., `hana_s` for status, `hana_t` for tables, `hana_imp` for import).

## Discovery Features

The MCP server includes powerful discovery tools to help agents find and use the right commands:

### Command Discovery

- **`hana_discover_categories`** - Browse commands by category (data-quality, performance-analysis, security, etc.)
- **`hana_discover_by_category`** - Get all commands in a specific category with metadata
- **`hana_discover_by_tag`** - Search commands by tags (import, export, validation, performance, etc.)

### Workflows

- **`hana_workflows`** - List pre-built multi-step workflows for common tasks
- **`hana_workflow_by_id`** - Get detailed steps for a specific workflow
- **`hana_search_workflows`** - Find workflows by tag or purpose

### Examples & Presets (NEW!)

- **`hana_examples`** - Get real-world usage examples for any command
  - Shows multiple scenarios with complete parameter sets
  - Includes expected outputs and usage notes
  - Perfect for learning command syntax
  
- **`hana_parameter_presets`** - Get parameter templates for common use cases
  - Pre-configured parameter combinations (e.g., "quick-import", "safe-import", "large-file")
  - Describes when to use each preset
  - Ready-to-use templates with placeholder values

- **`hana_commands_with_examples`** - List all commands that have examples and presets available

### Intent-Based Discovery & Guidance (Phase 2 - NEW!)

- **`hana_recommend`** - Get command recommendations based on natural language intent
  - Tell the system what you want to do in plain English
  - Returns top 5 matching commands with confidence scores
  - Example: "find duplicate rows" → suggests `duplicateDetection`, `dataProfile`, etc.
  - Includes example parameters and links to detailed examples
  
- **`hana_quickstart`** - Beginner-friendly quick start guide
  - Recommended first 6 commands for new users
  - Step-by-step instructions with purposes and tips
  - Perfect for initial database exploration

- **`hana_troubleshoot`** - Get troubleshooting guide for any command
  - Common issues and their solutions
  - Prerequisites and tips for success
  - Actionable suggestions with specific commands to try
  - Available for: import, export, dataProfile, tables, status, healthCheck, and more

### Context-Aware Next Steps (Phase 2 - NEW!)

After executing any command successfully, the system now suggests relevant next steps:

- **Automatic suggestions** - Based on the command you just ran
- **Contextual reasoning** - Explains why each next step makes sense
- **Ready-to-use parameters** - Includes parameter templates to make execution easy

Example after running `hana_status`:

```bash
🔄 Suggested Next Steps:
1. **Explore available schemas**
   Now that connection is verified, discover what data you can access
   → Use: `hana_schemas`

2. **Check system health**
   Verify the database is in good condition
   → Use: `hana_healthCheck`
```

### Enhanced Tool Descriptions

All tools now include:

- **Category and tags** - For better organization
- **Common use cases** - Real-world scenarios
- **Related commands** - Discover complementary tools
- **Quick tips** - Links to examples and presets when available

Example enhanced description:

```bash
hana_import: Import data from CSV/Excel/TSV file to database table.
[Category: data-operations] [Tags: import, data, csv, excel, etl]

Common Use Cases:
- Data migration from external systems
- Bulk data loading
- ETL pipeline integration

Related Commands: hana_export, hana_tableCopy, hana_dataValidator

💡 Tip: Use `hana_examples` with command="import" to see usage examples.
📋 Tip: Use `hana_parameter_presets` with command="import" to see parameter templates.
```

## Knowledge Base Integration (NEW!)

The MCP server now integrates comprehensive documentation from all project markdown files, providing context-aware guidance and best practices directly to AI assistants.

### Documentation Tools

- **`hana_connection_guide`** - 7-step connection resolution guide
  - Shows how the tool finds database credentials
  - Explains each connection method (admin, cds bind, .env, --conn, home directory, default-env.json, fallback)
  - Includes best practices for different environments
  - Essential for troubleshooting connection issues

- **`hana_standard_parameters`** - Standardized parameter conventions by command category
  - Parameters for data-manipulation commands (export, import, compareData, etc.)
  - Parameters for batch-operations (massGrant, massUpdate, massDelete, etc.)
  - Parameters for list/inspect commands (tables, views, schemas, functions, etc.)
  - Includes aliases, defaults, and usage examples
  - Helps understand parameter naming conventions

- **`hana_security_guide`** - Comprehensive security best practices
  - Connection configuration security
  - SQL injection protection mechanisms
  - Parameter handling security
  - Environment and access control guidelines
  - Security checklist for production use

- **`hana_best_practices`** - Naming conventions and usage patterns
  - Parameter naming conventions (single, source/target, boolean, aggregation)
  - Alias patterns and rules
  - Safe operation patterns (preview → verify → execute)
  - Cross-database usage patterns
  - Batch processing patterns
  - Real-world command examples

- **`hana_project_structure`** - Project organization and resources
  - Overview of all project folders (bin, app, routes, utils, docs, etc.)
  - Purpose of each folder
  - Links to all key documentation files
  - Guide to different resource types (CLI commands, HTTP API, Web UI, utilities)

- **`hana_docs_search`** - Full-text search across project documentation
  - Search by keyword across all categories, resources, and guidelines
  - Find information about specific topics
  - Discover related documentation
  - Examples: "security", "connection", "parameters", "import", "data-quality"

### Knowledge Base Examples

**Get connection setup guidance:**

```text
User: "I'm getting a connection error. How does hana-cli find the database credentials?"
Assistant: [Calls hana_connection_guide]
Response: Explains all 7 steps and shows which files to create based on environment
```

**Learn parameter conventions:**

```text
User: "What are the standard parameters for data export commands?"
Assistant: [Calls hana_standard_parameters with category="data-manipulation"]
Response: Shows all parameters, aliases, defaults, and usage examples for export/import/sync
```

**Security best practices:**

```text
User: "Is it safe to use hana-cli in production? What precautions should I take?"
Assistant: [Calls hana_security_guide]
Response: Provides comprehensive security guidelines with checklist
```

**Find documentation:**

```text
User: "How do I use the web interface for database operations?"
Assistant: [Calls hana_docs_search with query="web ui"]
Response: Links to app/README.md and related web application documentation
```

## Usage

Once configured, the AI assistant can call these tools directly:

```bash
Can you show me the current database connection status?
```

The assistant will use the `hana_status` tool to execute the command.

## Connection

The MCP server uses the same connection configuration as the hana-cli tool:

- `.env` files in the project root
- `default-env.json` files
- Command-line connection parameters

Make sure your database connection is properly configured before using commands that require database access.

## Customization

The output formatter can be customized by editing `src/output-formatter.ts`. You can:

- Add new command-specific formatters
- Adjust table grouping logic
- Modify schema name shortening behavior
- Change markdown table formatting style

After making changes, rebuild with:

```bash
npm run build
```

## Development

To rebuild after making changes:

```bash
cd mcp-server
npm run build
```

## Architecture

The MCP server consists of six main modules:

1. **command-parser.ts** - Converts yargs command definitions to JSON Schema for MCP
   - Handles both object-based and function-based builders
   - Extracts parameter types, defaults, choices, and descriptions
   - Supports command aliases
   - Handles both object-based and function-based builders
   - Extracts parameter types, defaults, choices, and descriptions
   - Supports command aliases

2. **command-metadata.ts** - Command categorization and workflow definitions
   - Organizes 150+ commands into logical categories
   - Defines multi-step workflows for common tasks
   - Provides tags, use cases, and relationships between commands

3. **examples-presets.ts** - Usage examples and parameter templates (Phase 1)
   - Real-world usage examples for common commands
   - Pre-configured parameter presets for different scenarios
   - Helps agents understand proper command usage

4. **recommendation.ts** - Intent-based command recommendation (Phase 2 - NEW!)
   - Natural language intent matching
   - Confidence scoring for recommendations
   - Quick start guide for new users
   - Smart keyword pattern matching

5. **next-steps.ts** - Context-aware guidance (Phase 2 - NEW!)
   - Suggested next steps after command execution
   - Troubleshooting guides for common commands
   - Output analysis for additional tips
   - Command prerequisites and common issues

6. **executor.ts** - Executes CLI commands and captures output
   - Spawns CLI processes with proper argument conversion
   - Handles timeouts and process errors
   - **Intelligent error analysis with actionable suggestions** (Phase 1)
   - **Context-aware next steps in success output** (Phase 2 - NEW!)
   - Validates environment configuration

7. **output-formatter.ts** - Formats command output for better readability
   - Parses ASCII table output from CLI commands
   - Converts to markdown format
   - Command-specific formatting (tables, schemas, procedures, etc)
   - Schema name shortening for UUIDs

8. **readme-knowledge-base.ts** - Knowledge base aggregator (Phase 4 - NEW!)
   - Aggregates documentation from all project markdown files
   - Provides structured access to:
     - Connection resolution guide (7-step process)
     - Standard parameters by command category
     - Security best practices and guidelines
     - Naming conventions and patterns
     - Project structure and key resources
   - Enables context-aware documentation search
   - Powers 6 new knowledge base tools

9. **index.ts** - Main MCP server implementation
   - Manages the MCP protocol communication
   - Loads all commands from the parent hana-cli project
   - Registers tools with **enhanced descriptions** (Phase 1)
   - Handles command execution and discovery tool requests
   - **New Phase 2 discovery tools** (recommend, quickstart, troubleshoot)
   - **Phase 4 knowledge base tools** (connection guide, parameters, security, docs search)

## Recent Improvements

### v1.202602.4 - Phase 4: Knowledge Base Integration (NEW!)

**Comprehensive Documentation Integration:**

- **Enhanced Knowledge Base** - All project markdown files aggregated and indexed
  - Connection resolution guide (7-step process)
  - Standard parameters by command category
  - Security best practices and guidelines
  - Naming conventions and patterns
  - Project structure and key resources
  
- **6 New Knowledge Base Tools:**
  1. **`hana_connection_guide`** - Shows how the tool finds database credentials
  2. **`hana_standard_parameters`** - Parameters, aliases, defaults by command category
  3. **`hana_security_guide`** - Security best practices and guidelines
  4. **`hana_best_practices`** - Naming conventions and usage patterns
  5. **`hana_project_structure`** - Project organization and key resources
  6. **`hana_docs_search`** - Full-text search across all documentation

**Key Benefits:**

- **Context-Aware Guidance** - AI assistants can now reference official documentation
- **Connection Troubleshooting** - Complete 7-step connection resolution guide at fingertips
- **Parameter Learning** - Understand naming conventions and standardized parameters
- **Security Awareness** - Built-in security best practices and compliance guidelines
- **Project Navigation** - Discover documentation and resources without leaving the MCP interface

**Example Usage:**

```bash
# Get connection setup help
User: "I'm having connection issues. How does hana-cli find credentials?"
Assistant: [Calls hana_connection_guide]
Response: Shows all 7 steps and which file to create based on environment

# Learn parameter conventions
User: "What parameters should I use for import operations?"
Assistant: [Calls hana_standard_parameters with category="data-manipulation"]
Response: Complete parameter guide with examples

# Find security information
User: "Is my hana-cli setup secure for production?"
Assistant: [Calls hana_security_guide]
Response: Security checklist and best practices

# Search documentation
User: "How do I use the web UI?"
Assistant: [Calls hana_docs_search with query="web ui"]
Response: Links to app/README.md and related documentation
```

### v1.202602.3 - Phase 3: Workflow Automation & Advanced Intelligence

**Workflow Execution:**

- **Multi-Step Automation** - Execute complete workflows in one call
  - Parameter substitution in workflow steps
  - Sequential execution with error handling
  - Progress tracking with step results
  - Support for stop-on-error or continue modes
  
- **Workflow Preview** - Dry run before execution
  - Validates parameters
  - Shows what will execute
  - Helps verify correct parameters

**Result Interpretation:**

- **AI-Friendly Analysis** - Automatic result interpretation
  - Extracts key insights from results
  - Generates priority-ranked recommendations
  - Detects concerns and issues
  - Identifies key metrics
  - Command-specific analysis for 8+ commands

**Smart Search:**

- **Multi-Scope Search** - Search across all resources
  - Commands, workflows, examples, presets, parameters
  - Relevance scoring algorithm
  - Single search replaces multiple discovery calls
  - Intelligent keyword matching

**Guided Workflows:**

- **5 Conversation Templates:**
  1. **data-exploration** - Systematic database discovery (6 steps, 15-30 min)
  2. **troubleshooting** - System issue diagnosis (5 steps, 20-40 min)
  3. **data-migration** - Safe data migration (6 steps, 30-60 min)
  4. **performance-tuning** - Performance optimization (5 steps, 30-60 min)
  5. **security-audit** - Security review (5 steps, 20-40 min)

- Each template includes:
  - Phase-by-phase steps
  - Required commands
  - Expected outcomes
  - Helpful tips
  - Common Q&A

### v1.202602.2 - Phase 2: Intent-Based Discovery & Context-Aware Guidance

**Intent-Based Command Recommendation:**

- **Natural Language Search** - Find commands by describing what you want to do
  - "find duplicate rows" → suggests duplicateDetection, dataProfile
  - "check database version" → suggests version, systemInfo
  - "export table to CSV" → suggests export with example parameters
  
- **Smart Confidence Scoring** - Ranks recommendations as high/medium/low confidence
  - Pattern matching against command names, tags, and use cases
  - Provides reasoning for each recommendation
  - Links to examples and presets for top matches

**Quick Start Guide:**

- **Beginner-Friendly Onboarding** - Recommended first 6 commands
  - Step-by-step progression from connection → exploration → analysis
  - Each step explains purpose and provides tips
  - Perfect for new users or initial database exploration

**Troubleshooting System:**

- **Command-Specific Guides** - Detailed troubleshooting for common commands
  - Common issues with specific solutions
  - Prerequisites checklist
  - Tips for successful execution
  - Available for: import, export, dataProfile, tables, status, healthCheck
  
- **Proactive Issue Detection** - Suggests commands to diagnose problems
  - Column mismatch? → Use matchMode parameter
  - File not found? → Check paths and use absolute paths
  - Timeout? → Increase timeout or filter data

**Context-Aware Next Steps:**

- **Automatic Suggestions** - After every successful command
  - Suggests 2-4 relevant next commands
  - Explains why each step makes sense
  - Includes parameter templates for easy execution
  
- **Output Analysis Tips** - Based on command results
  - High memory usage? → Suggests memory analysis commands
  - Many tables? → Suggests filtering patterns
  - Warnings in health check? → Suggests diagnostic commands

**Enhanced Success Output:**

- Every successful command now includes:
  - 📌 **Tips** - Based on output analysis
  - 🔄 **Suggested Next Steps** - With reasoning and parameters
  - Complete workflow guidance

### v1.202602.1 - Phase 1: Discovery & Usability Enhancements

**Examples & Presets:**

- **Usage Examples Library** - Real-world examples for common commands (import, export, dataProfile, etc.)
  - Multiple scenarios per command
  - Complete parameter sets with descriptions
  - Expected outputs and usage notes
  
- **Parameter Presets** - Pre-configured parameter templates for common use cases
  - "quick-import", "safe-import", "large-file" presets for import command
  - "full-table", "filtered-export", "excel-export" presets for export
  - Ready-to-use templates with when-to-use guidance

**Enhanced Error Messages:**

- **Intelligent Error Analysis** - Automatically detects error types and provides specific suggestions
  - TABLE_NOT_FOUND → suggests listing tables and checking schema
  - CONNECTION_ERROR → suggests checking credentials and connectivity
  - PARAMETER_ERROR → links to examples and presets
  - TIMEOUT → suggests optimizations and health checks
  
- **Actionable Suggestions** - Each error includes:
  - Possible causes
  - Suggested commands to diagnose/fix the issue
  - Ready-to-run command parameters

**Enhanced Tool Descriptions:**

- Rich, structured descriptions with categories, tags, and use cases
- Direct links to examples and presets when available
- Related commands for discovery
- Better organization and searchability

### v1.202602.0 - Enhanced Builder Introspection

- **Enhanced builder introspection** - Now handles function-based builders in addition to object builders
- **Better error messages** - More informative logging during command loading
- **All new commands exposed** - 150+ commands including new data validation and health check tools
- **Full parameter documentation** - All parameters with types, defaults, and descriptions
- **Improved validation** - Better environment validation and error handling

## What's Newly Exposed

**Import Command Enhancements:**

- `matchMode` - Match columns by order, name, or auto mode
- `dryRun` - Preview import without committing to database
- `maxFileSizeMB` - Memory protection for large imports
- `timeoutSeconds` - Configurable operation timeout
- `nullValues` - Custom NULL value handling
- `skipWithErrors` - Continue import on errors
- `maxErrorsAllowed` - Error threshold control

**New Commands:**

- `healthCheck` - System health status monitoring
- `memoryLeaks` - Memory leak detection
- `memoryAnalysis` - Memory consumption analysis
- `duplicateDetection` - Find and handle duplicate records
- Plus 140+ other commands for data analysis, optimization, and management
