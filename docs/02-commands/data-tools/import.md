# import

> Command: `import`  
> Aliases: `imp`, `uploadData`, `uploaddata`  
> Category: **Data Tools**  
> Status: Production Ready

## Overview

The `import` command allows you to upload data from CSV or Excel files directly into SAP HANA database tables. This is the complementary command to `querySimple`, which exports data from tables.

## Syntax

```bash
hana-cli import [options]
```

## Aliases

- `import`
- `imp`
- `uploadData`
- `uploaddata`

## Required Parameters

- **-n, --filename** (string): Path to the CSV or Excel file to import
- **-t, --table** (string): Target database table. Can be specified as:
  - `SCHEMA.TABLE` (e.g., `MYSCHEMA.EMPLOYEES`)
  - Just `TABLE` (uses default schema)

## Optional Parameters

### Input/Output

- **-o, --output** (string): File format  
  - Choices: `csv` or `excel`  
  - Default: `csv`

- **-m, --matchMode** (string): Column matching strategy
  - **order**: Match columns by position (first file column → first table column)
  - **name**: Match columns by name (case-insensitive)
  - **auto**: Try name matching first, then fall back to position matching
  - Default: `auto`

### Data Control

- **--truncate**, **--tr**: Boolean flag to truncate the target table before import
  - Default: `false`
  - Use with caution - this will clear all existing data

### Excel-Specific Options

- **--worksheet**, **-w** (number): Worksheet number to import (1-based indexing)
  - Default: `1` (first worksheet)
  - Useful for workbooks with multiple sheets

- **--startRow**, **--sr** (number): Row number of the header (1-based)
  - Default: `1`
  - Define which row contains column headers

- **--skipEmptyRows**, **--se** (boolean): Skip empty rows in Excel
  - Default: `true`
  - A row is considered empty if all cells are null, undefined, or empty strings

- **--excelCacheMode**, **--ec** (string): Cache mode for Excel processing
  - **cache**: Caches shared strings and styles in memory (default, fastest)
  - **emit**: Streaming mode with lower memory usage
  - **ignore**: Minimal memory mode (skips shared strings)
  - Default: `cache`

### Performance Options

- **--batchSize**, **-b** (number): Number of rows per batch insert
  - Default: `1000`
  - Range: `1` to `10,000`
  - Larger batches: Higher throughput for small rows
  - Smaller batches: Better for memory-constrained systems

### Connection & Debugging

- **-p, --profile**: CDS profile for connections (defaults to auto-detection)

- **-a, --admin**: Connect via admin credentials (uses default-env-admin.json)

- **--debug**: Enable debug output for troubleshooting

## Column Matching Strategies

### Match Mode: "order"

Columns are matched by their position, regardless of column names:

```shell
File columns:  [ID, Name, Price]
Table columns: [PRODUCT_ID, PRODUCT_NAME, COST]
Mapping:       ID → PRODUCT_ID, Name → PRODUCT_NAME, Price → COST
```

Use this when file columns are in the same order as table columns but have different names.

### Match Mode: "name"  

Columns are matched strictly by name (case-insensitive):

```shell
File columns:  [ID, ProductName, Cost]
Table columns: [ID, PRODUCT_NAME, COST]
Mapping:       ID → ID, ProductName → PRODUCT_NAME, Cost → COST
```

All file columns must match table columns exactly (by name) or import will fail.

### Match Mode: "auto" (Default)

Attempts name-based matching first, then falls back to position matching for unmatched columns:

```shell
File columns:  [ID, ProductName, UnknownCol]
Table columns: [ID, PRODUCT_NAME, COST]
Mapping:       ID → ID, ProductName → PRODUCT_NAME, UnknownCol → COST
```

Most flexible approach - recommended for general use.

## File Format Support

### CSV Format Requirements

- Standard comma-separated values
- First row contains column headers
- Values can be quoted (supports embedded commas and quotes)
- Example:

  ```csv
  ID,Name,Description,Price
  1,Product A,"Contains, comma",100.00
  2,"Product ""B""",Details,200.00
  ```

### Excel Format Requirements

- .xlsx format (modern Excel)
- First worksheet is used by default (specify others with `--worksheet`)
- First row contains column headers (configurable with `--startRow`)
- Supports various data types (numbers, dates, text)

## Data Type Handling

The import command automatically converts data types based on the target table's column definitions:

- **Integer columns**: Parsed from string/number to integer
- **Decimal/Numeric columns**: Parsed from string/number to decimal
- **Date/Timestamp columns**: Converted from string to ISO format
- **Boolean columns**: "true", "1", "yes" → true; "false", "0", "no" → false
- **Text columns**: Stored as string (with quote escaping for SQL)
- **Null values**: Empty cells or "NULL" strings become NULL

## Output and Results

After import, the command displays a summary:

```shell
Import Summary
┌─────────────┬──────────────┬───────────────┬────────────────┬──────────────┐
│ table       │ rowsProcessed│ rowsInserted  │ rowsWithErrors │ matchMode    │
├─────────────┼──────────────┼───────────────┼────────────────┼──────────────┤
│ HR.EMPLOYEES│ 1000         │ 995           │ 5              │ auto         │
└─────────────┴──────────────┴───────────────┴────────────────┴──────────────┘
```

If there are errors, they are listed separately:

```shell
Import Errors
[
  { "row": 5, "error": "Value '32.5' cannot be converted to integer" },
  { "row": 142, "error": "Duplicate key violation on PRIMARY KEY" },
  ...
]
```

## Examples

### 1. Basic CSV Import (Default Behavior)

```bash
hana-cli import -n ./export/employees.csv -t HR.EMPLOYEES
```

- Reads employees.csv
- Uses auto column matching (name-based first)
- Inserts into HR.EMPLOYEES table

### 2. Excel File Import with Name Matching

```bash
hana-cli import -n ./data/sales.xlsx -o excel -t SALES_DATA -m name
```

- Reads sales.xlsx file
- Matches columns strictly by name (case-insensitive)
- Inserts into SALES_DATA table

### 3. Import by Column Order

```bash
hana-cli import -n ./backup/products.csv -t PRODUCTS -m order
```

- Matches columns by position
- Useful when file columns are in same order as table columns

### 4. Truncate Before Import

```bash
hana-cli import -n ./data/refresh.csv -t MASTER_DATA --truncate
```

- Clears all existing data in MASTER_DATA first
- Then imports new data from refresh.csv

### 5. With Admin Connection

```bash
hana-cli import -n ./export/users.csv -t USERS -a
```

- Uses credentials from default-env-admin.json

### 6. Excel with Multiple Worksheets

```bash
# Import from the second worksheet
hana-cli import -n report.xlsx -o excel -t MONTHLY_SALES --worksheet 2
```

### 7. Excel with Custom Header Row

```bash
# Headers on row 3 (skip title and subtitle rows)
hana-cli import -n report.xlsx -o excel -t SALES --startRow 3
```

### 8. Large File with Performance Optimization

```bash
# Optimize for large Excel file with memory efficiency
hana-cli import -n annual_report.xlsx -o excel -t ANNUAL_DATA \
  --excelCacheMode emit \
  --batchSize 500
```

### 9. High-Throughput CSV Import

```bash
# High-volume import with 5000 rows per batch
hana-cli import -n transactions.csv -t TRANSACTIONS \
  --batchSize 5000 \
  --truncate
```

### 10. Complex Excel with Multiple Options

```bash
# Import from specific worksheet with headers on row 3
hana-cli import -n monthly_report.xlsx -o excel -t METRICS \
  --worksheet 3 \
  --startRow 3 \
  --batchSize 2000 \
  --matchMode auto
```

## Workflow: Export and Re-import

The most common workflow is to first export data, then manipulate it and re-import:

```bash
# Export existing data to CSV
hana-cli querySimple -q "SELECT * FROM PRODUCTS" -n ./backup/products -o csv

# Edit the CSV file as needed (add/modify rows in Excel or text editor)

# Re-import the modified data back to the table
hana-cli import -n ./backup/products.csv -t PRODUCTS --truncate
```

## Complete Workflow Example

```bash
# 1. Export current data for backup
hana-cli querySimple -q "SELECT * FROM SALES" -n ./backup/sales_backup -o csv

# 2. Prepare new data (e.g., sales.csv edited in Excel)

# 3. Preview what columns will be matched
hana-cli import -n ./data/sales.csv -t SALES -m auto

# 4. Import the data with truncate to replace everything
hana-cli import -n ./data/sales.csv -t SALES --truncate

# 5. Verify the data was imported correctly
hana-cli querySimple -q "SELECT COUNT(*) as total FROM SALES" -o table
```

## Quick Start: Setting Up a Test Table

### 1. Create a test table in your HANA database

```sql
CREATE TABLE EMPLOYEES (
    ID INTEGER PRIMARY KEY,
    EmployeeID VARCHAR(10) UNIQUE,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Department VARCHAR(50),
    Salary DECIMAL(10,2),
    StartDate DATE
)
```

### 2. Prepare sample data

Create a CSV file (`employees.csv`):

```csv
ID,EmployeeID,FirstName,LastName,Department,Salary,StartDate
1,E001,John,Smith,Engineering,85000,2020-01-15
2,E002,Jane,Doe,Marketing,72000,2019-06-20
3,E003,Michael,Johnson,Sales,75000,2021-02-10
```

### 3. Import the data

```bash
hana-cli import -n ./employees.csv -t EMPLOYEES -m auto
```

### 4. Verify the import

```bash
hana-cli querySimple -q "SELECT COUNT(*) as imported_count FROM EMPLOYEES"
hana-cli querySimple -q "SELECT * FROM EMPLOYEES ORDER BY ID" -o table
```

## Performance Considerations

### Batch Size Selection

| Scenario | Recommended Batch Size | Rationale |
| --------- | --- | --- |
| Row size > 1KB | 500-1000 | Reduce memory pressure |
| Row size < 100 bytes | 5000-10000 | Maximize throughput |
| File size > 100MB | 500-1000 | Balance memory and performance |
| Memory-constrained (< 4GB) | 500 | Conservative approach |
| Standard systems (4-8GB) | 1000-2000 | Default recommendation |
| High-end systems (> 8GB) | 2000-5000 | Aggressive optimization |

### Excel Cache Mode Selection

| Mode | Performance | Memory | Best For |
| ---- | --- | --- | --- |
| `cache` (default) | Fastest | Higher | Most files, < 100MB |
| `emit` | Slower | Lower | Large files > 100MB |
| `ignore` | Variable | Lowest | Extreme memory constraints |

### Example Optimizations by Scenario

#### Standard Import

```bash
hana-cli import -n data.csv -t TABLE
```

#### Large CSV File (100k+ rows)

```bash
hana-cli import -n large_data.csv -t SALES --batchSize 5000
```

#### Large Excel File (100MB+)

```bash
hana-cli import -n big_report.xlsx -o excel -t DATA \
  --excelCacheMode emit \
  --batchSize 1000 \
  --skipEmptyRows true
```

#### Memory-Constrained System

```bash
hana-cli import -n data.xlsx -o excel -t TABLE \
  --excelCacheMode emit \
  --batchSize 500
```

## Error Handling

The command handles various error scenarios gracefully:

- **File not found**: Stops with clear error message
- **Invalid file format**: Displays format-specific error
- **No data in file**: Notifies user that file is empty
- **Table not found**: Shows SCHEMA and TABLE name in error
- **Column mismatch**: Reports when columns cannot be matched
- **Data type errors**: Continues with next row, logs error for review
- **Database constraints**: Reports constraint violations
- **Connection errors**: Handled by base database client

### Troubleshooting Guide

#### Command not found

Ensure the hana-cli package is installed and in your PATH:

```bash
npm install -g hana-cli
```

#### Connection failed

Verify database connection settings:

```bash
hana-cli connect -n [HOST]:[PORT] -u [USER] -p [PASSWORD]
```

#### Column mismatch errors

Try different match modes or verify file columns match table columns:

```bash
# Try name matching instead of order
hana-cli import -n file.csv -t TABLE -m name

# Or use order matching if appropriate
hana-cli import -n file.csv -t TABLE -m order
```

#### Permission denied

Verify you have appropriate privileges on the target table:

```bash
hana-cli inspectTable -t [SCHEMA].[TABLE]
```

#### Out of Memory errors

Reduce batch size and use emit mode for Excel:

```bash
hana-cli import -n data.xlsx -o excel -t TABLE \
  --excelCacheMode emit \
  --batchSize 500
```

#### Wrong data imported

Check worksheet number and start row:

```bash
# List available worksheets
hana-cli import -n file.xlsx --worksheet 1 --debug
hana-cli import -n file.xlsx --worksheet 2 --debug
```

## Permission Requirements

- Read access to the source file
- Write/Insert privileges on target table
- If using `--truncate`: Delete privileges on target table

## Tips & Best Practices

1. **Always backup**: Export data before a truncate/import operation
2. **Test first**: Use a development table to test imports before production
3. **Use auto matching**: Default "auto" mode works well in most cases
4. **Quote values**: Use quotes in CSV for values containing commas or special characters
5. **Validate data**: Check import summary for errors before proceeding
6. **Consistent format**: Ensure file format matches what you specify (`-o csv` vs `-o excel`)
7. **Reserved words**: Escape SQL reserved words in table/schema names with quotes
8. **Batch size tuning**: Start with default 1000 and adjust based on your data size and memory
9. **Excel optimization**: Use `emit` mode for files larger than 100MB
10. **Skip validation**: Use `--skipEmptyRows` to avoid inserting empty rows into tables with NOT NULL constraints

## Related Commands

- **querySimple**: Export data from tables to CSV/Excel/JSON

  ```bash
  hana-cli querySimple -q "SELECT * FROM TABLE" -o csv -n export
  ```

- **connect**: Manage database connections

  ```bash
  hana-cli connect -n HOST:PORT -u USER -p PASSWORD
  ```

- **inspectTable**: View table metadata and column information

  ```bash
  hana-cli inspectTable -t SCHEMA.TABLE
  ```

## See Also

- [Category: Data Tools](../index.md#-data-tools)
- [All Commands A-Z](../all-commands.md)
- [Export Command](./export.md)
- [Data Sync Command](./data-sync.md)
