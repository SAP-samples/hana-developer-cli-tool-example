# export

> Command: `export`  
> Aliases: `exp`, `downloadData`, `downloaddata`  
> Category: **System Tools**  
> Status: Production Ready

## ⚠️ Redirect Notice

The `export` command documentation has been relocated to the **Data Tools** category.

**👉 [Go to Export Command Documentation](../data-tools/export.md)**

## Quick Reference

Download data from SAP HANA tables and views into CSV, Excel, or JSON files.

```bash
hana-cli export -t <table> -o <filename> [options]
```

### Common Options

- `-t, --table`: Source table (SCHEMA.TABLE or TABLE)
- `-o, --output`: Output file path
- `-f, --format`: File format (csv, excel, or json)
- `-s, --schema`: Source schema name
- `-w, --where`: WHERE clause to filter rows
- `-l, --limit`: Maximum rows to export
- `-c, --columns`: Specific columns to export
- `--timeout`: Operation timeout in seconds

### Quick Examples

```bash
# Basic CSV export
hana-cli export -t HR.EMPLOYEES -o employees.csv

# Excel with specific columns
hana-cli export -t HR.EMPLOYEES -o staff.xlsx -f excel -c EMPLOYEE_ID,NAME,SALARY

# Filtered export with ordering
hana-cli export -t SALES -o 2024_sales.csv -w "YEAR = 2024" --orderby "AMOUNT DESC"
```

## Related Commands

- [Complete Export Documentation](../data-tools/export.md) - Full reference with all parameters and examples
- [All Commands A-Z](../all-commands.md)
