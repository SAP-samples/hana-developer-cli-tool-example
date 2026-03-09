# Output Formats

HANA CLI supports multiple output formats for flexibility and integration with external tools.

## Output Format Variations by Command

Different commands handle output formats differently:

- **[inspectTable](../02-commands/object-inspection/inspect-table.md)**: Uses `--output` to specify format type (e.g., `json`, `yaml`, `sql`, `cds`)
- **[export](../02-commands/data-tools/export.md)**: Uses `--output` (or `-o`) for file path and `--format` for format type
- **[dataProfile](../02-commands/analysis-tools/data-profile.md)**: Uses `--output` for file path (optional) and `--format` for format type

Always check the command's help documentation (`hana-cli <command> --help`) to understand its specific output options.

## Supported Formats

### Table (Default)

Most commands default to human-readable table format for console output:

```bash
hana-cli tables -s HR
```

**Example Output:**

```text
Table Name         Type     Rows    Comment
EMPLOYEES          TABLE    1000    Employee records
DEPARTMENTS        TABLE    50      Department info
SALARIES           TABLE    5000    Salary history
```

This format is optimized for terminal viewing and quick inspection.

### JSON

Structured data format ideal for programmatic processing:

```bash
hana-cli dataProfile -s HR -t EMPLOYEES --format json
```

**Example Output:**

```json
{
  "schema": "HR",
  "table": "EMPLOYEES",
  "rowCount": 1000,
  "columnCount": 10,
  "columns": [
    {
      "name": "ID",
      "type": "INTEGER",
      "nullCount": 0,
      "distinctCount": 1000,
      "nullPercentage": 0
    }
  ]
}
```

Supported by: `dataProfile`, `export`, `inspectTable`, and others.

### CSV

Comma-separated values format compatible with spreadsheet applications:

```bash
hana-cli export -s HR -t EMPLOYEES --format csv -o employees.csv
```

**Example Output:**

```csv
ID,FIRST_NAME,LAST_NAME,EMAIL,HIRE_DATE,SALARY
1,John,Doe,john.doe@example.com,2020-01-15,75000
2,Jane,Smith,jane.smith@example.com,2019-03-22,82000
3,Mike,Johnson,mike.j@example.com,2021-06-10,68000
```

Supported by: `export`, `dataProfile`.

### Excel

Modern XLSX format with automatic column formatting:

```bash
hana-cli export -s HR -t EMPLOYEES --format excel -o employees.xlsx
```

Creates a formatted Excel workbook with proper data types preserved. Supported by: `export`.

### Other Formats

The `inspectTable` command supports many additional formats for schema conversion:

- **SQL**: `--output sql` (CREATE TABLE statement)
- **CDS**: `--output cds` (SAP CAP entity definition)
- **YAML**: `--output yaml` (YAML representation)
- **OpenAPI**: `--output openapi` (OpenAPI schema)
- **GraphQL**: `--output graphql` (GraphQL type definition)
- **HDI**: `--output hdbtable` (HANA HDI table artifact)
- And more...

See [inspectTable documentation](../02-commands/object-inspection/inspect-table.md) for the complete list.

## Using Output Formats

### Exporting to File

```bash
# Export table data to CSV file
hana-cli export -t EMPLOYEES -o data.csv --format csv

# Export to JSON file
hana-cli export -t EMPLOYEES -o data.json --format json

# Export to Excel with all columns
hana-cli export -t EMPLOYEES -o report.xlsx --format excel

# Save data profile analysis
hana-cli dataProfile -t EMPLOYEES --format json -o profile.json
```

### Piping to Other Tools

```bash
# Parse with jq
hana-cli dataProfile -t EMPLOYEES --format json | jq '.columns[] | select(.nullPercentage > 10)'

# Get table structure as SQL
hana-cli inspectTable -t EMPLOYEES --output sql > create_table.sql

# Convert to CDS and save
hana-cli inspectTable -t EMPLOYEES --output cds > employees.cds
```

### Processing in Scripts

**Bash Example:**

```bash
#!/bin/bash

# Export data and count rows
hana-cli export -t EMPLOYEES --format json -o employees.json
row_count=$(jq '. | length' employees.json)
echo "Exported $row_count employee records"

# Profile data and check quality
hana-cli dataProfile -t EMPLOYEES --format json -o profile.json
null_columns=$(jq '.columns[] | select(.nullPercentage > 50) | .name' profile.json)
echo "Columns with >50% nulls: $null_columns"
```

**PowerShell Example:**

```powershell
# Export and parse JSON
hana-cli export -t EMPLOYEES --format json -o employees.json
$data = Get-Content employees.json | ConvertFrom-Json
Write-Host "Total records: $($data.Count)"

# Generate profile report
hana-cli dataProfile -t EMPLOYEES --format csv -o profile.csv
Import-Csv profile.csv | Where-Object { $_.nullPercentage -gt 10 }
```

## Format Selection Guide

| Use Case | Recommended Format | Example Command |
| -------- | ------------------ | --------------- |
| Manual inspection | Table (default) | `hana-cli tables -s HR` |
| Scripting/automation | JSON | `hana-cli dataProfile -t DATA --format json` |
| Spreadsheet analysis | CSV or Excel | `hana-cli export -t DATA -o file.xlsx --format excel` |
| Schema conversion | SQL, CDS, etc. | `hana-cli inspectTable -t DATA --output cds` |
| API integration | JSON | `hana-cli dataProfile -t DATA --format json` |
| Business reporting | Excel | `hana-cli export -t SALES -o report.xlsx --format excel` |

## Format-Specific Options

### CSV Options

The `export` command provides several CSV customization options:

```bash
# Export with headers (default behavior)
hana-cli export -t EMPLOYEES -o data.csv --format csv

# Export without headers
hana-cli export -t EMPLOYEES -o data.csv --format csv --includeHeaders false

# Custom delimiter (semicolon for European Excel compatibility)
hana-cli export -t EMPLOYEES -o data.csv --format csv --delimiter ';'

# Custom delimiter (tab-separated)
hana-cli export -t EMPLOYEES -o data.tsv --format csv --delimiter '\t'

# Handle NULL values with custom replacement
hana-cli export -t EMPLOYEES -o data.csv --format csv --nullValue 'N/A'
```

**CSV Encoding:**

- All CSV exports use UTF-8 encoding by default
- Fully compatible with Unicode characters
- Works with modern spreadsheet applications (Excel 2016+, LibreOffice, Google Sheets)
- For older Excel versions, use Excel import wizard and select UTF-8 encoding

### Excel Options

```bash
# Basic Excel export
hana-cli export -t EMPLOYEES -o report.xlsx --format excel

# Excel with NULL value handling
hana-cli export -t EMPLOYEES -o report.xlsx --format excel --nullValue '-'

# Excel with row limit
hana-cli export -t LARGE_TABLE -o sample.xlsx --format excel --limit 100000
```

Excel exports automatically format columns based on data types (numbers, dates, text).

### JSON Options

```bash
# Output JSON to console
hana-cli dataProfile -t EMPLOYEES --format json

# Save JSON to file
hana-cli dataProfile -t EMPLOYEES --format json -o profile.json

# Export data as JSON
hana-cli export -t EMPLOYEES -o data.json --format json
```

JSON output is formatted with indentation for readability.

## Command-Specific Format Support

### dataProfile

**Format option:** `--format <type>`

- `summary` (default): Human-readable table format with statistics
- `csv`: Comma-separated values with column metrics
- `json`: Structured JSON with full profiling data

**Output option:** `--output <filepath>` (optional)

```bash
# Display summary to console
hana-cli dataProfile -t EMPLOYEES --format summary

# Save JSON profile to file
hana-cli dataProfile -t EMPLOYEES --format json -o profile.json
```

### export

**Format option:** `--format <type>`

- `csv` (default): Comma-separated values
- `json`: JSON array of row objects
- `excel`: XLSX workbook with formatting

**Output option:** `--output <filepath>` or `-o <filepath>` (required in non-interactive mode)

```bash
# Export to CSV
hana-cli export -t EMPLOYEES -o data.csv --format csv

# Export to Excel
hana-cli export -t EMPLOYEES -o data.xlsx --format excel

# Export to JSON
hana-cli export -t EMPLOYEES -o data.json --format json
```

### inspectTable

**Format option:** `--output <type>` (different from other commands!)

- `tbl` (default): Human-readable table structure
- `sql`: CREATE TABLE SQL statement
- `json`: JSON metadata
- `yaml`: YAML representation
- `cds`: SAP CAP CDS entity
- `hdbtable`: HANA HDI table artifact
- Plus many more (see [inspectTable docs](../02-commands/object-inspection/inspect-table.md))

```bash
# Display structure in table format
hana-cli inspectTable -t EMPLOYEES --output tbl

# Generate SQL DDL
hana-cli inspectTable -t EMPLOYEES --output sql

# Convert to CDS entity
hana-cli inspectTable -t EMPLOYEES --output cds
```

Note that `inspectTable` uses `--output` for format type (not file path), which differs from `export` and `dataProfile`.

## Common Pitfalls

### Using `-o` for Format Instead of File Path

**Incorrect:**

```bash
hana-cli export -t DATA -o json  # This creates a file named "json"
```

**Correct:**

```bash
hana-cli export -t DATA -o data.json --format json
```

### Mixing Up Command Options

- `export` and `dataProfile`: Use `--format` for format type and `-o`/`--output` for file path
- `inspectTable`: Uses `--output` for format type (no file path option, use redirection instead)

### Forgetting to Specify File Extension

While the CLI may auto-generate extensions, it's clearer to be explicit:

```bash
# Explicit and clear
hana-cli export -t DATA -o employees.xlsx --format excel

# May work but less clear
hana-cli export -t DATA -o employees --format excel
```

## See Also

- [export command](../02-commands/data-tools/export.md)
- [dataProfile command](../02-commands/analysis-tools/data-profile.md)
- [inspectTable command](../02-commands/object-inspection/inspect-table.md)
- [CLI Features](./cli-features.md)
