# dataProfile

> Command: `dataProfile`  
> Category: **Analysis Tools**  
> Status: Early Access

## Description

Generates comprehensive data quality metrics and statistical analysis for database tables. It analyzes NULL values, data distribution, uniqueness, and string patterns—useful for data quality assessment, understanding data characteristics, and identifying potential data issues.

### What is Data Profiling?

**Data profiling** is the process of examining actual data in your database to understand its characteristics, quality, and structure. It goes beyond table schema to analyze:

- **Data Distribution**: How data values are spread across the column
- **Data Quality**: Presence of NULL values, duplicates, invalid formats
- **Statistical Patterns**: Min/max values, averages, standard deviations
- **Uniqueness**: How many distinct values exist (cardinality)
- **Format Patterns**: String lengths, patterns, and data type compliance

Think of it as an X-ray of your data that reveals what's actually there, not just what the schema says should be there.

### Why is Data Profiling Important?

Data profiling provides critical insights that go beyond basic table structure:

**Data Quality Assessment:**

- **Hidden Issues**: Discover NULL values, invalid formats, or unexpected data types that violate assumptions
- **Data Validity**: Identify strings where numbers should be, or negative values where only positives are expected
- **Format Violations**: Find phone numbers, dates, or codes that don't match the expected format
- **Range Violations**: Discover values outside acceptable ranges (age > 150, prices < 0)
- **Completeness**: Understand what percentage of data is missing (NULL)

**Understanding Your Data:**

- **Cardinality Analysis**: Know how many unique values exist (is this really a "unique ID"?)
- **Distribution Patterns**: Understand if data is evenly distributed or has hot spots
- **Real-World Constraints**: Discover actual business rules vs. documented rules
- **Data Type Reality**: Confirm that columns actually contain the data type they claim
- **Time-Based Patterns**: Identify trends over time in data values

**Business Impact:**

- **Correct Reporting**: Base decisions on accurate understanding of data
- **Risk Identification**: Uncover data quality issues before they cause problems
- **Better Queries**: Write more efficient queries once you understand data distribution
- **Integration Planning**: Know data quality requirements for system integrations
- **Regulatory Compliance**: Document and validate data governance requirements
- **Root Cause Analysis**: Understand why reports differ from expectations

**Operational Benefits:**

- **Migration Planning**: Understand data complexity before migrating to new systems
- **Index Strategy**: Know which columns benefit most from indexing based on cardinality
- **Performance Tuning**: Identify columns with skewed distributions (partitioning candidates)
- **Data Cleanup**: Prioritize data quality improvements based on impact areas
- **Documentation**: Create accurate data dictionaries with real statistics

### Use Cases for Data Profiling

#### 1. New Project Kickoff

```bash
# Profile all tables in a new schema
hana-cli dataProfile --schema LEGACY_SYSTEM --cardinalityAnalysis --statisticalAnalysis
```

Understand the data you've inherited or integrated.

#### 2. Data Quality Initiative

```bash
# Identify columns with data quality issues
hana-cli dataProfile --table CUSTOMERS \
  --nullAnalysis \
  --patternAnalysis \
  --format json \
  --output customer-quality-report.json
```

Find specific columns that need data cleansing.

#### 3. Performance Tuning

```bash
# Analyze cardinality for indexing decisions
hana-cli dataProfile --table ORDERS \
  --cardinalityAnalysis \
  --columns ORDER_ID,CUSTOMER_ID,STATUS,ORDER_DATE
```

Identify which columns have high selectivity for indexes.

#### 4. Data Governance Documentation

```bash
# Generate statistical profile for data dictionary
hana-cli dataProfile --table PRODUCTS \
  --statisticalAnalysis \
  --format csv \
  --output products-statistics.csv
```

Create accurate documentation of real data characteristics.

#### 5. Pre-Migration Validation

```bash
# Compare profiles before and after migration
hana-cli dataProfile --schema PRODUCTION --sampleSize 1000000
```

Verify data integrity after system migration.

#### 6. Report Accuracy Verification

```bash
# Debug why summary report shows 0 customers
hana-cli dataProfile --table CUSTOMERS --nullAnalysis --cardinalityAnalysis
```

Verify that key columns contain expected data.

## Syntax

```bash
hana-cli dataProfile
```

## Aliases

- `prof`
- `profileData`
- `dataStats`

## Command Diagram

```mermaid
graph TD
  Start([hana-cli dataProfile]) --> Input{Table Provided?}
  Input -->|No| Err[Exit with Error<br/>Table not found]
  Input -->|Yes| Connect[Connect to Database]

  Connect --> Schema{Schema uses CURRENT_SCHEMA token?}
  Schema -->|Yes| Resolve[Resolve Current Schema]
  Schema -->|No| UseSchema[Use Provided Schema]

  Resolve --> Columns[Load Table Columns]
  UseSchema --> Columns

  Columns --> Filter{Columns option specified?}
  Filter -->|Yes| Selected[Filter to Selected Columns]
  Filter -->|No| AllCols[Profile All Columns]

  Selected --> Analyze[Run Analyses<br/>NULL/Cardinality/Stats/Pattern]
  AllCols --> Analyze

  Analyze --> Output{Output Target}
  Output -->|Console| Print[Display summary/csv/json]
  Output -->|File path| Save[Write report file]

  Print --> Complete([Command Complete])
  Save --> Complete

  style Start fill:#0092d1
  style Complete fill:#2ecc71
  style Input fill:#f39c12
  style Schema fill:#f39c12
  style Filter fill:#f39c12
  style Output fill:#f39c12
  style Err fill:#9b59b6
```

## Parameters

### Positional Arguments

This command has no positional arguments.

### Options

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--table` | `-t` | string | - | Target Table Name. Required for successful execution. |
| `--schema` | `-s` | string | `**CURRENT_SCHEMA**` | Target Schema Name. |
| `--columns` | `-c` | string | - | Columns to Profile (comma-separated, optional). |
| `--output` | `-o` | string | - | Output Report File Path. If omitted, output is printed to console. |
| `--format` | `-f` | string | `summary` | Report Format. Choices: `json`, `csv`, `summary`. |
| `--nullAnalysis` | `--na` | boolean | `true` | Include NULL Value Analysis. |
| `--cardinalityAnalysis` | `--ca` | boolean | `true` | Include Cardinality Analysis. |
| `--statisticalAnalysis` | `--sa` | boolean | `true` | Include Statistical Analysis (min, max, avg). |
| `--patternAnalysis` | `--pa` | boolean | `false` | Include Pattern Analysis (length statistics). |
| `--sampleSize` | `--ss` | number | `10000` | Maximum Rows to Analyze. |
| `--timeout` | `--to` | number | `3600` | Operation Timeout in Seconds. |
| `--profile` | `-p` | string | - | CDS Profile. |
| `--help` | `-h` | boolean | - | Show help. |

### Connection Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json). |
| `--conn` | - | string | - | Connection Filename to override default-env.json. |

### Troubleshooting

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable Verbose output - removes extra output primarily intended for human-readable usage. |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself by adding lots of intermediate details. |

For a complete list of parameters and options, use:

```bash
hana-cli dataProfile --help
```

## Output Metrics

### NULL Analysis

- NULL count per column
- NULL percentage
- Completeness ratio (1 - NULL%)

### Cardinality Analysis

- Distinct value count
- Cardinality ratio (distinct / total)
- Data uniqueness assessment

### Statistical Analysis

- Minimum value
- Maximum value
- Average value
- Applicable to numeric columns

### Pattern Analysis

- Minimum string length
- Maximum string length
- Average string length
- Useful for identifying data format issues

### Value Distribution

- Top 5 most frequent values
- Value frequency counts

## Output Formats

### Summary Format (Default)

Console-friendly overview showing key metrics per column.

### JSON Format

Structured format with complete metrics and metadata:

```json
{
  "table": "EMPLOYEES",
  "rowCount": 10000,
  "columnCount": 15,
  "columns": {
    "SALARY": {
      "nullCount": 5,
      "distinctCount": 8942,
      "minValue": 25000,
      "maxValue": 250000,
      "avgValue": 85432.50,
      "topValues": [...]
    }
  }
}
```

### CSV Format

Tabular format for analysis and comparison.

## Special Default Values

| Token | Resolves To | Description |
| --- | --- | --- |
| `**CURRENT_SCHEMA**` | Current user schema | Default for `--schema` when not explicitly provided. |

## Interactive Mode

This command can be used in interactive mode:

```bash
hana-cli interactive --category data-tools
```

When choosing `dataProfile` interactively, `table` is prompted as required and `schema` is optional. Most advanced options are available but skipped by default unless explicitly provided.

## Examples

### 1. Basic Table Profile

Quick overview of table data:

```bash
hana-cli dataProfile -t EMPLOYEES
```

### 2. Profile Specific Columns

Analyze selected columns only:

```bash
hana-cli dataProfile -t CUSTOMERS -c NAME,EMAIL,PHONE,ADDRESS
```

### 3. Detailed JSON Report

Export comprehensive profile:

```bash
hana-cli dataProfile \
  -t SALES_DATA \
  -f json \
  -o ./analysis/sales_profile.json
```

### 4. Include Pattern Analysis

Analyze string properties:

```bash
hana-cli dataProfile \
  -t PRODUCTS \
  --patternAnalysis true \
  -o ./analysis/product_patterns.json
```

### 5. Schema-Specific Profile

Profile table in non-default schema:

```bash
hana-cli dataProfile -t CUSTOMERS -s BUSINESS_UNIT_1
```

### 6. CSV Format for Spreadsheet

Export profile in CSV format:

```bash
hana-cli dataProfile \
  -t DATA \
  -f csv \
  -o ./analysis/data_profile.csv
```

## Use Cases

### Data Quality Assessment

Check overall quality of imported data:

```bash
hana-cli dataProfile \
  -t IMPORTED_DATA \
  -f json \
  -o ./quality_assessment.json
```

### Data Discovery

Understand new dataset characteristics:

```bash
hana-cli dataProfile \
  -t NEW_CUSTOMER_DATA \
  -c CUSTOMER_ID,NAME,EMAIL,PHONE,ZIP_CODE
```

### Identify Data Issues

Find columns that might have problems:

```bash
hana-cli dataProfile \
  -t PRODUCTS \
  --patternAnalysis true
```

### Performance Analysis

Understand data volume before optimization:

```bash
hana-cli dataProfile -t LARGE_TABLE --sampleSize 50000
```

### Data Governance

Document data characteristics for compliance:

```bash
hana-cli dataProfile \
  -t PROTECTED_DATA \
  -f json \
  -o ./governance/data_profile.json
```

## Performance Considerations

- **Sample size**: Reduce `--sampleSize` for faster profiling of huge tables
- **Pattern analysis**: Only use `--patternAnalysis` when needed (string analysis is slower)
- **Column filtering**: Profile only necessary columns
- **Timeout**: Increase for large datasets with complex analysis

## Quality Assessment Matrix

Use profile results to assess data quality:

| Metric | Good | Warning | Bad |
| --- | --- | --- | --- |
| NULL % | < 5% | 5-20% | > 20% |
| Cardinality | Near 100% | 50-100% | < 50% |
| Min/Max Range | Reasonable | Extreme range | Outliers present |
| Top values | Well distributed | Few dominant values | Single value dominates |

## Data Quality Red Flags

- High NULL percentage (> 20%)
- Unexpected NULL values in key columns
- Extremely low cardinality (few distinct values)
- Min/max values with obvious outliers
- Single value dominating distribution
- Empty strings mixed with NULLs

## Tips and Best Practices

1. **Profile before importing**: Understand source data quality
2. **Regular profiling**: Schedule periodic profiles for monitoring
3. **Compare profiles**: Run profiles on backup to identify changes
4. **Document findings**: Keep profile reports for reference
5. **Focus on key columns**: Profile business-critical columns first
6. **Use patterns**: Identify string format issues (zip codes, emails)
7. **Set appropriate samples**: Balance accuracy with performance

## Related Commands

- **`dataValidator`** - Validate table data against business rules and constraints
- **`duplicateDetection`** - Detect duplicate records using configurable matching strategies

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Analysis Tools](..)
- [All Commands A-Z](../all-commands.md)
