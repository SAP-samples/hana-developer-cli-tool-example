# tableCopy

> Command: `tableCopy`  
> Category: **Object Inspection**  
> Status: Production Ready

## Description

Copies table structure and/or data from one table to another, with optional filtering capabilities. This is useful for creating table backups, copying data subsets, or migrating tables between schemas.

## Syntax

```bash
hana-cli tableCopy [options]
```

## Aliases

- `tablecopy`
- `copyTable`
- `copytable`

## Parameters

### Required Parameters

- **-st, --sourceTable** (string): Source table name to copy from
- **-tt, --targetTable** (string): Target table name to copy to

### Optional Parameters

- **-ss, --sourceSchema** (string): Source schema name
  - Default: `**CURRENT_SCHEMA**`
- **-ts, --targetSchema** (string): Target schema name
  - Default: `**CURRENT_SCHEMA**`
- **-so, --structureOnly** (boolean): Copy only table structure (no data)
  - Default: `false`
- **-do, --dataOnly** (boolean): Copy only data (table must exist)
  - Default: `false`
- **-w, --where** (string): WHERE clause to filter rows during copy
- **-l, --limit** (number): Maximum number of rows to copy
- **-b, --batchSize** (number): Number of rows to insert in each batch
  - Default: `1000`
- **--timeout, --to** (number): Operation timeout in seconds
  - Default: `3600`
- **-p, --profile**: Connection profile

For a complete list of parameters and options, use:

```bash
hana-cli tableCopy --help
```

## Copy Modes

The command operates in three modes:

### 1. Both Structure and Data (Default)

- Creates target table
- Copies all data
- Use when creating a complete copy

### 2. Structure Only (`--structureOnly`)

- Creates empty target table
- No data copied
- Use for creating table templates
- Conflict: Cannot be used with `--dataOnly`

### 3. Data Only (`--dataOnly`)

- Target table must already exist
- Only copies data
- Use for refreshing existing tables
- Conflict: Cannot be used with `--structureOnly`

## Filtering Options

### WHERE Clause (`--where`)

- Filters rows during copy
- SQL WHERE clause syntax (without the WHERE keyword)
- Examples:
  - `STATUS = 'ACTIVE'`
  - `AMOUNT > 1000 AND CURRENCY = 'USD'`
  - `CREATE_DATE >= '2024-01-01'`

### LIMIT (`--limit`)

- Limits total number of rows copied
- Applied after WHERE filter
- Useful for:
  - Testing with sample data
  - Creating partial copies
  - Avoiding timeouts on large tables

## Output Format

```text
Starting table copy from PRODUCTION.CUSTOMERS to PRODUCTION.CUSTOMERS_BACKUP
Copying table structure
Table structure copied successfully
Copying table data
Read 25,432 rows from source table
Processed 1000 of 25432 rows
Processed 2000 of 25432 rows
...
Processed 25432 of 25432 rows
25,432 rows copied successfully
Table copy complete. Source: CUSTOMERS, Target: CUSTOMERS_BACKUP, Rows copied: 25432

┌─────────────────────┬───────────────────────────┬──────────────────┬─────────────┬──────────┬──────────────┬───────────────┐
│ SOURCE              │ TARGET                    │ STRUCTURE_COPIED │ ROWS_COPIED │ MODE     │ WHERE_FILTER │ LIMIT_APPLIED │
├─────────────────────┼───────────────────────────┼──────────────────┼─────────────┼──────────┼──────────────┼───────────────┤
│ PRODUCTION.CUSTOMERS│ PRODUCTION.CUSTOMERS_BACKUP│ YES              │ 25432       │ BOTH     │ NONE         │ NONE          │
└─────────────────────┴───────────────────────────┴──────────────────┴─────────────┴──────────┴──────────────┴───────────────┘
```

## Structure Copy Details

When copying structure, the following are included:

- ✅ Column names and data types
- ✅ Column order
- ✅ NOT NULL constraints
- ✅ DEFAULT values
- ✅ Primary keys
- ✅ Unique constraints
- ✅ Indexes

Note: Foreign keys, triggers, and complex constraints may not be copied.

## Examples

### 1. Basic Table Copy

Copy entire table (structure and data):

```bash
hana-cli tableCopy -st CUSTOMERS -tt CUSTOMERS_BACKUP
```

### 2. Cross-Schema Copy

Copy table from one schema to another:

```bash
hana-cli tableCopy \
  -st ORDERS \
  -ss PRODUCTION \
  -tt ORDERS \
  -ts ARCHIVE
```

### 3. Structure Only

Copy just the table structure without data:

```bash
hana-cli tableCopy \
  -st EMPLOYEES \
  -tt EMPLOYEES_TEMPLATE \
  -so
```

### 4. Data Only

Copy data to an existing table:

```bash
hana-cli tableCopy \
  -st TRANSACTIONS \
  -tt TRANSACTIONS_COPY \
  -do
```

### 5. Filtered Copy with WHERE Clause

Copy only specific rows:

```bash
hana-cli tableCopy \
  -st SALES \
  -tt SALES_2024 \
  -w "YEAR = 2024 AND STATUS = 'COMPLETED'"
```

### 6. Limited Row Copy

Copy only first N rows (useful for testing):

```bash
hana-cli tableCopy \
  -st LARGE_TABLE \
  -tt SAMPLE_TABLE \
  -l 10000
```

### 7. Batch Processing

Copy large table with custom batch size:

```bash
hana-cli tableCopy \
  -st BIG_DATA_TABLE \
  -tt BIG_DATA_COPY \
  -b 5000
```

### 8. Combined Filters

Combine WHERE clause and LIMIT:

```bash
hana-cli tableCopy \
  -st USERS \
  -tt ACTIVE_USERS_SAMPLE \
  -w "STATUS = 'ACTIVE'" \
  -l 1000
```

### 9. Cross-Schema with Filter

Copy filtered data between schemas:

```bash
hana-cli tableCopy \
  -st EVENTS \
  -ss LOGS \
  -tt RECENT_EVENTS \
  -ts REPORTING \
  -w "EVENT_DATE >= ADD_DAYS(CURRENT_DATE, -7)"
```

## Use Cases

1. **Table Backup**: Create quick backups before updates or deletes
2. **Data Archiving**: Copy historical data to archive tables
3. **Test Data**: Create smaller test datasets from production tables
4. **Schema Migration**: Move tables between schemas
5. **Data Sampling**: Extract representative samples for analysis
6. **Table Refresh**: Update development tables with production data
7. **Data Transformation**: Copy filtered/subset data for processing

## Performance Considerations

- **Batch Size**: Adjust based on row size and network
  - Small rows (< 100 bytes): Use larger batches (5000+)
  - Large rows (> 1KB): Use smaller batches (500-1000)
- **Indexes**: Target table indexes created automatically affect insert speed
- **Network**: Cross-system copies slower than same-system
- **WHERE Clause**: Complex filters may slow down the source query
- **Parallel Operations**: Consider splitting large tables by partition

## Prerequisites

- SELECT privilege on source table
- CREATE TABLE privilege on target schema (for structure copy)
- INSERT privilege on target table (for data copy)
- Sufficient disk space for target table

## Notes

- Target table created using `CREATE TABLE ... LIKE` syntax
- If target exists and `dataOnly` not set, command fails
- Column compatibility checked automatically
- NULL values handled appropriately
- Large tables should use appropriate batch size
- Consider using LIMIT for initial testing
- WHERE clause must be valid SQL
- Timeout should account for data volume

## Error Handling

### Common Errors

#### Target table already exists

- Use `--dataOnly` to append to existing table
- Or drop the target table first

#### Source table not found

- Verify table name and schema
- Check case sensitivity
- Ensure connection to correct database

#### Permission denied

- Check privileges on source and target
- May need table-level or schema-level grants

#### Out of memory

- Reduce batch size
- Use WHERE clause to copy in smaller chunks
- Consider copying by partition

#### Timeout exceeded

- Increase timeout parameter
- Use LIMIT to copy in stages
- Optimize WHERE clause

## Best Practices

1. **Test First**: Use LIMIT on first run to verify setup
2. **Monitor Progress**: Watch the row count output
3. **Batch Sizing**: Tune batch size for optimal performance
4. **Filters**: Apply WHERE clauses to reduce data volume
5. **Timing**: Run large copies during off-peak hours
6. **Verification**: Check row counts after copy completion
7. **Cleanup**: Remove intermediate tables after testing
8. **Documentation**: Document purpose of copied tables

## Related Commands

- `schemaClone` - Clone entire schemas
- `compareData` - Compare source and target after copy
- `tables` - List available tables
- `inspectTable` - View table structure details

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Object Inspection](..)
- [All Commands A-Z](../all-commands.md)
