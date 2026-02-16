# massExport

> Command: `massExport`  
> Category: **Data Tools**  
> Status: Production Ready

## Description

Export multiple objects at once

## Syntax

```bash
hana-cli massExport [schema] [object] [options]
```

## Aliases

- `me`
- `mexport`
- `massExp`
- `massexp`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli massExport --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli massExport --schema MYSCHEMA --object % --format csv --folder exports/
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Data Tools](..)
- [All Commands A-Z](../all-commands.md)
