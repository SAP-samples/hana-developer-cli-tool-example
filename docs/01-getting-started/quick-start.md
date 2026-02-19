# Quick Start

Get up and running with hana-cli in 5 minutes.

## Step 1: Verify Installation

```bash
hana-cli --version
# Output: hana-cli/x.x.x
```

## Step 2: Check Your Connection

Ensure you have a `default-env.json` file with HANA credentials (see [Configuration](./configuration.md)).

Test the connection:

```bash
hana-cli alerts -h
```

If this shows alerts without errors, you're connected!

## Step 3: Try Basic Commands

### View database information

```bash
hana-cli systemInfo
```

### List tables in the current schema

```bash
hana-cli tables 
```

### Profile data in a table

```bash
hana-cli dataProfile -t EMPLOYEES
```

## Step 4: Import Data

Create a CSV file (`data.csv`):

```csv
ID,Name,Age
1,Alice,30
2,Bob,25
3,Charlie,35
```

Import into a table:

```bash
hana-cli import -f data.csv -s MYSCHEMA -t EMPLOYEES -m name
```

## Step 5: Export Data

Export table data to CSV:

```bash
hana-cli export -s MYSCHEMA -t EMPLOYEES -o output.csv
```

## Common Tasks

### Compare Two Schemas

```bash
hana-cli compareSchema -s SCHEMA1 -t SCHEMA2
```

### Analyze Data Quality

```bash
hana-cli dataValidator -s MYSCHEMA -t EMPLOYEES
```

### Find Duplicates

```bash
hana-cli duplicateDetection -s MYSCHEMA -t EMPLOYEES -c ID
```

### Get Data Lineage

```bash
hana-cli dataLineage -s MYSCHEMA -t EMPLOYEES
```

## Getting Help

Get help for any command:

```bash
# General help
hana-cli --help

# Command-specific help
hana-cli import --help
hana-cli export --help
hana-cli dataProfile --help
```

## Next Steps

- [Explore all Commands](/02-commands/)
- [Features & Integration](/03-features/)
- [Full API Reference](/04-api-reference/)
- [Configuration Guide](./configuration.md)

## Troubleshooting

Having issues? See the [Troubleshooting Guide](../troubleshooting.md)