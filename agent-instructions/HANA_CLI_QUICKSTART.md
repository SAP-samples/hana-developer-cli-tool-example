# hana-cli Quick Start Guide

> Generated from hana-cli v4.202603.2 on 2026-03-17

## Install

```bash
npm install -g hana-cli
```

## Connect to Your Database

```bash
# Interactive connection wizard — prompts for host, port, user, password
hana-cli connect

# Or connect using a BTP service key file
hana-cli connectViaServiceKey

# Verify your connection
hana-cli status
```

## Essential Commands

### `hana-cli status`
Check current database user and connection
Aliases: `s`, `whoami`

```bash
hana-cli status
```

### `hana-cli connect`
Configure database connection
Aliases: `c`, `login`

```bash
hana-cli connect [user] [password]
```

### `hana-cli tables`
Find tables in schema
Aliases: `t`, `listTables`, `listtables`

```bash
hana-cli tables [schema] [table]
```

### `hana-cli inspectTable`
Inspect table structure and properties
Aliases: `it`, `table`, `insTbl`, `inspecttable`, `inspectable`

```bash
hana-cli inspectTable [schema] [table]
```

### `hana-cli views`
List views
Aliases: `v`, `listViews`, `listviews`

```bash
hana-cli views [schema] [view]
```

### `hana-cli import`
Load data from CSV/Excel
Aliases: `imp`, `uploadData`, `uploaddata`

```bash
hana-cli import
```

### `hana-cli export`
Extract table data to file
Aliases: `exp`, `downloadData`, `downloaddata`

```bash
hana-cli export
```

### `hana-cli querySimple`
Run simple queries
Aliases: `qs`, `querysimple`

```bash
hana-cli querySimple
```

### `hana-cli healthCheck`
Perform system health check
Aliases: `health`, `h`

```bash
hana-cli healthCheck
```

### `hana-cli schemas`
List all schemas
Aliases: `sch`, `getSchemas`, `listSchemas`, `s`

```bash
hana-cli schemas [schema]
```

## Common Workflows

### Explore a Schema
```bash
hana-cli schemas                                    # List schemas
hana-cli tables --schema MY_SCHEMA                  # List tables
hana-cli inspectTable --table MY_TABLE --schema MY_SCHEMA  # Column details
```

### Import Data
```bash
hana-cli import --filename data.csv --table MY_TABLE --schema MY_SCHEMA --dryRun  # Preview
hana-cli import --filename data.csv --table MY_TABLE --schema MY_SCHEMA           # Execute
```

### Export Data
```bash
hana-cli export --table MY_TABLE --schema MY_SCHEMA --filename export.csv
```

### Run a Query
```bash
hana-cli querySimple --query "SELECT TOP 10 * FROM MY_SCHEMA.MY_TABLE"
```

### Check System Health
```bash
hana-cli healthCheck
hana-cli systemInfo
```

## Getting Help

```bash
hana-cli --help         # List all commands
hana-cli <cmd> --help   # Help for specific command
hana-cli interactive    # Interactive menu mode
```
