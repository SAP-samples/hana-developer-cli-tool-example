# massGrant

> Command: `massGrant`  
> Category: **Mass Operations**  
> Status: Production Ready

## Description

Bulk privilege management

## Syntax

```bash
hana-cli massGrant [schema] [object] [options]
```

## Aliases

- `mg`
- `massgrant`
- `massGrn`
- `massgrn`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli massGrant --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli massGrant --schema MYSCHEMA --object % --grantee DBUSER --privilege SELECT
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Mass Operations](..)
- [All Commands A-Z](../all-commands.md)
