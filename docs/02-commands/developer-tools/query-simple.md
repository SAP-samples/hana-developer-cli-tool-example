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

---

## querySimpleUI (UI Variant)

> Command: `querySimpleUI`  
> Status: Production Ready

**Description:** Execute querySimpleUI command - UI version for executing SQL queries

**Syntax:**

```bash
hana-cli querySimpleUI [options]
```

**Aliases:**

- `qsui`
- `querysimpleui`
- `queryUI`
- `sqlUI`

**Parameters:**

For a complete list of parameters and options, use:

```bash
hana-cli querySimpleUI --help
```

**Example Usage:**

```bash
hana-cli querySimpleUI
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
