# cacheStats

> Command: `cacheStats`  
> Category: **System Tools**  
> Status: Production Ready

## Description

This page exists for the `/cache-contents` route. Use `cacheStats` to view SQL plan cache and result cache statistics.

## Syntax

```bash
hana-cli cacheStats [options]
```

## Command Diagram

```mermaid
    graph TD
        Start([hana-cli cacheStats]) --> Inputs{Read options}
        Inputs --> CacheType[cacheType: plan/result/all]
        Inputs --> Limit[limit: max rows]
        CacheType --> QueryPlan[Query SYS.M_SQL_PLAN_CACHE when needed]
        CacheType --> QueryResult[Query SYS.M_RESULT_CACHE when needed]
        Limit --> QueryPlan
        Limit --> QueryResult
        QueryPlan --> Output[Render results]
        QueryResult --> Output
        Output --> Complete([Command Complete])

        style Start fill:#0092d1
        style Complete fill:#2ecc71
        style Inputs fill:#f39c12
```

## Aliases

- No aliases

## Parameters

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--cacheType` | `-t` | string | `all` | Cache type to query. Choices: `plan`, `result`, `all` |
| `--limit` | `-l` | number | `50` | Maximum rows returned per cache query |

For complete option output, use:

```bash
hana-cli cacheStats --help
```

## Examples

### Basic Usage

```bash
hana-cli cacheStats --cacheType all
```

View SQL plan cache and result cache statistics

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Cache Statistics](../performance-monitoring/cache-stats.md)
- [All Commands A-Z](../all-commands.md)
