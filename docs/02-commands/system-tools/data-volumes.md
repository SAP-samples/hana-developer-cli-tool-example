# dataVolumes

> Command: `dataVolumes`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Inspect HANA data volume usage and statistics.

## Syntax

```bash
hana-cli dataVolumes [options]
```

## Command Diagram

```mermaid
    graph TD
        Start([hana-cli dataVolumes]) --> Connect[Connect to database]
        Connect --> Query1[Query SYS.M_DATA_VOLUMES]
        Query1 --> Query2[Query SYS.M_DATA_VOLUME_STATISTICS]
        Query2 --> Query3[Query SYS.M_DATA_VOLUME_PAGE_STATISTICS]
        Query3 --> Output[Render result tables]
        Output --> Complete([Command Complete])

        style Start fill:#0092d1
        style Complete fill:#2ecc71
```

## Aliases

- `dv`
- `datavolumes`

## Parameters

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| - | - | - | - | No command-specific options |

For a complete list of parameters and options, use:

```bash
hana-cli dataVolumes --help
```

## Examples

### Basic Usage

```bash
hana-cli dataVolumes
```

Show data volume, volume statistics, and page statistics.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
