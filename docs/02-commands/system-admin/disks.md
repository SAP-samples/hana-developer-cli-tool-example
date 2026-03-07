# disks

> Command: `disks`  
> Category: **System Admin**  
> Status: Production Ready

## Description

Display details about disk devices used by SAP HANA including disk information from `M_DISKS` and disk usage statistics from `M_DISK_USAGE`. This command helps monitor storage capacity, usage patterns, and disk performance.

## Syntax

```bash
hana-cli disks [options]
```

## Aliases

- `di`
- `Disks`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli disks]) --> Connect[Connect to Database]
    Connect --> QueryDisks[Query M_DISKS<br/>Disk Device Information]
    
    QueryDisks --> DisplayDisks[Display Disk Devices<br/>Paths, Types, Sizes]
    DisplayDisks --> QueryUsage[Query M_DISK_USAGE<br/>Disk Usage Statistics]
    
    QueryUsage --> DisplayUsage[Display Disk Usage<br/>Used/Free Space]
    DisplayUsage --> Complete([Command Complete])
    
    style Start fill:#0092d1
    style Complete fill:#2ecc71
```

## Parameters

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

### View Disk Information

```bash
hana-cli disks
```

Display disk devices and usage statistics for the SAP HANA system.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Admin](..)
- [hostInformation](./host-information.md) - Host resource information
- [systemInfo](./system-info.md) - System information
- [All Commands A-Z](../all-commands.md)
