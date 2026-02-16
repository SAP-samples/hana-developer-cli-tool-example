# connect

> Command: `connect`  
> Category: **Connection & Auth**  
> Status: Production Ready

## Description

Connects to an SAP HANA DB and writes connection information to a default-env-admin.json

## Syntax

```bash
hana-cli connect [user] [password] [options]
```

## Aliases

- `c`
- `login`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli connect --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli connect --connection localhost:30015 --user DBUSER
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Connection & Auth](..)
- [All Commands A-Z](../all-commands.md)
