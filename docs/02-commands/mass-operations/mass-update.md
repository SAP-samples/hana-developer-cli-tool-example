# massUpdate

> Command: `massUpdate`  
> Category: **Mass Operations**  
> Status: Production Ready

## Description

Bulk update operations

## Syntax

```bash
hana-cli massUpdate [schema] [object] [options]
```

## Aliases

- `mu`
- `massupdate`
- `massUpd`
- `massupd`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli massUpdate --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli massUpdate --schema MYSCHEMA --object % --set "STATUS = \'INACTIVE\'" --where "CREATED_AT < CURRENT_DATE"
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Mass Operations](..)
- [All Commands A-Z](../all-commands.md)
