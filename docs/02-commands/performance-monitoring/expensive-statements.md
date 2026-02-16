# expensiveStatements

> Command: `expensiveStatements`  
> Category: **System Tools**  
> Status: Production Ready

## Description

View top resource-consuming SQL statements

## Syntax

```bash
hana-cli expensiveStatements [options]
```

## Aliases

- ``

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli expensiveStatements --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli expensiveStatements --limit 50 --orderBy totalTime
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
