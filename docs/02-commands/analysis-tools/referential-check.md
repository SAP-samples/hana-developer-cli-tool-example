# referentialCheck

> Command: `referentialCheck`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Verifies referential integrity and validates foreign key constraints in HANA tables. It identifies orphaned records and constraint violations that could indicate data quality issues.

## Syntax

```bash
hana-cli referentialCheck [options]
```

## Aliases

- `refcheck`
- `checkReferential`
- `fkcheck`

## Parameters

| Option | Alias | Type | Default | Description |
| --------- | ------- | -------- | --------- | -------------------------------- |
| `--table` | `-t` | string | required | Name of the table to check |
| `--schema` | `-s` | string | optional | Schema name (uses current if omitted) |
| `--constraints` | `-c` | string | optional | Comma-separated specific constraint names to check |
| `--mode` | `-m` | string | check | Check mode: `check`, `report`, `repair`, `detailed` |
| `--output` | `-o` | string | optional | Output file path for the report |
| `--format` | `-f` | string | summary | Report format: `json`, `csv`, `summary` |
| `--limit` | `-l` | number | 10000 | Maximum rows to check for orphaned records |
| `--timeout` | `-to` | number | 3600 | Operation timeout in seconds |
| `--profile` | `-p` | string | optional | Connection profile to use |

For a complete list of parameters and options, use:

```bash
hana-cli referentialCheck --help
```

## Check Modes

- **check** (default) - Identify foreign key violations and orphaned records
- **report** - Generate a comprehensive report of all constraints
- **repair** - Attempt to fix violations (deletes or flags orphaned records)
- **detailed** - Full analysis with detailed constraint information

## Output Examples

### Summary (default)

```bash
Referential Integrity Check Report
===================================

Total Foreign Keys: 3
Valid Constraints:  2
Violated Constraints: 1
Total Orphaned Records: 5

Violations:
  FK_ORDERS_CUSTOMERS: VIOLATED
    Orphaned Records: 3
  FK_ORDERS_PRODUCTS: OK
  FK_ORDERS_WAREHOUSES: VIOLATED
    Orphaned Records: 2
```

### JSON

```json
{
  "totalForeignKeys": 3,
  "validConstraints": 2,
  "violatedConstraints": 1,
  "totalOrphanedRecords": 5,
  "violations": [
    {
      "constraintName": "FK_ORDERS_CUSTOMERS",
      "column": "CUSTOMER_ID",
      "referencesTable": "CUSTOMERS",
      "status": "VIOLATED",
      "orphanedRecords": [
        {
          "CUSTOMER_ID": 12345,
          "count": 3
        }
      ]
    }
  ],
  "details": [
    {
      "constraintName": "FK_ORDERS_PRODUCTS",
      "column": "PRODUCT_ID",
      "referencesTable": "PRODUCTS",
      "status": "OK"
    }
  ]
}
```

## Understanding Results

### Valid Constraint

All foreign key values in the primary table exist in the referenced table. Data integrity is maintained.

### Violated Constraint

Some foreign key values in the primary table do not exist in the referenced table. These are orphaned records.

### Orphaned Records

Records with foreign key values that reference non-existent parent records. This can happen when:

- Parent records are deleted without cascading deletes
- Foreign key constraints are disabled
- Data is imported without validation

## Examples

### Check all foreign keys

```bash
hana-cli referentialCheck --table ORDERS --schema SALES
```

### Check specific constraints

```bash
hana-cli referentialCheck --table ORDERS \
  --constraints FK_ORDERS_CUSTOMERS,FK_ORDERS_PRODUCTS
```

### Detailed analysis with JSON output

```bash
hana-cli referentialCheck --table ORDERS \
  --mode detailed \
  --format json \
  --output referential-check.json
```

### Attempt repair mode (use with caution)

```bash
hana-cli referentialCheck --table ORDERS --mode repair --limit 50000
```

## Repair Mode

**Warning**: Use with caution. The repair mode attempts to fix violations:

- Flags orphaned records
- May delete orphaned records (if configured)
- Always backup your database before using repair mode

## Return Codes

- `0` - Check completed successfully
- `1` - Check failed or database connection issue

## Performance Tips

1. Use `--limit` to check a subset first
2. Specify constraint names to check only needed constraints
3. Use `--timeout` to prevent long-running checks
4. Run during off-peak hours for production databases

## Database-Specific Notes

### HANA

- Uses `SYS.REFERENTIAL_CONSTRAINTS` system view
- Supports foreign key constraints across schemas

### PostgreSQL

- Uses `information_schema.table_constraints`
- Supports multiple foreign key types

## Integration with Data Governance

Use referential checks as part of data quality processes:

```bash
# Daily data quality check
hana-cli referentialCheck --table ORDERS --schema SALES \
  --format json --output daily-check.json

# Alert if violations found
if grep -q "VIOLATED" daily-check.json; then
  # Send alert
  echo "Referential integrity violations detected!"
fi
```

## Related Commands

- `dataValidator` - Validate data against business rules
- `duplicateDetection` - Find duplicate records
- `dataLineage` - Trace data lineage and transformations
- `dataProfile` - Generate statistical profiles

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
