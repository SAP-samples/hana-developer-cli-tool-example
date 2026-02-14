# Import Command Documentation

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

## Options

### Required Parameters

- **-n, --filename** (string): Path to the CSV or Excel file to import
- **-t, --table** (string): Target database table. Can be specified as:
  - `SCHEMA.TABLE` (e.g., `MYSCHEMA.EMPLOYEES`)
  - Just `TABLE` (uses default schema)

### Optional Parameters

- **-o, --output** (string): File format  
  - Choices: `csv` or `excel`  
  - Default: `csv`

- **-m, --matchMode** (string): Column matching strategy
  - **order**: Match columns by position (first file column → first table column)
  - **name**: Match columns by name (case-insensitive)
  - **auto**: Try name matching first, then fall back to position matching
  - Default: `auto`

- **--truncate, --tr**: Boolean flag to truncate the target table before import
  - Default: `false`
  - Use with caution - this will clear all existing data

- **-p, --profile**: CDS profile for connections (defaults to auto-detection)

- **-a, --admin**: Connect via admin credentials (uses default-env-admin.json)

- **--debug**: Enable debug output for troubleshooting

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

## Workflow: Export and Re-import

The most common workflow is to first export data, then manipulate it and re-import:

```bash
# Export existing data to CSV
hana-cli querySimple -q "SELECT * FROM PRODUCTS" -n ./backup/products -o csv

# Edit the CSV file as needed (add/modify rows in Excel or text editor)

# Re-import the modified data back to the table
hana-cli import -n ./backup/products.csv -t PRODUCTS --truncate
```

## Column Matching Strategies

### Match Mode: "order"

Columns are matched by their position, regardless of column names:

```shell
File columns:  [ID, Name, Price]
Table columns: [PRODUCT_ID, PRODUCT_NAME, COST]
Mapping:       ID → PRODUCT_ID, Name → PRODUCT_NAME, Price → COST
```

### Match Mode: "name"  

Columns are matched strictly by name (case-insensitive):

```shell
File columns:  [ID, ProductName, Cost]
Table columns: [ID, PRODUCT_NAME, COST]
Mapping:       ID → ID, ProductName → PRODUCT_NAME, Cost → COST
Unmatched:     None (will fail if any column cannot be matched)
```

### Match Mode: "auto" (Default)

Attempts name-based matching first, then falls back to position matching for unmatched columns:

```shell
File columns:  [ID, ProductName, UnknownCol]
Table columns: [ID, PRODUCT_NAME, COST]
Mapping:       ID → ID, ProductName → PRODUCT_NAME, UnknownCol → COST
```

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
- First worksheet is used (only one sheet)
- First row contains column headers
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

## Permission Requirements

- Read access to the source file
- Write/Insert privileges on target table
- If using `--truncate`: Delete privileges on target table

## Performance Considerations

- Imports are row-by-row for better error handling
- Large files (10,000+ rows) may take several minutes
- Consider batch processing for very large imports (100,000+ rows)
- Use `--truncate` instead of manual DELETE for faster clearing

## Troubleshooting

### Command not found

Ensure the hana-cli package is installed and in your PATH:

```bash
npm install -g hana-cli
```

### Connection failed

Verify database connection settings:

```bash
hana-cli connect -n [HOST]:[PORT] -u [USER] -p [PASSWORD]
```

### Column mismatch errors

Try different match modes or verify file columns match table columns:

```bash
# Try name matching instead of order
hana-cli import -n file.csv -t TABLE -m name

# Or use order matching if appropriate
hana-cli import -n file.csv -t TABLE -m order
```

### Permission denied

Verify you have appropriate privileges on the target table:

```bash
hana-cli inspectTable -t [SCHEMA].[TABLE]
```

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

## Tips & Best Practices

1. **Always backup**: Export data before a truncate/import operation
2. **Test first**: Use a development table to test imports before production
3. **Use auto matching**: Default "auto" mode works well in most cases
4. **Quote values**: Use quotes in CSV for values containing commas or special characters
5. **Validate data**: Check import summary for errors before proceeding
6. **Consistent format**: Ensure file format matches what you specify (-o csv vs -o excel)
7. **Reserved words**: Escape SQL reserved words in table/schema names with quotes

## Example Complete Workflow

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
