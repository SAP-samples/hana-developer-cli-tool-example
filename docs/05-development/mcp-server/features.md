# MCP Server Features Overview

Complete documentation of all features available in the SAP HANA CLI MCP Server.

## Core Features

### 1. Commands (150+ Tools)

All SAP HANA CLI commands are exposed as standardized MCP tools with the `hana_` prefix.

**Command Categories:**

- **System Admin** - Status, health check, memory analysis, INI files, feature usage
- **Data Tools** - Import, export, data synchronization, data validation
- **Analysis Tools** - Data profiling, duplicate detection, data comparison, lineage analysis
- **Backup & Recovery** - Backup, restore, reclaim, backup list, backup status
- **BTP Integration** - Cloud Foundry connection, service instances, deployment tools
- **Connection & Auth** - Connect, JWT tokens, user management, connection handling
- **HDI Management** - Container management, group management, user provisioning
- **Schema Tools** - Compare schema, schema clone, table copy, ERD diagrams
- **Performance** - Memory analysis, expensive statements, index testing, recommendations
- **Development Tools** - HDBSQL, procedure calls, code templates, documentation generation

**Example Tools:**

```bash
hana_status              # Check connection
hana_tables              # List database tables
hana_import              # Import data from CSV/Excel
hana_dataProfile         # Analyze data quality
hana_duplicateDetection  # Find duplicate rows
hana_compareSchema       # Compare database schemas
```

All command aliases are also available (e.g., `hana_s` for status, `hana_imp` for import).

### 2. Discovery Tools

Help agents find the right command for any task.

#### Command Recommendations (`hana_recommend`)

Get command suggestions based on natural language intent:

**Input:**

- Natural language description (e.g., "find duplicate rows", "export table to CSV")

**Output:**

- Top 5 matching commands
- Confidence scores
- Reasoning for each match
- Ready-to-use parameter templates

**Example:**

```bash
Intent: "find duplicate rows"

Recommendations:
1. duplicateDetection (high confidence)
   Reason: Designed specifically for duplicate detection
   
2. dataProfile (medium confidence)
   Reason: Can identify duplicate patterns
   
3. dataValidator (medium confidence)
   Reason: Can check for duplicate key violations
```

#### Smart Search (`hana_smart_search`)

Comprehensive search across all resources:

**Searches:**

- Command names and descriptions
- Workflow templates by name/purpose
- Usage examples by scenario
- Parameter presets by use case

**Features:**

- Relevance ranking
- Multi-scope searching
- Type indicators
- Helpful suggestions for few results

#### Quick Start Guide (`hana_quickstart`)

Perfect for new users to learn basic concepts:

**6 Essential Commands:**

1. `hana_status` - Verify connection
2. `hana_version` - Check database version
3. `hana_schemas` - List available schemas
4. `hana_tables` - List tables in a schema
5. `hana_inspectTable` - View table structure
6. `hana_healthCheck` - System health verification

### 3. Examples and Presets

#### Real-World Examples (`hana_examples`)

Usage examples for 40+ commands with complete parameter sets.

**For each example:**

- Scenario description
- Parameter values
- Expected output summary
- Tips and best practices

**Example - Import Command:**

```json
{
  "scenarios": [
    {
      "name": "Quick CSV Import",
      "description": "Fast import of small clean CSV file",
      "parameters": {
        "file": "data.csv",
        "table": "MY_TABLE",
        "hasHeader": true,
        "delimiter": ",",
        "mode": "insert"
      }
    },
    {
      "name": "Large File with Error Handling",
      "description": "Import large file, skip bad records",
      "parameters": {
        "file": "large_data.csv",
        "table": "MY_TABLE",
        "hasHeader": true,
        "skipWithErrors": true,
        "errorLimit": 100,
        "parallel": 4
      }
    }
  ]
}
```

#### Parameter Presets (`hana_parameter_presets`)

Pre-configured parameter combinations for common use cases.

**For each command, presets include:**

- Preset name (e.g., "quick-import", "safe-import", "large-file")
- Description of when to use
- Pre-filled parameters with placeholders
- Notes and warnings

**Example - Import Presets:**

- **quick-import** - Fast import for small, clean files
- **safe-import** - Conservative settings with error handling
- **large-file** - Optimized for large files with parallel processing
- **streaming-mode** - For continuous data flow
- **bulk-insert** - Maximized for speed over safety

### 4. Workflows and Tasks

#### Workflow Execution (`hana_execute_workflow`, `hana_preview_workflow`)

Execute multi-step workflow sequences with automatic parameter substitution.

**Features:**

- Parameter validation before execution
- Step result tracking
- Error handling with optional continuation
- Preview mode to see what will execute

**Example Workflow - Data Quality Check:**

```json
{
  "steps": [
    {
      "command": "hana_tables",
      "parameters": { "schema": "<schema>" }
    },
    {
      "command": "hana_inspectTable",
      "parameters": { "table": "<table>", "schema": "<schema>" }
    },
    {
      "command": "hana_dataProfile",
      "parameters": { "table": "<table>", "schema": "<schema>" }
    },
    {
      "command": "hana_duplicateDetection",
      "parameters": { "table": "<table>", "schema": "<schema>" }
    },
    {
      "command": "hana_dataValidator",
      "parameters": { "table": "<table>", "schema": "<schema>" }
    }
  ]
}
```

#### Conversation Templates (`hana_conversation_templates`, `hana_get_template`)

Pre-built conversation flows for common tasks.

**Available Templates:**

1. **data-exploration** (15-30 min)
   - Connection verification
   - Schema discovery
   - Table exploration
   - Data profiling

2. **troubleshooting** (20-40 min)
   - Health check
   - Connection diagnosis
   - Permission verification
   - Issue investigation

3. **data-migration** (30-60 min)
   - Pre-migration validation
   - Export source data
   - Prepare target
   - Import and validate

4. **performance-tuning** (30-60 min)
   - Baseline measurement
   - Hotspot identification
   - Index analysis
   - Tuning recommendations

5. **security-audit** (20-40 min)
   - User inventory
   - Role analysis
   - Permission audit
   - Compliance check

**Each template includes:**

- Phase-by-phase steps
- Commands for each step
- Expected outcomes
- Tips for success
- Common Q&A

### 5. Result Interpretation (`hana_interpret_result`)

AI-friendly analysis and insights from command results.

**For each command result, provides:**

- **Summary** - High-level interpretation
- **Key Insights** - Important patterns and findings
- **Recommendations** - Actionable suggestions ranked by priority
- **Concerns** - Issues that need attention
- **Key Metrics** - Extracted numeric values and statistics

**Example - Data Profile Result:**

```json
{
  "summary": "4,250 rows analyzed; moderate data quality issues detected",
  "insights": [
    "15% NULL values in CUSTOMER_NAME column",
    "Duplicate EMAIL entries: 127 occurrences (2.9%)",
    "Invalid DATE_OF_BIRTH format: 43 rows (1.0%)"
  ],
  "recommendations": [
    {
      "priority": "high",
      "action": "Clean NULL values in CUSTOMER_NAME",
      "nextStep": "hana_dataValidator"
    },
    {
      "priority": "high",
      "action": "Remove duplicate EMAIL entries",
      "nextStep": "hana_duplicateDetection"
    }
  ],
  "concerns": [],
  "metrics": {
    "totalRows": 4250,
    "nullPercentage": 1.5,
    "duplicateCount": 127
  }
}
```

### 6. Documentation Search (`hana_search_docs`, `hana_get_doc`, `hana_list_doc_categories`)

Access to all 279 project documentation pages with full-text search.

**Features:**

- Fast full-text search
- Category filtering
- Document type filtering
- Relevance ranking
- Direct links to website

**Available Categories:**

- Getting Started (5 docs)
- Commands & Reference (80+ docs)
- Features (15 docs)
- API Reference (10 docs)
- Development (20 docs)
- Troubleshooting (8 docs)
- Examples (50+ docs)
- And more...

**Search Example:**

```bash
Query: "import CSV"
Results:
1. Import Command Guide (99% match)
2. CSV File Format (87% match)
3. Data Import Examples (85% match)
4. Troubleshooting Import Issues (78% match)
```

## Phase-Based Implementation

The MCP Server was built in three phases, each adding significant capabilities:

### Phase 1: Core Features

- 150+ command tools
- Parameter discovery system
- Enhanced error messages
- Command examples library
- Parameter presets

### Phase 2: Discovery & Guidance

- Intent-based recommendations
- Quick start guide
- Context-aware next steps
- Command-specific troubleshooting
- Output analysis tips

### Phase 3: Advanced Features

- Workflow execution system
- Result interpretation engine
- Smart search system
- Conversation templates
- Integrated documentation

## Context-Aware Guidance

### Automatic Next Steps

After successful command execution, the system suggests relevant next steps:

**Example after `hana_status`:**

```bash
✅ Connection verified

🔄 Suggested Next Steps:
1. Explore available schemas
   Use: hana_schemas

2. Check system health
   Use: hana_healthCheck

3. Review version information
   Use: hana_version
```

### Output-Aware Tips

Tips automatically appear based on command output:

**Example from import with errors:**

```bash
⚠️ Import completed with 5 errors

📌 Tips:
- Try using dryRun:true to preview issues
- Use skipWithErrors:true to continue despite errors
- Review error details in error log
```

### Troubleshooting Guides

Command-specific troubleshooting for common issues:

**Available for:**

- import (5 common issues)
- export (3 common issues)
- dataProfile (2 common issues)
- tables (2 common issues)
- status (2 common issues)
- healthCheck (2 common issues)

## Error Handling and Diagnostics

### Intelligent Error Analysis

Errors are analyzed and matched to common causes:

**Error Types:**

- TABLE_NOT_FOUND → suggests listing tables, checking schema
- SCHEMA_NOT_FOUND → suggests listing schemas, checking permissions
- FILE_NOT_FOUND → suggests checking paths, using absolute paths
- CONNECTION_ERROR → suggests checking credentials, connectivity
- AUTHENTICATION_ERROR → suggests verifying credentials, checking user status
- TIMEOUT → suggests filtering data, checking health, increasing timeout
- PARAMETER_ERROR → links to examples and presets
- UNKNOWN_ERROR → generic suggestions for troubleshooting

### Debug Mode

Enable detailed diagnostic output:

```bash
hana_tables --debug true
# Outputs detailed connection info, query execution, and timing
```

## Summary Table

| Feature | Count | Examples |
| --------- | ------- | ---------- |
| **Commands** | 150+ | import, export, tables, dataProfile |
| **Discovery Tools** | 4 | recommend, smart_search, quickstart |
| **Examples** | 40+ | 5 import scenarios, 3 export scenarios |
| **Presets** | 30+ | quick-import, safe-import, large-file |
| **Workflows** | 20+ | data-quality-check, schema-compare |
| **Templates** | 5 | data-exploration, troubleshooting |
| **Documentation Pages** | 279 | All project docs searchable |
| **Categories** | 9+ | Data quality, Performance, Security |

## Next Steps

- **[Setup and Configuration](./setup-and-configuration.md)** - Get MCP running
- **[Discovery Tools](./discovery-tools.md)** - Learn to find the right commands
- **[Advanced Features](./advanced-features.md)** - Workflows and interpretation
- **[Implementation Phases](./implementation-phases.md)** - Technical deep dive
