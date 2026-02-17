# dataSync

> Command: `dataSync`  
> Category: **Data Tools**  
> Status: Production Ready

## Description

Synchronize data between systems or tables

## Syntax

```bash
hana-cli dataSync [options]
```

## Aliases

- `datasync`
- `syncData`
- `sync`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli dataSync --help
```

## Key Options

- `--timeout, -to` (number): Operation timeout in seconds (default: `3600`)

## Examples

### Basic Usage

```bash
hana-cli hana-cli dataSync --sourceConnection conn1 --targetConnection conn2 --table myTable
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Data Tools](..)
- [All Commands A-Z](../all-commands.md)
