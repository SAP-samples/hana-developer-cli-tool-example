# Compare Schema Command Documentation

## Overview

The `compareSchema` command allows you to compare database schema structures across different environments or schemas. It identifies differences in tables, columns, indexes, triggers, and constraints—useful for environment validation, migration verification, and identifying schema drift.

## Syntax

```bash
hana-cli compareSchema [options]
```

## Aliases

- `compareSchema`
- `cmpschema`
- `schemaCompare`
- `compareschema`

## Options

### Required Parameters

- **-ss, --sourceSchema** (string): First schema to compare
- **-ts, --targetSchema** (string): Second schema to compare

### Optional Parameters

- **--tables, --tb** (string): Comma-separated list of specific tables to compare (filters all tables if omitted)
- **--compareIndexes, --ci** (boolean): Include indexes in comparison
  - Default: `true`
- **--compareTriggers, --ct** (boolean): Include triggers in comparison
  - Default: `true`
- **--compareConstraints, --cc** (boolean): Include constraints in comparison
  - Default: `true`
- **-o, --output** (string): File path to save comparison report (displays in console if omitted)
- **--timeout, --to** (number): Operation timeout in seconds
  - Default: `3600`
- **-p, --profile**: CDS profile for connections

## Examples

### 1. Basic Schema Comparison

Compare two schemas:

```bash
hana-cli compareSchema -ss PRODUCTION -ts STAGING
```

### 2. Specific Table Comparison

Compare only certain tables:

```bash
hana-cli compareSchema \
  -ss PRODUCTION -ts STAGING \
  --tables CUSTOMERS,ORDERS,PRODUCTS
```

### 3. Exclude Indexes and Triggers

Quick comparison focusing on table structure:

```bash
hana-cli compareSchema \
  -ss PRODUCTION -ts STAGING \
  --compareIndexes false \
  --compareTriggers false
```

### 4. Schema Comparison with Report Export

Save detailed comparison report:

```bash
hana-cli compareSchema \
  -ss SOURCE_DB -ts TARGET_DB \
  -o ./reports/schema_comparison.json
```

### 5. Pre-Migration Schema Validation

Verify schemas match before migration:

```bash
hana-cli compareSchema \
  -ss LEGACY_SYSTEM -ts NEW_SYSTEM
```

## Output Details

The comparison report includes:

### Table Comparison
- **Matching tables**: Tables that exist in both schemas with identical structure
- **Added tables**: Tables in target but not in source
- **Missing tables**: Tables in source but not in target
- **Column differences**: 
  - Added columns
  - Missing columns
  - Type changes
  - Nullable constraint changes

### Index Comparison
- **Missing indexes**: Indexes in source but not in target
- **Extra indexes**: Indexes in target but not in source
- **Index structure changes**: Column order, uniqueness settings

### Trigger Comparison
- **Missing triggers**: Triggers in source but not in target
- **Extra triggers**: Triggers in target but not in source

### Constraint Comparison
- **Primary key differences**
- **Foreign key differences**
- **Unique constraint changes**
- **Check constraint changes**

## Use Cases

### Pre-Migration Validation

Ensure target environment matches source before migration:

```bash
hana-cli compareSchema \
  -ss CURRENT_PRODUCTION -ts MIGRATION_TARGET \
  -o ./migration_check.json
```

### Environment Synchronization

Check if development, staging, and production are in sync:

```bash
hana-cli compareSchema -ss DEV -ts STAGING
hana-cli compareSchema -ss STAGING -ts PRODUCTION
```

### Schema Drift Detection

Monitor whether schemas have diverged:

```bash
hana-cli compareSchema \
  -ss BASELINE_SCHEMA \
  -ts CURRENT_SCHEMA \
  -o ./drift_report.json
```

### Incremental Deployment Verification

After applying schema changes, verify they match expected state:

```bash
hana-cli compareSchema \
  -ss EXPECTED_STATE \
  -ts DEPLOYED_STATE
```

## Performance Considerations

- **Table filtering**: Use `--tables` to limit scope for large schemas
- **Comparison scope**: Disable unnecessary comparisons (indexes, triggers) if not needed
- **Timeout**: Increase `--timeout` for very large schemas
- **Network latency**: Cross-database comparisons may be slower

## Related Commands

- **`compareData`** - Compare data between tables
- **`dataDiff`** - Show detailed row-level differences
- **`schemas`** - List all schemas
- **`tables`** - List tables with schema filter
- **`inspectTable`** - View detailed table structure

## Migration Workflow Example

```bash
# 1. Compare schemas before migration
hana-cli compareSchema \
  -ss LEGACY_SYSTEM -ts NEW_SYSTEM \
  -o ./pre_migration_schema.json

# 2. Review report and address any differences

# 3. Apply any necessary schema corrections to NEW_SYSTEM

# 4. Re-run comparison to verify matching schemas
hana-cli compareSchema \
  -ss LEGACY_SYSTEM -ts NEW_SYSTEM \
  -o ./post_migration_schema.json

# 5. Compare data after applying schema changes
hana-cli compareData \
  -st CUSTOMER_DATA -ss LEGACY_SYSTEM \
  -tt CUSTOMER_DATA -ts NEW_SYSTEM \
  -k CUSTOMER_ID
```

## Tips and Best Practices

1. **Baseline comparison**: Create a baseline schema comparison report for reference
2. **Automate checks**: Schedule periodic schema comparisons to catch drift early
3. **Document schema versions**: Keep schema comparison reports for audit trails
4. **Pre-deployment validation**: Always run schema comparison before production deployments
5. **Team communication**: Share comparison reports with team members to discuss changes
6. **Test environment changes**: Apply schema changes to test environment first, then compare with target
7. **Archive reports**: Keep historical comparison reports for troubleshooting

## Common Schema Differences

### Expected Differences to Address
- Temporary tables or views not needed on target
- Development-only columns with prefixes like `DEV_*`
- Different naming conventions between environments
- Performance optimization columns/indexes in production

### Warning Signs
- Missing primary keys on replicated data
- Mismatched data types
- Missing foreign key constraints
- Orphaned indexes (can impact performance)
