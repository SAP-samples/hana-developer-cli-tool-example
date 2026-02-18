# import

> Command: `import`  
> Aliases: `imp`, `uploadData`, `uploaddata`  
> Category: **Data Tools**  
> Status: Production Ready

## ⚠️ Redirect Notice

The `import` command documentation has been relocated to the **Data Tools** category.

**👉 [Go to Import Command Documentation](../data-tools/import.md)**

## Quick Reference

Upload CSV or Excel files directly into SAP HANA database tables.

```bash
hana-cli import -n <filename> -t <table> [options]
```

### Common Options

- `-n, --filename`: Path to CSV or Excel file
- `-t, --table`: Target table (SCHEMA.TABLE or TABLE)
- `-o, --output`: File format (csv or excel)
- `-m, --matchMode`: Column matching (order, name, or auto)
- `--truncate`: Clear table before import
- `--batchSize`: Rows per batch (default: 1000)

### Quick Examples

```bash
# Basic CSV import
hana-cli import -n data.csv -t HR.EMPLOYEES

# Excel with name matching
hana-cli import -n report.xlsx -o excel -t SALES -m name

# Truncate and import
hana-cli import -n refresh.csv -t MASTER_DATA --truncate
```

---

## importUI (UI Variant)

> Command: `importUI`  
> Status: Production Ready

**Description:** Import data from CSV or Excel files into a database table via browser based UI

**Syntax:**

```bash
hana-cli importUI [filename] [table] [options]
```

**Aliases:**

- `impui`
- `importui`
- `uploadui`
- `uploadUI`

**Parameters:**

For a complete list of parameters and options, use:

```bash
hana-cli importUI --help
```

**Example Usage:**

```bash
hana-cli importUI
```

Execute the command

## Related Commands

- [Complete Import Documentation](../data-tools/import.md) - Full reference with all parameters and examples
- [All Commands A-Z](../all-commands.md)
- [Commands Overview](..)

## See Also

- [Category: System Tools](..)
- [Command Reference](../all-commands.md)
