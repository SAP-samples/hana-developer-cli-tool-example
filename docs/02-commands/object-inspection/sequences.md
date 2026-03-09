# sequences

> Command: `sequences`  
> Category: **Object Inspection**  
> Status: Production Ready

## Description

Get a list of all sequences

## Syntax

```bash
hana-cli sequences [schema] [sequence] [options]
```

## Aliases

- `seq`
- `listSeqs`
- `ListSeqs`
- `listseqs`
- `Listseq`
- `listSequences`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli sequences]) --> Inputs{Inputs}
    Inputs --> Schema[Schema<br/>default **CURRENT_SCHEMA**]
    Inputs --> Seq[Sequence pattern<br/>default *]
    Inputs --> Limit[Limit<br/>default 200]
    Schema --> Query[Query M_SEQUENCES view]
    Seq --> Query
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
| `sequence` | string | Sequence name filter (optional positional input). |

### Options

| Option | Alias | Type | Default | Description |
|---|---|---|---|---|
| `--sequence` | `--seq` | string | `*` | Sequence name pattern to match. |
| `--schema` | `-s` | string | `**CURRENT_SCHEMA**` | Schema name or pattern to match. |
| `--limit` | `-l` | number | `200` | Maximum number of rows returned. |
| `--profile` | `-p` | string | - | Connection profile override. |

For additional shared options from the common command builder, use `hana-cli sequences --help`.

## Examples

### Basic Usage

```bash
hana-cli sequences --schema MYSCHEMA --sequence %
```

Execute the command

### Limit Results

```bash
hana-cli sequences --schema MYSCHEMA --limit 50
```

Return only the first 50 matching rows.

## Related Commands

- [`tables`](tables.md)
- [`objects`](objects.md)

## See Also

- [Category: Object Inspection](..)
- [All Commands A-Z](../all-commands.md)
