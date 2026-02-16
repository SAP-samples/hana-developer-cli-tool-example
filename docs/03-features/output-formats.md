# Output Formats

HANA CLI supports multiple output formats for flexibility and integration.

## Supported Formats

### Text (Default)

Human-readable table format:

```bash
hana-cli dataProfile -s HR -t EMPLOYEES
```

**Output:**
```
Column Name        Type       Nulls  Distinct  Min  Max
ID                 INT        0      1000      1    1000
FIRST_NAME         STRING     5      950       -    -
SALARY             DECIMAL    10     800       0    500000
```

### JSON

Perfect for programmatic use:

```bash
hana-cli dataProfile -s HR -t EMPLOYEES --output json
```

**Output:**
```json
{
  "schema": "HR",
  "table": "EMPLOYEES",
  "rows": 1000,
  "columns": [
    {
      "name": "ID",
      "type": "INT",
      "nulls": 0,
      "distinct": 1000
    }
  ]
}
```

### CSV

Spreadsheet-compatible:

```bash
hana-cli export -s HR -t EMPLOYEES --output csv -o employees.csv
```

### Prettified JSON (Pretty)

Formatted JSON with indentation:

```bash
hana-cli dataProfile -s HR -t EMPLOYEES --output pretty
```

## Using Output Formats

### Exporting to File

```bash
# Export JSON
hana-cli dataProfile -s HR -t EMPLOYEES --output json > report.json

# Export CSV
hana-cli export -s HR -t EMPLOYEES -o data.csv

# Export with specific filename and format
hana-cli export -s SCHEMA -t TABLE -o backup.json --format json
```

### Piping to Other Tools

```bash
# Parse with jq
hana-cli dataProfile -s HR -t EMPLOYEES --output json | jq '.columns[]'

# Filter with grep
hana-cli tables -s HR --output csv | grep -i employee

# Process with AWK
hana-cli export -s HR -t EMPLOYEES --output csv | awk -F',' '{print $2}'
```

### Processing in Scripts

```bash
#!/bin/bash

# Get data as JSON and process
data=$(hana-cli export -s HR -t EMPLOYEES --output json)
echo "Row count: $(echo $data | jq '.total')"

# Export CSV for analysis
hana-cli dataProfile -s HR -t EMPLOYEES --output csv > profile.csv
echo "Analysis saved to profile.csv"
```

## Format Selection Guide

| Use Case | Format | Command |
| -------- | ------ | ------- |
| Manual inspection | Text | (default) |
| Scripting/automation | JSON | `--output json` |
| Spreadsheet analysis | CSV | `--output csv` |
| API responses | JSON | `--output json` |
| Human reports | Pretty | `--output pretty` |

## Format-Specific Options

### CSV Options

```bash
# With headers (default: true)
hana-cli export -s SCHEMA -t TABLE --header true

# Without headers
hana-cli export -s SCHEMA -t TABLE --header false

# Custom delimiter
hana-cli export -s SCHEMA -t TABLE --delimiter ';'

# Custom encoding
hana-cli export -s SCHEMA -t TABLE --encoding 'utf-16'
```

### JSON Options

```bash
# Pretty-printed (compact by default)
hana-cli dataProfile -s SCHEMA -t TABLE --output json --pretty

# With metadata
hana-cli export -s SCHEMA -t TABLE --output json --metadata
```

## See Also

- [CLI Features](./cli-features.md)
- [API Reference](/04-api-reference/)
