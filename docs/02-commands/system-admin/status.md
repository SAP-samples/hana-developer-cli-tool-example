# status

> Command: `status`  
> Category: **System Admin**  
> Status: Production Ready

## Description

Get Connection Status and user information. This command displays the current database connection details, including the current user, current schema, session context information, granted roles, and optionally, granted privileges.

## Syntax

```bash
hana-cli status [options]
```

## Aliases

- `s`
- `whoami`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli status]) --> Connect[Connect to Database]
    Connect --> CurrentUser[Query Current User<br/>and Current Schema]
    
    CurrentUser --> Display1[Display User Information]
    Display1 --> SessionContext[Query Session Context<br/>M_SESSION_CONTEXT]
    
    SessionContext --> Display2[Display Session Information]
    Display2 --> Roles[Query Granted Roles<br/>GRANTED_ROLES]
    
    Roles --> Display3[Display User Roles]
    Display3 --> PrivCheck{Show Privileges?}
    
    PrivCheck -->|Yes --priv| Privileges[Query Granted Privileges<br/>GRANTED_PRIVILEGES]
    PrivCheck -->|No| Complete
    
    Privileges --> Display4[Display User Privileges]
    Display4 --> Complete([Command Complete])
    
    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style PrivCheck fill:#f39c12
```

## Parameters

### Options

| Option   | Alias                | Type    | Default | Description                                   |
|----------|----------------------|---------|---------|-----------------------------------------------|
| `--priv` | `-p`, `--privileges` | boolean | `false` | Display granted privileges in addition to roles |

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

### Basic Usage

```bash
hana-cli status
```

Display current user, schema, session context, and granted roles.

### View With Privileges

```bash
hana-cli status --priv
```

Display connection status including all granted privileges.

### Using Alias

```bash
hana-cli whoami
```

Quick check of current database user using the `whoami` alias.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Admin](..)
- [systemInfo](./system-info.md) - Display database system information
- [healthCheck](./health-check.md) - Perform comprehensive health checks
- [All Commands A-Z](../all-commands.md)
