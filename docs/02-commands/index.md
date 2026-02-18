# Commands Overview

All available commands organized by category. **186 total commands** available - see the [Complete Command Reference](./all-commands.md) for the full list.

## 📚 Quick Links

- **[📋 All Commands A-Z](./all-commands.md)** - Complete reference of all 186 commands
- **[🔀 Command Reference Diagrams](../99-reference/command-reference.md)** - Visual flowcharts with Mermaid diagrams
- **[🔄 Command Execution Flows](../04-api-reference/command-flows.md)** - System architecture diagrams

---

## 📊 Analysis Tools

Tools for data analysis, profiling, and quality checks.

- **[Data Lineage](./analysis-tools/data-lineage.md)** - Trace data flow and dependencies
- **[Data Profile](./analysis-tools/data-profile.md)** - Analyze column statistics and distributions
- **[Data Diff](./analysis-tools/data-diff.md)** - Compare data between tables or systems
- **[Duplicate Detection](./analysis-tools/duplicate-detection.md)** - Find duplicate records
- **[Referential Check](./analysis-tools/referential-check.md)** - Validate foreign key relationships
- **[Calc View Analyzer](./analysis-tools/calc-view-analyzer.md)** - Analyze calculated views
- **[Data Validator](./analysis-tools/data-validator.md)** - Validate data consistency

*Plus 3 more: columnStats, fragmentationCheck - See [All Commands](./all-commands.md)*

## 🗄️ Data Tools

Commands for data migration, synchronization, and transformation.

- **[Import](./data-tools/import.md)** - Load CSV/Excel data into tables (with batch processing, Excel worksheet selection, and performance tuning)
- **[Export](./data-tools/export.md)** - Export table data to CSV/Excel/JSON files (with filtering, column selection, and custom formatting)
- **[Compare Data](./data-tools/compare-data.md)** - Compare data across different sources
- **[Data Sync](./data-tools/data-sync.md)** - Synchronize data between systems
- **[Data Validator](./data-tools/data-validator.md)** - Validate data consistency and integrity
- **[Kafka Connect](./data-tools/kafka-connect.md)** - Stream data from Kafka

## 🏗️ Schema Tools

Tools for schema management and database structure operations.

- **[Compare Schema](./schema-tools/compare-schema.md)** - Compare database schemas
- **[Schema Clone](./schema-tools/schema-clone.md)** - Clone entire schemas with data
- **[Table Copy](./schema-tools/table-copy.md)** - Copy tables between schemas

## 🛠️ Developer Tools

Commands for development and testing.

- **[Help Documentation](./developer-tools/help-docu.md)** - Open Help Documentation in web browser
- **[Open README](./developer-tools/open-read-me.md)** - Open README documentation
- **[Open Change Log](./developer-tools/open-change-log.md)** - Open change log documentation
- **[CDS](./developer-tools/cds.md)** - CDS operations
- **[Generate Docs](./developer-tools/generate-docs.md)** - Generate documentation

*Plus 10 more: Call Procedure, Change Log, Code Template, Create Module, HDBSQL, Issue, Query Simple, README - See [All Commands](./all-commands.md)*

## ⚙️ System Tools

Administrative and system-level commands.

- **[Replication Status](./system-tools/replication-status.md)** - Monitor database replication
- **[SDI Tasks](./system-tools/sdi-tasks.md)** - Manage Smart Data Integration tasks
- **[XSA Services](./system-tools/xsa-services.md)** - Manage XSA services
- **[Timeseries Tools](./system-tools/timeseries-tools.md)** - Work with time series data

## 🔍 Quick Search

Looking for a specific command? Use the search bar above or check the full [Command Reference in Features](/03-features/).

## Pro Tips

- Use `--help` flag with any command for detailed options
- Most commands support `--output` for different formats (json, csv, table)
- Use `--verbose` flag for detailed execution information
- Commands support aliases for faster typing (e.g., `imp` for `import`)

## Examples

```bash
# Get help for a command
hana-cli import --help

# Use verbose output
hana-cli dataProfile -s SCHEMA -t TABLE --verbose

# Export as JSON
hana-cli export -s SCHEMA -t TABLE --output json
```
