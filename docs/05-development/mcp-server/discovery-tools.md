# Discovery Tools and Guidance

Advanced tools for finding the right commands and understanding how to use them.

## Command Recommendations (`hana_recommend`)

Get command suggestions based on what you want to do in plain English.

### How It Works

The recommendation system matches your intent to commands using:

1. **Pattern Matching** - Keywords you use
2. **Confidence Scoring** - How well each command matches
3. **Example Parameters** - Ready-to-use parameter templates

### Basic Usage

**Input:** Natural language description of what you want to do

```json
{
  "intent": "find duplicate rows"
}
```

**Output:** Top 5 matching commands with confidence and reasoning

```json
{
  "recommendations": [
    {
      "rank": 1,
      "command": "duplicateDetection",
      "confidence": "high",
      "reasoning": "Designed specifically for finding duplicate records",
      "exampleParameters": {
        "table": "MY_TABLE",
        "schema": "SALES",
        "checkColumns": "EMAIL,PHONE"
      }
    },
    {
      "rank": 2,
      "command": "dataProfile",
      "confidence": "medium",
      "reasoning": "Can identify duplicate patterns and distribution",
      "exampleParameters": {
        "table": "MY_TABLE",
        "schema": "SALES"
      }
    }
  ]
}
```

### Common Intent Patterns

| Intent | Recommended Command |
| -------- | --------------------- |
| "List tables" | `hana_tables`, `hana_schemas` |
| "Find duplicates" | `hana_duplicateDetection`, `hana_dataProfile` |
| "Import data" | `hana_import`, `hana_tableCopy`, `hana_dataSync` |
| "Check data quality" | `hana_dataValidator`, `hana_dataProfile` |
| "Compare tables" | `hana_compareData`, `hana_dataDiff` |
| "Export data" | `hana_export`, `hana_tableCopy` |
| "Analyze performance" | `hana_memoryAnalysis`, `hana_expensiveStatements` |
| "Verify connection" | `hana_status`, `hana_healthCheck` |
| "Find missing columns" | `hana_compareSchema`, `hana_inspectTable` |

## Smart Search (`hana_smart_search`)

Comprehensive search across all resources in the MCP Server.

### Search Scope

The smart search looks across:

1. **Commands** (150+)
   - Command names
   - Descriptions
   - Tags and categories
   - Use cases

2. **Workflows** (20+)
   - Multi-step task sequences
   - Workflow names and descriptions
   - Task phases

3. **Examples** (40+)
   - Real-world scenarios
   - Parameter examples
   - Usage descriptions

4. **Presets** (30+)
   - Parameter templates
   - Preset names
   - Use case descriptions

### Usage Examples

#### Example 1: Find Import Commands

```json
{
  "query": "import CSV",
  "scope": ["commands"],
  "limit": 5
}
```

**Result:**

```json
{
  "results": [
    {
      "type": "command",
      "name": "import",
      "relevance": 99,
      "description": "Import data from CSV file",
      "category": "data-operations"
    },
    {
      "type": "command", 
      "name": "tableCopy",
      "relevance": 78,
      "description": "Copy table data, supports CSV format",
      "category": "data-operations"
    }
  ]
}
```

#### Example 2: Find Data Quality Workflows

```json
{
  "query": "data quality validation",
  "scope": ["workflows", "examples"],
  "limit": 10
}
```

**Result:**

```json
{
  "results": [
    {
      "type": "workflow",
      "name": "data-quality-check",
      "relevance": 95,
      "phase": 1,
      "steps": 5
    },
    {
      "type": "example",
      "command": "dataValidator",
      "scenario": "Comprehensive Data Quality Check",
      "relevance": 88
    },
    {
      "type": "preset",
      "command": "dataProfile",
      "name": "quality-analysis",
      "relevance": 82
    }
  ]
}
```

### Ranking Algorithm

Results are scored based on:

- **Exact match** - 100 points
- **Contains phrase** - 50 points
- **Contains all words** - 30 points
- **Per word match** - 10 points
- **Start of text bonus** - 20 points

Results are sorted by total relevance score.

## Quick Start Guide (`hana_quickstart`)

Perfect for users new to HANA CLI and the MCP Server.

### The 6 Essential Commands

The quick start teaches you these commands in order:

1. **`hana_status`** - Verify connection and current user

   ```bash
   # Shows:
   # - Current user
   # - Connected database
   # - Current schema
   # - Version information
   ```

   **Why:** Confirms everything is set up correctly

2. **`hana_version`** - Check database version

   ```bash
   # Shows HANA version and build number
   ```

   **Why:** Understand database capabilities

3. **`hana_schemas`** - List available schemas

   ```bash
   # Shows all schemas you can access
   ```

   **Why:** See available data sources

4. **`hana_tables`** - List tables in a schema

   ```bash
   hana_tables --schema SALES
   # Shows all tables in SALES schema
   ```

   **Why:** Find the data you need to work with

5. **`hana_inspectTable`** - View table structure

   ```bash
   hana_inspectTable --table CUSTOMERS --schema SALES
   # Shows columns, types, constraints
   ```

   **Why:** Understand what data is available

6. **`hana_healthCheck`** - Check system health

   ```bash
   # Shows warnings and critical issues
   ```

   **Why:** Ensure database is running properly

### Next Commands to Learn

After the quick start, explore:

- **Data Analysis:** `dataProfile`, `dataValidator`, `duplicateDetection`
- **Data Operations:** `import`, `export`, `dataSync`
- **Schema Tools:** `compareSchema`, `schemaClone`, `inspectTable`
- **System Tools:** `memoryAnalysis`, `expensiveStatements`, `recommendations`

## Conversation Templates (`hana_conversation_templates`)

Pre-built conversation flows for common tasks.

### Available Templates

#### 1. Data Exploration (15-30 minutes)

**Goal:** Understand database structure and data

**Phases:**

1. Verify connection
2. Check version and system info
3. List available schemas
4. Explore tables in key schemas
5. Profile data quality

**Commands:**

- `hana_status`
- `hana_version`
- `hana_systemInfo`
- `hana_schemas`
- `hana_tables`
- `hana_inspectTable`
- `hana_dataProfile`

**Tips:**

- Start with SYSTEM schema for system tables
- Look for SALES, CUSTOMER, PRODUCT schemas
- Profile small tables first to understand data

#### 2. Troubleshooting (20-40 minutes)

**Goal:** Diagnose and fix issues

**Phases:**

1. Check system health
2. Verify connectivity
3. Test permissions
4. Analyze resource usage
5. Identify bottlenecks

**Commands:**

- `hana_healthCheck`
- `hana_status`
- `hana_inspectUser`
- `hana_memoryAnalysis`
- `hana_expensiveStatements`
- `hana_recommendations`

**Tips:**

- Run healthCheck first
- Check user roles and privileges
- Top queries often cause performance issues
- Review system alerts

#### 3. Data Migration (30-60 minutes)

**Goal:** Move data between sources

**Phases:**

1. Validate source schema
2. Prepare target schema
3. Export source data
4. Import to target
5. Verify migration

**Commands:**

- `hana_inspectTable`
- `hana_compareSchema`
- `hana_export`
- `hana_import`
- `hana_compareData`
- `hana_dataValidator`

**Tips:**

- Always do dry-run first
- Start with small tables
- Validate after import
- Check data quality

#### 4. Performance Tuning (30-60 minutes)

**Goal:** Optimize database performance

**Phases:**

1. Establish baseline
2. Identify hotspots
3. Analyze indexes
4. Review recommendations
5. Implement improvements

**Commands:**

- `hana_memoryAnalysis`
- `hana_tableHotspots`
- `hana_indexTest`
- `hana_recommendations`
- `hana_expensiveStatements`

**Tips:**

- Large tables cause most issues
- Monitor memory usage trends
- Test index effectiveness
- Compare before/after metrics

#### 5. Security Audit (20-40 minutes)

**Goal:** Review and secure database access

**Phases:**

1. Inventory users
2. Review roles and privileges
3. Check inactive accounts
4. Audit recent access
5. Identify issues

**Commands:**

- `hana_users`
- `hana_inspectUser`
- `hana_roles`
- `hana_auditLog`
- `hana_replicationStatus`

**Tips:**

- Document all user accounts
- Review DBA privileges
- Look for inactive accounts
- Check sensitive table access

### Using a Template

#### Step 1: Get Template

```json
{
  "templateId": "data-exploration"
}
```

#### Step 2: Review Steps

Each step includes:

- Purpose and goal
- Commands to run
- Expected outcomes
- Tips for success

#### Step 3: Follow Guided Workflow

- Run each command in sequence
- Review results
- Proceed to next step
- Skip optional steps if needed

## Context-Aware Suggestions

### After Command Execution

The system automatically suggests useful next steps:

**After `hana_status`:**

```bash
✅ Connected successfully

🔄 Suggested Next Steps:
1. Explore available schemas
   → Use: hana_schemas
   → Helps: Understand available data

2. Check system health
   → Use: hana_healthCheck
   → Helps: Verify system is stable

3. View version information  
   → Use: hana_version
   → Helps: Understand capabilities
```

**After `hana_tables`:**

```bash
✅ Listed 47 tables

🔄 Suggested Next Steps:
1. Inspect interesting table structures
   → Use: hana_inspectTable
   → Parameter: table="CUSTOMERS"

2. Profile table data quality
   → Use: hana_dataProfile
   → Parameter: table="CUSTOMERS"

3. Find duplicate rows
   → Use: hana_duplicateDetection
   → Parameter: table="CUSTOMERS"
```

### Output-Based Tips

Tips appear based on command results:

**When import has errors:**

```bash
⚠️ Import completed with 5 errors

📌 Suggested Actions:
• Try dryRun:true to preview before actual import
• Use skipWithErrors:true to continue on error
• Check error log for details
• Review data validation with dataValidator
```

**When memory usage is high:**

```bash
⚠️ Memory usage at 85% capacity

📌 Suggested Actions:
• Review expensiveStatements to find heavy queries
• Check tableHotspots for concentrated usage
• Implement recommendations
• Monitor memoryAnalysis trends
```

## Best Practices for Discovery

### 1. Start with Recommendations

For any task, start with `hana_recommend`:

```json
{
  "intent": "what you want to do"
}
```

This ensures you're using the right command.

### 2. Review Examples

Before running a command, check examples:

```json
{
  "command": "import"
}
```

Learn from real-world usage patterns.

### 3. Use Parameter Presets

Let presets guide your parameters:

```json
{
  "command": "import"
}
```

Get templates for different scenarios.

### 4. Follow Templates

For complex tasks, use conversation templates:

- Data exploration
- Troubleshooting
- Data migration
- Performance tuning
- Security audits

### 5. Interpret Results

Use result interpretation for insights:

```json
{
  "command": "dataProfile",
  "result": "command output"
}
```

Get AI-friendly analysis and recommendations.

## Workflow Discovery

### List Available Workflows

```json
{
  "action": "list"
}
```

Returns all 20+ pre-built workflows.

### Get Workflow Details

```json
{
  "workflowId": "data-quality-check"
}
```

Returns complete steps, parameters, and examples.

### Search Workflows

```json
{
  "query": "data validation",
  "scope": "workflows"
}
```

Find workflows matching your needs.

### Execute Workflow

```json
{
  "action": "execute",
  "workflowId": "data-quality-check",
  "parameters": {
    "schema": "SALES",
    "table": "CUSTOMERS"
  }
}
```

Runs complete multi-step workflow.

## Examples for Commands

### Get Examples

```json
{
  "command": "import"
}
```

Returns 5+ real-world scenarios:

- Quick CSV import
- Large file with error handling
- Streaming mode
- Bulk insert
- Error validation

### What Examples Include

- Complete parameter set
- Scenario description
- Expected output
- Tips and best practices
- Common issues and solutions

### Using Examples in Your Work

1. Find relevant scenario
2. Copy parameter template
3. Customize for your data
4. Run with dryRun first
5. Execute when confident

## Next Steps

- **[Advanced Features](./advanced-features.md)** - Workflows and interpretation
- **[Features Overview](./features.md)** - All available capabilities
- **[Prompts and Resources](./prompts-and-resources.md)** - MCP resources and prompts
