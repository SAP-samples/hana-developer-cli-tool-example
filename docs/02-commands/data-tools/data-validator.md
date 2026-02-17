# dataValidator

> Command: `dataValidator`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Execute dataValidator command

## Syntax

```bash
hana-cli dataValidator [options]
```

## Aliases

- `dval`
- `validateData`
- `dataValidation`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli dataValidator --help
```

## Key Options

- `--limit, -l` (number): Maximum rows to validate (default: `10000`)
- `--timeout, -to` (number): Operation timeout in seconds (default: `3600`)

## Examples

### Basic Usage

```bash
hana-cli hana-cli dataValidator --table myTable --rules validation.json
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
