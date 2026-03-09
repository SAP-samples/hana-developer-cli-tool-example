# backupStatus

> Command: `backupStatus`  
> Category: **Backup & Recovery**  
> Status: Production Ready

## Description

Check backup/recovery operation status

## Syntax

```bash
hana-cli backupStatus [options]
```

## Aliases

- `bstatus`
- `backupstate`
- `bkpstatus`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli backupStatus]) --> Connection{Connection Parameters}
    Connection -->|--admin| Admin[Connect via Admin<br/>uses default-env-admin.json]
    Connection -->|--conn| Conn[Override Connection File<br/>Custom filename]
    
    Admin --> Options{Options}
    Conn --> Options
    
    Options -->|--catalogOnly| Catalog[Show Backup Catalog<br/>Skip configuration]
    Options -->|--limit| Limit[Limit Results<br/>Default: 20]
    Options -->|--backupType| BackupType{Filter by Backup Type}
    Options -->|--status| Status{Filter by Status}
    Options -->|--days| Days[Show Last N Days<br/>Default: 7]
    
    BackupType -->|complete| Complete[Complete Backup]
    BackupType -->|data| DataBackup[Data Backup]
    BackupType -->|log| Log[Log Backup]
    BackupType -->|incremental| Incremental[Incremental Backup]
    BackupType -->|differential| Differential[Differential Backup]
    BackupType -->|all| AllTypes[All Backup Types<br/>Default]
    
    Status -->|successful| Successful[Successful Operations]
    Status -->|running| Running[Running Operations]
    Status -->|failed| Failed[Failed Operations]
    Status -->|canceled| Canceled[Canceled Operations]
    Status -->|all| AllStatus[All Statuses<br/>Default]
    
    Complete --> Query[Query Backup Status]
    DataBackup --> Query
    Log --> Query
    Incremental --> Query
    Differential --> Query
    AllTypes --> Query
    Successful --> Query
    Running --> Query
    Failed --> Query
    Canceled --> Query
    AllStatus --> Query
    
    Catalog --> Troubleshoot{Troubleshooting Options}
    Limit --> Troubleshoot
    Days --> Troubleshoot
    Query --> Troubleshoot
    
    Troubleshoot -->|--disableVerbose| Verbose[Disable Verbose Output<br/>Machine-readable format]
    Troubleshoot -->|--debug| Debug[Debug Mode<br/>Detailed intermediate output]
    
    Verbose --> Execute[Execute Query]
    Debug --> Execute
    
    Execute --> Result([Display Backup Status<br/>and Recovery Information])
    
    style Start fill:#0092d1
    style Result fill:#2ecc71
    style Connection fill:#f39c12
    style Options fill:#f39c12
    style BackupType fill:#9b59b6
    style Status fill:#9b59b6
    style Troubleshoot fill:#e74c3c
```

## Parameters

### Connection Parameters

| Option | Alias | Type | Default | Description |
| -------- | ------- | ------ | --------- | ------------- |
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json) |
| `--conn` | - | string | - | Connection filename to override default-env.json |

### Options

| Option | Alias | Type | Default | Description |
| -------- | ------- | ------ | --------- | ------------- |
| `--catalogOnly` | `--co` | boolean | `false` | Show only backup catalog (skip configuration) |
| `--limit` | `-l` | number | `20` | Limit number of results returned |
| `--backupType` | `--type` | string | `"all"` | Filter by backup type. Choices: `complete`, `data`, `log`, `incremental`, `differential`, `all` |
| `--status` | `--st` | string | `"all"` | Filter by backup status. Choices: `successful`, `running`, `failed`, `canceled`, `all` |
| `--days` | `-d` | number | `7` | Show backups from the last N days |

### Troubleshooting

| Option              | Alias     | Type    | Default | Description                                                                                              |
|---------------------|-----------|---------|---------|----------------------------------------------------------------------------------------------------------|
| `--disableVerbose`  | `--quiet` | boolean | `false` | Disable verbose output - removes all extra output that is only helpful to human readable interface       |
| `--debug`           | `-d`      | boolean | `false` | Debug hana-cli itself by adding output of LOTS of intermediate details                                   |

### Backup Types

- **complete**: Full database backup
- **data**: Data backup only
- **log**: Transaction log backup
- **incremental**: Incremental backup (only changes since last backup)
- **differential**: Differential backup (only changes since last complete backup)
- **all**: All backup types (default)

### Backup Status

- **successful**: Completed successfully
- **running**: Currently in progress
- **failed**: Failed to complete
- **canceled**: Manually canceled
- **all**: All backup statuses (default)

For a complete list of parameters and options, use:

```bash
hana-cli backupStatus --help
```

## Notes

- **Privileges**: Some backup information requires system privileges. Use `--admin` flag for full access to all backup details.
- **Time Range**: The default look-back period is 7 days. Use `--days` to adjust (e.g., `--days 30` for 30 days).
- **Filtering**: You can combine multiple filters like `--backupType complete --status successful` to narrow results.

## Examples

### Basic Usage - Show recent backups (last 7 days)

```bash
hana-cli backupStatus
```

Displays backup status for the last 7 days

### View backups from last 30 days

```bash
hana-cli backupStatus --days 30
```

Extends the look-back period to 30 days

### Filter by backup type

```bash
hana-cli backupStatus --backupType complete --limit 10
```

Shows only complete backups, limited to 10 results

### Filter by status

```bash
hana-cli backupStatus --status successful
```

Shows only successful backups

### View with admin privileges

```bash
hana-cli backupStatus --admin
```

Connects with admin user (default-env-admin.json) for full access to backup information (recommended for viewing all backup details and progress)

### Show only catalog (skip configuration)

```bash
hana-cli backupStatus --catalogOnly
```

Displays backup catalog without configuration information

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Backup & Recovery](..)
- [All Commands A-Z](../all-commands.md)
