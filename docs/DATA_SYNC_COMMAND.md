# Data Sync Command Documentation

## Overview

The `dataSync` command synchronizes data between systems or tables. This is useful for keeping development and production environments in sync, replicating data changes, and maintaining data consistency across systems.

## Syntax

```bash
hana-cli dataSync [options]
```

## Aliases

- `dataSync`
- `datasync`
- `syncData`
- `sync`

## Options

### Required Parameters

- **-t, --table** (string): Table name to synchronize
- **-k, --keyColumns** (string): Comma-separated key columns for row matching

### Optional Parameters

- **-sc, --sourceConnection** (string): Source connection profile or connection string
  - If not provided, uses current connection
- **-tc, --targetConnection** (string): Target connection profile or connection string
  - If not provided, uses current connection
- **-s, --schema** (string): Schema name containing the table
  - Default: `**CURRENT_SCHEMA**`
- **-m, --syncMode** (string): Synchronization mode
  - Choices: `full`, `incremental`
  - Default: `full`
- **-b, --batchSize** (number): Number of rows to process in each batch
  - Default: `1000`
- **-cr, --conflictResolution** (string): How to resolve conflicts
  - Choices: `source` (source wins), `target` (target wins), `skip` (skip conflict)
  - Default: `source`
- **--timeout, --to** (number): Operation timeout in seconds
  - Default: `3600`
- **-p, --profile**: Connection profile

## Examples

### 1. Basic Full Synchronization

Synchronize all data in a table:

```bash
hana-cli dataSync -t CUSTOMERS -k CUSTOMER_ID
```

### 2. Incremental Synchronization

Sync only changes since last sync:

```bash
hana-cli dataSync \
  -t ORDERS \
  -k ORDER_ID \
  -m incremental
```

### 3. Cross-System Synchronization

Sync data between different systems:

```bash
hana-cli dataSync \
  -sc DEV_PROFILE \
  -tc PROD_PROFILE \
  -t PRODUCTS \
  -k PRODUCT_ID
```

### 4. Batch Processing

Process large tables in smaller batches:

```bash
hana-cli dataSync \
  -t TRANSACTIONS \
  -k TRANSACTION_ID \
  -b 5000
```

### 5. Conflict Resolution Strategy

Handle conflicts by preferring target values:

```bash
hana-cli dataSync \
  -t INVENTORY \
  -k ITEM_ID \
  -cr target
```

### 6. Schema-Specific Sync

Sync table in specific schema:

```bash
hana-cli dataSync \
  -s SALES_SCHEMA \
  -t MONTHLY_SALES \
  -k MONTH,REGION
```

## Output Format

The command displays:

- Number of rows read from source
- Synchronization mode used
- Number of rows synchronized
- Batch size and conflict resolution strategy

Example output:

```bash
Starting data synchronization for PRODUCTION.CUSTOMERS
Read 15,432 rows from source table
Using full synchronization mode
Synchronization complete. 15,432 rows synced to table CUSTOMERS

┌──────────┬────────────────┬───────────┬─────────────┬────────────┬─────────────────────┐
│ TABLE    │ SCHEMA         │ SYNC_MODE │ ROWS_SYNCED │ BATCH_SIZE │ CONFLICT_RESOLUTION │
├──────────┼────────────────┼───────────┼─────────────┼────────────┼─────────────────────┤
│ CUSTOMERS│ PRODUCTION     │ full      │ 15432       │ 1000       │ source              │
└──────────┴────────────────┴───────────┴─────────────┴────────────┴─────────────────────┘
```

## Use Cases

1. **Environment Synchronization**: Keep development environments in sync with production data
2. **Data Replication**: Replicate data changes between systems
3. **Disaster Recovery**: Sync data for backup and recovery purposes
4. **Testing**: Copy production data to test environments
5. **Data Migration**: Move data between different HANA instances
6. **Multi-Region Sync**: Maintain data consistency across geographical regions

## Notes

- Use `incremental` mode for better performance on large tables with timestamp columns
- Adjust `batchSize` based on table size and network performance
- Key columns must uniquely identify rows for proper matching
- Conflict resolution applies when same row exists in both source and target
- Consider using timeout parameter for very large synchronizations
