# Advanced Features

Sophisticated capabilities for complex workflows and understanding results.

## Workflow Execution System

Automated execution of multi-step workflows with parameter substitution and result tracking.

### What Are Workflows?

Pre-built sequences of commands that work together to accomplish a goal.

**Example Workflow - Data Quality Check:**

```bash
1. Profile data (dataProfile)
   ↓
2. Find duplicates (duplicateDetection)
   ↓
3. Validate data (dataValidator)
   ↓
4. Get interpretation (interpret_result)
   ↓
5. Generate report
```

### Executing a Workflow

**MCP Tool:** `hana_execute_workflow`

```json
{
  "workflowId": "data-quality-check",
  "parameters": {
    "schema": "SALES",
    "table": "CUSTOMERS",
    "stopOnError": false
  }
}
```

**Output includes:**

- Results from each step
- Execution time per step
- Any errors encountered
- Summary and recommendations

### Previewing Before Execution

**MCP Tool:** `hana_preview_workflow`

```json
{
  "workflowId": "data-quality-check",
  "parameters": {
    "schema": "SALES",
    "table": "CUSTOMERS"
  }
}
```

**Shows:**

- All steps in order
- Parameters for each step
- Expected execution
- No actual commands run

### Built-In Workflows

The MCP server includes 20+ professional workflows:

#### 1. Data Validation Workflows

**data-quality-check** (5 steps)

- Profile → Duplicates → Validation → Interpretation → Report

**data-integrity-audit** (6 steps)

- Inspect → Compare → Validate → Referential check → Analysis → Report

**data-cleansing** (7 steps)

- Profile → Identify issues → Mask sensitive → Clean → Transform → Validate → Report

#### 2. Schema Management Workflows

**schema-comparison** (4 steps)

- Inspect source → Inspect target → Compare → Generate DDL

**schema-migration** (6 steps)

- Validate source → Compare → Generate DDL → Test → Migrate → Verify

**schema-clone** (5 steps)

- Inspect source → Clone → Verify structures → Build indexes → Validate

#### 3. Performance Analysis Workflows

**performance-baseline** (5 steps)

- Health check → Memory analysis → Expensive statements → Index review → Report

**performance-optimization** (7 steps)

- Baseline → Hotspot analysis → Index test → Recommendations → Implement → Test → Verify

**resource-optimization** (4 steps)

- Memory analysis → Identify large tables → Reclaim space → Verify

#### 4. Data Operations Workflows

**safe-import** (5 steps)

- Dry run → Review errors → Validate → Import → Verify

**safe-export** (4 steps)

- Verify source → Configure format → Export → Validate

**data-migration** (6 steps)

- Export → Prepare target → Import → Validate → Compare → Report

#### 5. Troubleshooting Workflows

**connection-diagnosis** (4 steps)

- Test connection → Check permissions → Verify network → Get info

**performance-diagnosis** (5 steps)

- Health check → Memory → Expensive queries → Hotspots → Recommendations

### Parameter Substitution

Workflows support parameter templates using `<parameter-name>`:

```json
{
  "workflow": {
    "steps": [
      {
        "command": "hana_inspectTable",
        "parameters": {
          "table": "<table>",
          "schema": "<schema>"
        }
      },
      {
        "command": "hana_dataProfile",
        "parameters": {
          "table": "<table>",
          "schema": "<schema>"
        }
      }
    ]
  }
}
```

When executing, provide actual values:

```json
{
  "workflowId": "my-workflow",
  "parameters": {
    "table": "CUSTOMERS",
    "schema": "SALES"
  }
}
```

Parameters are automatically substituted in each step.

### Error Handling in Workflows

Control how workflows handle errors:

**Continue on errors:**

```json
{
  "workflowId": "data-quality-check",
  "parameters": { ... },
  "stopOnError": false
}
```

**Stop on first error:**

```json
{
  "workflowId": "data-quality-check", 
  "parameters": { ... },
  "stopOnError": true
}
```

**Output shows:**

```json
{
  "steps": [
    {
      "step": 1,
      "command": "dataProfile",
      "status": "success",
      "duration": 2.5
    },
    {
      "step": 2,
      "command": "duplicateDetection",
      "status": "success",
      "duration": 1.8
    }
  ],
  "totalDuration": 4.3,
  "errors": []
}
```

## Result Interpretation (`hana_interpret_result`)

Transform raw command results into AI-friendly insights and recommendations.

### What It Does

Analyzes command output and provides:

1. **Summary** - High-level interpretation
2. **Insights** - Key findings and patterns
3. **Recommendations** - Actionable suggestions
4. **Concerns** - Issues requiring attention
5. **Key Metrics** - Important numbers

### How to Use

**Input:**

```json
{
  "command": "dataProfile",
  "result": "command output text or object"
}
```

**Output:**

```json
{
  "command": "dataProfile",
  "summary": "4,250 rows analyzed; moderate data quality issues",
  "insights": [
    "15% NULL values in CUSTOMER_NAME",
    "127 duplicate EMAIL entries (2.9%)",
    "43 invalid DATE_OF_BIRTH values (1.0%)"
  ],
  "recommendations": [
    {
      "priority": "high",
      "action": "Clean NULL values in CUSTOMER_NAME",
      "impact": "Improves data quality by 15%",
      "nextCommand": "hana_dataValidator"
    }
  ],
  "concerns": [
    {
      "level": "critical",
      "issue": "High duplicate rate in EMAIL column",
      "action": "Run duplicateDetection to clean"
    }
  ],
  "metrics": {
    "totalRows": 4250,
    "nullPercentage": 1.5,
    "duplicateCount": 127,
    "validationErrors": 43
  }
}
```

### Command-Specific Interpretation

#### Data Profile Results

- Data quality issues detected
- NULL value percentages
- Duplicate identification
- Data type mismatches
- Range and distribution analysis

**Provides:**

- Data quality score
- Issues ranked by severity
- Cleaning recommendations
- Next validation steps

#### Memory Analysis Results

- Memory usage concentration
- Largest tables and indexes
- Memory growth trends
- Fragmentation issues

**Provides:**

- Resource optimization suggestions
- Partitioning recommendations
- Compression opportunities
- Reclaim recommendations

#### Health Check Results

- System status and alerts
- Critical warnings
- Performance issues
- Resource constraints

**Provides:**

- Problem diagnosis
- Immediate actions
- Investigations needed
- Prevention tips

#### Expensive Statements Results

- Long-running queries
- Resource-intensive operations
- Query patterns
- Performance bottlenecks

**Provides:**

- Optimization suggestions
- Index recommendations
- Query rewrite options
- Monitoring next steps

### Interpretation Examples

#### Example 1: Data Profile

```bash
Raw Output:
" Rows: 10000
  Columns: 8
  NULL values: 1500 (15%)
  Duplicates: 250
  Errors: 45"

Interpreted:
Summary: "Data quality is moderate with significant issues"
Insights:
- "High NULL value percentage (15%) in some columns"
- "Duplicate records found (2.5% of dataset)"
- "45 validation errors detected"
Recommendations:
- Priority: high → "Clean NULL values first"
- Priority: high → "Remove duplicate records"
- Priority: medium → "Fix validation errors"
```

#### Example 2: Memory Analysis

```bash
Raw Output:
"TOP MEMORY ALLOCATIONS
1. TABLE CUSTOMERS - 800 MB (45%)
2. INDEX ON_CUSTOMERS_ID - 300 MB (17%)
3. TABLE ORDERS - 600 MB (34%)"

Interpreted:
Summary: "Memory concentrated in two large tables"
Insights:
- "CUSTOMERS table using 45% of total memory"
- "Combined table memory: 79% of total"
Recommendations:
- Priority: high → "Consider partitioning CUSTOMERS table"
- Priority: medium → "Review index on CUSTOMERS"
- Priority: medium → "Analyze ORDERS table growth"
Concerns:
- Memory concentration risk if tables grow
- Limited headroom for other operations
```

### Using Interpreted Results

1. **Get recommendations** - Understand what to do next
2. **Prioritize actions** - High priority first
3. **Chain commands** - Use suggested next commands
4. **Track metrics** - Monitor key numbers
5. **Plan tuning** - Use insights for optimization

## Documentation Search Integration

Access all 279 project documentation pages directly from MCP.

### Searching Documentation

**MCP Tool:** `hana_search_docs`

```json
{
  "query": "import CSV data",
  "category": "commands",
  "docType": "command",
  "limit": 5
}
```

**Returns:**

```json
{
  "results": [
    {
      "title": "Import Command Guide",
      "path": "02-commands/data-tools/import.md",
      "category": "commands",
      "docType": "command",
      "relevance": 99,
      "excerpt": "Import data from CSV, Excel, or TSV files...",
      "url": "https://sap-samples.github.io/hana-developer-cli-tool-example/..."
    }
  ]
}
```

### Getting Full Documentation

**MCP Tool:** `hana_get_doc`

```json
{
  "path": "02-commands/data-tools/import.md"
}
```

**Returns:**

- Complete markdown content
- Document metadata
- Table of contents (headings)
- Related links
- Full website URL

### Finding Documentation by Category

**MCP Tool:** `hana_list_doc_categories`

Returns:

- All 9+ categories
- Number of documents per category
- Sample documents from each

**Categories:**

- Getting Started (5 docs)
- Commands (80+ docs)
- Features (15 docs)
- API Reference (10 docs)
- Development (20 docs)
- Troubleshooting (8 docs)
- Examples (50+ docs)

### Documentation Search Workflow

```bash
1. User: "How do I import a CSV file?"
   ↓
2. System: Calls hana_search_docs
   ↓
3. Returns: Top 5 import-related docs
   ↓
4. User: Selects most relevant result
   ↓
5. System: Calls hana_get_doc with path
   ↓
6. Returns: Full import command documentation
   ↓
7. Shows: Examples, parameters, troubleshooting
```

## Advanced Scenarios

### Scenario 1: Complete Data Migration

```bash
1. Preview: hana_preview_workflow("schema-migration")
   ↓
2. Execute: hana_execute_workflow("schema-migration")
   - Validate source
   - Generate DDL
   - Test migration
   - Compare schemas
   ↓
3. Interpret: hana_interpret_result("dataValidator", results)
   ↓
4. Report: Generate migration report with metrics
```

### Scenario 2: Performance Optimization

```bash
1. Get baseline: hana_execute_workflow("performance-baseline")
   ↓
2. Analyze: hana_interpret_result("memoryAnalysis", baseline)
   ↓
3. Find issues: hana_execute_workflow("performance-diagnosis")
   ↓
4. Get recommendations: from diagnosed issues
   ↓
5. Implement optimizations
   ↓
6. Re-run baseline: hana_execute_workflow("performance-baseline")
   ↓
7. Compare: baseline before vs. after
```

### Scenario 3: Data Quality Assurance

```bash
1. Profile data: hana_dataProfile(table)
   ↓
2. Interpret: hana_interpret_result("dataProfile", results)
   ↓
3. Find issues: recommendations and concerns
   ↓
4. Execute: hana_execute_workflow("data-cleansing")
   - Identify issues
   - Clean data
   - Validate
   ↓
5. Verify: hana_dataValidator(table)
   ↓
6. Report: Quality metrics and changes
```

## Best Practices

### 1. Always Preview Before Executing

```json
// Step 1: Preview
hana_preview_workflow("data-migration", parameters)

// Step 2: Review and confirm
// Step 3: Execute
hana_execute_workflow("data-migration", parameters)
```

### 2. Use Error Handling Wisely

```json
{
  "stopOnError": true  // For critical workflows
}

{
  "stopOnError": false  // For bulk operations with retry
}
```

### 3. Interpret All Results

Every command result should be interpreted:

```json
hana_interpret_result(command, result)
```

Gets insights, recommendations, and next steps.

### 4. Chain Workflows Logically

```bash
Diagnosis → Analysis → Action → Verification → Report
```

Each step builds on previous results.

### 5. Track Metrics Over Time

Use key metrics to measure success:

- Before/after comparisons
- Performance improvements
- Data quality scores
- Resource utilization

## Next Steps

- **[Discovery Tools](./discovery-tools.md)** - Finding the right commands
- **[Prompts and Resources](./prompts-and-resources.md)** - MCP resources and guides
- **[Implementation Phases](./implementation-phases.md)** - Technical details
