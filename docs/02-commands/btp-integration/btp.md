# btp

> Command: `btp`  
> Category: **BTP Integration**  
> Status: Production Ready

## Description

Set the target for commands for the btp CLI to the global account, a directory, or a subaccount. Commands are executed in the specified target, unless you override it using a parameter. If the specified target is part of an account hierarchy, its parents are also targeted, so that if a command is only available on a higher level, it will be executed there.

## Syntax

```bash
hana-cli btp [directory] [subaccount] [options]
```

## Aliases

- `btpTarget`
- `btptarget`
- `btp`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli btp --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli btp --subaccount mySubaccount
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: BTP Integration](..)
- [All Commands A-Z](../all-commands.md)
