# duplicateDetection

> Command: `duplicateDetection`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Finds duplicate records in HANA tables using various matching strategies. It supports exact matching, fuzzy matching with similarity thresholds, and partial key matching to identify near-duplicates.

## Syntax

```bash
hana-cli duplicateDetection [options]
```

## Aliases

- `dupdetect`
- `findDuplicates`
- `duplicates`

## Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--table` | `-t` | string | required | Name of the table to check |
| `--schema` | `-s` | string | optional | Schema name (uses current if omitted) |
| `--keyColumns` | `-k` | string | required | Comma-separated key columns for matching |
| `--checkColumns` | `-c` | string | optional | Specific columns to compare (if omitted, all are used) |
| `--excludeColumns` | `-e` | string | optional | Columns to skip during duplicate detection |
| `--mode` | `-m` | string | exact | Detection mode: `exact`, `fuzzy`, `partial` |
| `--threshold` | `-th` | number | 0.95 | Similarity threshold for fuzzy matching (0-1) |
| `--output` | `-o` | string | optional | Output file path for the report |
| `--format` | `-f` | string | summary | Report format: `json`, `csv`, `summary` |
| `--limit` | `-l` | number | 10000 | Maximum rows to check |
| `--timeout` | `-to` | number | 3600 | Operation timeout in seconds |
| `--profile` | `-p` | string | optional | Connection profile to use |

For a complete list of parameters and options, use:

```bash
hana-cli duplicateDetection --help
```

## Detection Modes

- **exact** (default) - Find identical values in key columns
- **fuzzy** - Find similar values using Levenshtein distance and similarity threshold
- **partial** - Find duplicates using only first key column

## Similarity Threshold

The threshold determines what counts as a match in fuzzy mode:

- `1.0` (100%) - Exact match only
- `0.95` (95%) - Allow 1-2 character differences per field
- `0.90` (90%) - Allow 3-4 character differences per field
- `0.85` (85%) - More lenient matching

## Output Examples

### Summary (default)

```bash
Duplicate Detection Report
==========================

Total Rows: 10000
Unique Rows: 9850
Duplicate Groups: 75
Total Duplicates: 150

Duplicate Groups:
  Group: John||Smith, Records: 2, Match: 100%
  Group: John||Smyth, Records: 3, Match: 95%
  Group: Jane||Doe, Records: 2, Match: 100%
  ...
```

### JSON

```json
{
  "totalRows": 10000,
  "uniqueRows": 9850,
  "duplicateGroups": 75,
  "totalDuplicates": 150,
  "duplicates": [
    {
      "matchKey": "John||Smith",
      "matchPercentage": 100,
      "count": 2,
      "records": [
        {
          "rowNumber": 5,
          "data": { "FIRST_NAME": "John", "LAST_NAME": "Smith", ... }
        },
        {
          "rowNumber": 1250,
          "data": { "FIRST_NAME": "John", "LAST_NAME": "Smith", ... }
        }
      ]
    }
  ]
}
```

### CSV

```csv
Group,Rows,Similarity
"John||Smith",2,100%
"John||Smyth",3,95%
"Jane||Doe",2,100%
```

## Understanding Results

### Exact Matches

All values in key columns are identical. These are definite duplicates.

### Fuzzy Matches

Values are similar but not identical. The similarity percentage indicates how close they are.

### Partial Matches

Duplicates identified based on a subset of key columns.

## Examples

### Exact duplicate detection

```bash
hana-cli duplicateDetection --table CUSTOMERS \
  --keyColumns "FIRST_NAME,LAST_NAME" \
  --mode exact
```

### Fuzzy duplicate detection with threshold

```bash
hana-cli duplicateDetection --table CUSTOMERS \
  --keyColumns "FIRST_NAME,LAST_NAME" \
  --mode fuzzy \
  --threshold 0.90 \
  --format json \
  --output duplicates.json
```

### Exclude specific columns

```bash
hana-cli duplicateDetection --table PRODUCTS \
  --keyColumns "SKU" \
  --excludeColumns "CREATED_DATE,MODIFIED_DATE" \
  --limit 50000
```

### Partial matching

```bash
hana-cli duplicateDetection --table SUPPLIERS \
  --keyColumns "COMPANY_NAME" \
  --mode partial
```

## Handling Duplicates

After identifying duplicates, you can:

1. **Report Only** - Generate report and review manually
2. **Tag Records** - Add a flag/status column to mark duplicates
3. **Merge Records** - Combine duplicate records into one
4. **Delete Duplicates** - Remove duplicate entries (keep first occurrence)
5. **Review Process** - Use data steward process to determine action

Example workflow:

```bash
# Step 1: Identify fuzzy duplicates
hana-cli duplicateDetection --table CUSTOMERS \
  --keyColumns "FIRST_NAME,LAST_NAME,EMAIL" \
  --mode fuzzy --threshold 0.92 \
  --format json --output duplicates.json

# Step 2: Review and manually validate
# (Review duplicates.json and create merge/delete list)

# Step 3: Execute cleanup
# (Use data governance process or scripts)
```

## Return Codes

- `0` - Detection completed successfully
- `1` - Detection error or database connection issue

## Performance Tips

1. Use `exact` mode for better performance on large tables
2. Use `--limit` to test on a subset first
3. Specify key columns prudently
4. Use `--excludeColumns` to skip irrelevant columns
5. Increase `--threshold` for faster fuzzy matching

## Related Commands

- `dataValidator` - Validate data against business rules
- `referentialCheck` - Verify referential integrity
- `dataLineage` - Trace data lineage and transformations
- `dataProfile` - Generate statistical profiles

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
