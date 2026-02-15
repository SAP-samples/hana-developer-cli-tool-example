# Data Diff Command Documentation

## Overview

The `dataDiff` command performs detailed row-level comparison between two datasets, identifying specific columns that differ. This is useful for data validation, change tracking, and identifying discrepancies at the cell level.

## Syntax

```bash
hana-cli dataDiff [options]
```

## Aliases

- `dataDiff`
- `ddiff`
- `diffData`

## Options

### Required Parameters

- **-t1, --table1** (string): First table to compare
- **-t2, --table2** (string): Second table to compare
- **-k, --keyColumns** (string): Comma-separated columns for row matching (must uniquely identify rows)

### Optional Parameters

- **-s1, --schema1** (string): Schema for first table. Defaults to current schema.
- **-s2, --schema2** (string): Schema for second table. Defaults to schema1.
- **-c, --compareColumns** (string): Specific columns to compare (comma-separated). Defaults to all common columns.
- **-o, --output** (string): File path for diff report
- **-f, --format** (string): Report output format
  - Choices: `json`, `csv`, `summary`
  - Default: `summary`
- **-l, --limit** (number): Maximum rows to compare
  - Default: `10000`
- **--showValues, --sv** (boolean): Include actual values in report
  - Default: `false`
- **--timeout, --to** (number): Operation timeout in seconds
  - Default: `3600`
- **-p, --profile**: CDS profile for connections

## Examples

### 1. Basic Data Diff

Find differences between two tables:

```bash
hana-cli dataDiff -t1 EMPLOYEES -t2 EMPLOYEES_UPDATED -k EMPLOYEE_ID
```

### 2. Diff across Schemas

Compare same table in different environments:

```bash
hana-cli dataDiff \
  -t1 CUSTOMERS -s1 PRODUCTION \
  -t2 CUSTOMERS -s2 STAGING \
  -k CUSTOMER_ID
```

### 3. Detailed Value Comparison

Show actual values that differ:

```bash
hana-cli dataDiff \
  -t1 PRODUCTS -t2 PRODUCTS_UPDATED \
  -k PRODUCT_ID \
  --showValues true
```

### 4. Compare Specific Columns

Focus on particular columns:

```bash
hana-cli dataDiff \
  -t1 ORDERS -t2 ORDERS_COPY \
  -k ORDER_ID \
  -c TOTAL_AMOUNT,STATUS,SHIPPING_DATE
```

### 5. JSON Report Export

Export detailed diff in JSON format:

```bash
hana-cli dataDiff \
  -t1 DATA -t2 DATA_BACKUP \
  -k ID \
  -f json \
  -o ./reports/data_differences.json
```

### 6. CSV Report for Spreadsheet Analysis

Export as CSV for Excel analysis:

```bash
hana-cli dataDiff \
  -t1 SALES -t2 SALES_ARCHIVE \
  -k TRANSACTION_ID \
  -f csv \
  -o ./reports/sales_diff.csv
```

### 7. Multi-Column Key Matching

Use composite key for row matching:

```bash
hana-cli dataDiff \
  -t1 TRANSACTIONS -t2 TRANSACTIONS_REFERENCE \
  -k ORDER_ID,LINE_ITEM,STORE_ID
```

## Output Formats

### Summary Format (Default)
Console-friendly overview:
```
Identical: 950
Different: 45
OnlyInTable1: 3
OnlyInTable2: 2
```

### JSON Format
Structured format with detailed differences:
```json
{
  "identical": 950,
  "different": 45,
  "onlyInTable1": [...],
  "onlyInTable2": [...],
  "differences": [
    {
      "key": "12345",
      "changes": [
        {"column": "PRICE", "table1Value": 99.99, "table2Value": 89.99}
      ]
    }
  ]
}
```

### CSV Format
Tabular format for analysis:
```
type,key,column,table1Value,table2Value
difference,12345,PRICE,99.99,89.99
onlyInTable1,67890,,
onlyInTable2,11111,,
```

## Use Cases

### Quality Assurance Testing

Verify test data matches expected state:

```bash
hana-cli dataDiff \
  -t1 TEST_DATA_INPUT \
  -t2 TEST_DATA_EXPECTED \
  -k TEST_ID \
  --showValues true
```

### Migration Validation

Ensure all data migrated correctly:

```bash
hana-cli dataDiff \
  -t1 SOURCE_TABLE -s1 LEGACY_SYSTEM \
  -t2 SOURCE_TABLE -s2 NEW_SYSTEM \
  -k RECORD_ID \
  -f json \
  -o ./migration_validation.json
```

### Data Integrity Monitoring

Check for unexpected changes:

```bash
hana-cli dataDiff \
  -t1 MASTER_DATA \
  -t2 MASTER_DATA_SNAPSHOT \
  -k ID \
  -o ./integrity_check.json
```

### Sync Verification

Verify two systems are in sync:

```bash
hana-cli dataDiff \
  -t1 PRODUCTS -s1 SYSTEM_A \
  -t2 PRODUCTS -s2 SYSTEM_B \
  -k SKU
```

## Performance Tips

- **Limit rows**: Use `--limit` to sample large tables first
- **Selective columns**: Compare only relevant columns
- **Composite keys**: Use multi-column keys when available for performance
- **Filter with WHERE**: Apply database-level filtering if possible

## Related Commands

- **`compareData`** - High-level data comparison by matching rows
- **`compareSchema`** - Compare schema structures
- **`export`** - Export data for external analysis
- **`querySimple`** - Run custom SQL queries

## Tips and Best Practices

1. **Test with limit first**: Use `--limit 100` before full comparison
2. **Choose correct keys**: Primary or unique keys work best
3. **One issue at a time**: Focus on specific column groups
4. **Archive reports**: Keep historical diff reports for tracking changes
5. **Share reports**: Review diff results with teammates to discuss discrepancies
