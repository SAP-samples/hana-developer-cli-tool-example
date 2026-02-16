# massDelete

> Command: `massDelete`  
> Category: **Mass Operations**  
> Status: Production Ready

## Description

Bulk delete operations with filtering

## Syntax

```bash
hana-cli massDelete [schema] [object] [options]
```

## Aliases

- `md`
- `massdelete`
- `massDel`
- `massdel`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli massDelete --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli massDelete --schema MYSCHEMA --object % --objectType TABLE --dryRun
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Mass Operations](..)
- [All Commands A-Z](../all-commands.md)
