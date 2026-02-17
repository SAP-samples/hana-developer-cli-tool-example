# referentialCheck

> Command: `referentialCheck`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Execute referentialCheck command

## Syntax

```bash
hana-cli referentialCheck [options]
```

## Aliases

- `refcheck`
- `checkReferential`
- `fkcheck`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli referentialCheck --help
```

## Key Options

- `--limit, -l` (number): Maximum rows to check (default: `10000`)
- `--timeout, -to` (number): Operation timeout in seconds (default: `3600`)

## Examples

### Basic Usage

```bash
hana-cli hana-cli referentialCheck --table myTable --mode check
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
