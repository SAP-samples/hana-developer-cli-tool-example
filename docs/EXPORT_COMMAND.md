# Export Command Documentation

## Overview

The `export` command allows you to download data from SAP HANA (or other supported databases) tables and views into CSV, Excel, or JSON files. This is the complementary command to `import`, which uploads data into tables.

## Syntax

```bash
hana-cli export [options]
```

## Aliases

- `export`
- `exp`
- `downloadData`
- `downloaddata`

## Options

### Required Parameters

- **-t, --table** (string): Source database table or view to export from. Can be specified as:
  - `SCHEMA.TABLE` (e.g., `HR.EMPLOYEES`)
  - Just `TABLE` (uses current schema)

- **-o, --output** (string): Full path to the output file

### Optional Parameters

- **-s, --schema** (string): Source schema name. If not provided, uses current schema.

- **-f, --format** (string): Export file format
  - Choices: `csv`, `excel`, `json`
  - Default: `csv`

- **-w, --where** (string): WHERE clause to filter exported rows. Example: `HIRE_DATE > '2020-01-01'`

- **-l, --limit** (number): Maximum number of rows to export
  - Default: No limit (up to maxRows)

- **--orderby, --ob** (string): ORDER BY clause for sorting. Example: `SALARY DESC, NAME ASC`

- **-c, --columns** (string): Comma-separated list of specific columns to export. If not provided, all columns are exported.
  - Example: `EMPLOYEE_ID,NAME,SALARY`

- **-d, --delimiter** (string): CSV field delimiter character
  - Default: `,` (comma)
  - Use `\t` for tab

- **--includeHeaders, --ih** (boolean): Include header row in CSV export
  - Default: `true`

- **--nullValue, --nv** (string): Value to use for NULL/empty cells in output
  - Default: empty string

- **--maxRows, --mr** (number): Maximum rows allowed to prevent excessive exports
  - Default: `1000000`

- **--timeout, --to** (number): Operation timeout in seconds
  - Default: `3600` (1 hour)

- **-p, --profile**: CDS profile for connections (defaults to auto-detection)

## Examples

### 1. Basic CSV Export

Export all data from a table to CSV file:

```bash
hana-cli export -t EMPLOYEES -o ./output/employees.csv
```

### 2. Excel Export with Column Selection

Export specific columns to Excel format:

```bash
hana-cli export -t EMPLOYEES -o ./output/staff.xlsx -f excel -c EMPLOYEE_ID,NAME,EMAIL,HIRE_DATE
```

### 3. Export with WHERE Clause

Export only filtered data:

```bash
hana-cli export -t SALES -o ./output/2024_sales.csv -w "YEAR = 2024 AND STATUS = 'COMPLETED'"
```

### 4. JSON Export with Ordering

Export data as JSON array with specific ordering:

```bash
hana-cli export -t PRODUCTS -o ./output/products.json -f json --orderby "PRICE DESC"
```

### 5. Export with Row Limit

Export only the first 1000 rows:

```bash
hana-cli export -t LARGE_TABLE -o ./output/sample.csv -l 1000
```

### 6. CSV with Custom Delimiter

Export as tab-separated values:

```bash
hana-cli export -t DATA -o ./output/data.tsv -d '\t'
```

### 7. Export from Specific Schema

Export from a non-default schema:

```bash
hana-cli export -t CUSTOMERS -s SALES_DB -o ./output/customers.csv
```

### 8. Cross-Schema Data Migration

Export data for migration between systems:

```bash
hana-cli export -t ORDERS -s PRODUCTION -o ./backup/orders_backup.xlsx -f excel
```

### 9. Export without Headers (for Data Loading)

Remove headers for loading into another system:

```bash
hana-cli export -t STAGING_DATA -o ./output/data_only.csv --includeHeaders false
```

### 10. Export with NULL Replacement

Replace NULL values with a placeholder:

```bash
hana-cli export -t CUSTOMERS -o ./output/customers.csv --nullValue "N/A"
```

## Workflow Examples

### Backup and Restore Workflow

1. **Export current production data**:
```bash
hana-cli export -t CRITICAL_TABLE -s PRODUCTION -o ./backup/critical_$(date +%Y%m%d).csv -f excel
```

2. **Later, restore by importing into new environment**:
```bash
hana-cli import -n ./backup/critical_20260215.csv -t CRITICAL_TABLE -s STAGING -m name
```

### Data Migration Between Databases

1. **Export from source**:
```bash
hana-cli export -t PRODUCTS -s SOURCE_DB -o ./migration/products.json -f json
```

2. **Review and modify if needed**:
```bash
# Edit products.json as needed
```

3. **Import to target**:
```bash
hana-cli import -n ./migration/products.json -t PRODUCTS -s TARGET_DB
```

### Regular Data Exports for External Analysis

1. **Export monthly summary**:
```bash
hana-cli export \
  -t SALES_SUMMARY \
  -o "./reports/sales_$(date +%Y%m).csv" \
  -w "MONTH = CURRENT_DATE" \
  --orderby "REVENUE DESC"
```

## Advanced Usage

### Incremental Exports

Export only records modified since last export:

```bash
hana-cli export \
  -t TRANSACTIONS \
  -o ./data/transactions_incremental.csv \
  -w "MODIFIED_DATE > (SELECT MAX(MODIFIED_DATE) FROM LAST_EXPORT_LOG)"
```

### Large Dataset Export Strategy

For tables with millions of rows, export in chunks:

```bash
# First batch
hana-cli export -t BIG_TABLE -o ./batch1.csv -l 100000

# Subsequent batches with filtering
hana-cli export -t BIG_TABLE -o ./batch2.csv -l 100000 \
  -w "ID > 100000"
```

### Format Conversion Pipeline

Export from HANA and convert formats:

```bash
# Export to CSV
hana-cli export -t DATA -o ./temp/data.csv

# Convert CSV to Excel
# (Use external tools like LibreOffice or pandas)
```

## Performance Considerations

- **Row Limit**: Use `--limit` to restrict output size for testing
- **Column Selection**: Specify only needed columns with `-c` to reduce file size and export time
- **Timeout**: Increase `--timeout` for large exports (e.g., for millions of rows)
- **Format Choice**: JSON is larger; use CSV for bulk data
- **WHERE Clause**: Filter at database level, not in post-processing

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Table not found` | Table doesn't exist or wrong schema | Verify table name and schema via `hana-cli tables` |
| `Column mismatch` | Column name not found | Check column names with `hana-cli inspectTable -t TABLE` |
| `File write failed` | Permission denied or invalid path | Ensure output directory exists and is writable |
| `Timeout exceeded` | Query took too long | Use WHERE clause to filter, increase `--timeout` |
| `Schema not found` | Invalid schema name | Verify with `hana-cli schemas` |

## Related Commands

- **`import`** - Load data from files into tables
- **`tables`** - List available tables
- **`inspectTable`** - View table structure and metadata
- **`querySimple`** - Execute custom SQL queries
- **`schemas`** - List available schemas

## Tips and Best Practices

1. **Always test with small data first**: Use `--limit 100` to preview before full export
2. **Include timestamps in filenames**: Makes it easier to track export versions
3. **Use JSON for complex data types**: Preserves data structure better than CSV
4. **Validate CSV before import**: Check headers and row counts match expectations
5. **Document your exports**: Keep notes about what was exported and why
6. **Set appropriate timeouts**: Longer timeouts for large tables, shorter for interactive use
7. **Use schemas consistently**: Always specify schema in scripts to avoid ambiguity

## FAQ

**Q: Can I export views as well as tables?**  
A: Yes, the export command works with both tables and views.

**Q: What's the maximum file size?**  
A: Limited by available disk space and `--maxRows` setting (default 1,000,000 rows).

**Q: Can I export to a remote location?**  
A: Use network paths (e.g., `//server/share/file.csv` on Windows or `/mnt/remote/file.csv` on Linux).

**Q: How do I handle special characters in column names?**  
A: CSV export automatically handles special characters in headers and data.

**Q: Can I schedule regular exports?**  
A: Yes, use cron (Linux) or Task Scheduler (Windows) with the hana-cli export command.
