# ports

> Command: `ports`  
> Category: **System Admin**  
> Status: Production Ready

## Description

Display port assignments for internal SAP HANA services. This command queries the `M_SERVICES` system view to show service names and their assigned PORT and SQL_PORT values, helping administrators identify service endpoints and troubleshoot connectivity issues.

## Syntax

```bash
hana-cli ports [options]
```

## Command Diagram

```mermaid
graph TD
    Start([hana-cli ports]) --> Connect[Connect to Database]
    Connect --> Query[Query M_SERVICES<br/>for Port Assignments]
    
    Query --> Extract[Extract Service Name,<br/>PORT, SQL_PORT]
    Extract --> Display[Display Port Table]
    
    Display --> Complete([Command Complete])
    
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

### View Port Assignments

```bash
hana-cli ports
```

Display all SAP HANA service port assignments.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Admin](..)
- [hostInformation](./host-information.md) - Host information
- [systemInfo](./system-info.md) - System information
- [All Commands A-Z](../all-commands.md)
