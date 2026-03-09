# inspectLibMember

> Command: `inspectLibMember`  
> Category: **Object Inspection**  
> Status: Production Ready

## Description

Return metadata about a Library Member

## Syntax

```bash
hana-cli inspectLibMember [schema] [library] [libraryMem] [options]
```

## Aliases

- `ilm`
- `libraryMember`
- `librarymember`
- `insLibMem`
- `inspectlibrarymember`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli inspectLibMember]) --> Inputs{Inputs}
    Inputs --> Schema[Schema<br/>default **CURRENT_SCHEMA**]
    Inputs --> Library[Library name]
    Inputs --> Member[Member name]
    Inputs --> OutputType[Output<br/>tbl or sql]
    Schema --> Inspect[Read library member metadata]
    Library --> Inspect
    Member --> Inspect
    OutputType --> Inspect
    Inspect --> Done([Command Complete])

    style Start fill:#0092d1
    style Done fill:#2ecc71
    style Inputs fill:#f39c12
```

## Parameters

### Positional Arguments

| Parameter | Type | Description |
|---|---|---|
| `schema` | string | Target schema (optional positional input). |
| `library` | string | Library name (optional positional input). |
| `libraryMem` | string | Library member name (optional positional input). |

### Options

| Option | Alias | Type | Default | Description |
|---|---|---|---|---|
| `--library` | `--lib` | string | - | Library name to inspect. |
| `--libraryMem` | `-m`, `--libMem` | string | - | Library member name to inspect. |
| `--schema` | `-s` | string | `**CURRENT_SCHEMA**` | Schema that contains the library member. |
| `--output` | `-o` | string | `tbl` | Output format. Choices: `tbl`, `sql`. |

## Examples

### Basic Usage

```bash
hana-cli inspectLibMember --library myLib --libraryMem myMember --output tbl
```

Inspect metadata for a specific library member.

## Related Commands

- [`libraries`](libraries.md)
- [`inspectLibrary`](inspect-library.md)

## See Also

- [Category: Object Inspection](..)
- [All Commands A-Z](../all-commands.md)
