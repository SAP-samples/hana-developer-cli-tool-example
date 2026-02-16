# querySimple

> Command: `querySimple`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Execute single SQL command and output results

## Syntax

```bash
hana-cli querySimple [options]
```

## Aliases

- `qs`
- `querysimple`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli querySimple --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli querySimple --query "SELECT * FROM CUSTOMERS" --output csv
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
