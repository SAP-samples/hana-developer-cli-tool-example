# libraries

> Command: `libraries`  
> Category: **Object Inspection**  
> Status: Production Ready

## Description

Get a list of all libraries

## Syntax

```bash
hana-cli libraries [schema] [library] [options]
```

## Aliases

- `l`
- `listLibs`
- `ListLibs`
- `listlibs`
- `ListLib`
- `listLibraries`
- `listlibraries`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli libraries]) --> Inputs{Inputs}
    Inputs --> Schema[Schema<br/>default **CURRENT_SCHEMA**]
    Inputs --> Library[Library pattern<br/>default *]
    Inputs --> Limit[Limit<br/>default 200]
    Schema --> Query[Query LIBRARIES view]
    Library --> Query
    Limit --> Query
    Query --> Output[Render results table]
    Output --> Done([Command Complete])

    style Start fill:#0092d1
    style Done fill:#2ecc71
    style Inputs fill:#f39c12
```

## Parameters

### Positional Arguments

| Parameter | Type | Description |
|---|---|---|
| `schema` | string | Schema name filter (optional positional input). |
| `library` | string | Library name filter (optional positional input). |

### Options

| Option | Alias | Type | Default | Description |
|---|---|---|---|---|
| `--library` | `--lib` | string | `*` | Library name pattern to match. |
| `--schema` | `-s` | string | `**CURRENT_SCHEMA**` | Schema name or pattern to match. |
| `--limit` | `-l` | number | `200` | Maximum number of rows returned. |
| `--profile` | `-p` | string | - | Connection profile override. |

For additional shared options from the common command builder, use `hana-cli libraries --help`.

## Examples

### Basic Usage

```bash
hana-cli libraries --schema MYSCHEMA --library %
```

Execute the command

### Limit Results

```bash
hana-cli libraries --schema MYSCHEMA --limit 50
```

Return only the first 50 matching rows.

## Related Commands

- [`inspectLibrary`](inspect-library.md)
- [`inspectLibMember`](inspect-lib-member.md)

## See Also

- [Category: Object Inspection](..)
- [All Commands A-Z](../all-commands.md)
