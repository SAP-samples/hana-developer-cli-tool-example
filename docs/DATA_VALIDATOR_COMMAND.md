# Data Validator Command

## Overview

The `dataValidator` command validates data in HANA tables against business rules and constraints. It helps identify data quality issues by applying various validation rules to specified columns.

## Command Aliases

- `dval`
- `validateData`
- `dataValidation`

## Usage

```bash
hana-cli dataValidator [options]
hana-cli dval --table EMPLOYEES --rules "name:required;email:email"
```

## Options

| Option | Alias | Type | Default | Description |
| -------- | ------- | -------- | --------- | ------------- |
| `--table` | `-t` | string | required | Name of the table to validate |
| `--schema` | `-s` | string | optional | Schema name (uses current if omitted) |
| `--rules` | `-r` | string | required | Validation rules in format: `column:rule1,rule2;column2:rule3` |
| `--rulesFile` | `-rf` | string | optional | Path to file containing validation rules |
| `--columns` | `-c` | string | optional | Comma-separated list of specific columns to validate |
| `--output` | `-o` | string | optional | Output file path for the report |
| `--format` | `-f` | string | summary | Report format: `json`, `csv`, `summary`, `detailed` |
| `--limit` | `-l` | number | 10000 | Maximum number of rows to validate |
| `--stopOnFirstError` | `-sfe` | boolean | false | Stop validation after first error |
| `--timeout` | `-to` | number | 3600 | Operation timeout in seconds |
| `--profile` | `-p` | string | optional | Connection profile to use |

## Validation Rules

Rules are specified in the format: `column:rule1,rule2;column2:rule3`

Supported rules:

- `required` - Column must not be null or empty
- `numeric` - Column must contain numeric values
- `email` - Column must contain valid email addresses
- `date` - Column must contain valid dates
- `length:min:max` - Column value length must be between min and max
- `pattern:regex` - Column must match the specified regex pattern
- `range:min:max` - Numeric column must be between min and max

## Examples

### Simple validation

```bash
hana-cli dataValidator --table EMPLOYEES --schema HR --rules "name:required;salary:numeric"
```

### Complex validation with multiple rules

```bash
hana-cli dataValidator --table CUSTOMERS \
  --rules "email:required,email;firstName:required,length:1:50;age:numeric,range:18:120" \
  --format json \
  --output validation-report.json
```

### Validation from file

```bash
hana-cli dataValidator --table ORDERS --rulesFile ./validation-rules.txt --limit 50000
```

### Stop on first error

```bash
hana-cli dataValidator --table PRODUCTS --rules "sku:required;price:numeric" --stopOnFirstError
```

## Rules File Format

Create a text file with validation rules, one rule per line or use semicolons to separate:

```bash
email:required,email
firstName:required,length:1:50
lastName:required,length:1:50
age:numeric,range:18:120
zipcode:pattern:^\d{5}(-\d{4})?$
```

## Output Formats

### Summary (default)

```bash
Data Validation Report
=======================

Total Rows:  1000
Valid Rows:  950
Invalid Rows: 50
Total Errors: 75

Errors:
  Row 15, Column email: Column email must be valid email
  Row 27, Column name: Column name is required
  ...
```

### JSON

```json
{
  "totalRows": 1000,
  "validRows": 950,
  "invalidRows": 50,
  "totalErrors": 75,
  "errors": [
    {
      "rowNumber": 15,
      "column": "email",
      "value": "invalid-email",
      "rule": "email",
      "error": "Column email must be valid email"
    }
  ]
}
```

### CSV

```csv
Row,Column,Value,Rule,Error
15,"email","invalid@email","email","Column email must be valid email"
27,"name","","required","Column name is required"
```

## Return Codes

- `0` - Validation completed successfully
- `1` - Validation error or database connection issue

## Performance Tips

1. Use `--limit` parameter to validate a subset of rows first
2. Use `--stopOnFirstError` to quickly identify issues
3. Specify only required columns with `--columns` to reduce processing
4. Use `--timeout` to prevent long-running validations

## Integration with CI/CD

Use the JSON format output for automated validation in pipelines:

```bash
hana-cli dataValidator --table EMPLOYEES \
  --rules "email:email" \
  --format json \
  --output validation.json

# Check result
if [ -s validation.json ]; then
  echo "Validation errors found"
  exit 1
fi
```

## Related Commands

- `dataProfile` - Generate statistical profiles of table data
- `dataDiff` - Compare data between two tables
- `duplicateDetection` - Find duplicate records
