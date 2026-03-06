# massExport

> Command: `massExport`  
> Category: **Mass Operations**  
> Status: Production Ready

## Description

Export multiple database objects at once in various formats. This command allows you to bulk export tables, views, and other database objects to CSV, JSON, or other supported formats, with optional data export capabilities.

### Use Cases

- **Backup & Archive**: Export schema objects for version control or archival
- **Data Migration**: Export tables with data for transfer to other systems
- **Documentation**: Generate object metadata and structure documentation
- **Bulk Operations**: Export multiple related objects in a single command
- **Format Conversion**: Convert between data formats (CSV, JSON, etc.)

### Supported Formats

| Format | Description | Best For |
|--------|-------------|----------|
| `csv`  | Comma-separated values (default) | Spreadsheet import, general data exchange |
| `json` | JavaScript Object Notation | Web APIs, structured data |

## Syntax

```bash
hana-cli massExport [schema] [object] [options]
```

## Aliases

- `me`
- `mexport`
- `massExp`
- `massexp`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli massExport]) --> Input{Input Parameters}
    Input -->|schema| Schema[Schema Name<br/>Required]
    Input -->|object| Object[Object Pattern<br/>Required<br/>Supports wildcards]
    
    Schema --> Format{Output Format}
    Object --> Format
    
    Format -->|csv| CSV[📄 CSV Format<br/>Default]
    Format -->|json| JSON[📄 JSON Format]
    
    CSV --> Config{Configuration}
    JSON --> Config
    
    Config -->|objectType| TypeFilter[Filter by Type<br/>TABLE, VIEW, PROCEDURE, etc.]
    Config -->|limit| Limit[Apply Limit<br/>Default: 1000]
    Config -->|includeData| Data{Include Data?}
    
    TypeFilter --> Output[Output Directory]
    Limit --> Output
    
    Data -->|true| WithData[Export with Data<br/>Structure + Content]
    Data -->|false| StructureOnly[Export Structure Only<br/>Default]
    
    WithData --> Results[Generate Files]
    StructureOnly --> Results
    
    Results --> Success[✓ Export Complete]
```

## Parameters

| Parameter | Alias | Type | Default | Required | Description |
|-----------|-------|------|---------|----------|-------------|
| `schema` | `s` | string | - | Yes | Database schema to export from |
| `object` | `o` | string | - | Yes | Object name or pattern (use `%` for all) |
| `objectType` | `t`, `type` | string | - | No | Filter by object type (TABLE, VIEW, PROCEDURE, etc.) |
| `limit` | `l` | number | 1000 | No | Maximum number of objects to export |
| `format` | `f` | string | `csv` | No | Output format (csv, json) |
| `folder` | `d`, `directory` | string | - | No | Output directory for exported files |
| `includeData` | `data` | boolean | false | No | Include actual table data in export |

For a complete list of parameters and options, use:

```bash
hana-cli massExport --help
```

## Examples

### Export All Tables as CSV

```bash
hana-cli massExport --schema MYSCHEMA --object % --format csv --folder exports/
```

### Export Specific Table with Data

```bash
hana-cli massExport --schema MYSCHEMA --object CUSTOMERS --format json --folder exports/ --includeData
```

### Export Tables Matching Pattern

```bash
hana-cli massExport --schema MYSCHEMA --object "SALES%" --objectType TABLE --format csv
```

### Export Views Only

```bash
hana-cli massExport -s MYSCHEMA -o % -t VIEW -f json -d views/
```

## Related Commands

- [massDelete](mass-delete.md) - Bulk delete database objects
- [massConvert](mass-convert.md) - Convert objects to different formats

## See Also

- [Category: Mass Operations](..)
- [All Commands A-Z](../all-commands.md)
