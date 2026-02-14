# Import Command - Quick Start Examples

## Example 1: Basic CSV Import

The following example shows how to import the sample employee data.

### Prerequisites

1. Create a table in your HANA database:

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

1. Sample CSV file: `docs/IMPORT_EXAMPLE_EMPLOYEES.csv`

### Command

```bash
hana-cli import -n docs/IMPORT_EXAMPLE_EMPLOYEES.csv -t EMPLOYEES -m auto
```

### Expected Output

```shell
Import Summary
┌──────────┬──────────────┬───────────────┬────────────────┬──────────────┐
│ table    │ rowsProcessed│ rowsInserted  │ rowsWithErrors │ matchMode    │
├──────────┼──────────────┼───────────────┼────────────────┼──────────────┤
│ EMPLOYEES│ 10           │ 10            │ 0              │ auto         │
└──────────┴──────────────┴───────────────┴────────────────┴──────────────┘
```

## Example 2: Truncate and Replace Data

To replace all existing employee data with new data:

```bash
hana-cli import -n docs/IMPORT_EXAMPLE_EMPLOYEES.csv -t EMPLOYEES --truncate
```

This will:

1. Delete all existing records in EMPLOYEES table
2. Import the 10 new records from the CSV file

## Example 3: Name-Based Column Matching

If your file has different column names but they should match table columns:

```bash
hana-cli import -n ./data/employees_alt.csv -t EMPLOYEES -m name
```

File columns: `ID, PERSON_ID, FIRST, LAST, DEPT, SALARY, HIRED`  
Table columns: `ID, EmployeeID, FirstName, LastName, Department, Salary, StartDate`

With `-m name`, no columns would match and the command would fail. Use `-m order` instead:

```bash
hana-cli import -n ./data/employees_alt.csv -t EMPLOYEES -m order
```

## Example 4: Excel File Import

Import from an Excel file instead of CSV:

```bash
hana-cli import -n ~/Sales/Q4_2024.xlsx -t SALES_DATA -o excel
```

## Example 5: Using Admin Connection

Import using admin credentials:

```bash
hana-cli import -n data/admin_users.csv -t SYS_USERS -a
```

This uses credentials from `default-env-admin.json` instead of the regular connection file.

## Example 6: Schema-Qualified Table

Specify both schema and table name:

```bash
hana-cli import -n export/data.csv -t MYSCHEMA.EMPLOYEES
```

## Example 7: Verify Import with Query

After importing, verify the data was inserted correctly:

```bash
# Count imported records
hana-cli querySimple -q "SELECT COUNT(*) as imported_count FROM EMPLOYEES"

# Review imported data
hana-cli querySimple -q "SELECT * FROM EMPLOYEES ORDER BY ID" -o table

# Export to verify
hana-cli querySimple -q "SELECT * FROM EMPLOYEES" -n backup/employees_imported -o csv
```

## Working with Large Files

For files with thousands of rows:

```bash
# Show progress with debug output
hana-cli import -n large_dataset.csv -t BIG_TABLE --debug

# Import to staging table first to validate
hana-cli import -n large_dataset.csv -t EMPLOYEES_STAGING
# Review data in staging
hana-cli querySimple -q "SELECT * FROM EMPLOYEES_STAGING LIMIT 10"
# If good, copy to production
hana-cli querySimple -q "INSERT INTO EMPLOYEES SELECT * FROM EMPLOYEES_STAGING"
```

## Error Recovery Workflow

If import encounters errors:

```bash
# Review error messages in import output
hana-cli import -n problem_data.csv -t EMPLOYEES --debug 2>&1 | tee import_log.txt

# Fix issues in source CSV file (edit in Excel or text editor)

# Get count of what's in table after partial import
hana-cli querySimple -q "SELECT COUNT(*) FROM EMPLOYEES"

# Optional: Reset and retry
hana-cli querySimple -q "DELETE FROM EMPLOYEES"
hana-cli import -n problem_data.csv -t EMPLOYEES
```

## CSV Format Tips

### Complex Cells with Commas

```csv
ID,Name,Address
1,John Smith,"123 Oak Street, Suite 500"
2,Jane Doe,"456 Elm Ave, Apt 22"
```

### Quoted Values

```csv
ID,"Full Name","Quote"
1,"Smith, John","He said ""Hello"""
2,"Doe, Jane","She replied ""Hi"""
```

### Empty/Null Values

```csv
ID,FirstName,LastName,MiddleName,Department
1,John,Smith,,Sales
2,Jane,Doe,Marie,Engineering
```

### Date Formats (Auto-detected)

```csv
ID,Name,StartDate
1,John,2023-01-15
2,Jane,2024-06-20
3,Mike,01/15/2023
```

## Workflow: Backup, Modify, Restore

```bash
#!/bin/bash

# Step 1: Export current data
echo "Backing up current EMPLOYEES table..."
hana-cli querySimple -q "SELECT * FROM EMPLOYEES" -n backup/employees_backup -o csv

# Step 2: User edits the CSV file
echo "Modify backup/employees_backup.csv in Excel or your editor"
read -p "Press Enter when done..."

# Step 3: Reimport with truncate
echo "Importing modified data..."
hana-cli import -n backup/employees_backup.csv -t EMPLOYEES --truncate

# Step 4: Verify
echo "Verifying import..."
hana-cli querySimple -q "SELECT COUNT(*) as total_records FROM EMPLOYEES"
```

## Performance Notes

- **Small files** (< 1000 rows): < 1 second
- **Medium files** (1K - 10K rows): 1 - 10 seconds  
- **Large files** (10K+ rows): 10 - 100+ seconds depending on server

Use `--truncate` with small transactions for best performance:

```bash
# Split large file into chunks and import separately
hana-cli import -n chunk_001.csv -t EMPLOYEES --truncate  # Clears table
hana-cli import -n chunk_002.csv -t EMPLOYEES            # Appends to existing
hana-cli import -n chunk_003.csv -t EMPLOYEES            # Appends to existing
```

## Related Documentation

- **Export Data**: See [querySimple Documentation](../bin/querySimple.js)
- **Database Connections**: See [Connection Guide](./CONNECTION.md)
- **Table Metadata**: See [inspectTable Command](./INSPECT_TABLE.md)
