# tableCopy

> Command: `tableCopy`  
> Category: **Object Inspection**  
> Status: Production Ready

## Description

Copy table structure and/or data with optional filtering

## Syntax

```bash
hana-cli tableCopy [options]
```

## Aliases

- `tablecopy`
- `copyTable`
- `copytable`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli tableCopy --help
```

## Key Options

- `--limit, -l` (number): Maximum rows to copy
- `--timeout, -to` (number): Operation timeout in seconds (default: `3600`)

## Examples

### Basic Usage

```bash
hana-cli hana-cli tableCopy --sourceTable src_table --targetTable tgt_table --batchSize 1000
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Object Inspection](..)
- [All Commands A-Z](../all-commands.md)
