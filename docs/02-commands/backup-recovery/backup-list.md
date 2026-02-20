# backupList

> Command: `backupList`  
> Category: **Backup & Recovery**  
> Status: Production Ready

## Description

List available backups

## Syntax

```bash
hana-cli backupList [directory] [options]
```

## Aliases

- `blist`
- `listBackups`
- `backups`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli backupList]) --> Input{Input Parameters}
    Input -->|directory| Dir[Directory Path<br/>Optional: Directory to scan]
    
    Dir --> Scan[Scan Directory]
    Scan --> Filter{Filter Options}
    
    Filter -->|backupType| Type{Backup Type Filter}
    Type -->|all| AllTypes[All Backups<br/>Default]
    Type -->|table| TableOnly[Table Backups Only]
    Type -->|schema| SchemaOnly[Schema Backups Only]
    Type -->|database| DatabaseOnly[Database Backups Only]
    
    AllTypes --> Sort{Sort Configuration}
    TableOnly --> Sort
    SchemaOnly --> Sort
    DatabaseOnly --> Sort
    
    Sort -->|sortBy| SortField{Sort By Field}
    SortField -->|date| ByDate[Sort by Date<br/>Default]
    SortField -->|name| ByName[Sort by Name]
    SortField -->|size| BySize[Sort by Size]
    SortField -->|type| ByType[Sort by Type]
    
    ByDate --> Order{Sort Order}
    ByName --> Order
    BySize --> Order
    ByType --> Order
    
    Order -->|desc| Descending[Descending<br/>Default]
    Order -->|asc| Ascending[Ascending]
    
    Descending --> Limit{Apply Limit}
    Ascending --> Limit
    
    Limit -->|limit| LimitVal[Max Results<br/>Default: 50]
    
    LimitVal --> Display{Display Mode}
    Display -->|showDetails=false| Summary[Summary View<br/>Basic info only]
    Display -->|showDetails=true| Detailed[Detailed View<br/>Full metadata]
    
    Summary --> Output[Display Results]
    Detailed --> Output
    
    Output --> Complete([Backup List Complete])
    
    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Type fill:#f39c12
    style SortField fill:#f39c12
    style Display fill:#9b59b6
```

## Parameters

### Positional Arguments

| Parameter   | Type   | Description                                                    |
|-------------|--------|----------------------------------------------------------------|
| `directory` | string | Directory to scan for backups (optional)                       |

### Options

| Option           | Alias      | Type    | Default  | Description                                                                 |
|------------------|------------|---------|----------|-----------------------------------------------------------------------------|
| `--directory`    | `--dir`    | string  | -        | Directory to scan for backups                                               |
| `--backupType`   | `--type`   | string  | `"all"`  | Type of backup. Choices: `table`, `schema`, `database`, `all`               |
| `--sortBy`       | `--sort`   | string  | `"date"` | Sort backups by field. Choices: `name`, `date`, `size`, `type`              |
| `--order`        | `-o`       | string  | `"desc"` | Sort order. Choices: `asc`, `desc`                                          |
| `--limit`        | `-l`       | number  | `50`     | Limit number of results                                                     |
| `--showDetails`  | `--details`| boolean | `false`  | Show detailed backup information including metadata                         |
| `--help`         | `-h`       | boolean | -        | Show help                                                                   |

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
hana-cli hana-cli backupList --backupPath /backups
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Backup & Recovery](..)
- [All Commands A-Z](../all-commands.md)
