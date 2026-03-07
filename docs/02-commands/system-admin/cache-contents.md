# cacheStats

> Command: `cacheStats`  
> Category: **System Admin**  
> Status: Production Ready

## Description

View SQL plan cache and result cache statistics from the SAP HANA database. This command allows you to analyze cache performance and memory utilization by querying the `M_SQL_PLAN_CACHE` and `M_RESULT_CACHE` system views.

## Syntax

```bash
hana-cli cacheStats [options]
```

## Command Diagram

```mermaid
graph TD
    Start([hana-cli cacheStats]) --> Input{Input Parameters}
    Input --> CacheType[Cache Type Selection<br/>plan, result, or all]
    Input --> Limit[Result Limit<br/>default: 50]
    
    CacheType --> Process{Cache Type?}
    Process -->|plan| PlanCache[Query M_SQL_PLAN_CACHE<br/>SQL plan cache statistics]
    Process -->|result| ResultCache[Query M_RESULT_CACHE<br/>Result cache statistics]
    Process -->|all| BothCaches[Query Both Caches<br/>Combined statistics]
    
    PlanCache --> LimitCheck{Apply Limit?}
    ResultCache --> LimitCheck
    BothCaches --> LimitCheck
    
    LimitCheck -->|Yes| ApplyLimit[Limit Results to N rows]
    LimitCheck -->|No| Output[Display Results]
    
    ApplyLimit --> Output
    Output --> Complete([Command Complete])
    
    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Process fill:#f39c12
```

## Parameters

### Options

| Option        | Alias | Type   | Default | Description                                                    |
|---------------|-------|--------|---------|----------------------------------------------------------------|
| `--cacheType` | `-t`  | string | `all`   | Type of cache to query. Choices: `plan`, `result`, `all`      |
| `--limit`     | `-l`  | number | `50`    | Maximum number of cache entries to return                      |

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

### View All Cache Statistics

```bash
hana-cli cacheStats --cacheType all
```

Display both SQL plan cache and result cache statistics.

### View SQL Plan Cache Only

```bash
hana-cli cacheStats --cacheType plan --limit 100
```

View the top 100 entries from the SQL plan cache.

### View Result Cache Only

```bash
hana-cli cacheStats --cacheType result --limit 25
```

View the top 25 entries from the result cache.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Admin](..)
- [All Commands A-Z](../all-commands.md)
