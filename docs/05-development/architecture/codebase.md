# Detailed Command Deep Dives

Extended documentation for complex commands with examples and edge cases.

## Import Command Deep Dive

For complete documentation, see: [docs/IMPORT_COMMAND.md](../../02-commands/data-tools/import.md)

**Topics Covered:**

- Column matching strategies (auto, name, order)
- Data type conversion
- Error handling and validation
- Performance optimization
- Large file handling
- Excel-specific options
- Common pitfalls

**Key Features:**

- Auto column detection
- Truncate before import option
- Batch processing for large files
- Detailed error reporting

## Export Command Deep Dive

For complete documentation, see: [docs/EXPORT_COMMAND.md](../../02-commands/data-tools/export.md)

**Topics Covered:**

- Multiple output formats
- Filtering and column selection
- Pagination for large results
- Compression options
- Incremental exports
- Performance tips

**Key Features:**

- JSON, CSV, Excel output
- WHERE clause filtering
- Column selection
- HEAD/LIMIT options

## Compare Schema Deep Dive

For complete documentation, see: [docs/COMPARE_SCHEMA_COMMAND.md](../../02-commands/data-tools/compareSchema.md)

**Topics Covered:**

- Schema structure comparison
- Difference reporting
- Migration recommendations
- Table and view analysis
- Constraint checking
- Performance statistics

**Key Features:**

- Object-level comparison
- Detailed diff reports
- Migration scripts
- HTML report generation

## Data Profile Deep Dive

For complete documentation, see: [docs/DATA_PROFILE_COMMAND.md](../../02-commands/analysis-tools/dataProfile.md)

**Topics Covered:**

- Statistical analysis
- Data quality metrics
- Null value analysis
- Distinct value counting
- Distribution analysis

**Key Features:**

- Column-by-column statistics
- Min/max value detection
- Data type inference
- Null/empty analysis

## Use Case Examples

### ETL Pipeline

```bash
# Extract data
hana-cli export -s SOURCE -t TABLE -o extract.csv

# Transform (external tool)

# Load
hana-cli import -n extract.csv -t TARGET_TABLE
```

### Schema Migration

```bash
# Compare schemas
hana-cli compareSchema -s1 DEV -s2 PROD

# Clone and sync
hana-cli schemaClone -s PROD -t STAGING --data
```

### Data Quality Checks

```bash
# Profile data
hana-cli dataProfile -s SCHEMA -t TABLE

# Validate
hana-cli dataValidator -s SCHEMA -t TABLE

# Find duplicates
hana-cli duplicateDetection -s SCHEMA -t TABLE -c ID
```

## Advanced Tips

### Performance Tuning

- Use `--batch-size` for large imports
- Use `--limit` for quick exports
- Use WHERE clause to filter data before export
- Consider indexes before bulk operations

### Error Handling

- Use `--debug` flag for detailed errors
- Check data types before import
- Validate file format and encoding
- Review sample rows first

### Automation

- Wrap commands in shell scripts
- Use exit codes for error checking
- Log all operations
- Schedule with cron/Windows Task Scheduler

See Also:

- [Command Index](../../02-commands/)
- [Troubleshooting](../../troubleshooting.md)
