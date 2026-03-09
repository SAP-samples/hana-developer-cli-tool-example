# memoryLeaks

> Command: `memoryLeaks`  
> Category: **Performance Monitoring**  
> Status: Production Ready

## Description

Detect potential memory leaks in the SAP HANA database. This command analyzes service memory usage and heap memory objects to identify services exceeding memory thresholds and potential leak indicators.

## Syntax

```bash
hana-cli memoryLeaks [options]
```

## Aliases

- `memleak`
- `ml`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli memoryLeaks]) --> Input{Input Parameters}
    Input -->|component| Component[Component Filter<br/>Optional]
    Input -->|threshold| Threshold[Memory Threshold %<br/>Default: 10%]
    Input -->|limit| Limit[Maximum Results<br/>Default: 50]
    
    Component --> QueryService[Query Service<br/>Memory Usage]
    Threshold --> QueryService
    Limit --> QueryService
    
    QueryService --> DisplayService[Display Service<br/>Memory Stats]
    
    DisplayService --> CheckThreshold{Services Above<br/>Threshold?}
    
    CheckThreshold -->|Yes| HighlightServices[Highlight High<br/>Memory Services]
    CheckThreshold -->|No| ProceedToObjects[Continue to<br/>Memory Objects]
    
    HighlightServices --> ProceedToObjects
    
    ProceedToObjects --> QueryObjects[Query Heap<br/>Memory Objects]
    
    QueryObjects --> CheckComponent{Component<br/>Filter?}
    
    CheckComponent -->|Yes| FilterObjects[Filter by<br/>Component]
    CheckComponent -->|No| AllObjects[All Memory<br/>Objects]
    
    FilterObjects --> GroupDisplay[Group and Display<br/>by Category]
    AllObjects --> GroupDisplay
    
    GroupDisplay --> Complete([Command Complete])
    
    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Input fill:#f39c12
    style CheckThreshold fill:#f39c12
    style CheckComponent fill:#f39c12
    style HighlightServices fill:#9b59b6
```

## Parameters

### Options

| Option        | Alias | Type   | Default | Description                                                          |
|---------------|-------|--------|---------|----------------------------------------------------------------------|
| `--component` | `-c`  | string | -       | Component name to filter memory objects (optional)                   |
| `--threshold` | `-t`  | number | `10`    | Memory usage threshold percentage to flag services                   |
| `--limit`     | `-l`  | number | `50`    | Maximum number of memory objects to display                          |

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

### Detect Memory Leaks with High Threshold

```bash
hana-cli memoryLeaks --threshold 25 --limit 100
```

Detect services using more than 25% of their allocated heap memory, showing up to 100 memory objects.

### Analyze Specific Component

```bash
hana-cli memoryLeaks --component indexserver --threshold 15
```

Analyze memory usage specifically for the indexserver component with a 15% threshold.

### Quick Memory Leak Check

```bash
hana-cli memoryLeaks
```

Perform a memory leak check with default settings (10% threshold, 50 objects).

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Performance Monitoring](..)
- [All Commands A-Z](../all-commands.md)
