# Commands Overview

All available commands organized by category. **155 total commands** available - see the [Complete Command Reference](./all-commands.md) for the full list.

## 📚 Quick Links

- **[📋 All Commands A-Z](./all-commands.md)** - Complete reference of all 155 commands
- **[🔀 Command Reference Diagrams](../99-reference/command-reference.md)** - Visual flowcharts with Mermaid diagrams
- **[🔄 Command Execution Flows](../04-api-reference/command-flows.md)** - System architecture diagrams

---

## 📊 Analysis Tools

Tools for data analysis, profiling, and quality checks.

- **[Calc View Analyzer](./analysis-tools/calc-view-analyzer.md)** - Analyze Calculation views
- **[Data Diff](./analysis-tools/data-diff.md)** - Compare table data across schemas or systems
- **[Data Lineage](./analysis-tools/data-lineage.md)** - Trace upstream and downstream data dependencies
- **[Data Profile](./analysis-tools/data-profile.md)** - Profile columns, distributions, and null patterns
- **[Duplicate Detection](./analysis-tools/duplicate-detection.md)** - Detect duplicate records by key patterns
- **[ERD Diagram](./analysis-tools/erd-diagram.md)** - Generate ER diagrams from schema metadata
- **[Referential Check](./analysis-tools/referential-check.md)** - Validate referential integrity relationships
- **[Table Hotspots](./analysis-tools/table-hotspots.md)** - Identify high-access and high-change tables

All commands: [Calc View Analyzer](./analysis-tools/calc-view-analyzer.md), [Column Stats](./analysis-tools/column-stats.md), [Data Diff](./analysis-tools/data-diff.md), [Data Lineage](./analysis-tools/data-lineage.md), [Data Profile](./analysis-tools/data-profile.md), [Duplicate Detection](./analysis-tools/duplicate-detection.md), [ERD Diagram](./analysis-tools/erd-diagram.md), [Fragmentation Check](./analysis-tools/fragmentation-check.md), [Referential Check](./analysis-tools/referential-check.md), [Table Hotspots](./analysis-tools/table-hotspots.md).

## 🗄️ Data Tools

Commands for data migration, synchronization, and transformation.

- **[Import](./data-tools/import.md)** - Import CSV/Excel datasets into target tables
- **[Export](./data-tools/export.md)** - Export table data to CSV, Excel, or JSON
- **[Compare Data](./data-tools/compare-data.md)** - Compare row-level data across sources
- **[Data Sync](./data-tools/data-sync.md)** - Synchronize data between source and target systems
- **[Data Validator](./data-tools/data-validator.md)** - Validate data quality and integrity constraints
- **[Kafka Connect](./data-tools/kafka-connect.md)** - Stream records using Kafka integration workflows

All commands: [Compare Data](./data-tools/compare-data.md), [Data Sync](./data-tools/data-sync.md), [Data Validator](./data-tools/data-validator.md), [Export](./data-tools/export.md), [Import](./data-tools/import.md), [Kafka Connect](./data-tools/kafka-connect.md).

## 🏗️ Schema Tools

Tools for schema management and database structure operations.

- **[Compare Schema](./schema-tools/compare-schema.md)** - Compare schema objects and structure differences
- **[Schema Clone](./schema-tools/schema-clone.md)** - Clone schemas, objects, and selected data
- **[Table Copy](./schema-tools/table-copy.md)** - Copy tables across schemas and connections

All commands: [Compare Schema](./schema-tools/compare-schema.md), [Schema Clone](./schema-tools/schema-clone.md), [Table Copy](./schema-tools/table-copy.md).

## 🔍 Object Inspection

Commands for inspecting database objects and metadata.

All commands: [Functions](./object-inspection/functions.md), [Indexes](./object-inspection/indexes.md), [Inspect Function](./object-inspection/inspect-function.md), [Inspect Lib Member](./object-inspection/inspect-lib-member.md), [Inspect Library](./object-inspection/inspect-library.md), [Inspect Procedure](./object-inspection/inspect-procedure.md), [Inspect Table](./object-inspection/inspect-table.md), [Inspect Trigger](./object-inspection/inspect-trigger.md), [Inspect View](./object-inspection/inspect-view.md), [Libraries](./object-inspection/libraries.md), [Objects](./object-inspection/objects.md), [Partitions](./object-inspection/partitions.md), [Procedures](./object-inspection/procedures.md), [Schemas](./object-inspection/schemas.md), [Sequences](./object-inspection/sequences.md), [Tables](./object-inspection/tables.md), [Tables PG](./object-inspection/tables-p-g.md), [Tables SQLite](./object-inspection/tables-s-q-lite.md), [Triggers](./object-inspection/triggers.md), [Views](./object-inspection/views.md).

## 🧰 Mass Operations

Bulk operations across schemas and objects.

All commands: [Mass Convert](./mass-operations/mass-convert.md), [Mass Delete](./mass-operations/mass-delete.md), [Mass Export](./mass-operations/mass-export.md), [Mass Grant](./mass-operations/mass-grant.md), [Mass Rename](./mass-operations/mass-rename.md), [Mass Update](./mass-operations/mass-update.md), [Mass Users](./mass-operations/mass-users.md).

## 📈 Performance Monitoring

Monitoring, diagnostics, and performance tuning commands.

All commands: [Alerts](./performance-monitoring/alerts.md), [Blocking](./performance-monitoring/blocking.md), [Cache Stats](./performance-monitoring/cache-stats.md), [Deadlocks](./performance-monitoring/deadlocks.md), [Expensive Statements](./performance-monitoring/expensive-statements.md), [Long Running](./performance-monitoring/long-running.md), [Memory Analysis](./performance-monitoring/memory-analysis.md), [Memory Leaks](./performance-monitoring/memory-leaks.md), [Query Plan](./performance-monitoring/query-plan.md), [Trace Contents](./performance-monitoring/trace-contents.md), [Traces](./performance-monitoring/traces.md), [Workload Management](./performance-monitoring/workload-management.md).

## 💾 Backup & Recovery

Backup, restore, and retention workflows.

All commands: [Backup](./backup-recovery/backup.md), [Backup List](./backup-recovery/backup-list.md), [Backup Status](./backup-recovery/backup-status.md), [Reclaim](./backup-recovery/reclaim.md), [Restore](./backup-recovery/restore.md).

## 🔐 Security

Security auditing, policies, and privilege analysis.

All commands: [Audit Log](./security/audit-log.md), [Certificates](./security/certificates.md), [Create XSA Admin](./security/create-x-s-a-admin.md), [Encryption Status](./security/encryption-status.md), [Grant Chains](./security/grant-chains.md), [Privilege Analysis](./security/privilege-analysis.md), [Privilege Error](./security/privilege-error.md), [Pwd Policy](./security/pwd-policy.md), [Roles](./security/roles.md), [Security Scan](./security/security-scan.md).

## 🔑 Connection & Auth

Connection management and authentication utilities.

All commands: [Connect](./connection-auth/connect.md), [Connect via Service Key](./connection-auth/connect-via-service-key.md), [Connections](./connection-auth/connections.md), [Create JWT](./connection-auth/create-j-w-t.md), [Inspect JWT](./connection-auth/inspect-j-w-t.md), [Inspect User](./connection-auth/inspect-user.md), [Users](./connection-auth/users.md).

## 🧩 HDI Management

HDI container lifecycle and group management.

All commands: [Activate HDI](./hdi-management/activate-h-d-i.md), [Admin HDI](./hdi-management/admin-h-d-i.md), [Admin HDI Group](./hdi-management/admin-h-d-i-group.md), [Containers](./hdi-management/containers.md), [Create Container](./hdi-management/create-container.md), [Create Container Users](./hdi-management/create-container-users.md), [Create Group](./hdi-management/create-group.md), [Drop Container](./hdi-management/drop-container.md), [Drop Group](./hdi-management/drop-group.md), [HANA Cloud HDI Instances](./hdi-management/hana-cloud-h-d-i-instances.md).

## ☁️ HANA Cloud

HANA Cloud instance operations and lifecycle control.

All commands: [HANA Cloud Instances](./hana-cloud/hana-cloud-instances.md), [HANA Cloud SBSS Instances](./hana-cloud/hana-cloud-s-b-s-s-instances.md), [HANA Cloud Schema Instances](./hana-cloud/hana-cloud-schema-instances.md), [HANA Cloud Secure Store Instances](./hana-cloud/hana-cloud-secure-store-instances.md), [HANA Cloud Start](./hana-cloud/hana-cloud-start.md), [HANA Cloud Stop](./hana-cloud/hana-cloud-stop.md), [HANA Cloud UPS Instances](./hana-cloud/hana-cloud-u-p-s-instances.md).

## 🧭 BTP Integration

BTP targeting and convenience openers.

All commands: [BTP](./btp-integration/btp.md), [BTP Info](./btp-integration/btp-info.md), [BTP Subs](./btp-integration/btp-subs.md), [BTP Target](./btp-integration/btp-target.md), [Open BAS](./btp-integration/open-b-a-s.md), [Open DB Explorer](./btp-integration/open-d-b-explorer.md).

## 🛠️ Developer Tools

Commands for development and testing.

- **[Help Docu](./developer-tools/help-docu.md)** - Open CLI help documentation in your browser
- **[Open Read Me](./developer-tools/open-read-me.md)** - Open README documentation in your browser
- **[Open Change Log](./developer-tools/open-change-log.md)** - Open changelog documentation in your browser
- **[CDS](./developer-tools/cds.md)** - Run CDS-related helper operations
- **[Generate Docs](./developer-tools/generate-docs.md)** - Generate and refresh project documentation

All commands: [Call Procedure](./developer-tools/call-procedure.md), [CDS](./developer-tools/cds.md), [Change Log](./developer-tools/change-log.md), [Code Template](./developer-tools/code-template.md), [Create Module](./developer-tools/create-module.md), [Generate Docs](./developer-tools/generate-docs.md), [HDBSQL](./developer-tools/hdbsql.md), [Help Docu](./developer-tools/help-docu.md), [Issue](./developer-tools/issue.md), [Open Change Log](./developer-tools/open-change-log.md), [Open Read Me](./developer-tools/open-read-me.md), [Query Simple](./developer-tools/query-simple.md), [Read Me](./developer-tools/read-me.md).

## 🧪 System Admin

Administrative diagnostics and system configuration checks.

All commands: [Cache Contents](./system-admin/cache-contents.md), [Crash Dumps](./system-admin/crash-dumps.md), [Data Types](./system-admin/data-types.md), [Dependencies](./system-admin/dependencies.md), [Diagnose](./system-admin/diagnose.md), [Disks](./system-admin/disks.md), [Feature Usage](./system-admin/feature-usage.md), [Features](./system-admin/features.md), [Health Check](./system-admin/health-check.md), [Host Information](./system-admin/host-information.md), [INI Contents](./system-admin/ini-contents.md), [INI Files](./system-admin/ini-files.md), [Ports](./system-admin/ports.md), [Recommendations](./system-admin/recommendations.md), [Status](./system-admin/status.md), [System Info](./system-admin/system-info.md).

## ⚙️ System Tools

Administrative and system-level commands.

- **[CLI (Internal)](./system-tools/cli.md)** - CLI launcher entrypoint (not a standalone subcommand)
- **[Command Map (Internal)](./system-tools/command-map.md)** - Internal lazy-loading map for CLI routing
- **[Index Test (Legacy Placeholder)](./system-tools/index-test.md)** - Historical placeholder (use Inspect Index)
- **[Replication Status](./system-tools/replication-status.md)** - Check replication status and health indicators
- **[SDI Tasks](./system-tools/sdi-tasks.md)** - Monitor and manage SDI task execution
- **[XSA Services](./system-tools/xsa-services.md)** - Inspect and manage XSA services
- **[Time Series Tools](./system-tools/time-series-tools.md)** - Query and analyze time-series data
- **[Time Series Tools (Legacy Alias)](./system-tools/timeseries-tools.md)** - Compatibility alias for the canonical Time Series Tools documentation
- **[Compare Schema (Legacy Alias)](./system-tools/compare-schema.md)** - Legacy alias for the Schema Tools documentation
- **[Export (Legacy Alias)](./system-tools/export.md)** - Legacy alias for the Data Tools documentation
- **[Import (Legacy Alias)](./system-tools/import.md)** - Legacy alias for the Data Tools documentation
- **[Kafka Connect (Legacy Alias)](./system-tools/kafka-connect.md)** - Legacy alias for the Data Tools documentation

All commands: [CLI (Internal)](./system-tools/cli.md), [Command Map (Internal)](./system-tools/command-map.md), [Compare Schema (Legacy Alias)](./system-tools/compare-schema.md), [Copy2 Default Env](./system-tools/copy2-default-env.md), [Copy2 Env](./system-tools/copy2-env.md), [Copy2 Secrets](./system-tools/copy2-secrets.md), [Data Mask](./system-tools/data-mask.md), [Data Volumes](./system-tools/data-volumes.md), [Export (Legacy Alias)](./system-tools/export.md), [FT Indexes](./system-tools/ft-indexes.md), [Generate Test Data](./system-tools/generate-test-data.md), [Graph Workspaces](./system-tools/graph-workspaces.md), [Import (Legacy Alias)](./system-tools/import.md), [Index Test (Legacy Placeholder)](./system-tools/index-test.md), [Inspect Index](./system-tools/inspect-index.md), [Kafka Connect (Legacy Alias)](./system-tools/kafka-connect.md), [RICK](./system-tools/rick.md), [Replication Status](./system-tools/replication-status.md), [SDI Tasks](./system-tools/sdi-tasks.md), [Spatial Data](./system-tools/spatial-data.md), [Synonyms](./system-tools/synonyms.md), [Table Groups](./system-tools/table-groups.md), [Test](./system-tools/test.md), [Time Series Tools](./system-tools/time-series-tools.md), [Time Series Tools (Legacy Alias)](./system-tools/timeseries-tools.md), [UI](./system-tools/u-i.md), [Version](./system-tools/version.md), [XSA Services](./system-tools/xsa-services.md).

## 🔍 Quick Search

Looking for a specific command? Use the search bar above or jump directly to:

- [All Commands A-Z](/02-commands/all-commands)
- [Commands Overview](/02-commands/)
- [Features & Guides](/03-features/)

## Pro Tips

- Use `--help` flag with any command for detailed options
- Some commands support `--output` for different formats (json, csv, table)
- Use `--verbose` flag for detailed execution output
- Use `--debug` flag for debugging information
- Use `--quiet` flag to suppress output for scripting
- Some commands support aliases for faster typing (e.g., `imp` for `import`)

## Examples

```bash
# Get help for a command
hana-cli import --help

# Use verbose output
hana-cli dataProfile -s SCHEMA -t TABLE --verbose

# Export as JSON
hana-cli export -s SCHEMA -t TABLE --output json
```
