# deadlocks

> Command: `deadlocks`  
> Category: **Performance Monitoring**  
> Status: Production Ready

## Description

Analyze and detect deadlock situations in the SAP HANA database. This command identifies circular lock dependencies (deadlocks) and blocked transactions, providing recommendations for resolution.

## Syntax

```bash
hana-cli deadlocks [options]
```

## Aliases

- `deadlock`
- `dl`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli deadlocks]) --> Input{Input Parameters}
    Input -->|limit| Limit[Maximum Results<br/>Default: 50]
    
    Limit --> QueryDeadlocks[Query M_LOCKS<br/>for Circular Dependencies]
    
    QueryDeadlocks --> HasDeadlocks{Deadlocks<br/>Found?}
    
    HasDeadlocks -->|Yes| DisplayDeadlocks[Display Deadlock<br/>Details & Warning]
    HasDeadlocks -->|No| NoDeadlocks[Display: No<br/>Deadlocks Detected]
    
    DisplayDeadlocks --> QueryBlocked[Query Blocked<br/>Transactions]
    NoDeadlocks --> QueryBlocked
    
    QueryBlocked --> HasBlocked{Blocked<br/>Trans?}
    
    HasBlocked -->|Yes| DisplayBlocked[Display Blocked<br/>Transactions]
    HasBlocked -->|No| NoBlocked[Display: No<br/>Blocked Transactions]
    
    DisplayBlocked --> ShowRecs[Show Recommendations<br/>for Resolution]
    
    ShowRecs --> Complete([Command Complete])
    NoBlocked --> Complete
    
    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Input fill:#f39c12
    style HasDeadlocks fill:#f39c12
    style HasBlocked fill:#f39c12
    style ShowRecs fill:#9b59b6
```

## Parameters

### Options

| Option    | Alias | Type   | Default | Description                                         |
|-----------|-------|--------|---------|-----------------------------------------------------|
| `--limit` | `-l`  | number | `50`    | Maximum number of blocked transactions to display   |

### Connection Parameters

| Option    | Alias | Type    | Default | Description                                          |
|-----------|-------|---------|---------|------------------------------------------------------|
| `--admin` | `-a`  | boolean | `false` | Connect via admin (default-env-admin.json)           |
| `--conn`  | -     | string  | -       | Connection filename to override default-env.json     |

### Troubleshooting

| Option              | Alias     | Type    | Default | Description                                                                 |
|---------------------|-----------|---------|---------|-----------------------------------------------------------------------------|
| `--disableVerbose`  | `--quiet` | boolean | `false` | Disable verbose output                                                      |
| `--debug`           | `-d`      | boolean | `false` | Debug hana-cli itself by adding output of intermediate details             |

## Examples

### Analyze Deadlocks

```bash
hana-cli deadlocks --limit 50
```

Analyze the database for deadlocks and blocked transactions with a limit of 50 results.

### Quick Deadlock Check

```bash
hana-cli deadlocks
```

Perform a quick deadlock analysis with default settings.

### Detailed Deadlock Analysis

```bash
hana-cli deadlocks --limit 100
```

Perform a comprehensive deadlock analysis with up to 100 blocked transactions displayed.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Performance Monitoring](..)
- [All Commands A-Z](../all-commands.md)
