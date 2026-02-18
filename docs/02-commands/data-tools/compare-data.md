# compareData

> Command: `compareData`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Compares data between two tables or schemas to identify differences. This is useful for data validation, reconciliation, and identifying changes between systems.

## Syntax

```bash
hana-cli compareData [options]
```

## Aliases

- `cmpdata`
- `compardata`
- `dataCompare`

## Parameters

### Required Parameters

- **-st, --sourceTable** (string): First table to compare
- **-tt, --targetTable** (string): Second table to compare  
- **-k, --keyColumns** (string): Comma-separated column names to use for matching rows between tables

### Optional Parameters

- **-ss, --sourceSchema** (string): Schema containing the source table. Defaults to current schema.
- **-ts, --targetSchema** (string): Schema containing the target table. Defaults to source schema.
- **-c, --columns** (string): Specific columns to compare (comma-separated). If not provided, all common columns are compared.
- **-o, --output** (string): File path to save comparison report
- **--showMatches, --sm** (boolean): Include details of matching rows in report
  - Default: `false`
- **-l, --limit** (number): Maximum rows to compare from each table
  - Default: `1000`
- **--timeout, --to** (number): Operation timeout in seconds
  - Default: `3600`
- **-p, --profile**: CDS profile for connections

For a complete list of parameters and options, use:

```bash
hana-cli compareData --help
```

## Output Format

The comparison report includes:

- **Matching rows**: Row count where key matches and all values are identical
- **Differences**: Rows with matching keys but different values, showing both versions
- **Source-only rows**: Rows present in source but not in target
- **Target-only rows**: Rows present in target but not in source
- **Summary statistics**: Total rows in each table, difference count

## Examples

### 1. Basic Table Comparison

Compare two tables in the same schema:

```bash
hana-cli compareData -st EMPLOYEES -tt EMPLOYEES_ARCHIVE -k EMPLOYEE_ID
```

### 2. Cross-Schema Comparison

Compare tables from different schemas:

```bash
hana-cli compareData \
  -st CUSTOMERS -ss PRODUCTION \
  -tt CUSTOMERS -ts STAGING \
  -k CUSTOMER_ID
```

### 3. Multi-Column Key Matching

Use multiple columns to match rows:

```bash
hana-cli compareData \
  -st ORDERS -tt ORDERS_NEW \
  -k ORDER_ID,ORDER_DATE
```

### 4. Selective Column Comparison

Compare only specific columns:

```bash
hana-cli compareData \
  -st EMPLOYEES -tt EMPLOYEES_UPDATED \
  -k EMPLOYEE_ID \
  -c NAME,SALARY,DEPARTMENT
```

### 5. Comparison with Report Export

Save comparison results to file:

```bash
hana-cli compareData \
  -st SALES_DATA -tt SALES_DATA_BACKUP \
  -k TRANSACTION_ID \
  -o ./reports/sales_comparison.json
```

### 6. Show All Matching Rows

Include details of matching rows in report:

```bash
hana-cli compareData \
  -st DATA -tt DATA_COPY \
  -k ID \
  --showMatches true
```

### 7. Limited Scope Comparison

Compare only first 100 rows:

```bash
hana-cli compareData \
  -st BIG_TABLE -tt BIG_TABLE_NEW \
  -k ID \
  -l 100
```

## Use Cases

### Data Reconciliation

Verify that data migrated correctly to a new system:

```bash
hana-cli compareData \
  -st CUSTOMER_MASTER -ss LEGACY_SYSTEM \
  -tt CUSTOMER_MASTER -ts NEW_SYSTEM \
  -k CUSTOMER_ID \
  -o ./reports/reconciliation.json
```

### Change Detection

Identify what changed between two snapshots:

```bash
hana-cli compareData \
  -st PRODUCTS -tt PRODUCTS_SNAPSHOT \
  -k PRODUCT_ID \
  -c NAME,PRICE,STOCK_LEVEL
```

### Data Quality Checks

Compare current data with a known good version:

```bash
hana-cli compareData \
  -st TRANSACTIONS -tt TRANSACTIONS_VALIDATED \
  -k TRANSACTION_ID
```

## Performance Considerations

- **Use key columns wisely**: Choose columns that efficiently identify rows
- **Row limit**: Use `--limit` to restrict comparison scope for large tables
- **Column filtering**: Compare only necessary columns to reduce processing time
- **Timeout**: Increase for large dataset comparisons

## Tips and Best Practices

1. **Choose correct key columns**: Ensure key columns uniquely identify each row
2. **Start with limited scope**: Use `--limit` to test before full comparison
3. **Export results**: Save comparison reports for documentation and audit trails
4. **Regular reconciliation**: Schedule periodic comparisons for data integrity monitoring
5. **Multi-column keys**: Use composite keys when single column isn't unique

## Related Commands

- **`dataDiff`** - Show detailed row-level differences
- **`compareSchema`** - Compare database schema structures
- **`tables`** - List available tables
- **`inspectTable`** - View table structure

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
