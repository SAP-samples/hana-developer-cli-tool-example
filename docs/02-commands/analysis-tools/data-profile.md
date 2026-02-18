# dataProfile

> Command: `dataProfile`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Generates comprehensive data quality metrics and statistical analysis for database tables. It analyzes NULL values, data distribution, uniqueness, and string patterns—useful for data quality assessment, understanding data characteristics, and identifying potential data issues.

## Syntax

```bash
hana-cli dataProfile [options]
```

## Aliases

- `prof`
- `profileData`
- `dataStats`

## Parameters

### Required Parameters

- **-t, --table** (string): Table to profile

### Optional Parameters

- **-s, --schema** (string): Schema containing the table. Defaults to current schema.
- **-c, --columns** (string): Specific columns to profile (comma-separated). Profiles all if omitted.
- **-o, --output** (string): File path to save profile report
- **-f, --format** (string): Report output format
  - Choices: `json`, `csv`, `summary`
  - Default: `summary`
- **--nullAnalysis, --na** (boolean): Include NULL value analysis
  - Default: `true`
- **--cardinalityAnalysis, --ca** (boolean): Include distinct value count
  - Default: `true`
- **--statisticalAnalysis, --sa** (boolean): Include min/max/avg analysis
  - Default: `true`
- **--patternAnalysis, --pa** (boolean): Include string length analysis
  - Default: `false` (slower)
- **--sampleSize, --ss** (number): Maximum rows to analyze
  - Default: `10000`
- **--timeout, --to** (number): Operation timeout in seconds
  - Default: `3600`
- **-p, --profile**: CDS profile for connections

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

- **`compareData`** - Compare data between tables
- **`dataDiff`** - Show detailed row differences
- **`compareSchema`** - Compare schema structures
- **`export`** - Export data for external analysis
- **`querySimple`** - Run custom analytical queries

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
