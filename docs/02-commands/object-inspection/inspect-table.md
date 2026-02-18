# inspectTable

> Command: `inspectTable`  
> Category: **Object Inspection**  
> Status: Production Ready

## Description

Return metadata about a DB table

## Syntax

```bash
hana-cli inspectTable [schema] [table] [options]
```

## Aliases

- `it`
- `table`
- `insTbl`
- `inspecttable`
- `inspectable`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli inspectTable --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli inspectTable --table myTable --schema MYSCHEMA
```

Execute the command

---

## inspectTableUI (UI Variant)

> Command: `inspectTableUI`  
> Status: Production Ready

**Description:** Execute inspectTableUI command - UI version for inspecting table metadata

**Syntax:**

```bash
hana-cli inspectTableUI [schema] [table] [options]
```

**Aliases:**

- `itui`
- `tableUI`
- `tableui`
- `insTblUI`
- `inspecttableui`
- `inspectableui`

**Parameters:**

For a complete list of parameters and options, use:

```bash
hana-cli inspectTableUI --help
```

**Example Usage:**

```bash
hana-cli inspectTableUI
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Object Inspection](..)
- [All Commands A-Z](../all-commands.md)
