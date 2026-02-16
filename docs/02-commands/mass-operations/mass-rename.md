# massRename

> Command: `massRename`  
> Category: **Mass Operations**  
> Status: Production Ready

## Description

Mass Rename fields based upon a CDS-based massExport file

## Syntax

```bash
hana-cli massRename [options]
```

## Aliases

- `mr`
- `massrename`
- `massRN`
- `massrn`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli massRename --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli massRename --schema db/schema.cds --prefix app_ --case camelCase
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Mass Operations](..)
- [All Commands A-Z](../all-commands.md)
