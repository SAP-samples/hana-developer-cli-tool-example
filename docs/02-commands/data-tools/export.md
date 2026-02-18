# export

> Command: `export`  
> Aliases: `exp`, `downloadData`, `downloaddata`  
> Category: **Data Tools**  
> Status: Production Ready

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

## Required Parameters

- **-t, --table** (string): Source database table or view to export from. Can be specified as:
  - `SCHEMA.TABLE` (e.g., `HR.EMPLOYEES`)
  - Just `TABLE` (uses current schema)

- **-o, --output** (string): Full path to the output file

## Optional Parameters

### Data Selection

- **-s, --schema** (string): Source schema name. If not provided, uses current schema.

- **-w, --where** (string): WHERE clause to filter exported rows
  - Example: `HIRE_DATE > '2020-01-01'`

- **-l, --limit** (number): Maximum number of rows to export
  - Default: No limit (up to maxRows)

- **--orderby, --ob** (string): ORDER BY clause for sorting
  - Example: `SALARY DESC, NAME ASC`

- **-c, --columns** (string): Comma-separated list of specific columns to export
  - If not provided, all columns are exported
  - Example: `EMPLOYEE_ID,NAME,SALARY`

### Output Format

- **-f, --format** (string): Export file format
  - Choices: `csv`, `excel`, `json`
  - Default: `csv`

- **-d, --delimiter** (string): CSV field delimiter character
  - Default: `,` (comma)
  - Use `\t` for tab-separated values

- **--includeHeaders, --ih** (boolean): Include header row in export
  - Default: `true`

- **--nullValue, --nv** (string): Value to use for NULL/empty cells in output
  - Default: empty string

### Performance & Limits

- **--maxRows, --mr** (number): Maximum rows allowed to prevent excessive exports
  - Default: `1000000`

- **--timeout, --to** (number): Operation timeout in seconds
  - Default: `3600` (1 hour)

### Connection & Debugging

- **-p, --profile**: CDS profile for connections (defaults to auto-detection)

- **--debug**: Enable debug output for troubleshooting

## Output Formats

### CSV Export

- Standard comma-separated values format
- First row contains column headers (configurable with `--includeHeaders`)
- Values are automatically quoted when containing special characters
- NULL values appear as empty cells or custom value (with `--nullValue`)

Example output:
```csv
EMPLOYEE_ID,NAME,SALARY,HIRE_DATE
E001,John Smith,85000,2020-01-15
E002,Jane Doe,72000,2019-06-20
```

### Excel Export

- Modern .xlsx format (Office Open XML)
- Automatic column width adjustment
- Data types preserved (numbers, dates, text)
- Supports large datasets
- Professional formatting with headers

### JSON Export

- JSON array of objects format
- Best for complex data structures
- Preserves data types and NULL values
- Larger file size compared to CSV
- Easy to parse programmatically

Example output:
```json
[
  {
    "EMPLOYEE_ID": "E001",
    "NAME": "John Smith",
    "SALARY": 85000,
    "HIRE_DATE": "2020-01-15"
  },
  {
    "EMPLOYEE_ID": "E002",
    "NAME": "Jane Doe",
    "SALARY": 72000,
    "HIRE_DATE": "2019-06-20"
  }
]
```

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
hana-cli export -t CRITICAL_TABLE -s PRODUCTION -o ./backup/critical_$(date +\%Y\%m\%d).csv -f excel
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
  -o "./reports/sales_$(date +\%Y\%m).csv" \
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

Export to multiple formats for different uses:

```bash
# Export to CSV for data analysis
hana-cli export -t DATA -o ./output/data.csv

# Export to Excel for business users
hana-cli export -t DATA -o ./output/data.xlsx -f excel

# Export to JSON for APIs
hana-cli export -t DATA -o ./output/data.json -f json
```

### Selective Column Export for Privacy

Export only non-sensitive columns:

```bash
hana-cli export \
  -t CUSTOMERS \
  -o ./output/customers_safe.csv \
  -c "CUSTOMER_ID,NAME,COUNTRY,REGION" \
  --orderby "CUSTOMER_ID ASC"
```

## Performance Considerations

| Factor | Recommendation |
|--------|-----------------|
| **Large datasets** | Use `--limit` to test, then export in batches |
| **Specific columns** | Use `-c` to reduce file size and export time |
| **Long-running exports** | Increase `--timeout` for millions of rows |
| **File format choice** | JSON is larger; use CSV for bulk data |
| **Filtering efficiency** | Apply WHERE clause at database level |
| **Remote exports** | Consider network bandwidth for large files |

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Table not found` | Table doesn't exist or wrong schema | Verify table name and schema via `hana-cli inspectTable -t TABLE` |
| `Column not found` | Column doesn't exist | Check column names with `hana-cli inspectTable -t SCHEMA.TABLE` |
| `File write failed` | Permission denied or invalid path | Ensure output directory exists and is writable |
| `Timeout exceeded` | Query took too long | Use WHERE clause to filter, increase `--timeout` |
| `Schema not found` | Invalid schema name | Verify with `hana-cli inspectTable -s SCHEMA` |
| `No output specified` | Missing `-o` parameter | Always provide output file path |
| `Invalid format` | Unsupported format choice | Use csv, excel, or json |

### Troubleshooting Guide

#### Connection issues

```bash
hana-cli connect -n [HOST]:[PORT] -u [USER] -p [PASSWORD]
```

#### View available tables

```bash
hana-cli inspectSchema -s SCHEMA_NAME
```

#### Check table structure before export

```bash
hana-cli inspectTable -t SCHEMA.TABLE
```

#### Test export with small sample

```bash
hana-cli export -t LARGE_TABLE -o ./sample.csv -l 100
```

## Related Commands

- **[import](./import.md)** - Load data from files into tables

  ```bash
  hana-cli import -n data.csv -t HR.EMPLOYEES
  ```

- **inspectTable** - View table metadata and structure

  ```bash
  hana-cli inspectTable -t SCHEMA.TABLE
  ```

- **inspectSchema** - List tables in a schema

  ```bash
  hana-cli inspectSchema -s SCHEMA_NAME
  ```

- **querySimple** - Execute custom SQL queries

  ```bash
  hana-cli querySimple -q "SELECT * FROM TABLE"
  ```

## Tips and Best Practices

1. **Always test first**: Use `-l 100` to preview data before full export
2. **Include timestamps**: Add timestamps to filenames for version tracking
3. **Choose format wisely**: 
   - CSV for data analysis tools
   - Excel for business users
   - JSON for APIs and web applications
4. **Validate before import**: Check file integrity after export
5. **Document your exports**: Keep notes about what was exported and when
6. **Use schemas explicitly**: Always specify schema to avoid ambiguity
7. **Filter at database level**: Use WHERE clause instead of post-processing
8. **Set appropriate timeouts**: Longer for large tables, shorter for interactive use
9. **Archive old exports**: Keep backup versions with dates
10. **Test recovery process**: Verify exports can be re-imported successfully

## Frequently Asked Questions

### Can I export views?

Yes, the export command works with both tables and views.

```bash
hana-cli export -t SCHEMA.VIEW_NAME -o output.csv
```

### What's the maximum file size?

Limited by available disk space and the `--maxRows` setting (default 1,000,000 rows). For larger exports, use batching.

### Can I export to a remote location?

Yes, use network paths:
- **Windows**: `//server/share/file.csv`
- **Linux/Mac**: `/mnt/remote/file.csv` or `smb://server/share/file.csv`

### How do I handle special characters in column names?

CSV export automatically handles special characters in headers and data with proper quoting.

### Can I schedule regular exports?

Yes, use your system's scheduler:
- **Linux/Mac**: `crontab -e`
- **Windows**: Task Scheduler
- **Cloud**: Cloud Functions or Scheduled Tasks

Example cron job:
```bash
# Export employees daily at 2 AM
0 2 * * * hana-cli export -t HR.EMPLOYEES -o /backups/employees_$(date +\%Y\%m\%d).csv
```

### How do I export with complex WHERE clauses?

Use proper SQL syntax. For complex queries, use `querySimple` and pipe to export or use subqueries:

```bash
hana-cli export -t SALES \
  -o output.csv \
  -w "DATE >= '2024-01-01' AND (REGION IN ('USA', 'CA') OR CUSTOMER_ID IN (SELECT ID FROM VIP_CUSTOMERS))"
```

### What happens to NULL values in export?

- By default, NULL appears as empty cell in CSV/Excel
- Use `--nullValue "TEXT"` to customize
- JSON preserves NULL as JSON null

### Can I export computed/derived columns?

If defined in the view or with `querySimple`, yes. For quick computed exports, create a view first.

## Complete Workflow Example: Backup and Refresh

```bash
#!/bin/bash

# Step 1: Export current data for backup
echo "Backing up EMPLOYEES table..."
hana-cli export \
  -t HR.EMPLOYEES \
  -s HR \
  -o "./backup/employees_$(date +%Y%m%d_%H%M%S).csv" \
  -f excel

# Step 2: Verify export
echo "Export complete. Sample data:"
hana-cli export -t HR.EMPLOYEES -s HR -o /tmp/sample.csv -l 5

# Step 3: Check file
echo "File size: $(ls -lh ./backup/employees_*.csv | tail -1 | awk '{print $5}')"
echo "Row count: $(wc -l < ./backup/employees_*.csv)"
```

## See Also

- [Category: Data Tools](../index.md#-data-tools)
- [All Commands A-Z](../all-commands.md)
- [Import Command](./import.md)
- [Data Sync Command](./data-sync.md)
- [Query Simple Command](../developer-tools/query-simple.md)
