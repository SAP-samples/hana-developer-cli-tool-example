# dataDiff

> Command: `dataDiff`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Execute dataDiff command

## Syntax

```bash
hana-cli dataDiff [options]
```

## Aliases

- `ddiff`
- `diffData`
- `dataCompare`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli dataDiff --help
```

## Key Options

- `--showValues, -sv` (boolean): Include actual values in report (default: `false`)
- `--limit, -l` (number): Maximum rows to compare (default: `10000`)
- `--timeout, -to` (number): Operation timeout in seconds (default: `3600`)

## Examples

### Basic Usage

```bash
hana-cli hana-cli dataDiff --table1 source_data --table2 target_data
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
