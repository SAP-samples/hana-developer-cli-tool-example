# Performance Monitoring

Monitor performance, expensive operations, and system bottlenecks

| Command | Aliases | Description |
|---------|---------|-------------|
| `blocking` | `b`, `locks` | Find blocking locks |
| `columnStats` | - | Analyze column statistics |
| `deadlocks` | `deadlock`, `dl` | Find deadlock information |
| `expensiveStatements` | - | Find expensive SQL statements |
| `fragmentationCheck` | `frag`, `fc` | Check table fragmentation |
| `indexTest` | - | - |
| `longRunning` | `lr`, `longrunning` | Find long-running operations |
| `memoryAnalysis` | - | Analyze memory consumption |
| `memoryLeaks` | `memleak`, `ml` | Find potential memory leaks |
| `queryPlan` | - | Analyze query execution plan |
| `querySimple` | `qs`, `querysimple` | Run simple queries |
| `querySimpleUI` | `qsui`, `querysimpleui`, `queryUI`, `sqlUI` | - |
| `reclaim` | - | Reclaim unused space |
| `recommendations` | `rec`, `recommend` | Get system recommendations |
| `tableHotspots` | `th`, `hotspots` | Identify heavily accessed tables |

## `blocking`

**Aliases:** `b`, `locks`
**Tags:** blocking, lock, session
- Find blocking locks
- Identify deadlocks

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `50` | limit |
| `--details` (`-d`) | boolean | `false` | details |

**Related:** `deadlocks`, `longRunning`, `connections`

---

## `columnStats`

```bash
hana-cli columnStats [schema] [table]
```

**Tags:** statistics, column-analysis
- Analyze column statistics
- Update column statistics

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | `"*"` | table |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `tables`, `inspectTable`, `tableHotspots`

---

## `deadlocks`

**Aliases:** `deadlock`, `dl`
**Tags:** deadlock, lock, session
- Find deadlock information
- Analyze lock contention

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `longRunning`, `blocking`, `healthCheck`

---

## `expensiveStatements`

**Tags:** performance, sql, slow-queries
- Find expensive SQL statements
- Identify performance problems

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `50` | limit |
| `--orderBy` (`-o`) | string | `'totalTime'` | expensiveStatementsOrderBy |

### Examples

**Find slow queries:** `hana-cli expensiveStatements --limit 10`
> Shows statements from SQL plan cache

**Related:** `longRunning`, `queryPlan`, `blocking`

---

## `fragmentationCheck`

**Aliases:** `frag`, `fc`
**Tags:** fragmentation, performance, diagnostics
- Check table fragmentation
- Monitor storage efficiency

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--table` (`-t`) | string | `null` | table |
| `--threshold` (`--th`) | number | `10` | fragmentationThreshold |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `reclaim`, `healthCheck`

---

## `indexTest`


**Related:** `indexes`, `tableHotspots`

---

## `longRunning`

**Aliases:** `lr`, `longrunning`
**Tags:** long-running, slow, performance
- Find long-running operations
- Monitor slow processes

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `50` | limit |
| `--duration` (`-d`) | number | `60` | queryDuration |
| `--includeIdle` (`-i`) | boolean | `false` | idleSession |
| `--cancel` (`-c`) | string | - | Statement hash to cancel |

**Related:** `expensiveStatements`, `deadlocks`, `blocking`

---

## `memoryAnalysis`

**Tags:** memory, performance, resource-usage
- Analyze memory consumption
- Find memory-heavy tables

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--component` (`-c`) | string | `'*'` | component |
| `--limit` (`-l`) | number | `200` | limit |

### Examples

**Analyze memory usage:** `hana-cli memoryAnalysis `
> Identifies memory-intensive tables

**Related:** `memoryLeaks`, `healthCheck`, `systemInfo`

---

## `memoryLeaks`

**Aliases:** `memleak`, `ml`
**Tags:** memory, memory-leak, diagnostics
- Find potential memory leaks
- Monitor memory issues

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--component` (`-c`) | string | `null` | component |
| `--threshold` (`-t`) | number | `10` | threshold |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `memoryAnalysis`, `healthCheck`

---

## `queryPlan`

**Tags:** execution-plan, sql-analysis, performance
- Analyze query execution plan
- Optimize queries

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--sql` (`-q`, `--sql`) | string | - | query |

**Related:** `querySimple`, `expensiveStatements`

---

## `querySimple`

**Aliases:** `qs`, `querysimple`
**Tags:** query, sql, execution
- Run simple queries

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--query` (`-q`) | string | - | query |
| `--folder` (`-f`) | string | `'./'` | folder |
| `--filename` (`-n`) | string | - | filename |
| `--output` (`-o`) | string | `"table"` | outputTypeQuery |
| `--profile` (`-p`) | string | - | profile |

**Related:** `queryPlan`, `expensiveStatements`

---

## `querySimpleUI`

**Aliases:** `qsui`, `querysimpleui`, `queryUI`, `sqlUI`

**Related:** `querySimple`

---

## `reclaim`

**Tags:** reclaim, cleanup, maintenance
- Reclaim unused space
- Perform maintenance

**Related:** `fragmentationCheck`, `dataVolumes`

---

## `recommendations`

**Aliases:** `rec`, `recommend`
**Tags:** recommendation, optimization, best-practices
- Get system recommendations
- Find optimization opportunities

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--category` (`-c`) | string | `'all'` | Recommendation category |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `healthCheck`, `expensiveStatements`

---

## `tableHotspots`

```bash
hana-cli tableHotspots [schema] [table]
```

**Aliases:** `th`, `hotspots`
**Tags:** hotspot, high-load, performance
- Identify heavily accessed tables
- Find performance bottlenecks

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | `"*"` | table |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--includePartitions` (`-p`, `--Partitions`) | boolean | `true` | includePartitions |
| `--limit` (`-l`, `--Limit`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `columnStats`, `indexes`, `inspectTable`

---
