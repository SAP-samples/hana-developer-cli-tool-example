# dataLineage

> Command: `dataLineage`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Execute dataLineage command

## Syntax

```bash
hana-cli dataLineage [options]
```

## Aliases

- `lineage`
- `dataFlow`
- `traceLineage`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli dataLineage --help
```

## Key Options

- `--timeout, -to` (number): Operation timeout in seconds (default: `3600`)

## Examples

### Basic Usage

```bash
hana-cli hana-cli dataLineage --table myTable --depth 3
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
