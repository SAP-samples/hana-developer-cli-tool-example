# Import Command Enhancements

This document describes the advanced features and enhancements available in the `hana-cli import` command for optimizing data import operations.

## Table of Contents

1. [Configurable Batch Size](#configurable-batch-size)
2. [Excel Worksheet Selection](#excel-worksheet-selection)
3. [Start Row Configuration](#start-row-configuration)
4. [Skip Empty Rows](#skip-empty-rows)
5. [Excel Cache Mode](#excel-cache-mode)
6. [Performance Best Practices](#performance-best-practices)
7. [Examples](#examples)

## Configurable Batch Size

### Overview - Batch Size Control

Control the number of rows inserted per batch operation to optimize performance based on your data characteristics and system resources.

### Option - Batch Size Parameter

```bash
--batchSize <number>
-b <number>
```

### Details - Batch Size Configuration

- **Default**: 1000 rows per batch
- **Range**: 1 to 10,000 rows
- **When to use larger batches**: High-volume imports with small row sizes
- **When to use smaller batches**: Large row data, memory-constrained systems, or when you want more granular error reporting

### Examples - Batch Size Usage

```bash
# High-volume import with 5000 rows per batch
hana-cli import -n bigdata.csv -t SALES --batchSize 5000

# Memory-constrained system with 500 rows per batch
hana-cli import -n data.csv -t EMPLOYEES --batchSize 500
```

## Excel Worksheet Selection

### Overview - Worksheet Selection

Specify which worksheet to import when working with Excel files containing multiple sheets.

### Option - Worksheet Number

```bash
--worksheet <number>
-w <number>
```

### Details - Worksheet Configuration

- **Default**: 1 (first worksheet)
- **Range**: 1-based worksheet numbering
- Only the specified worksheet will be processed
- Useful for workbooks with multiple data sheets

### Examples - Worksheet Selection Usage

```bash
# Import from the second worksheet
hana-cli import -n report.xlsx -o excel -t MONTHLY_SALES --worksheet 2

# Import from the third worksheet
hana-cli import -n workbook.xlsx -o excel -t DATA --worksheet 3
```

## Start Row Configuration

### Overview - Header Row Definition

Define which row contains the column headers, allowing you to skip title rows, metadata, or other non-data content at the beginning of Excel files.

### Option - Row Number

```bash
--startRow <number>
--sr <number>
```

### Details - Start Row Configuration

- **Default**: 1 (first row as header)
- **Range**: 1-based row numbering
- The specified row is treated as the header row
- All rows before the start row are skipped
- Data import begins immediately after the header row

### Examples - Start Row Usage

```bash
# Headers on row 3 (skip title and subtitle rows)
hana-cli import -n report.xlsx -o excel -t SALES --startRow 3

# Headers on row 2
hana-cli import -n data.xlsx -o excel -t EMPLOYEES --startRow 2
```

### Use Cases

- Excel files with title rows
- Reports with metadata at the top
- Templates with instructions before data
- Files with formatting or summary rows

## Skip Empty Rows

### Overview - Empty Row Handling

Control whether completely empty rows in Excel files should be skipped during import.

### Option - Boolean Flag

```bash
--skipEmptyRows <boolean>
--se <boolean>
```

### Details - Empty Row Handling

- **Default**: true (empty rows are skipped)
- A row is considered empty if all cells are null, undefined, or empty strings
- Setting to `false` will attempt to insert empty rows (may fail if table has NOT NULL columns)

### Examples - Skip Empty Rows Usage

```bash
# Skip empty rows (default behavior)
hana-cli import -n data.xlsx -o excel -t EMPLOYEES

# Include empty rows
hana-cli import -n sparse_data.xlsx -o excel -t LOG_DATA --skipEmptyRows false
```

## Excel Cache Mode

### Overview - Cache Mode Selection

Choose how ExcelJS handles shared strings to balance between performance and memory usage.

### Option - Cache Mode Selection

```bash
--excelCacheMode <mode>
--ec <mode>
```

### Modes

#### cache (Default)

- **Description**: Caches shared strings and styles in memory
- **Performance**: Fastest processing speed
- **Memory**: Higher memory usage
- **Best for**: Most files, especially those under 100MB

#### emit

- **Description**: Streaming mode with minimal caching
- **Performance**: Slightly slower than cache mode
- **Memory**: Lower memory usage
- **Best for**: Large Excel files (>100MB), memory-constrained environments

#### ignore

- **Description**: Skips shared strings processing entirely
- **Performance**: Variable, depends on file structure
- **Memory**: Lowest memory usage
- **Best for**: Files without shared strings, or when memory is extremely limited

### Examples - Cache Mode Usage

```bash
# Standard mode (default)
hana-cli import -n data.xlsx -o excel -t EMPLOYEES

# Large file with streaming mode
hana-cli import -n large_report.xlsx -o excel -t BIGTABLE --excelCacheMode emit --batchSize 500

# Minimal memory mode
hana-cli import -n huge_file.xlsx -o excel -t DATA --excelCacheMode ignore
```

## Performance Best Practices

### Recommendations by Scenario

#### High-Volume Import (CSV)

```bash
hana-cli import -n large_data.csv -t SALES --batchSize 5000
```

#### Large Excel Files

```bash
hana-cli import -n big_report.xlsx -o excel -t DATA \
  --excelCacheMode emit \
  --batchSize 1000 \
  --skipEmptyRows true
```

#### Memory-Constrained Systems

```bash
hana-cli import -n data.xlsx -o excel -t TABLE \
  --excelCacheMode emit \
  --batchSize 500
```

#### Complex Excel with Multiple Sheets

```bash
hana-cli import -n workbook.xlsx -o excel -t QUARTERLY_SALES \
  --worksheet 2 \
  --startRow 3 \
  --batchSize 2000
```

#### Maximum Performance (Small Files)

```bash
hana-cli import -n data.csv -t EMPLOYEES --batchSize 10000
```

### Factor Considerations

| Factor | Recommendation |
| --------- | --------------- |
| Row size > 1KB | Use smaller batch sizes (500-1000) |
| Row size < 100 bytes | Use larger batch sizes (5000-10000) |
| File size > 100MB | Use `excelCacheMode emit` |
| Available RAM > 8GB | Use `excelCacheMode cache` |
| Multiple large columns | Reduce batch size |
| Simple data types | Increase batch size |

## Examples

### Basic Import Enhancement

```bash
# CSV with custom batch size
hana-cli import -n sales_data.csv -t SALES --batchSize 3000
```

### Excel Multi-Sheet Import

```bash
# Import second sheet starting from row 2
hana-cli import -n quarterly_report.xlsx -o excel -t Q1_SALES \
  --worksheet 2 \
  --startRow 2 \
  --matchMode name
```

### Large File Optimization

```bash
# Optimize for large Excel file with memory efficiency
hana-cli import -n annual_report.xlsx -o excel -t ANNUAL_DATA \
  --excelCacheMode emit \
  --batchSize 500 \
  --worksheet 1 \
  --skipEmptyRows true
```

### Complex Excel Import

```bash
# Import from specific worksheet with headers on row 3
hana-cli import -n monthly_report.xlsx -o excel -t METRICS \
  --worksheet 3 \
  --startRow 3 \
  --batchSize 2000 \
  --excelCacheMode cache \
  --matchMode auto
```

### Sparse Data Import

```bash
# Import Excel with potential empty rows
hana-cli import -n log_data.xlsx -o excel -t SYSTEM_LOGS \
  --skipEmptyRows false \
  --batchSize 1000
```

### High-Throughput Scenario

```bash
# Maximum performance for small row data
hana-cli import -n transactions.csv -t TRANSACTIONS \
  --batchSize 10000 \
  --truncate
```

### Schema-Qualified with Options

```bash
# Import to specific schema with performance tuning
hana-cli import -n data.xlsx -o excel -t HR.EMPLOYEES \
  --worksheet 1 \
  --startRow 2 \
  --batchSize 3000 \
  --excelCacheMode cache \
  --matchMode name
```

## Troubleshooting

### Error: Batch size must be between 1 and 10000

- Ensure your `--batchSize` value is within the valid range
- Example: `--batchSize 5000` (valid), `--batchSize 15000` (invalid)

### Out of Memory Errors

- Reduce batch size: `--batchSize 500`
- Use emit mode: `--excelCacheMode emit`
- Process smaller chunks of data

### Slow Performance

- Increase batch size for small rows: `--batchSize 5000`
- Use cache mode for faster processing: `--excelCacheMode cache`
- Ensure database connection is not a bottleneck

### Wrong Data Imported

- Check worksheet number: `--worksheet 2`
- Verify start row: `--startRow 3`
- Review column matching mode: `--matchMode name`

## See Also

- [Import Command Overview](../README.md#import)
- [Column Matching Strategies](../README.md#column-matching)
- [Database Connection Setup](../README.md#connect)
