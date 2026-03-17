# Data Tools

Import, export, compare, validate, and manage data across systems

| Command | Aliases | Description |
|---------|---------|-------------|
| `compareData` | `cmpdata`, `compardata`, `dataCompare` | - |
| `compareSchema` | `cmpschema`, `schemaCompare`, `compareschema` | Compare two schemas |
| `dataDiff` | `ddiff`, `diffData`, `dataCompare` | - |
| `dataLineage` | `lineage`, `dataFlow`, `traceLineage` | - |
| `dataMask` | `mask`, `dataprivacy`, `anonymize`, `pii` | Mask sensitive data |
| `dataProfile` | `prof`, `profileData`, `dataStats` | Profile table data |
| `dataSync` | `datasync`, `syncData`, `sync` | Synchronize data between tables |
| `dataValidator` | `dval`, `validateData`, `dataValidation` | Validate data against rules |
| `duplicateDetection` | `dupdetect`, `findDuplicates`, `duplicates` | Find duplicate records |
| `export` | `exp`, `downloadData`, `downloaddata` | Extract table data to file |
| `import` | `imp`, `uploadData`, `uploaddata` | Load data from CSV/Excel |
| `importUI` | `impui`, `importui`, `uploadui`, `uploadUI` | - |
| `kafkaConnect` | `kafka`, `kafkaAdapter`, `kafkasub` | Manage Kafka connections |

## `compareData`

**Aliases:** `cmpdata`, `compardata`, `dataCompare`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--sourceTable` (`--st`) | string | - | compareDataSourceTable |
| `--sourceSchema` (`--ss`) | string | `'**CURRENT_SCHEMA**'` | compareDataSourceSchema |
| `--targetTable` (`--tt`) | string | - | compareDataTargetTable |
| `--targetSchema` (`--ts`) | string | `'**CURRENT_SCHEMA**'` | compareDataTargetSchema |
| `--keyColumns` (`-k`) | string | - | compareDataKeyColumns |
| `--output` (`-o`) | string | - | compareDataOutput |
| `--columns` (`-c`) | string | - | compareDataColumns |
| `--showMatches` (`--sm`) | boolean | `false` | compareDataShowMatches |
| `--limit` (`-l`) | number | `1000` | compareDataLimit |
| `--timeout` (`--to`) | number | `3600` | compareDataTimeout |
| `--profile` (`-p`) | string | - | profile |

**Related:** `compareSchema`, `dataDiff`

---

## `compareSchema`

**Aliases:** `cmpschema`, `schemaCompare`, `compareschema`
**Tags:** compare, diff, analysis
- Compare two schemas
- Find schema differences
**Prerequisites:** Active database connection, Both schemas exist

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--sourceSchema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | compareSchemaSourceSchema |
| `--targetSchema` (`-t`) | string | `'**CURRENT_SCHEMA**'` | compareSchemaTargetSchema |
| `--tables` (`--tb`) | string | - | compareSchemaTableFilter |
| `--compareIndexes` (`--ci`) | boolean | `true` | compareSchemaCompareIndexes |
| `--compareTriggers` (`--ct`) | boolean | `true` | compareSchemaCompareTriggers |
| `--compareConstraints` (`--cc`) | boolean | `true` | compareSchemaCompareConstraints |
| `--output` (`-o`) | string | - | compareSchemaOutput |
| `--timeout` (`--to`) | number | `3600` | compareSchemaTimeout |
| `--profile` (`-p`) | string | - | profile |

### Examples

**Compare two schemas:** `hana-cli compareSchema --sourceSchema "DEV_SCHEMA" --targetSchema "PROD_SCHEMA"`

**Related:** `compareData`, `schemaClone`

---

## `dataDiff`

**Aliases:** `ddiff`, `diffData`, `dataCompare`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table1` (`--t1`) | string | - | dataDiffTable1 |
| `--table2` (`--t2`) | string | - | dataDiffTable2 |
| `--schema1` (`--s1`) | string | `'**CURRENT_SCHEMA**'` | dataDiffSchema1 |
| `--schema2` (`--s2`) | string | `'**CURRENT_SCHEMA**'` | dataDiffSchema2 |
| `--keyColumns` (`-k`) | string | - | dataDiffKeyColumns |
| `--compareColumns` (`-c`) | string | - | dataDiffCompareColumns |
| `--output` (`-o`) | string | - | dataDiffOutput |
| `--format` (`-f`) | string | `"summary"` | dataDiffFormat |
| `--limit` (`-l`) | number | `10000` | dataDiffLimit |
| `--showValues` (`--sv`) | boolean | `false` | dataDiffShowValues |
| `--dryRun` (`--dr`, `--preview`) | boolean | `false` | dryRun |
| `--timeout` (`--to`) | number | `3600` | dataDiffTimeout |
| `--profile` (`-p`) | string | - | profile |

**Related:** `compareData`, `dataValidator`

---

## `dataLineage`

**Aliases:** `lineage`, `dataFlow`, `traceLineage`

**Related:** `dataProfile`, `compareData`

---

## `dataMask`

**Aliases:** `mask`, `dataprivacy`, `anonymize`, `pii`
**Tags:** masking, anonymization, privacy
- Mask sensitive data
- Anonymize personal information

**Related:** `dataValidator`, `import`

---

## `dataProfile`

**Aliases:** `prof`, `profileData`, `dataStats`
**Tags:** profiling, statistics, data-analysis
- Profile table data
- Analyze column distributions
- Identify data patterns
**Prerequisites:** Active database connection, Target table exists

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | - | dataProfileTable |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | dataProfileSchema |
| `--columns` (`-c`) | string | - | dataProfileColumns |
| `--output` (`-o`) | string | - | dataProfileOutput |
| `--format` (`-f`) | string | `"summary"` | dataProfileFormat |
| `--nullAnalysis` (`--na`) | boolean | `true` | dataProfileNullAnalysis |
| `--cardinalityAnalysis` (`--ca`) | boolean | `true` | dataProfileCardinalityAnalysis |
| `--statisticalAnalysis` (`--sa`) | boolean | `true` | dataProfileStatisticalAnalysis |
| `--patternAnalysis` (`--pa`) | boolean | `false` | dataProfilePatternAnalysis |
| `--sampleSize` (`--ss`) | number | `10000` | dataProfileSampleSize |
| `--timeout` (`--to`) | number | `3600` | dataProfileTimeout |
| `--profile` (`-p`) | string | - | profile |

### Examples

**Profile complete table:** `hana-cli dataProfile --table "SALES_DATA" --schema "ANALYTICS"`
> May take several minutes for large tables

**Profile specific columns:** `hana-cli dataProfile --table "CUSTOMERS" --schema "SALES" --columns ["COUNTRY","REGION","SEGMENT"]`
> Faster than profiling entire table

**Related:** `dataValidator`, `duplicateDetection`

---

## `dataSync`

**Aliases:** `datasync`, `syncData`, `sync`
**Tags:** sync, synchronization, replication
- Synchronize data between tables
- Replicate data
**Prerequisites:** Active database connection, Source and target tables exist

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--sourceConnection` (`--sc`) | string | - | dataSyncSourceConnection |
| `--targetConnection` (`--tc`) | string | - | dataSyncTargetConnection |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | dataSyncSchema |
| `--table` (`-t`) | string | - | dataSyncTable |
| `--syncMode` (`-m`) | string | `'full'` | dataSyncMode |
| `--batchSize` (`-b`) | number | `1000` | dataSyncBatchSize |
| `--conflictResolution` (`--cr`) | string | `'source'` | dataSyncConflictResolution |
| `--keyColumns` (`-k`) | string | - | dataSyncKeyColumns |
| `--timeout` (`--to`) | number | `3600` | dataSyncTimeout |
| `--profile` (`-p`) | string | - | profile |

**Related:** `import`, `export`

---

## `dataValidator`

**Aliases:** `dval`, `validateData`, `dataValidation`
**Tags:** validation, quality, rules, checking
- Validate data against rules
- Check data quality
- Find invalid records
**Prerequisites:** Active database connection, Target table exists, Validation rules defined

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | - | dataValidatorTable |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | dataValidatorSchema |
| `--rules` (`-r`) | string | - | dataValidatorRules |
| `--rulesFile` (`--rf`) | string | - | dataValidatorRulesFile |
| `--columns` (`-c`) | string | - | dataValidatorColumns |
| `--output` (`-o`) | string | - | dataValidatorOutput |
| `--format` (`-f`) | string | `"json"` | dataValidatorFormat |
| `--limit` (`-l`) | number | `10000` | dataValidatorLimit |
| `--stopOnFirstError` (`--sfe`) | boolean | `false` | dataValidatorStopOnFirstError |
| `--timeout` (`--to`) | number | `3600` | dataValidatorTimeout |
| `--profile` (`-p`) | string | - | profile |

### Examples

**Validate with rules file:** `hana-cli dataValidator --table "CUSTOMERS" --schema "SALES" --rulesFile "validation_rules.json"`
> Rules file defines constraints like required fields, ranges, patterns

**Related:** `import`, `dataProfile`

---

## `duplicateDetection`

**Aliases:** `dupdetect`, `findDuplicates`, `duplicates`
**Tags:** duplicates, quality, anomaly
- Find duplicate records
- Identify data redundancy
**Prerequisites:** Active database connection, Target table exists

### Examples

**Find duplicates across all columns:** `hana-cli duplicateDetection --table "CUSTOMERS" --schema "SALES"`

**Find duplicates by key columns:** `hana-cli duplicateDetection --table "ORDERS" --schema "SALES" --keyColumns ["ORDER_ID","LINE_ITEM"]`
> More precise than checking all columns

**Related:** `dataProfile`, `dataValidator`

---

## `export`

**Aliases:** `exp`, `downloadData`, `downloaddata`
**Tags:** export, download, extract, csv, excel
- Extract table data to file
- Download data
**Prerequisites:** Active database connection, Source table exists

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | - | exportTable |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | exportSchema |
| `--output` (`-o`) | string | - | exportOutput |
| `--format` (`-f`) | string | `"csv"` | exportFormat |
| `--where` (`-w`) | string | - | exportWhere |
| `--limit` (`-l`) | number | - | exportLimit |
| `--orderby` (`--ob`) | string | - | exportOrderBy |
| `--columns` (`-c`) | string | - | exportColumns |
| `--delimiter` (`-d`) | string | `'` | exportDelimiter |
| `--includeHeaders` (`--ih`) | boolean | `true` | exportIncludeHeaders |
| `--nullValue` (`--nv`) | string | `''` | exportNullValue |
| `--maxRows` (`--mr`) | number | `1000000` | exportMaxRows |
| `--timeout` (`--to`) | number | `3600` | exportTimeout |
| `--profile` (`-p`) | string | - | profile |

### Examples

**Basic table export:** `hana-cli export --table "CUSTOMERS" --schema "SALES" --filename "customers_export.csv"`

**Export with filter:** `hana-cli export --table "ORDERS" --schema "SALES" --filename "recent_orders.csv" --where "ORDER_DATE >= '2025-01-01'"`
> Use SQL WHERE syntax to filter rows

**Export to Excel:** `hana-cli export --table "SALES_DATA" --schema "ANALYTICS" --filename "sales_report.xlsx"`
> Automatically formats as Excel if filename ends in .xlsx

**Related:** `import`, `massExport`

---

## `import`

**Aliases:** `imp`, `uploadData`, `uploaddata`
**Tags:** import, upload, load-data, csv, excel
- Load data from CSV/Excel
- Upload data to table
**Prerequisites:** Active database connection, Target table exists with compatible structure, CSV or Excel file available

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--filename` (`-n`) | string | - | importFilename |
| `--table` (`-t`) | string | - | importTable |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | importSchema |
| `--output` (`-o`) | string | `"csv"` | importOutputFormat |
| `--matchMode` (`-m`) | string | `"auto"` | importMatchMode |
| `--truncate` (`--tr`) | boolean | `false` | importTruncate |
| `--batchSize` (`-b`) | number | `1000` | importBatchSize |
| `--worksheet` (`-w`) | number | `1` | importWorksheet |
| `--startRow` (`--sr`) | number | `1` | importStartRow |
| `--skipEmptyRows` (`--se`) | boolean | `true` | importSkipEmptyRows |
| `--excelCacheMode` (`--ec`) | string | `"cache"` | importExcelCacheMode |
| `--dryRun` (`--dr`) | boolean | `false` | Preview import results without committing to database |
| `--maxFileSizeMB` (`--mfs`) | number | `500` | Maximum file size in MB (prevents memory exhaustion) |
| `--timeoutSeconds` (`--ts`) | number | `3600` | Import operation timeout in seconds (0 = no timeout) |
| `--nullValues` (`--nv`) | string | `'null` | Comma-separated list of values to treat as NULL |
| `--skipWithErrors` (`--swe`) | boolean | `false` | Continue import even if errors exceed threshold (logs errors) |
| `--maxErrorsAllowed` (`--mea`) | number | `-1` | Maximum errors allowed before stopping (-1 = unlimited) |
| `--profile` (`-p`) | string | - | profile |

### Examples

**Basic CSV import:** `hana-cli import --filename "data.csv" --table "MY_TABLE" --schema "MY_SCHEMA"`
> Use this for straightforward imports where file columns match table columns

**Import with dry run:** `hana-cli import --filename "data.csv" --table "MY_TABLE" --schema "MY_SCHEMA" --dryRun`
> Always recommended to run this first to validate data and mappings

**Import with error handling:** `hana-cli import --filename "data.csv" --table "MY_TABLE" --schema "MY_SCHEMA" --skipWithErrors --maxErrorsAllowed 100`
> Useful for large imports where you want to skip bad rows and review later

**Large file import:** `hana-cli import --filename "large_data.csv" --table "BIG_TABLE" --schema "MY_SCHEMA" --maxFileSizeMB 500 --timeoutSeconds 3600`
> Prevents memory issues and timeout errors with large files

**Import with column name matching:** `hana-cli import --filename "data.csv" --table "MY_TABLE" --schema "MY_SCHEMA" --matchMode "name"`
> Use when file column order differs from table column order

**Related:** `export`, `dataValidator`

---

## `importUI`

```bash
hana-cli importUI [filename] [table]
```

**Aliases:** `impui`, `importui`, `uploadui`, `uploadUI`

**Related:** `import`

---

## `kafkaConnect`

```bash
hana-cli kafkaConnect [action]
```

**Aliases:** `kafka`, `kafkaAdapter`, `kafkasub`
**Tags:** kafka, streaming, integration
- Manage Kafka connections

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--action` (`-a`) | string | `'list'` | action |
| `--name` (`-n`) | string | - | connectorName |
| `--brokers` (`-b`) | string | - | kafkaBrokers |
| `--topic` (`-t`) | string | - | kafkaTopic |
| `--config` (`-c`) | string | - | configPath |

**Related:** `dataSync`, `import`

---
