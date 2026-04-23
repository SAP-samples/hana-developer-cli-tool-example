# Advanced Features

Sophisticated capabilities for complex workflows and understanding results.

## Workflow Templates

Pre-built sequences of commands that work together to accomplish a goal. The AI agent orchestrates execution — workflow templates provide the sequence and recommended parameters, while the LLM handles execution and decision-making between steps.

### What Are Workflows?

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

### Browsing Workflows

**MCP Tool:** `hana_workflows`

Returns a list of all available workflow templates with descriptions and step counts.

**MCP Tool:** `hana_workflow_by_id`

```json
{
  "id": "data-quality-check"
}
```

**Returns:**

- All steps in order with commands and parameters
- Parameter templates using `<parameter-name>` substitution
- Expected outcomes per step
- Tips and best practices

**MCP Tool:** `hana_search_workflows`

```json
{
  "tag": "performance"
}
```

Search workflows by tag (e.g., `data-quality`, `performance`, `security`, `backup`, `migration`).

### Built-In Workflows

The MCP Server includes 20+ professional workflows:

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

Workflow templates use parameter placeholders with `<parameter-name>` syntax. When the AI agent executes each step, it substitutes the actual values:

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

The AI agent substitutes actual values when calling each tool in sequence.

### Error Handling in Workflows

The AI agent decides how to handle errors between steps — it can skip failed steps, retry with different parameters, or stop and report issues. Workflow templates include guidance on which steps are critical vs. optional.

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

**MCP Tool:** `hana_search`

```json
{
  "query": "import CSV data",
  "scope": "docs",
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

**MCP Resource:** `hana://docs/categories`

Documentation categories are available as an MCP resource (not a tool), keeping the tool list concise while still providing browsable metadata.

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
2. System: Calls hana_search
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
1. Browse: hana_workflow_by_id("schema-migration")
   ↓
2. Execute steps guided by the workflow template:
   - Validate source schema
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
1. Get workflow: hana_workflow_by_id("performance-baseline")
   ↓
2. Execute baseline steps: hana_healthCheck, hana_memoryAnalysis, etc.
   ↓
3. Analyze: hana_interpret_result("memoryAnalysis", baseline)
   ↓
4. Get diagnosis workflow: hana_workflow_by_id("performance-diagnosis")
   ↓
5. Execute diagnosis steps and get recommendations
   ↓
6. Implement optimizations
   ↓
7. Re-run baseline steps and compare before vs. after
```

### Scenario 3: Data Quality Assurance

```bash
1. Profile data: hana_dataProfile(table)
   ↓
2. Interpret: hana_interpret_result("dataProfile", results)
   ↓
3. Find issues: recommendations and concerns
   ↓
4. Get workflow: hana_workflow_by_id("data-cleansing")
   ↓
5. Execute cleansing steps:
   - Identify issues
   - Clean data
   - Validate
   ↓
6. Verify: hana_dataValidator(table)
   ↓
7. Report: Quality metrics and changes
```

## Best Practices

### 1. Review Workflow Templates First

```bash
# Step 1: Browse the workflow
hana_workflow_by_id("data-migration")

# Step 2: Review the steps and parameters
# Step 3: Execute each step, adapting as needed
```

### 2. Handle Errors Between Steps

The AI agent should check results between workflow steps and decide whether to continue, retry, or stop based on the outcome.

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
