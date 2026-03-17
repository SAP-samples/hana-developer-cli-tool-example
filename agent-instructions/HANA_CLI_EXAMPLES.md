# hana-cli — Real-World Examples

> Auto-generated from hana-cli command examples and parameter presets.

## Command Examples

### `compareSchema`

**Compare two schemas** — Find differences between source and target schemas

```bash
hana-cli compareSchema --sourceSchema "DEV_SCHEMA" --targetSchema "PROD_SCHEMA"
```
Expected: Detailed diff showing added, modified, and deleted objects

### `dataProfile`

**Profile complete table** — Analyze data distribution and statistics

```bash
hana-cli dataProfile --table "SALES_DATA" --schema "ANALYTICS"
```
> May take several minutes for large tables
Expected: Statistics for each column: distinct values, nulls, min/max, etc.

**Profile specific columns** — Analyze only selected columns

```bash
hana-cli dataProfile --table "CUSTOMERS" --schema "SALES" --columns ["COUNTRY","REGION","SEGMENT"]
```
> Faster than profiling entire table
Expected: Statistics for specified columns only

### `dataValidator`

**Validate with rules file** — Apply validation rules from JSON file

```bash
hana-cli dataValidator --table "CUSTOMERS" --schema "SALES" --rulesFile "validation_rules.json"
```
> Rules file defines constraints like required fields, ranges, patterns
Expected: List of validation failures with row numbers

### `duplicateDetection`

**Find duplicates across all columns** — Identify duplicate records

```bash
hana-cli duplicateDetection --table "CUSTOMERS" --schema "SALES"
```
Expected: List of duplicate records grouped by matching values

**Find duplicates by key columns** — Check for duplicates using specific columns

```bash
hana-cli duplicateDetection --table "ORDERS" --schema "SALES" --keyColumns ["ORDER_ID","LINE_ITEM"]
```
> More precise than checking all columns
Expected: Duplicates based on specified key columns

### `expensiveStatements`

**Find slow queries** — Identify expensive SQL statements

```bash
hana-cli expensiveStatements --limit 10
```
> Shows statements from SQL plan cache
Expected: Top expensive queries with execution metrics

### `export`

**Basic table export** — Export entire table to CSV

```bash
hana-cli export --table "CUSTOMERS" --schema "SALES" --filename "customers_export.csv"
```
Expected: CSV file with all table data

**Export with filter** — Export subset of data using WHERE clause

```bash
hana-cli export --table "ORDERS" --schema "SALES" --filename "recent_orders.csv" --where "ORDER_DATE >= '2025-01-01'"
```
> Use SQL WHERE syntax to filter rows
Expected: CSV file with filtered data only

**Export to Excel** — Export table to Excel format

```bash
hana-cli export --table "SALES_DATA" --schema "ANALYTICS" --filename "sales_report.xlsx"
```
> Automatically formats as Excel if filename ends in .xlsx
Expected: Excel file with formatted data

### `healthCheck`

**System health check** — Comprehensive system health assessment

```bash
hana-cli healthCheck 
```
Expected: Health status with warnings and recommendations

### `import`

**Basic CSV import** — Simplest import - auto-detects column mapping

```bash
hana-cli import --filename "data.csv" --table "MY_TABLE" --schema "MY_SCHEMA"
```
> Use this for straightforward imports where file columns match table columns
Expected: Success message with number of rows imported

**Import with dry run** — Preview import without committing to database

```bash
hana-cli import --filename "data.csv" --table "MY_TABLE" --schema "MY_SCHEMA" --dryRun
```
> Always recommended to run this first to validate data and mappings
Expected: Preview of what would be imported, including any errors

**Import with error handling** — Continue import even if some rows fail

```bash
hana-cli import --filename "data.csv" --table "MY_TABLE" --schema "MY_SCHEMA" --skipWithErrors --maxErrorsAllowed 100
```
> Useful for large imports where you want to skip bad rows and review later
Expected: Success with count of imported rows and skipped errors

**Large file import** — Import large file with memory protection

```bash
hana-cli import --filename "large_data.csv" --table "BIG_TABLE" --schema "MY_SCHEMA" --maxFileSizeMB 500 --timeoutSeconds 3600
```
> Prevents memory issues and timeout errors with large files
Expected: Success message after extended processing time

**Import with column name matching** — Match file columns to table columns by name (not position)

```bash
hana-cli import --filename "data.csv" --table "MY_TABLE" --schema "MY_SCHEMA" --matchMode "name"
```
> Use when file column order differs from table column order
Expected: Success with columns matched by header names

### `inspectTable`

**View table structure** — Get complete table metadata including columns and constraints

```bash
hana-cli inspectTable --table "CUSTOMERS" --schema "SALES"
```
Expected: Detailed table structure with columns, types, keys, and indexes

### `memoryAnalysis`

**Analyze memory usage** — View memory consumption by tables

```bash
hana-cli memoryAnalysis 
```
> Identifies memory-intensive tables
Expected: List of tables sorted by memory usage

### `schemaClone`

**Clone schema structure** — Copy schema structure without data

```bash
hana-cli schemaClone --sourceSchema "PROD_SCHEMA" --targetSchema "TEST_SCHEMA"
```
> Clones tables, views, stored procedures, but not data
Expected: New schema with identical structure

### `status`

**Check connection** — Verify database connection and view current user

```bash
hana-cli status 
```
> First command to run when connecting
Expected: Current user, roles, and connection details

### `tableCopy`

**Copy table with data** — Clone table including data

```bash
hana-cli tableCopy --sourceTable "CUSTOMERS" --sourceSchema "PROD" --targetTable "CUSTOMERS_BACKUP" --targetSchema "BACKUP"
```
Expected: New table with copied data

### `tables`

**List all tables in schema** — View all tables in a specific schema

```bash
hana-cli tables --schema "MY_SCHEMA"
```
Expected: Table with all table names, types, and sizes

**Search for tables by pattern** — Find tables matching a name pattern

```bash
hana-cli tables --schema "MY_SCHEMA" --table "SALES%"
```
> Use % as wildcard, similar to SQL LIKE
Expected: Filtered list of matching tables

## Parameter Presets

Pre-configured parameter combinations for common scenarios.

### `compareSchema` Presets

**standard-compare** — Compare two schemas
When to use: Check differences between environments

```bash
hana-cli compareSchema --sourceSchema <source-schema> --targetSchema <target-schema>
```

### `dataProfile` Presets

**full-profile** — Profile all columns
When to use: Initial data exploration

```bash
hana-cli dataProfile --table <table-name> --schema <schema-name>
```

**quick-profile** — Profile specific columns only
When to use: Large tables where full profile is too slow

```bash
hana-cli dataProfile --table <table-name> --schema <schema-name> --columns <column1>,<column2>
```

### `dataValidator` Presets

**default-rules** — Generic starter rules based on common column patterns
When to use: Quick validation setup before refining rules

```bash
hana-cli dataValidator --table <table-name> --schema <schema-name> --rules <id-column>:required;<email-column>:email;<date-column>:date;<amount-column>:numeric
```
> Adjust column names to match your table. Use rulesFile for larger rule sets.

### `duplicateDetection` Presets

**all-columns** — Check for complete duplicate rows
When to use: Find exact duplicate records

```bash
hana-cli duplicateDetection --table <table-name> --schema <schema-name>
```

**key-based** — Check duplicates on key columns
When to use: Find duplicate business keys

```bash
hana-cli duplicateDetection --table <table-name> --schema <schema-name> --keyColumns <key-column>
```

### `export` Presets

**full-table** — Export complete table
When to use: Need all data from table

```bash
hana-cli export --table <table-name> --schema <schema-name> --filename <output-file.csv>
```

**filtered-export** — Export with WHERE clause
When to use: Only need subset of data

```bash
hana-cli export --table <table-name> --schema <schema-name> --filename <output-file.csv> --where <your-condition>
```

**excel-export** — Export to Excel format
When to use: Need Excel format for business users

```bash
hana-cli export --table <table-name> --schema <schema-name> --filename <output-file.xlsx>
```

### `import` Presets

**quick-import** — Fast import for small files with known good data
When to use: Small files (<10MB) with clean, validated data

```bash
hana-cli import --filename <your-file.csv> --table <table-name> --schema <schema-name>
```

**safe-import** — Cautious import with validation and error handling
When to use: Unvalidated data or first-time imports

```bash
hana-cli import --filename <your-file.csv> --table <table-name> --schema <schema-name> --dryRun --skipWithErrors --maxErrorsAllowed 10
```
> Run twice: first with dryRun:true, then with dryRun:false

**large-file** — Import large files with memory protection
When to use: Files >100MB or expected long-running imports

```bash
hana-cli import --filename <your-file.csv> --table <table-name> --schema <schema-name> --maxFileSizeMB 500 --timeoutSeconds 3600
```

**flexible-mapping** — Import with flexible column matching
When to use: File columns in different order than table columns

```bash
hana-cli import --filename <your-file.csv> --table <table-name> --schema <schema-name> --matchMode name
```

### `schemaClone` Presets

**structure-only** — Clone schema without data
When to use: Create test environment with same structure

```bash
hana-cli schemaClone --sourceSchema <source-schema> --targetSchema <new-schema>
```
