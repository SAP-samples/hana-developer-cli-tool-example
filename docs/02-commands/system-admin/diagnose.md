# diagnose

> Command: `diagnose`  
> Category: **System Admin**  
> Status: Production Ready

## Description

Run comprehensive system diagnostics on the SAP HANA database. This command performs multiple health checks including service status, backup verification, memory usage, disk space, connection limits, transaction locks, replication status, and alert monitoring. Results are categorized by severity (critical, warning, info) to help identify potential issues.

## Syntax

```bash
hana-cli diagnose [options]
```

## Aliases

- `diag`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli diagnose]) --> Connect[Connect to Database]
    Connect --> ParseChecks[Parse Check Types<br/>from --checks option]
    
    ParseChecks --> RunChecks{Run Diagnostics}
    
    RunChecks --> Services[Check 1: Services Status<br/>M_SERVICES]
    Services --> Backups[Check 2: Backup Status<br/>M_BACKUP_CATALOG]
    Backups --> Memory[Check 3: Memory Usage<br/>M_HOST_RESOURCE_UTILIZATION]
    Memory --> Disk[Check 4: Disk Space<br/>M_DISK_USAGE]
    Disk --> Connections[Check 5: Connections<br/>M_CONNECTIONS]
    Connections --> Locks[Check 6: Transaction Locks<br/>M_BLOCKED_TRANSACTIONS]
    Locks --> Replication[Check 7: Replication<br/>M_SERVICE_REPLICATION]
    Replication --> Alerts[Check 8: System Alerts<br/>M_ALERTS]
    
    Alerts --> Aggregate[Aggregate Results<br/>Issues & Warnings]
    Aggregate --> Display[Display Summary<br/>with Severity Levels]
    
    Display --> Complete([Command Complete])
    
    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style RunChecks fill:#f39c12
```

## Parameters

### Options

| Option     | Alias | Type   | Default | Description                            |
|------------|-------|--------|---------|----------------------------------------|
| `--checks` | `-c`  | string | `all`   | Comma-separated list of checks to run: `all`, `services`, `backup`, `memory`, `disk`, `connections`, `locks`, `replication`, `alerts` |
| `--limit`  | `-l`  | number | `50`    | Maximum number of results per check    |

### Connection Parameters

| Option    | Alias | Type    | Default | Description                                          |
|-----------|-------|---------|---------|------------------------------------------------------|
| `--admin` | `-a`  | boolean | `false` | Connect via admin (default-env-admin.json)           |
| `--conn`  | -     | string  | -       | Connection filename to override default-env.json     |

### Troubleshooting

| Option              | Alias     | Type    | Default | Description                                                                                              |
|---------------------|-----------|---------|---------|----------------------------------------------------------------------------------------------------------|
| `--disableVerbose`  | `--quiet` | boolean | `false` | Disable verbose output - removes all extra output that is only helpful to human readable interface       |
| `--debug`           | `-d`      | boolean | `false` | Debug hana-cli itself by adding output of LOTS of intermediate details                                   |

## Examples

### Run All Diagnostics

```bash
hana-cli diagnose --checks all
```

Run all available diagnostic checks and display a comprehensive system health report.

### Check Specific Systems

```bash
hana-cli diagnose --checks services,backup,memory
```

Run only service status, backup status, and memory usage checks.

### Quick Disk and Connection Check

```bash
hana-cli diagnose --checks disk,connections --limit 25
```

Check disk space and active connections with a limit of 25 results per check.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Admin](..)
- [healthCheck](./health-check.md) - Comprehensive database health assessment
- [systemInfo](./system-info.md) - Display system information
- [status](./status.md) - Connection status
- [All Commands A-Z](../all-commands.md)
