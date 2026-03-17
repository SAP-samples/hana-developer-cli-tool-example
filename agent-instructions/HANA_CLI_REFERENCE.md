# SAP HANA CLI (hana-cli) — Complete Command Reference

> Generated from hana-cli v4.202603.2 on 2026-03-17
> This file is auto-generated. Do not edit manually.

## What is hana-cli?

**hana-cli** is a command-line tool that simplifies SAP HANA database development. It wraps complex multi-step database operations into single, easy-to-use commands. It is a development-time tool — not a replacement for `hdbsql` or production administration tools.

### Installation

```bash
npm install -g hana-cli
```

**Requirements:** Node.js ≥ 20.19.0

### Connection Setup

Before using most commands, establish a database connection:

```bash
# Interactive connection wizard
hana-cli connect

# Connect via BTP service key
hana-cli connectViaServiceKey

# Copy connection to default-env.json for CAP/CDS projects
hana-cli copy2DefaultEnv
```

Connection details are stored locally. Use `hana-cli status` to verify your connection.

### Running Commands

```bash
# Direct CLI mode
hana-cli <command> [options]

# Interactive mode (menu-driven)
hana-cli

# Get help for any command
hana-cli <command> --help
```

### Output Formats

Many commands support `--output` with values: `table`, `json`, `csv`, `excel`.

---

## Command Reference

### Analysis Tools

Analyze dependencies, privileges, calculations, and relationships

#### `calcViewAnalyzer`

**Aliases:** `cva`, `analyzeCalcView`, `calcview`
**Syntax:** `hana-cli calcViewAnalyzer [schema] [view]`
**Tags:** calc-view, analysis

**Use cases:**
- Analyze calculation views

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--view` (`-v`) | string | `"*"` | view |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--metrics` (`-m`) | boolean | `false` | metrics |
| `--limit` (`-l`) | number | `100` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `views`, `erdDiagram`

---

#### `dependencies`

**Aliases:** `deps`, `depend`, `dependency-graph`, `relationships`
**Syntax:** `hana-cli dependencies`
**Tags:** dependency, metadata, analysis

**Use cases:**
- Find object dependencies
- Understand impact of drops

**Related:** `objects`, `views`, `procedures`

---

#### `erdDiagram`

**Aliases:** `erd`, `er`, `schema-diagram`, `entityrelation`
**Syntax:** `hana-cli erdDiagram`
**Tags:** diagram, entity-relationship, visualization

**Use cases:**
- Generate ER diagram
- Visualize schema structure

**Related:** `calcViewAnalyzer`, `schemaClone`, `graphWorkspaces`

---

#### `grantChains`

**Aliases:** `grants`, `grantchain`
**Syntax:** `hana-cli grantChains`
**Tags:** grant, privilege, chain

**Use cases:**
- Analyze privilege grant chains

**Related:** `privilegeAnalysis`, `privilegeError`, `roles`

---

#### `graphWorkspaces`

**Aliases:** `gws`, `graphs`, `graphWorkspace`, `graphws`
**Syntax:** `hana-cli graphWorkspaces [schema] [workspace]`
**Tags:** graph, visualization

**Use cases:**
- Explore graph workspaces

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--workspace` (`-w`) | string | `"*"` | graphWorkspaceName |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `erdDiagram`, `objects`

---

#### `privilegeAnalysis`

**Aliases:** `privanalysis`, `privanalyze`
**Syntax:** `hana-cli privilegeAnalysis`
**Tags:** privilege, security, analysis

**Use cases:**
- Analyze privilege distribution
- Find over-privileged users

**Related:** `roles`, `users`, `grantChains`

---

#### `privilegeError`

**Aliases:** `pe`, `privilegeerror`, `privilegerror`, `getInsuffficientPrivilegeErrorDetails`
**Syntax:** `hana-cli privilegeError [guid]`

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--guid` (`-g`, `--error`) | string | - | errorGuid |

**Related:** `grantChains`, `privilegeAnalysis`

---

#### `referentialCheck`

**Aliases:** `refcheck`, `checkReferential`, `fkcheck`
**Syntax:** `hana-cli referentialCheck`
**Tags:** referential-integrity, foreign-keys, validation

**Use cases:**
- Check foreign key integrity
- Find orphaned records

**Prerequisites:** Active database connection, Foreign key constraints defined

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | - | referentialCheckTable |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | referentialCheckSchema |
| `--constraints` (`-c`) | string | - | referentialCheckConstraints |
| `--mode` (`-m`) | string | `"check"` | referentialCheckMode |
| `--output` (`-o`) | string | - | referentialCheckOutput |
| `--format` (`-f`) | string | `"summary"` | referentialCheckFormat |
| `--limit` (`-l`) | number | `10000` | referentialCheckLimit |
| `--timeout` (`--to`) | number | `3600` | referentialCheckTimeout |
| `--profile` (`-p`) | string | - | profile |

**Related:** `tables`, `compareData`, `dataValidator`

---

### Backup & Recovery

Create backups, manage restores, and verify recovery readiness

#### `backup`

**Aliases:** `bkp`, `createBackup`
**Syntax:** `hana-cli backup [target] [name]`
**Tags:** backup, recovery

**Use cases:**
- Create backup
- Start backup process

**Prerequisites:** Active database connection, Sufficient disk space, BACKUP admin privileges

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--target` (`--tgt`) | string | - | backupTarget |
| `--name` (`-n`) | string | - | backupName |
| `--backupType` (`--type`) | string | `"table"` | backupType |
| `--format` (`-f`) | string | `"csv"` | backupFormat |
| `--destination` (`--dest`) | string | - | backupDestination |
| `--compress` (`-c`) | boolean | `true` | backupCompress |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--withData` (`--wd`) | boolean | `true` | backupWithData |
| `--overwrite` (`--ow`) | boolean | `false` | backupOverwrite |

**Related:** `backupStatus`, `backupList`, `restore`

---

#### `backupList`

**Aliases:** `blist`, `listBackups`, `backups`
**Syntax:** `hana-cli backupList [directory]`
**Tags:** backup, list, catalog

**Use cases:**
- List available backups
- View backup history

**Prerequisites:** Active database connection

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--directory` (`--dir`) | string | - | backupListDirectory |
| `--backupType` (`--type`) | string | `"all"` | backupType |
| `--sortBy` (`--sort`) | string | `"date"` | backupListSortBy |
| `--order` (`-o`) | string | `"desc"` | backupListOrder |
| `--limit` (`-l`) | number | `50` | limit |
| `--showDetails` (`--details`) | boolean | `false` | backupListShowDetails |

**Related:** `backup`, `backupStatus`, `restore`

---

#### `backupStatus`

**Aliases:** `bstatus`, `backupstate`, `bkpstatus`
**Syntax:** `hana-cli backupStatus`
**Tags:** backup, status, monitoring

**Use cases:**
- Check backup status
- Monitor backup progress

**Prerequisites:** Active database connection

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--catalogOnly` (`--co`) | boolean | `false` | backupStatusCatalogOnly |
| `--limit` (`-l`) | number | `20` | limit |
| `--backupType` (`--type`) | string | `"all"` | backupStatusType |
| `--status` (`--st`) | string | `"all"` | backupStatusState |
| `--days` | number | `7` | backupStatusDays |

**Related:** `backup`, `backupList`, `replicationStatus`

---

#### `replicationStatus`

**Aliases:** `replstatus`, `replication`, `replstat`
**Syntax:** `hana-cli replicationStatus`
**Tags:** replication, status, monitoring

**Use cases:**
- Check replication status
- Monitor data replication

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--type` (`--ty`) | string | `'system'` | replicationStatusType |
| `--serviceName` (`--sn`) | string | - | replicationStatusServiceName |
| `--detailed` (`-d`) | boolean | `false` | replicationStatusDetailed |
| `--watch` (`-w`) | boolean | `false` | replicationStatusWatch |
| `--profile` (`-p`) | string | - | profile |

**Related:** `backupStatus`, `backup`, `healthCheck`

---

#### `restore`

**Aliases:** `rst`, `restoreBackup`
**Syntax:** `hana-cli restore [backupFile]`
**Tags:** restore, recovery

**Use cases:**
- Restore from backup
- Recover database

**Prerequisites:** Active database connection, Backup file available, Database access privileges

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--backupFile` (`--bf`, `--file`) | string | - | restoreBackupFile |
| `--target` (`--tgt`) | string | - | restoreTarget |
| `--schema` (`-s`) | string | - | schema |
| `--overwrite` (`--ow`) | boolean | `false` | restoreOverwrite |
| `--dropExisting` (`--de`) | boolean | `false` | restoreDropExisting |
| `--continueOnError` (`--coe`) | boolean | `false` | restoreContinueOnError |
| `--batchSize` (`-b`, `--batch`) | number | `1000` | restoreBatchSize |
| `--dryRun` (`--dr`, `--preview`) | boolean | `false` | restoreDryRun |

**Related:** `backup`, `backupList`, `backupStatus`

---

### BTP Integration

SAP BTP integration tools and account management utilities

#### `btpInfo`

**Aliases:** `btpinfo`
**Syntax:** `hana-cli btpInfo`
**Tags:** btp, info, cloud

**Use cases:**
- Get BTP information

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--output` | string | - | output |

**Related:** `btp`, `btpTarget`, `btpSubs`

---

#### `btpInfoUI`

**Aliases:** `btpinfoUI`, `btpui`, `btpInfoui`
**Syntax:** `hana-cli btpInfoUI`

**Related:** `btpInfo`, `btp`

---

### Connection & Auth

Connection setup, authentication helpers, and configuration tools

#### `config`

**Aliases:** `cfg`
**Syntax:** `hana-cli config [action]`

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--edit` (`-e`) | boolean | `false` | edit |
| `--global` (`-g`) | boolean | `false` | global |
| `--path` (`-p`) | boolean | `false` | path |
| `--reset` | boolean | `false` | reset |

**Related:** `connect`, `connections`

---

#### `connect`

**Aliases:** `c`, `login`
**Syntax:** `hana-cli connect [user] [password]`
**Tags:** connect, connection, configuration

**Use cases:**
- Configure database connection

**Related:** `connections`, `connectViaServiceKey`, `config`

---

#### `connections`

**Aliases:** `conn`, `c`
**Syntax:** `hana-cli connections`
**Tags:** connection, configuration, management

**Use cases:**
- Manage saved connections

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `100` | limit |
| `--user` (`-u`) | string | - | user |
| `--application` (`-a`) | string | - | applicationName |
| `--idle` (`-i`) | boolean | `false` | Include idle connections |

**Related:** `connect`, `connectViaServiceKey`, `status`

---

#### `connectViaServiceKey`

**Aliases:** `key`, `servicekey`, `service-key`
**Syntax:** `hana-cli serviceKey [instance] [key]`
**Tags:** connect, service-key, configuration

**Use cases:**
- Connect using service key

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--instance` | string | - | instance |
| `--key` | string | - | key |
| `--encrypt` | boolean | `true` | encrypt |
| `--validate` | boolean | `false` | validate |
| `--cf` | boolean | `true` | cf |
| `--save` | boolean | - | save |

**Related:** `connect`, `connections`, `config`

---

#### `copy2DefaultEnv`

**Aliases:** `copyDefaultEnv`, `copyDefault-Env`, `copy2defaultenv`, `copydefaultenv`, `copydefault-env`
**Syntax:** `hana-cli copy2DefaultEnv`
**Tags:** configuration, environment

**Use cases:**
- Copy settings to default environment

**Related:** `connect`, `config`, `copy2Env`

---

#### `copy2Env`

**Aliases:** `copyEnv`, `copyenv`, `copy2env`
**Syntax:** `hana-cli copy2Env`
**Tags:** configuration, environment

**Use cases:**
- Copy settings to environment file

**Related:** `connect`, `config`, `copy2Secrets`

---

#### `copy2Secrets`

**Aliases:** `secrets`, `make:secrets`
**Syntax:** `hana-cli copy2Secrets`
**Tags:** configuration, secrets

**Use cases:**
- Copy settings to secrets file

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--envJson` (`--from-file`) | string | `"default-env.json"` | envJson |
| `--secretsFolder` (`--to-folder`) | string | `"secrets"` | secretsFolder |
| `--filter` | string | - | secretsFilter |

**Related:** `connect`, `copy2Env`

---

#### `createJWT`

**Aliases:** `cJWT`, `cjwt`, `cJwt`
**Syntax:** `hana-cli createJWT [name]`
**Tags:** jwt, token, authentication

**Use cases:**
- Create JWT token

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--name` (`-c`) | string | - | jwtName |
| `--certificate` (`--cert`) | string | - | certificate |
| `--issuer` (`-i`) | string | - | issuer |

**Related:** `inspectJWT`, `connectViaServiceKey`

---

### Data Tools

Import, export, compare, validate, and manage data across systems

#### `compareData`

**Aliases:** `cmpdata`, `compardata`, `dataCompare`
**Syntax:** `hana-cli compareData`

**Parameters:**

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

#### `compareSchema`

**Aliases:** `cmpschema`, `schemaCompare`, `compareschema`
**Syntax:** `hana-cli compareSchema`
**Tags:** compare, diff, analysis

**Use cases:**
- Compare two schemas
- Find schema differences

**Prerequisites:** Active database connection, Both schemas exist

**Parameters:**

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

**Related:** `compareData`, `schemaClone`

---

#### `dataDiff`

**Aliases:** `ddiff`, `diffData`, `dataCompare`
**Syntax:** `hana-cli dataDiff`

**Parameters:**

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

#### `dataLineage`

**Aliases:** `lineage`, `dataFlow`, `traceLineage`
**Syntax:** `hana-cli dataLineage`

**Related:** `dataProfile`, `compareData`

---

#### `dataMask`

**Aliases:** `mask`, `dataprivacy`, `anonymize`, `pii`
**Syntax:** `hana-cli dataMask`
**Tags:** masking, anonymization, privacy

**Use cases:**
- Mask sensitive data
- Anonymize personal information

**Related:** `dataValidator`, `import`

---

#### `dataProfile`

**Aliases:** `prof`, `profileData`, `dataStats`
**Syntax:** `hana-cli dataProfile`
**Tags:** profiling, statistics, data-analysis

**Use cases:**
- Profile table data
- Analyze column distributions
- Identify data patterns

**Prerequisites:** Active database connection, Target table exists

**Parameters:**

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

**Related:** `dataValidator`, `duplicateDetection`

---

#### `dataSync`

**Aliases:** `datasync`, `syncData`, `sync`
**Syntax:** `hana-cli dataSync`
**Tags:** sync, synchronization, replication

**Use cases:**
- Synchronize data between tables
- Replicate data

**Prerequisites:** Active database connection, Source and target tables exist

**Parameters:**

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

#### `dataValidator`

**Aliases:** `dval`, `validateData`, `dataValidation`
**Syntax:** `hana-cli dataValidator`
**Tags:** validation, quality, rules, checking

**Use cases:**
- Validate data against rules
- Check data quality
- Find invalid records

**Prerequisites:** Active database connection, Target table exists, Validation rules defined

**Parameters:**

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

**Related:** `import`, `dataProfile`

---

#### `duplicateDetection`

**Aliases:** `dupdetect`, `findDuplicates`, `duplicates`
**Syntax:** `hana-cli duplicateDetection`
**Tags:** duplicates, quality, anomaly

**Use cases:**
- Find duplicate records
- Identify data redundancy

**Prerequisites:** Active database connection, Target table exists

**Related:** `dataProfile`, `dataValidator`

---

#### `export`

**Aliases:** `exp`, `downloadData`, `downloaddata`
**Syntax:** `hana-cli export`
**Tags:** export, download, extract, csv, excel

**Use cases:**
- Extract table data to file
- Download data

**Prerequisites:** Active database connection, Source table exists

**Parameters:**

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

**Related:** `import`, `massExport`

---

#### `import`

**Aliases:** `imp`, `uploadData`, `uploaddata`
**Syntax:** `hana-cli import`
**Tags:** import, upload, load-data, csv, excel

**Use cases:**
- Load data from CSV/Excel
- Upload data to table

**Prerequisites:** Active database connection, Target table exists with compatible structure, CSV or Excel file available

**Parameters:**

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

**Related:** `export`, `dataValidator`

---

#### `importUI`

**Aliases:** `impui`, `importui`, `uploadui`, `uploadUI`
**Syntax:** `hana-cli importUI [filename] [table]`

**Related:** `import`

---

#### `kafkaConnect`

**Aliases:** `kafka`, `kafkaAdapter`, `kafkasub`
**Syntax:** `hana-cli kafkaConnect [action]`
**Tags:** kafka, streaming, integration

**Use cases:**
- Manage Kafka connections

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--action` (`-a`) | string | `'list'` | action |
| `--name` (`-n`) | string | - | connectorName |
| `--brokers` (`-b`) | string | - | kafkaBrokers |
| `--topic` (`-t`) | string | - | kafkaTopic |
| `--config` (`-c`) | string | - | configPath |

**Related:** `dataSync`, `import`

---

### Developer Tools

Developer utilities, templates, docs, and interactive helpers

#### `callProcedure`

**Aliases:** `cp`, `callprocedure`, `callProc`, `callproc`, `callSP`, `callsp`
**Syntax:** `hana-cli callProcedure [schema] [procedure]`
**Tags:** procedure, execution, call

**Use cases:**
- Call stored procedure
- Execute procedure

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--procedure` (`-p`, `--sp`) | string | - | procedure |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectProcedure`, `procedures`

---

#### `cds`

**Aliases:** `cdsPreview`
**Syntax:** `hana-cli cds [schema] [table]`
**Tags:** cds, cap, data-model

**Use cases:**
- Work with CDS models

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | - | table |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--view` (`-v`) | boolean | `false` | viewOpt |
| `--useHanaTypes` (`--hana`) | boolean | `false` | useHanaTypes |
| `--useQuoted` (`-q`, `--quoted`) | boolean | `false` | useQuoted |
| `--port` (`-p`) | number | `false` | port |
| `--profile` (`--pr`) | string | - | profile |

**Related:** `activateHDI`, `generateDocs`, `codeTemplate`

---

#### `codeTemplate`

**Aliases:** `template`, `codegen`, `scaffold`, `boilerplate`
**Syntax:** `hana-cli codeTemplate`
**Tags:** template, code-generation

**Use cases:**
- Generate code templates

**Related:** `createModule`, `generateTestData`

---

#### `createModule`

**Aliases:** `createDB`, `createDBModule`
**Syntax:** `hana-cli createModule`

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--folder` | string | - | folder |
| `--hanaCloud` | boolean | `true` | hanaCloud |

**Related:** `generateTestData`, `codeTemplate`

---

#### `examples`

**Aliases:** `example`
**Syntax:** `hana-cli examples [command] [query...]`

**Related:** `viewDocs`, `interactive`, `kb`

---

#### `generateDocs`

**Aliases:** `docs`, `gendocs`, `generateDocumentation`
**Syntax:** `hana-cli generateDocs`
**Tags:** documentation, generate, docs

**Use cases:**
- Generate documentation
- Create docs from schema

**Related:** `viewDocs`, `helpDocu`, `readMe`

---

#### `generateTestData`

**Aliases:** `testdata`, `gendata`, `generateData`
**Syntax:** `hana-cli generateTestData`
**Tags:** test-data, generate, sample

**Use cases:**
- Generate test data
- Create sample records

**Related:** `codeTemplate`, `import`, `dataProfile`

---

#### `hdbsql`

**Syntax:** `hana-cli hdbsql`
**Tags:** sql, query, execution

**Use cases:**
- Execute SQL directly

**Related:** `querySimple`, `callProcedure`

---

#### `helpDocu`

**Aliases:** `openDocu`, `openDocumentation`, `documentation`, `docu`
**Syntax:** `hana-cli helpDocu`

**Related:** `viewDocs`, `kb`, `readMe`

---

#### `interactive`

**Aliases:** `i`, `repl`, `shell`
**Syntax:** `hana-cli interactive`

**Related:** `helpDocu`, `examples`, `kb`

---

#### `issue`

**Aliases:** `Issue`, `openIssue`, `openissue`, `reportIssue`, `reportissue`
**Syntax:** `hana-cli issue`
**Tags:** issue, report, help

**Use cases:**
- Report issues or get help

**Related:** `diagnose`, `helpDocu`

---

#### `kb`

**Syntax:** `hana-cli kb [query...]`

**Related:** `viewDocs`, `helpDocu`, `examples`

---

#### `readMe`

**Aliases:** `readme`
**Syntax:** `hana-cli readMe`
**Tags:** readme, documentation

**Use cases:**
- View help documentation

**Related:** `readMeUI`, `helpDocu`, `openReadMe`

---

#### `readMeUI`

**Aliases:** `readmeui`, `readMeUi`, `readmeUI`
**Syntax:** `hana-cli readMeUI`

**Related:** `readMe`, `UI`, `openReadMe`

---

#### `sdiTasks`

**Aliases:** `sditasks`, `sdi`, `smartDataIntegration`
**Syntax:** `hana-cli sdiTasks`
**Tags:** sdi, task, data-provisioning

**Use cases:**
- Manage SDI tasks
- Monitor data provisioning

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--action` (`-a`) | string | `'list'` | sdiTasksAction |
| `--taskName` (`--tn`) | string | - | sdiTasksTaskName |
| `--flowgraph` (`--fg`) | string | - | sdiTasksFlowgraph |
| `--agentName` (`--an`) | string | - | sdiTasksAgentName |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | sdiTasksSchema |
| `--profile` (`-p`) | string | - | profile |

**Related:** `dataSync`, `connections`

---

#### `test`

**Syntax:** `hana-cli test`

**Related:** `cds`, `activateHDI`

---

#### `timeSeriesTools`

**Aliases:** `tsTools`, `timeseries`, `timeseriestools`
**Syntax:** `hana-cli timeSeriesTools [action]`
**Tags:** time-series, temporal

**Use cases:**
- Work with time series data

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--action` (`-a`, `--Action`) | string | `'list'` | action |
| `--table` (`-t`, `--Table`) | string | - | table |
| `--schema` (`-s`, `--Schema`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--timeColumn` (`--tc`, `--TimeColumn`) | string | - | timeColumn |
| `--valueColumn` (`--vc`, `--ValueColumn`) | string | - | valueColumn |
| `--interval` (`-i`, `--Interval`) | string | `'HOUR'` | timeInterval |
| `--limit` (`-l`, `--Limit`) | number | `1000` | limit |

**Related:** `tables`, `dataProfile`

---

#### `UI`

**Aliases:** `ui`, `gui`, `GUI`, `launchpad`, `LaunchPad`, `launchPad`, `server`
**Syntax:** `hana-cli UI`

**Related:** `readMeUI`, `helpDocu`

---

#### `viewDocs`

**Aliases:** `docs`, `doc`, `documentation`
**Syntax:** `hana-cli viewDocs [topic]`

**Related:** `helpDocu`, `kb`, `examples`

---

### HANA Cloud

Manage SAP HANA Cloud instances and related services

#### `hanaCloudHDIInstances`

**Aliases:** `hdiInstances`, `hdiinstances`, `hdiServices`, `listhdi`, `hdiservices`, `hdis`
**Syntax:** `hana-cli hdi`
**Tags:** cloud, hdi, instance

**Use cases:**
- List HANA Cloud HDI instances

**Related:** `hanaCloudInstances`, `adminHDI`

---

#### `hanaCloudHDIInstancesUI`

**Aliases:** `hdiInstancesUI`, `hdiinstancesui`, `hdiServicesUI`, `listhdiui`, `hdiservicesui`, `hdisui`
**Syntax:** `hana-cli hdiUI`

**Related:** `hanaCloudHDIInstances`

---

#### `hanaCloudInstances`

**Aliases:** `hcInstances`, `instances`, `listHC`, `listhc`, `hcinstances`
**Syntax:** `hana-cli hc [name]`
**Tags:** cloud, instance, management

**Use cases:**
- List HANA Cloud instances
- View cloud databases

**Related:** `hanaCloudStart`, `hanaCloudStop`, `hanaCloudHDIInstances`

---

#### `hanaCloudSBSSInstances`

**Aliases:** `sbssInstances`, `sbssinstances`, `sbssServices`, `listsbss`, `sbssservices`, `sbsss`
**Syntax:** `hana-cli sbss`
**Tags:** cloud, sbss, instance

**Use cases:**
- List HANA Cloud SBSS instances

**Related:** `hanaCloudInstances`

---

#### `hanaCloudSBSSInstancesUI`

**Aliases:** `sbssInstancesUI`, `sbssinstancesui`, `sbssServicesUI`, `listsbssui`, `sbssservicesui`, `sbsssui`
**Syntax:** `hana-cli sbssUI`

**Related:** `hanaCloudSBSSInstances`

---

#### `hanaCloudSchemaInstances`

**Aliases:** `schemainstances`, `schemaServices`, `listschemas`, `schemaservices`
**Syntax:** `hana-cli schemaInstances`
**Tags:** cloud, schema, instance

**Use cases:**
- List HANA Cloud schema instances

**Related:** `hanaCloudInstances`, `schemas`

---

#### `hanaCloudSchemaInstancesUI`

**Aliases:** `schemainstancesui`, `schemaServicesUI`, `listschemasui`, `schemaservicesui`
**Syntax:** `hana-cli schemaInstancesUI`

**Related:** `hanaCloudSchemaInstances`

---

#### `hanaCloudSecureStoreInstances`

**Aliases:** `secureStoreInstances`, `securestoreinstances`, `secureStoreServices`, `listSecureStore`, `securestoreservices`, `securestores`
**Syntax:** `hana-cli securestore`
**Tags:** cloud, secure-store, instance

**Use cases:**
- List HANA Cloud Secure Store instances

**Related:** `hanaCloudInstances`, `certificates`

---

#### `hanaCloudSecureStoreInstancesUI`

**Aliases:** `secureStoreInstancesUI`, `secureStoreUI`, `securestoreinstancesui`, `secureStoreServicesUI`, `listSecureStoreUI`, `securestoreservicesui`, `securestoresui`
**Syntax:** `hana-cli securestoreUI`

**Related:** `hanaCloudSecureStoreInstances`

---

#### `hanaCloudStart`

**Aliases:** `hcstart`, `hc_start`, `start`
**Syntax:** `hana-cli hcStart [name]`
**Tags:** cloud, start, instance

**Use cases:**
- Start HANA Cloud instance

**Related:** `hanaCloudStop`, `hanaCloudInstances`

---

#### `hanaCloudStop`

**Aliases:** `hcstop`, `hc_stop`, `stop`
**Syntax:** `hana-cli hcStop [name]`
**Tags:** cloud, stop, instance

**Use cases:**
- Stop HANA Cloud instance

**Related:** `hanaCloudStart`, `hanaCloudInstances`

---

#### `hanaCloudUPSInstances`

**Aliases:** `upsInstances`, `upsinstances`, `upServices`, `listups`, `upsservices`
**Syntax:** `hana-cli ups`
**Tags:** cloud, ups, instance

**Use cases:**
- List HANA Cloud UPS instances

**Related:** `hanaCloudInstances`

---

#### `hanaCloudUPSInstancesUI`

**Aliases:** `upsInstancesUI`, `upsinstancesui`, `upServicesUI`, `listupsui`, `upsservicesui`
**Syntax:** `hana-cli upsUI`

**Related:** `hanaCloudUPSInstances`

---

### HDI Management

Manage HDI containers, groups, and deployment operations

#### `activateHDI`

**Aliases:** `ahdi`, `ah`
**Syntax:** `hana-cli activateHDI [tenant]`
**Tags:** hdi, deployment, activation

**Use cases:**
- Activate HDI deployment
- Deploy HDI changes

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--tenant` (`-t`) | string | - | tenant |

**Related:** `adminHDI`, `adminHDIGroup`, `cds`

---

#### `adminHDI`

**Aliases:** `adHDI`, `adhdi`
**Syntax:** `hana-cli adminHDI [user] [password]`
**Tags:** hdi, administration, management

**Use cases:**
- Administer HDI
- Manage HDI settings

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | - | user |
| `--password` (`-p`) | string | - | password |
| `--create` (`-c`) | boolean | `true` | createUser |

**Related:** `adminHDIGroup`, `hanaCloudHDIInstances`

---

#### `adminHDIGroup`

**Aliases:** `adHDIG`, `adhdig`
**Syntax:** `hana-cli adminHDIGroup [user] [group]`
**Tags:** hdi, group, administration

**Use cases:**
- Manage HDI groups
- Administer HDI group

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`, `--User`) | string | - | user |
| `--group` (`-g`) | string | `'SYS_XS_HANA_BROKER'` | group |

**Related:** `adminHDI`, `activateHDI`

---

#### `containers`

**Aliases:** `cont`, `listContainers`, `listcontainers`
**Syntax:** `hana-cli containers [containerGroup] [container]`
**Tags:** container, hdi, deployment

**Use cases:**
- List HDI containers
- Manage containers

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--container` (`-c`) | string | `"*"` | container |
| `--containerGroup` (`-g`, `--group`, `--containergroup`) | string | `'*'` | containerGroup |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `createContainer`, `dropContainer`, `containersUI`

---

#### `containersUI`

**Aliases:** `containersui`, `contUI`, `listContainersUI`, `listcontainersui`
**Syntax:** `hana-cli containersUI [containerGroup] [container]`

**Related:** `containers`

---

#### `createContainer`

**Aliases:** `cc`, `cCont`
**Syntax:** `hana-cli createContainer [container] [group]`
**Tags:** container, create, hdi

**Use cases:**
- Create new HDI container

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--container` (`-c`) | string | - | container |
| `--group` (`-g`) | string | `''` | group |
| `--save` (`-s`) | boolean | `true` | saveHDI |
| `--encrypt` (`-e`, `--ssl`) | boolean | `false` | encrypt |

**Related:** `dropContainer`, `containers`, `createContainerUsers`

---

#### `createContainerUsers`

**Aliases:** `ccu`, `cContU`
**Syntax:** `hana-cli createContainerUsers [container]`

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--container` (`-c`) | string | - | container |
| `--save` (`-s`) | boolean | `true` | saveHDI |
| `--encrypt` (`-e`, `--ssl`) | boolean | `false` | encrypt |

**Related:** `createContainer`, `users`

---

#### `dropContainer`

**Aliases:** `dc`, `dropC`
**Syntax:** `hana-cli dropContainer [container] [group]`
**Tags:** container, drop, hdi

**Use cases:**
- Drop HDI container

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--container` (`-c`) | string | - | container |
| `--group` (`-g`) | string | `''` | group |

**Related:** `createContainer`, `containers`

---

### Mass Operations

Bulk operations for grants, updates, deletions, and conversions

#### `massConvert`

**Aliases:** `mc`, `massconvert`, `massConv`, `massconv`
**Syntax:** `hana-cli massConvert [schema] [table] [view]`
**Tags:** convert, bulk-operation, data-type

**Use cases:**
- Convert data types
- Bulk data conversion

**Related:** `massUpdate`, `massRename`

---

#### `massConvertUI`

**Aliases:** `mcui`, `massconvertui`, `massConvUI`, `massconvui`
**Syntax:** `hana-cli massConvertUI [schema] [table]`

**Related:** `massConvert`

---

#### `massDelete`

**Aliases:** `md`, `massdelete`, `massDel`, `massdel`
**Syntax:** `hana-cli massDelete [schema] [object]`
**Tags:** delete, bulk-operation, purge

**Use cases:**
- Delete records in bulk
- Purge old data

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`) | string | - | schema |
| `--object` (`-o`) | string | - | object |
| `--limit` (`-l`) | number | `1000` | limit |
| `--objectType` (`-t`, `--type`) | string | - | objectType |
| `--includeSystem` (`-i`, `--system`) | boolean | `false` | includeSystemObjects |
| `--dryRun` (`--dr`, `--preview`) | boolean | `false` | dryRun |
| `--force` (`-f`) | boolean | `false` | force |
| `--log` | boolean | - | log |

**Related:** `massExport`, `massUpdate`

---

#### `massExport`

**Aliases:** `me`, `mexport`, `massExp`, `massexp`
**Syntax:** `hana-cli massExport [schema] [object]`
**Tags:** export, bulk-operation, extract

**Use cases:**
- Export multiple tables at once

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`, `--schema`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--object` (`-o`, `--object`) | string | `'*'` | object |
| `--objectType` (`-t`, `--type`) | string | - | objectType |
| `--limit` (`-l`, `--limit`) | number | `1000` | limit |
| `--format` (`-f`, `--format`) | string | `'csv'` | exportFormat |
| `--folder` (`--directory`, `--dir`) | string | - | folder |
| `--includeData` (`--data`) | boolean | `false` | includeData |

**Related:** `export`, `massDelete`

---

#### `massGrant`

**Aliases:** `mg`, `massgrant`, `massGrn`, `massgrn`
**Syntax:** `hana-cli massGrant [schema] [object]`
**Tags:** grant, permission, bulk-operation

**Use cases:**
- Grant permissions in bulk
- Bulk privilege assignment

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`) | string | - | schema |
| `--object` (`-o`) | string | - | object |
| `--grantee` (`-g`) | string | - | grantee |
| `--privilege` (`--pr`) | string | - | privilege |
| `--objectType` (`-t`, `--type`) | string | - | objectType |
| `--withGrantOption` (`--wgo`) | boolean | `false` | withGrantOption |
| `--dryRun` (`--dr`, `--preview`) | boolean | `false` | dryRun |
| `--log` | boolean | - | log |

**Related:** `massUsers`, `users`, `roles`

---

#### `massRename`

**Aliases:** `mr`, `massrename`, `massRN`, `massrn`
**Syntax:** `hana-cli massRename`
**Tags:** rename, bulk-operation

**Use cases:**
- Rename objects in bulk

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`) | string | - | schemaCDS |
| `--namespace` (`-n`) | string | - | namespace |
| `--prefix` (`-p`) | string | - | prefix |
| `--case` (`-c`) | string | - | case |

**Related:** `massConvert`, `massUpdate`

---

#### `massUpdate`

**Aliases:** `mu`, `massupdate`, `massUpd`, `massupd`
**Syntax:** `hana-cli massUpdate [schema] [object]`
**Tags:** update, bulk-operation

**Use cases:**
- Update many records at once

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`) | string | - | schema |
| `--object` (`-o`) | string | - | object |
| `--setClause` (`-c`, `--set`) | string | - | setClause |
| `--whereClause` (`-w`, `--where`) | string | - | whereClause |
| `--limit` (`-l`) | number | `1000` | limit |
| `--dryRun` (`--dr`, `--preview`) | boolean | `false` | dryRun |
| `--log` | boolean | - | log |

**Related:** `massDelete`, `massConvert`

---

#### `massUsers`

**Aliases:** `massUser`, `mUsers`, `mUser`, `mu`
**Syntax:** `hana-cli massUsers [user] [password]`

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | - | user |
| `--password` (`-p`) | string | - | password |

**Related:** `users`, `roles`, `massGrant`

---

#### `tableCopy`

**Aliases:** `tablecopy`, `copyTable`, `copytable`
**Syntax:** `hana-cli tableCopy`
**Tags:** copy, transfer, data-movement

**Use cases:**
- Copy table between schemas
- Copy table to another system

**Prerequisites:** Active database connection, Source table exists, Target schema accessible

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--sourceTable` (`--st`) | string | - | tableCopySourceTable |
| `--targetTable` (`--tt`) | string | - | tableCopyTargetTable |
| `--sourceSchema` (`--ss`) | string | `'**CURRENT_SCHEMA**'` | tableCopySourceSchema |
| `--targetSchema` (`--ts`) | string | `'**CURRENT_SCHEMA**'` | tableCopyTargetSchema |
| `--structureOnly` (`--so`) | boolean | `false` | tableCopyStructureOnly |
| `--dataOnly` (`--do`) | boolean | `false` | tableCopyDataOnly |
| `--where` (`-w`) | string | - | tableCopyWhere |
| `--limit` (`-l`) | number | - | tableCopyLimit |
| `--batchSize` (`-b`, `--batch`) | number | `1000` | tableCopyBatchSize |
| `--dryRun` (`--dr`, `--preview`) | boolean | `false` | dryRun |
| `--timeout` (`--to`) | number | `3600` | tableCopyTimeout |
| `--profile` (`-p`) | string | - | profile |

**Related:** `export`, `import`, `tables`

---

### Object Inspection

Inspect tables, views, procedures, indexes, and related objects

#### `inspectFunction`

**Aliases:** `if`, `function`, `insFunc`, `inspectfunction`
**Syntax:** `hana-cli inspectFunction [schema] [function]`
**Tags:** function, inspection

**Use cases:**
- Inspect function details

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--functionName` (`-f`, `--function`) | string | - | function |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `functions`, `inspectProcedure`

---

#### `inspectIndex`

**Aliases:** `ii`, `index`, `insIndex`, `inspectindex`
**Syntax:** `hana-cli inspectIndex [schema] [index]`
**Tags:** index, inspection, analysis

**Use cases:**
- Inspect index details

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--index` (`-i`) | string | - | index |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |

**Related:** `indexes`, `tables`, `tableHotspots`

---

#### `inspectJWT`

**Aliases:** `jwt`, `ijwt`, `iJWT`, `iJwt`
**Syntax:** `hana-cli inspectJWT`
**Tags:** jwt, token, analysis

**Use cases:**
- Analyze JWT token

**Related:** `createJWT`

---

#### `inspectLibMember`

**Aliases:** `ilm`, `libraryMember`, `librarymember`, `insLibMem`, `inspectlibrarymember`
**Syntax:** `hana-cli inspectLibMember [schema] [library] [libraryMem]`
**Tags:** library, member

**Use cases:**
- Inspect library member details

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--library` (`--lib`) | string | - | library |
| `--libraryMem` (`-m`, `--libMem`) | string | - | libMember |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `libraries`, `inspectLibrary`

---

#### `inspectLibrary`

**Aliases:** `il`, `library`, `insLib`, `inspectlibrary`
**Syntax:** `hana-cli inspectLibrary [schema] [library]`
**Tags:** library, inspection

**Use cases:**
- Inspect library details

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--library` (`--lib`) | string | - | library |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `libraries`, `inspectLibMember`

---

#### `inspectProcedure`

**Aliases:** `ip`, `procedure`, `insProc`, `inspectprocedure`, `inspectsp`
**Syntax:** `hana-cli inspectProcedure [schema] [procedure]`
**Tags:** procedure, inspection

**Use cases:**
- Inspect procedure details

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--procedure` (`-p`, `--sp`) | string | - | procedure |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `procedures`, `inspectFunction`, `callProcedure`

---

#### `inspectTable`

**Aliases:** `it`, `table`, `insTbl`, `inspecttable`, `inspectable`
**Syntax:** `hana-cli inspectTable [schema] [table]`
**Tags:** table, inspection, analysis

**Use cases:**
- Inspect table structure and properties

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | - | table |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |
| `--useHanaTypes` (`--hana`) | boolean | `false` | useHanaTypes |
| `--useExists` (`--exists`, `--persistence`) | boolean | `true` | useExists |
| `--useQuoted` (`-q`, `--quoted`) | boolean | `false` | useQuoted |
| `--noColons` | boolean | `false` | noColons |

**Related:** `tables`, `inspectView`, `columnStats`

---

#### `inspectTableUI`

**Aliases:** `itui`, `tableUI`, `tableui`, `insTblUI`, `inspecttableui`, `inspectableui`
**Syntax:** `hana-cli inspectTableUI [schema] [table]`

**Related:** `tables`, `inspectTable`

---

#### `inspectTrigger`

**Aliases:** `itrig`, `trigger`, `insTrig`, `inspecttrigger`, `inspectrigger`
**Syntax:** `hana-cli inspectTrigger [schema] [trigger]`
**Tags:** trigger, inspection

**Use cases:**
- Inspect trigger details

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--trigger` (`-t`) | string | `"*"` | sequence |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `triggers`, `inspectProcedure`, `tables`

---

#### `inspectView`

**Aliases:** `iv`, `view`, `insVew`, `inspectview`
**Syntax:** `hana-cli inspectView [schema] [view]`
**Tags:** view, inspection

**Use cases:**
- Inspect view details

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--view` (`-v`) | string | - | view |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |
| `--useHanaTypes` (`--hana`) | boolean | `false` | useHanaTypes |
| `--useExists` (`--exists`, `--persistence`) | boolean | `true` | useExists |
| `--useQuoted` (`-q`, `--quoted`) | boolean | `false` | useQuoted |
| `--noColons` | boolean | `false` | noColons |

**Related:** `views`, `inspectTable`, `inspectProcedure`

---

### Other

#### `commandMap`

**Syntax:** `hana-cli commandMap`


---

### Performance Monitoring

Monitor performance, expensive operations, and system bottlenecks

#### `blocking`

**Aliases:** `b`, `locks`
**Syntax:** `hana-cli blocking`
**Tags:** blocking, lock, session

**Use cases:**
- Find blocking locks
- Identify deadlocks

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `50` | limit |
| `--details` (`-d`) | boolean | `false` | details |

**Related:** `deadlocks`, `longRunning`, `connections`

---

#### `columnStats`

**Syntax:** `hana-cli columnStats [schema] [table]`
**Tags:** statistics, column-analysis

**Use cases:**
- Analyze column statistics
- Update column statistics

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | `"*"` | table |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `tables`, `inspectTable`, `tableHotspots`

---

#### `deadlocks`

**Aliases:** `deadlock`, `dl`
**Syntax:** `hana-cli deadlocks`
**Tags:** deadlock, lock, session

**Use cases:**
- Find deadlock information
- Analyze lock contention

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `longRunning`, `blocking`, `healthCheck`

---

#### `expensiveStatements`

**Syntax:** `hana-cli expensiveStatements`
**Tags:** performance, sql, slow-queries

**Use cases:**
- Find expensive SQL statements
- Identify performance problems

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `50` | limit |
| `--orderBy` (`-o`) | string | `'totalTime'` | expensiveStatementsOrderBy |

**Related:** `longRunning`, `queryPlan`, `blocking`

---

#### `fragmentationCheck`

**Aliases:** `frag`, `fc`
**Syntax:** `hana-cli fragmentationCheck`
**Tags:** fragmentation, performance, diagnostics

**Use cases:**
- Check table fragmentation
- Monitor storage efficiency

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--table` (`-t`) | string | `null` | table |
| `--threshold` (`--th`) | number | `10` | fragmentationThreshold |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `reclaim`, `healthCheck`

---

#### `indexTest`

**Syntax:** `hana-cli indexTest`

**Related:** `indexes`, `tableHotspots`

---

#### `longRunning`

**Aliases:** `lr`, `longrunning`
**Syntax:** `hana-cli longRunning`
**Tags:** long-running, slow, performance

**Use cases:**
- Find long-running operations
- Monitor slow processes

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `50` | limit |
| `--duration` (`-d`) | number | `60` | queryDuration |
| `--includeIdle` (`-i`) | boolean | `false` | idleSession |
| `--cancel` (`-c`) | string | - | Statement hash to cancel |

**Related:** `expensiveStatements`, `deadlocks`, `blocking`

---

#### `memoryAnalysis`

**Syntax:** `hana-cli memoryAnalysis`
**Tags:** memory, performance, resource-usage

**Use cases:**
- Analyze memory consumption
- Find memory-heavy tables

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--component` (`-c`) | string | `'*'` | component |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `memoryLeaks`, `healthCheck`, `systemInfo`

---

#### `memoryLeaks`

**Aliases:** `memleak`, `ml`
**Syntax:** `hana-cli memoryLeaks`
**Tags:** memory, memory-leak, diagnostics

**Use cases:**
- Find potential memory leaks
- Monitor memory issues

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--component` (`-c`) | string | `null` | component |
| `--threshold` (`-t`) | number | `10` | threshold |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `memoryAnalysis`, `healthCheck`

---

#### `queryPlan`

**Syntax:** `hana-cli queryPlan`
**Tags:** execution-plan, sql-analysis, performance

**Use cases:**
- Analyze query execution plan
- Optimize queries

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--sql` (`-q`, `--sql`) | string | - | query |

**Related:** `querySimple`, `expensiveStatements`

---

#### `querySimple`

**Aliases:** `qs`, `querysimple`
**Syntax:** `hana-cli querySimple`
**Tags:** query, sql, execution

**Use cases:**
- Run simple queries

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--query` (`-q`) | string | - | query |
| `--folder` (`-f`) | string | `'./'` | folder |
| `--filename` (`-n`) | string | - | filename |
| `--output` (`-o`) | string | `"table"` | outputTypeQuery |
| `--profile` (`-p`) | string | - | profile |

**Related:** `queryPlan`, `expensiveStatements`

---

#### `querySimpleUI`

**Aliases:** `qsui`, `querysimpleui`, `queryUI`, `sqlUI`
**Syntax:** `hana-cli querySimpleUI`

**Related:** `querySimple`

---

#### `reclaim`

**Syntax:** `hana-cli reclaim`
**Tags:** reclaim, cleanup, maintenance

**Use cases:**
- Reclaim unused space
- Perform maintenance

**Related:** `fragmentationCheck`, `dataVolumes`

---

#### `recommendations`

**Aliases:** `rec`, `recommend`
**Syntax:** `hana-cli recommendations`
**Tags:** recommendation, optimization, best-practices

**Use cases:**
- Get system recommendations
- Find optimization opportunities

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--category` (`-c`) | string | `'all'` | Recommendation category |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `healthCheck`, `expensiveStatements`

---

#### `tableHotspots`

**Aliases:** `th`, `hotspots`
**Syntax:** `hana-cli tableHotspots [schema] [table]`
**Tags:** hotspot, high-load, performance

**Use cases:**
- Identify heavily accessed tables
- Find performance bottlenecks

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | `"*"` | table |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--includePartitions` (`-p`, `--Partitions`) | boolean | `true` | includePartitions |
| `--limit` (`-l`, `--Limit`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `columnStats`, `indexes`, `inspectTable`

---

### Schema Tools

Explore schemas, tables, views, and database object metadata

#### `dataTypes`

**Aliases:** `dt`, `datatypes`, `dataType`, `datatype`
**Syntax:** `hana-cli dataTypes`

**Related:** `dataTypesUI`, `tables`

---

#### `dataTypesUI`

**Aliases:** `dtui`, `datatypesUI`, `dataTypeUI`, `datatypeui`, `datatypesui`
**Syntax:** `hana-cli dataTypesUI`

**Related:** `dataTypes`

---

#### `ftIndexes`

**Aliases:** `fti`, `ftIndex`, `fulltext`, `fulltextIndexes`
**Syntax:** `hana-cli ftIndexes [schema] [index]`

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--index` (`-i`) | string | `"*"` | ftIndexName |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--table` (`-t`) | string | - | ftTable |
| `--details` (`-d`) | boolean | `false` | details |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `indexes`, `tables`

---

#### `functions`

**Aliases:** `f`, `listFuncs`, `ListFunc`, `listfuncs`, `Listfunc`, `listFunctions`, `listfunctions`
**Syntax:** `hana-cli functions [schema] [function]`
**Tags:** function, metadata, sql

**Use cases:**
- List functions
- Analyze function definitions

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--functionName` (`-f`, `--function`) | string | `"*"` | function |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectFunction`, `procedures`, `objects`

---

#### `functionsUI`

**Aliases:** `fui`, `listFuncsUI`, `ListFuncUI`, `listfuncsui`, `Listfuncui`, `listFunctionsUI`, `listfunctionsui`
**Syntax:** `hana-cli functionsUI [schema] [function]`

**Related:** `functions`

---

#### `indexes`

**Aliases:** `ind`, `listIndexes`, `ListInd`, `listind`, `Listind`, `listfindexes`
**Syntax:** `hana-cli indexes [schema] [indexes]`
**Tags:** index, metadata, performance

**Use cases:**
- List indexes on tables
- Analyze index definitions

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--indexes` (`-i`) | string | `"*"` | function |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectIndex`, `tables`, `tableHotspots`

---

#### `indexesUI`

**Aliases:** `indUI`, `listIndexesUI`, `ListIndUI`, `listindui`, `Listindui`, `listfindexesui`, `indexesui`
**Syntax:** `hana-cli indexesUI [schema] [indexes]`

**Related:** `indexes`

---

#### `libraries`

**Aliases:** `l`, `listLibs`, `ListLibs`, `listlibs`, `ListLib`, `listLibraries`, `listlibraries`
**Syntax:** `hana-cli libraries [schema] [library]`
**Tags:** library, managed-library

**Use cases:**
- List managed libraries

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--library` (`--lib`) | string | `"*"` | library |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectLibrary`, `inspectLibMember`

---

#### `objects`

**Aliases:** `o`, `listObjects`, `listobjects`
**Syntax:** `hana-cli objects [schema] [object]`
**Tags:** object, metadata, catalog

**Use cases:**
- List all database objects
- Search by object type

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--object` (`-o`) | string | `"*"` | object |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `schemas`, `tables`, `views`

---

#### `partitions`

**Aliases:** `parts`, `partition`, `partitioning`, `tablePartitions`
**Syntax:** `hana-cli partitions [schema] [table]`

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | `"*"` | partitionTable |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--type` (`--pt`) | string | - | partitionType |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `tables`, `inspectTable`, `tableHotspots`

---

#### `procedures`

**Aliases:** `p`, `listProcs`, `ListProc`, `listprocs`, `Listproc`, `listProcedures`, `listprocedures`, `sp`
**Syntax:** `hana-cli procedures [schema] [procedure]`
**Tags:** procedure, metadata, sql

**Use cases:**
- Find stored procedures
- Analyze procedure definitions

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--procedure` (`-p`, `--Procedure`) | string | `"*"` | procedure |
| `--schema` (`-s`, `--Schema`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectProcedure`, `functions`, `views`

---

#### `schemaClone`

**Aliases:** `schemaclone`, `cloneSchema`, `copyschema`
**Syntax:** `hana-cli schemaClone`
**Tags:** clone, copy-schema, replication

**Use cases:**
- Clone entire schema
- Duplicate schema structure

**Prerequisites:** Active database connection, Source schema exists, SCHEMA admin privileges

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--sourceSchema` (`--ss`) | string | `'**CURRENT_SCHEMA**'` | schemaCloneSourceSchema |
| `--targetSchema` (`--ts`) | string | `'**CURRENT_SCHEMA**'` | schemaCloneTargetSchema |
| `--includeData` (`--id`) | boolean | `false` | schemaCloneIncludeData |
| `--includeGrants` (`--ig`) | boolean | `false` | schemaCloneIncludeGrants |
| `--parallel` (`--par`) | number | `1` | schemaCloneParallel |
| `--excludeTables` (`--et`) | string | - | schemaCloneExcludeTables |
| `--dryRun` (`--dr`, `--preview`) | boolean | `false` | dryRun |
| `--timeout` (`--to`) | number | `7200` | schemaCloneTimeout |
| `--profile` (`-p`) | string | - | profile |

**Related:** `schemas`, `tables`, `export`

---

#### `schemas`

**Aliases:** `sch`, `getSchemas`, `listSchemas`, `s`
**Syntax:** `hana-cli schemas [schema]`
**Tags:** schema, metadata, structure

**Use cases:**
- List all schemas
- Discover database structure

**Prerequisites:** Active database connection

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`) | string | `"*"` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--all` (`--al`, `--allSchemas`) | boolean | `false` | allSchemas |

**Related:** `objects`, `schemaClone`, `tables`

---

#### `schemasUI`

**Aliases:** `schui`, `getSchemasUI`, `listSchemasUI`, `schemasui`, `getschemasui`, `listschemasui`
**Syntax:** `hana-cli schemasUI [schema]`

**Related:** `schemas`

---

#### `sequences`

**Aliases:** `seq`, `listSeqs`, `ListSeqs`, `listseqs`, `Listseq`, `listSequences`
**Syntax:** `hana-cli sequences [schema] [sequence]`
**Tags:** sequence, metadata

**Use cases:**
- List sequences

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--sequence` (`--seq`) | string | `"*"` | sequence |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `tables`, `objects`

---

#### `synonyms`

**Aliases:** `syn`, `listSynonyms`, `listsynonyms`
**Syntax:** `hana-cli synonyms [schema] [synonym] [target]`
**Tags:** synonym, metadata

**Use cases:**
- List synonyms

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--synonym` (`--syn`, `--Synonym`) | string | `"*"` | synonym |
| `--target` (`-t`, `--Target`) | string | `"*"` | target |
| `--schema` (`-s`, `--Schema`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `tables`, `views`, `procedures`

---

#### `tableGroups`

**Aliases:** `tg`, `tablegroup`, `groups`, `groups-tables`
**Syntax:** `hana-cli tableGroups [action] [groupName]`
**Tags:** table-group, organization

**Use cases:**
- View table groups

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--action` (`-a`) | string | `'list'` | tableGroupAction |
| `--groupName` (`-g`, `--group`) | string | - | tableGroupName |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | tableGroupSchema |
| `--table` (`-t`) | string | - | tableGroupTable |
| `--type` | string | - | Table group type |
| `--subtype` | string | - | Table group subtype |
| `--matchSchema` | string | - | Match schema pattern |
| `--matchTable` | string | - | Match table pattern |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `tables`, `objects`

---

#### `tables`

**Aliases:** `t`, `listTables`, `listtables`
**Syntax:** `hana-cli tables [schema] [table]`
**Tags:** table, metadata, structure, catalog

**Use cases:**
- Find tables in schema
- Analyze table properties

**Prerequisites:** Active database connection

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`, `--Table`) | string | `"*"` | table |
| `--schema` (`-s`, `--Schema`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectTable`, `tableGroups`, `schemas`

---

#### `tablesPG`

**Aliases:** `tablespg`, `tablespostgres`, `tablesPostgres`, `tables-postgres`, `tables-postgressql`, `tablesPOSTGRES`
**Syntax:** `hana-cli tablesPG [schema] [table]`

**Related:** `tables`, `tablesSQLite`

---

#### `tablesSQLite`

**Aliases:** `tablessqlite`, `tablesqlite`, `tablesSqlite`, `tables-sqlite`, `tables-sql`, `tablesSQL`
**Syntax:** `hana-cli tablesSQLite [table]`

**Related:** `tables`, `tablesPG`

---

#### `tablesUI`

**Aliases:** `tui`, `listTablesUI`, `listtablesui`, `tablesui`
**Syntax:** `hana-cli tablesUI [schema] [table]`

**Related:** `tables`, `inspectTable`

---

#### `triggers`

**Aliases:** `trig`, `listTriggers`, `ListTrigs`, `listtrigs`, `Listtrig`, `listrig`
**Syntax:** `hana-cli triggers [schema] [trigger] [target]`
**Tags:** trigger, metadata

**Use cases:**
- List triggers on tables

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--trigger` (`-t`, `--Trigger`) | string | `"*"` | sequence |
| `--target` (`--to`, `--Target`) | string | `"*"` | target |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectTrigger`, `procedures`, `tables`

---

#### `views`

**Aliases:** `v`, `listViews`, `listviews`
**Syntax:** `hana-cli views [schema] [view]`
**Tags:** view, metadata, structure

**Use cases:**
- List views
- Analyze view definitions

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--view` (`-v`, `--View`) | string | `"*"` | view |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectView`, `tables`, `procedures`

---

### Security

User, role, privilege, and security audit management

#### `auditLog`

**Aliases:** `audit`, `auditlog`
**Syntax:** `hana-cli auditLog`
**Tags:** audit, logging, compliance

**Use cases:**
- View audit logs
- Track changes

**Related:** `systemInfo`, `securityScan`

---

#### `certificates`

**Aliases:** `cert`, `certs`
**Syntax:** `hana-cli certificates`
**Tags:** certificate, ssl, encryption

**Use cases:**
- Manage certificates
- Check SSL certificates

**Related:** `certificatesUI`, `encryptionStatus`

---

#### `certificatesUI`

**Aliases:** `certUI`, `certsUI`, `certificatesui`, `listCertificatesUI`, `listcertificatesui`
**Syntax:** `hana-cli certificatesUI`

**Related:** `certificates`

---

#### `createGroup`

**Aliases:** `cg`, `cGrp`
**Syntax:** `hana-cli createGroup [group]`
**Tags:** group, create, hdi

**Use cases:**
- Create HDI group

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--group` (`-g`) | string | - | group |

**Related:** `createXSAAdmin`, `users`, `roles`

---

#### `createXSAAdmin`

**Aliases:** `cXSAAdmin`, `cXSAA`, `cxsaadmin`, `cxsaa`
**Syntax:** `hana-cli createXSAAdmin [user] [password]`
**Tags:** xsa, admin, user

**Use cases:**
- Create XSA admin user

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | - | user |
| `--password` (`-p`) | string | - | password |

**Related:** `users`, `roles`, `createGroup`

---

#### `dropGroup`

**Aliases:** `dg`, `dropG`
**Syntax:** `hana-cli dropGroup [group]`
**Tags:** group, drop, hdi

**Use cases:**
- Drop HDI group

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--group` (`-g`) | string | - | group |

**Related:** `createGroup`, `users`, `roles`

---

#### `encryptionStatus`

**Aliases:** `encryption`, `encrypt`
**Syntax:** `hana-cli encryptionStatus`
**Tags:** encryption, security, diagnostics

**Use cases:**
- Check encryption status

**Related:** `certificates`, `healthCheck`

---

#### `inspectUser`

**Aliases:** `iu`, `user`, `insUser`, `inspectuser`
**Syntax:** `hana-cli inspectUser [user]`
**Tags:** user, inspection

**Use cases:**
- Inspect user details and privileges

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | - | user |

**Related:** `users`, `roles`, `pwdPolicy`

---

#### `pwdPolicy`

**Aliases:** `pwdpolicy`, `passpolicies`
**Syntax:** `hana-cli pwdPolicy`
**Tags:** password, policy, security

**Use cases:**
- Manage password policies

**Related:** `users`, `inspectUser`

---

#### `roles`

**Aliases:** `r`, `listRoles`, `listroles`
**Syntax:** `hana-cli roles [schema] [role]`
**Tags:** role, access-control, administration

**Use cases:**
- List database roles
- Manage role assignments

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--role` (`-r`) | string | `"*"` | role |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `users`, `inspectUser`, `grantChains`

---

#### `securityScan`

**Aliases:** `secscan`, `scan`
**Syntax:** `hana-cli securityScan`
**Tags:** security, scan, compliance

**Use cases:**
- Run security scan
- Check security settings

**Related:** `pwdPolicy`, `users`, `healthCheck`

---

#### `users`

**Aliases:** `u`, `listUsers`, `listusers`
**Syntax:** `hana-cli users [user]`
**Tags:** user, access-control, administration

**Use cases:**
- List database users
- Manage user access

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | `"*"` | user |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `roles`, `inspectUser`, `massUsers`

---

### System Administration

System health, configuration, diagnostics, and maintenance

#### `diagnose`

**Aliases:** `diag`
**Syntax:** `hana-cli diagnose`
**Tags:** diagnose, troubleshoot, issues

**Use cases:**
- Run diagnostics
- Troubleshoot problems

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--checks` (`-c`) | string | `'all'` | checks |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `healthCheck`, `systemInfo`, `status`

---

#### `healthCheck`

**Aliases:** `health`, `h`
**Syntax:** `hana-cli healthCheck`
**Tags:** health, check, diagnostics

**Use cases:**
- Perform system health check
- Verify system status

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--checks` (`-c`) | string | `'all'` | Health checks to perform (all, memory, disk, connection, transaction, backup, replication, resources) |

**Related:** `systemInfo`, `status`, `diagnose`

---

#### `status`

**Aliases:** `s`, `whoami`
**Syntax:** `hana-cli status`
**Tags:** connection, user, session, roles, diagnostic

**Use cases:**
- Check current database user and connection
- View granted roles
- Verify database connection

**Prerequisites:** Active database connection

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--priv` (`-p`, `--privileges`) | boolean | `false` | privileges |

**Related:** `systemInfo`, `healthCheck`, `connections`

---

#### `systemInfo`

**Aliases:** `sys`, `sysinfo`, `sysInfo`, `systeminfo`, `system-information`, `dbInfo`, `dbinfo`
**Syntax:** `hana-cli systemInfo`
**Tags:** system, info, diagnostics, hardware

**Use cases:**
- View system information
- Check hardware resources

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--output` (`-o`, `--Output`) | string | `"basic"` | outputType |

**Related:** `status`, `healthCheck`, `version`

---

#### `systemInfoUI`

**Aliases:** `sysUI`, `sysinfoui`, `sysInfoUI`, `systeminfoui`
**Syntax:** `hana-cli systemInfoUI`

**Related:** `systemInfo`, `healthCheck`

---

#### `workloadManagement`

**Aliases:** `wlm`, `workloads`, `workloadClass`, `workloadmgmt`
**Syntax:** `hana-cli workloadManagement [schema] [group]`
**Tags:** workload, resource, management

**Use cases:**
- Manage workload assignments

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--group` (`-g`) | string | `"*"` | workloadClass |
| `--workload` (`-w`) | string | - | workloadClass |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--priority` (`-p`) | string | - | workloadPriority |
| `--activeOnly` (`-a`) | boolean | `false` | workloadActiveOnly |
| `--showViews` (`--sv`, `--views`) | boolean | `false` | workloadShowViews |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `status`, `longRunning`, `healthCheck`

---

#### `xsaServices`

**Aliases:** `xsa`, `xsaSvc`, `xsaservices`
**Syntax:** `hana-cli xsaServices [action]`
**Tags:** xsa, service

**Use cases:**
- Manage XSA services

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--action` (`-a`, `--Action`) | string | `'list'` | action |
| `--service` (`--sv`, `--Service`) | string | - | service |
| `--details` (`-d`, `--Details`) | boolean | `false` | details |

**Related:** `systemInfo`, `status`

---

### System Tools

System diagnostics, logs, host info, and runtime utilities

#### `alerts`

**Aliases:** `a`, `alert`
**Syntax:** `hana-cli alerts`
**Tags:** alert, event, monitoring

**Use cases:**
- View system alerts
- Monitor events

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `100` | limit |
| `--severity` (`-s`) | string | `'all'` | alertSeverity |
| `--acknowledge` (`--ack`) | string | - | Acknowledge alert by ID |
| `--delete` (`--del`) | string | - | Delete alert by ID |

**Related:** `healthCheck`, `systemInfo`

---

#### `cacheStats`

**Syntax:** `hana-cli cacheStats`

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--cacheType` (`-t`) | string | `'all'` | cacheType |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `memoryAnalysis`, `systemInfo`

---

#### `crashDumps`

**Aliases:** `crash`, `cd`
**Syntax:** `hana-cli crashDumps`
**Tags:** crash, dump, diagnostics

**Use cases:**
- Check crash dumps
- Diagnose crashes

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--days` (`-d`) | number | `7` | days |
| `--type` (`-t`) | string | `null` | crashType |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `diagnose`, `healthCheck`

---

#### `dataVolumes`

**Aliases:** `dv`, `datavolumes`
**Syntax:** `hana-cli dataVolumes`
**Tags:** volume, storage, data

**Use cases:**
- Check data volumes
- Analyze storage distribution

**Related:** `disks`, `fragmentationCheck`, `reclaim`

---

#### `disks`

**Aliases:** `di`, `Disks`
**Syntax:** `hana-cli disks`
**Tags:** disk, storage, resource

**Use cases:**
- Check disk usage
- Monitor storage capacity

**Related:** `hostInformation`, `dataVolumes`, `ports`

---

#### `features`

**Aliases:** `fe`, `Features`
**Syntax:** `hana-cli features`
**Tags:** feature, capability, version

**Use cases:**
- List available features
- Check feature support

**Related:** `featuresUI`, `systemInfo`

---

#### `featuresUI`

**Aliases:** `feui`, `featuresui`, `FeaturesUI`
**Syntax:** `hana-cli featuresUI`

**Related:** `features`

---

#### `featureUsage`

**Aliases:** `fu`, `FeaturesUsage`
**Syntax:** `hana-cli featureUsage`
**Tags:** feature, usage, analytics

**Use cases:**
- Check feature usage
- Understand feature adoption

**Related:** `featureUsageUI`, `features`

---

#### `featureUsageUI`

**Aliases:** `fuui`, `featureusageui`, `FeaturesUsageUI`, `featuresusageui`
**Syntax:** `hana-cli featureUsageUI`

**Related:** `featureUsage`

---

#### `hostInformation`

**Aliases:** `hi`, `HostInformation`, `hostInfo`, `hostinfo`
**Syntax:** `hana-cli hostInformation`
**Tags:** host, hardware, system

**Use cases:**
- Get host information
- Check hardware details

**Related:** `systemInfo`, `disks`, `ports`

---

#### `iniContents`

**Aliases:** `if`, `inifiles`, `ini`
**Syntax:** `hana-cli iniContents [file] [section]`
**Tags:** configuration, ini-file

**Use cases:**
- View INI file contents

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--file` (`-f`) | string | `"*"` | file |
| `--section` (`-s`) | string | `"*"` | section |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `iniFiles`, `config`

---

#### `iniFiles`

**Aliases:** `if`, `inifiles`, `ini`
**Syntax:** `hana-cli iniFiles`
**Tags:** configuration, ini-file

**Use cases:**
- Manage INI files

**Related:** `iniContents`, `config`

---

#### `ports`

**Syntax:** `hana-cli ports`
**Tags:** port, network, connectivity

**Use cases:**
- Check open ports
- Verify network connectivity

**Related:** `hostInformation`, `disks`, `systemInfo`

---

#### `rick`

**Syntax:** `hana-cli rick`

**Related:** `version`, `healthCheck`

---

#### `spatialData`

**Aliases:** `spatial`, `geoData`, `geographic`, `geo`
**Syntax:** `hana-cli spatialData [schema] [table]`
**Tags:** spatial, geometry, gis

**Use cases:**
- Work with spatial data

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | `"*"` | spatialTable |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--column` (`-c`) | string | - | spatialColumn |
| `--bounds` (`-b`) | boolean | `false` | spatialBounds |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `tables`, `dataProfile`

---

#### `traces`

**Aliases:** `tf`, `Traces`
**Syntax:** `hana-cli traces`
**Tags:** trace, sql-trace, sql-plan-cache

**Use cases:**
- Manage system traces
- Analyze SQL execution

**Related:** `traceContents`, `healthCheck`

---

#### `version`

**Syntax:** `hana-cli version`
**Tags:** version, build, platform

**Use cases:**
- Check HANA version
- Verify platform information

**Prerequisites:** Active database connection

**Related:** `systemInfo`, `status`

---

## Multi-Step Workflows

These are pre-defined sequences of commands for common tasks.

### Validate and Profile Data

Complete data quality assessment: profile table data, then validate against rules

**Goal:** Understand data quality and identify issues
**Estimated time:** 5-10 minutes
**Tags:** data-quality, analysis, validation

| Step | Command | Description |
|------|---------|-------------|
| 1 | `hana-cli dataProfile --table <table_name> --schema <schema>` | Profile the table to understand distributions and patterns |
| 2 | `hana-cli duplicateDetection --table <table_name> --schema <schema>` | Find duplicate records in the table |
| 3 | `hana-cli dataValidator --table <table_name> --schema <schema> --rulesFile <rules.json>` | Apply validation rules to data |

### Export and Import Data

Export data from source table and import to target table

**Goal:** Transfer data between tables or systems
**Estimated time:** 10-30 minutes
**Tags:** data-operations, migration, copy

| Step | Command | Description |
|------|---------|-------------|
| 1 | `hana-cli export --table <source_table> --schema <source_schema> --filename <export.csv>` | Export data from source table to file |
| 2 | `hana-cli import --filename <export.csv> --table <target_table> --schema <target_schema>` | Import the exported file to target table |

### Compare and Clone Schema

Compare two schemas for differences, then clone one to another location

**Goal:** Replicate and synchronize schema structures
**Estimated time:** 15-45 minutes
**Tags:** schema-management, migration, comparison

| Step | Command | Description |
|------|---------|-------------|
| 1 | `hana-cli compareSchema --sourceSchema <source> --targetSchema <target>` | Compare source and target schemas |
| 2 | `hana-cli schemaClone --sourceSchema <source> --targetSchema <new_target>` | Clone schema structure to new location |

### Analyze System Performance

Comprehensive performance diagnostic: memory, expensive queries, hotspots

**Goal:** Identify performance bottlenecks and optimization opportunities
**Estimated time:** 15-30 minutes
**Tags:** performance, diagnostics, optimization

| Step | Command | Description |
|------|---------|-------------|
| 1 | `hana-cli memoryAnalysis ` | Analyze memory consumption by tables |
| 2 | `hana-cli expensiveStatements --limit 10` | Find expensive SQL statements |
| 3 | `hana-cli tableHotspots ` | Identify heavily accessed tables |

### Security Audit

Complete security check: scan for issues, analyze privileges, check encryption

**Goal:** Verify security posture and identify vulnerabilities
**Estimated time:** 20-40 minutes
**Tags:** security, compliance, audit

| Step | Command | Description |
|------|---------|-------------|
| 1 | `hana-cli securityScan ` | Run comprehensive security scan |
| 2 | `hana-cli privilegeAnalysis ` | Analyze privilege distribution |
| 3 | `hana-cli encryptionStatus ` | Check encryption status |

### Backup and Verify

Create backup and verify its status

**Goal:** Ensure reliable backup availability
**Estimated time:** 30-120 minutes
**Tags:** backup, recovery, maintenance

| Step | Command | Description |
|------|---------|-------------|
| 1 | `hana-cli backup ` | Create database backup |
| 2 | `hana-cli backupStatus ` | Monitor backup progress |
| 3 | `hana-cli backupList ` | Verify backup in catalog |

### Troubleshoot System Issues

Diagnose and investigate system problems

**Goal:** Identify root cause of issues
**Estimated time:** 10-30 minutes
**Tags:** diagnostics, troubleshooting, monitoring

| Step | Command | Description |
|------|---------|-------------|
| 1 | `hana-cli healthCheck ` | Perform system health check |
| 2 | `hana-cli diagnose ` | Run system diagnostics |
| 3 | `hana-cli alerts ` | View active system alerts |

## Common Patterns

### Explore Before Modify
1. `hana-cli tables` → find the table
2. `hana-cli inspectTable --table X --schema Y` → understand structure
3. `hana-cli dataProfile --table X --schema Y` → understand data
4. Then proceed with import/export/modify operations

### Safe Data Import
1. `hana-cli import --filename data.csv --table X --schema Y --dryRun` → preview
2. Review the dry-run output for errors
3. `hana-cli import --filename data.csv --table X --schema Y` → actual import

### Performance Investigation
1. `hana-cli healthCheck` → overview
2. `hana-cli expensiveStatements --limit 10` → find slow queries
3. `hana-cli queryPlan --query "SELECT ..."` → analyze specific query

### Schema Comparison
1. `hana-cli compareSchema --sourceSchema DEV --targetSchema PROD` → find differences
2. Review differences
3. `hana-cli schemaClone --sourceSchema DEV --targetSchema TEST` → clone if needed

### Security Review
1. `hana-cli securityScan` → comprehensive scan
2. `hana-cli privilegeAnalysis` → check privilege distribution
3. `hana-cli grantChains --user X` → trace specific user privileges

## Quick Reference — All Commands

| Command | Category | Description |
|---------|----------|-------------|
| `activateHDI` (ahdi, ah) | Hdi Management | Activate HDI deployment |
| `adminHDI` (adHDI, adhdi) | Hdi Management | Administer HDI |
| `adminHDIGroup` (adHDIG, adhdig) | Hdi Management | Manage HDI groups |
| `alerts` (a, alert) | System Tools | View system alerts |
| `auditLog` (audit, auditlog) | Security | View audit logs |
| `backup` (bkp, createBackup) | Backup Recovery | Create backup |
| `backupList` (blist, listBackups, backups) | Backup Recovery | List available backups |
| `backupStatus` (bstatus, backupstate, bkpstatus) | Backup Recovery | Check backup status |
| `blocking` (b, locks) | Performance Monitoring | Find blocking locks |
| `btpInfo` (btpinfo) | Btp Integration | Get BTP information |
| `btpInfoUI` (btpinfoUI, btpui, btpInfoui) | Btp Integration | Btp Integration |
| `cacheStats` | System Tools | System Tools |
| `calcViewAnalyzer` (cva, analyzeCalcView, calcview) | Analysis Tools | Analyze calculation views |
| `callProcedure` (cp, callprocedure, callProc, callproc, callSP, callsp) | Developer Tools | Call stored procedure |
| `cds` (cdsPreview) | Developer Tools | Work with CDS models |
| `certificates` (cert, certs) | Security | Manage certificates |
| `certificatesUI` (certUI, certsUI, certificatesui, listCertificatesUI, listcertificatesui) | Security | Security |
| `codeTemplate` (template, codegen, scaffold, boilerplate) | Developer Tools | Generate code templates |
| `columnStats` | Performance Monitoring | Analyze column statistics |
| `commandMap` | Other | Other |
| `compareData` (cmpdata, compardata, dataCompare) | Data Tools | Data Tools |
| `compareSchema` (cmpschema, schemaCompare, compareschema) | Data Tools | Compare two schemas |
| `config` (cfg) | Connection Auth | Connection Auth |
| `connect` (c, login) | Connection Auth | Configure database connection |
| `connections` (conn, c) | Connection Auth | Manage saved connections |
| `connectViaServiceKey` (key, servicekey, service-key) | Connection Auth | Connect using service key |
| `containers` (cont, listContainers, listcontainers) | Hdi Management | List HDI containers |
| `containersUI` (containersui, contUI, listContainersUI, listcontainersui) | Hdi Management | Hdi Management |
| `copy2DefaultEnv` (copyDefaultEnv, copyDefault-Env, copy2defaultenv, copydefaultenv, copydefault-env) | Connection Auth | Copy settings to default environment |
| `copy2Env` (copyEnv, copyenv, copy2env) | Connection Auth | Copy settings to environment file |
| `copy2Secrets` (secrets, make:secrets) | Connection Auth | Copy settings to secrets file |
| `crashDumps` (crash, cd) | System Tools | Check crash dumps |
| `createContainer` (cc, cCont) | Hdi Management | Create new HDI container |
| `createContainerUsers` (ccu, cContU) | Hdi Management | Hdi Management |
| `createGroup` (cg, cGrp) | Security | Create HDI group |
| `createJWT` (cJWT, cjwt, cJwt) | Connection Auth | Create JWT token |
| `createModule` (createDB, createDBModule) | Developer Tools | Developer Tools |
| `createXSAAdmin` (cXSAAdmin, cXSAA, cxsaadmin, cxsaa) | Security | Create XSA admin user |
| `dataDiff` (ddiff, diffData, dataCompare) | Data Tools | Data Tools |
| `dataLineage` (lineage, dataFlow, traceLineage) | Data Tools | Data Tools |
| `dataMask` (mask, dataprivacy, anonymize, pii) | Data Tools | Mask sensitive data |
| `dataProfile` (prof, profileData, dataStats) | Data Tools | Profile table data |
| `dataSync` (datasync, syncData, sync) | Data Tools | Synchronize data between tables |
| `dataTypes` (dt, datatypes, dataType, datatype) | Schema Tools | Schema Tools |
| `dataTypesUI` (dtui, datatypesUI, dataTypeUI, datatypeui, datatypesui) | Schema Tools | Schema Tools |
| `dataValidator` (dval, validateData, dataValidation) | Data Tools | Validate data against rules |
| `dataVolumes` (dv, datavolumes) | System Tools | Check data volumes |
| `deadlocks` (deadlock, dl) | Performance Monitoring | Find deadlock information |
| `dependencies` (deps, depend, dependency-graph, relationships) | Analysis Tools | Find object dependencies |
| `diagnose` (diag) | System Admin | Run diagnostics |
| `disks` (di, Disks) | System Tools | Check disk usage |
| `dropContainer` (dc, dropC) | Hdi Management | Drop HDI container |
| `dropGroup` (dg, dropG) | Security | Drop HDI group |
| `duplicateDetection` (dupdetect, findDuplicates, duplicates) | Data Tools | Find duplicate records |
| `encryptionStatus` (encryption, encrypt) | Security | Check encryption status |
| `erdDiagram` (erd, er, schema-diagram, entityrelation) | Analysis Tools | Generate ER diagram |
| `examples` (example) | Developer Tools | Developer Tools |
| `expensiveStatements` | Performance Monitoring | Find expensive SQL statements |
| `export` (exp, downloadData, downloaddata) | Data Tools | Extract table data to file |
| `features` (fe, Features) | System Tools | List available features |
| `featuresUI` (feui, featuresui, FeaturesUI) | System Tools | System Tools |
| `featureUsage` (fu, FeaturesUsage) | System Tools | Check feature usage |
| `featureUsageUI` (fuui, featureusageui, FeaturesUsageUI, featuresusageui) | System Tools | System Tools |
| `fragmentationCheck` (frag, fc) | Performance Monitoring | Check table fragmentation |
| `ftIndexes` (fti, ftIndex, fulltext, fulltextIndexes) | Schema Tools | Schema Tools |
| `functions` (f, listFuncs, ListFunc, listfuncs, Listfunc, listFunctions, listfunctions) | Schema Tools | List functions |
| `functionsUI` (fui, listFuncsUI, ListFuncUI, listfuncsui, Listfuncui, listFunctionsUI, listfunctionsui) | Schema Tools | Schema Tools |
| `generateDocs` (docs, gendocs, generateDocumentation) | Developer Tools | Generate documentation |
| `generateTestData` (testdata, gendata, generateData) | Developer Tools | Generate test data |
| `grantChains` (grants, grantchain) | Analysis Tools | Analyze privilege grant chains |
| `graphWorkspaces` (gws, graphs, graphWorkspace, graphws) | Analysis Tools | Explore graph workspaces |
| `hanaCloudHDIInstances` (hdiInstances, hdiinstances, hdiServices, listhdi, hdiservices, hdis) | Hana Cloud | List HANA Cloud HDI instances |
| `hanaCloudHDIInstancesUI` (hdiInstancesUI, hdiinstancesui, hdiServicesUI, listhdiui, hdiservicesui, hdisui) | Hana Cloud | Hana Cloud |
| `hanaCloudInstances` (hcInstances, instances, listHC, listhc, hcinstances) | Hana Cloud | List HANA Cloud instances |
| `hanaCloudSBSSInstances` (sbssInstances, sbssinstances, sbssServices, listsbss, sbssservices, sbsss) | Hana Cloud | List HANA Cloud SBSS instances |
| `hanaCloudSBSSInstancesUI` (sbssInstancesUI, sbssinstancesui, sbssServicesUI, listsbssui, sbssservicesui, sbsssui) | Hana Cloud | Hana Cloud |
| `hanaCloudSchemaInstances` (schemainstances, schemaServices, listschemas, schemaservices) | Hana Cloud | List HANA Cloud schema instances |
| `hanaCloudSchemaInstancesUI` (schemainstancesui, schemaServicesUI, listschemasui, schemaservicesui) | Hana Cloud | Hana Cloud |
| `hanaCloudSecureStoreInstances` (secureStoreInstances, securestoreinstances, secureStoreServices, listSecureStore, securestoreservices, securestores) | Hana Cloud | List HANA Cloud Secure Store instances |
| `hanaCloudSecureStoreInstancesUI` (secureStoreInstancesUI, secureStoreUI, securestoreinstancesui, secureStoreServicesUI, listSecureStoreUI, securestoreservicesui, securestoresui) | Hana Cloud | Hana Cloud |
| `hanaCloudStart` (hcstart, hc_start, start) | Hana Cloud | Start HANA Cloud instance |
| `hanaCloudStop` (hcstop, hc_stop, stop) | Hana Cloud | Stop HANA Cloud instance |
| `hanaCloudUPSInstances` (upsInstances, upsinstances, upServices, listups, upsservices) | Hana Cloud | List HANA Cloud UPS instances |
| `hanaCloudUPSInstancesUI` (upsInstancesUI, upsinstancesui, upServicesUI, listupsui, upsservicesui) | Hana Cloud | Hana Cloud |
| `hdbsql` | Developer Tools | Execute SQL directly |
| `healthCheck` (health, h) | System Admin | Perform system health check |
| `helpDocu` (openDocu, openDocumentation, documentation, docu) | Developer Tools | Developer Tools |
| `hostInformation` (hi, HostInformation, hostInfo, hostinfo) | System Tools | Get host information |
| `import` (imp, uploadData, uploaddata) | Data Tools | Load data from CSV/Excel |
| `importUI` (impui, importui, uploadui, uploadUI) | Data Tools | Data Tools |
| `indexes` (ind, listIndexes, ListInd, listind, Listind, listfindexes) | Schema Tools | List indexes on tables |
| `indexesUI` (indUI, listIndexesUI, ListIndUI, listindui, Listindui, listfindexesui, indexesui) | Schema Tools | Schema Tools |
| `indexTest` | Performance Monitoring | Performance Monitoring |
| `iniContents` (if, inifiles, ini) | System Tools | View INI file contents |
| `iniFiles` (if, inifiles, ini) | System Tools | Manage INI files |
| `inspectFunction` (if, function, insFunc, inspectfunction) | Object Inspection | Inspect function details |
| `inspectIndex` (ii, index, insIndex, inspectindex) | Object Inspection | Inspect index details |
| `inspectJWT` (jwt, ijwt, iJWT, iJwt) | Object Inspection | Analyze JWT token |
| `inspectLibMember` (ilm, libraryMember, librarymember, insLibMem, inspectlibrarymember) | Object Inspection | Inspect library member details |
| `inspectLibrary` (il, library, insLib, inspectlibrary) | Object Inspection | Inspect library details |
| `inspectProcedure` (ip, procedure, insProc, inspectprocedure, inspectsp) | Object Inspection | Inspect procedure details |
| `inspectTable` (it, table, insTbl, inspecttable, inspectable) | Object Inspection | Inspect table structure and properties |
| `inspectTableUI` (itui, tableUI, tableui, insTblUI, inspecttableui, inspectableui) | Object Inspection | Object Inspection |
| `inspectTrigger` (itrig, trigger, insTrig, inspecttrigger, inspectrigger) | Object Inspection | Inspect trigger details |
| `inspectUser` (iu, user, insUser, inspectuser) | Security | Inspect user details and privileges |
| `inspectView` (iv, view, insVew, inspectview) | Object Inspection | Inspect view details |
| `interactive` (i, repl, shell) | Developer Tools | Developer Tools |
| `issue` (Issue, openIssue, openissue, reportIssue, reportissue) | Developer Tools | Report issues or get help |
| `kafkaConnect` (kafka, kafkaAdapter, kafkasub) | Data Tools | Manage Kafka connections |
| `kb` | Developer Tools | Developer Tools |
| `libraries` (l, listLibs, ListLibs, listlibs, ListLib, listLibraries, listlibraries) | Schema Tools | List managed libraries |
| `longRunning` (lr, longrunning) | Performance Monitoring | Find long-running operations |
| `massConvert` (mc, massconvert, massConv, massconv) | Mass Operations | Convert data types |
| `massConvertUI` (mcui, massconvertui, massConvUI, massconvui) | Mass Operations | Mass Operations |
| `massDelete` (md, massdelete, massDel, massdel) | Mass Operations | Delete records in bulk |
| `massExport` (me, mexport, massExp, massexp) | Mass Operations | Export multiple tables at once |
| `massGrant` (mg, massgrant, massGrn, massgrn) | Mass Operations | Grant permissions in bulk |
| `massRename` (mr, massrename, massRN, massrn) | Mass Operations | Rename objects in bulk |
| `massUpdate` (mu, massupdate, massUpd, massupd) | Mass Operations | Update many records at once |
| `massUsers` (massUser, mUsers, mUser, mu) | Mass Operations | Mass Operations |
| `memoryAnalysis` | Performance Monitoring | Analyze memory consumption |
| `memoryLeaks` (memleak, ml) | Performance Monitoring | Find potential memory leaks |
| `objects` (o, listObjects, listobjects) | Schema Tools | List all database objects |
| `partitions` (parts, partition, partitioning, tablePartitions) | Schema Tools | Schema Tools |
| `ports` | System Tools | Check open ports |
| `privilegeAnalysis` (privanalysis, privanalyze) | Analysis Tools | Analyze privilege distribution |
| `privilegeError` (pe, privilegeerror, privilegerror, getInsuffficientPrivilegeErrorDetails) | Analysis Tools | Analysis Tools |
| `procedures` (p, listProcs, ListProc, listprocs, Listproc, listProcedures, listprocedures, sp) | Schema Tools | Find stored procedures |
| `pwdPolicy` (pwdpolicy, passpolicies) | Security | Manage password policies |
| `queryPlan` | Performance Monitoring | Analyze query execution plan |
| `querySimple` (qs, querysimple) | Performance Monitoring | Run simple queries |
| `querySimpleUI` (qsui, querysimpleui, queryUI, sqlUI) | Performance Monitoring | Performance Monitoring |
| `readMe` (readme) | Developer Tools | View help documentation |
| `readMeUI` (readmeui, readMeUi, readmeUI) | Developer Tools | Developer Tools |
| `reclaim` | Performance Monitoring | Reclaim unused space |
| `recommendations` (rec, recommend) | Performance Monitoring | Get system recommendations |
| `referentialCheck` (refcheck, checkReferential, fkcheck) | Analysis Tools | Check foreign key integrity |
| `replicationStatus` (replstatus, replication, replstat) | Backup Recovery | Check replication status |
| `restore` (rst, restoreBackup) | Backup Recovery | Restore from backup |
| `rick` | System Tools | System Tools |
| `roles` (r, listRoles, listroles) | Security | List database roles |
| `schemaClone` (schemaclone, cloneSchema, copyschema) | Schema Tools | Clone entire schema |
| `schemas` (sch, getSchemas, listSchemas, s) | Schema Tools | List all schemas |
| `schemasUI` (schui, getSchemasUI, listSchemasUI, schemasui, getschemasui, listschemasui) | Schema Tools | Schema Tools |
| `sdiTasks` (sditasks, sdi, smartDataIntegration) | Developer Tools | Manage SDI tasks |
| `securityScan` (secscan, scan) | Security | Run security scan |
| `sequences` (seq, listSeqs, ListSeqs, listseqs, Listseq, listSequences) | Schema Tools | List sequences |
| `spatialData` (spatial, geoData, geographic, geo) | System Tools | Work with spatial data |
| `status` (s, whoami) | System Admin | Check current database user and connection |
| `synonyms` (syn, listSynonyms, listsynonyms) | Schema Tools | List synonyms |
| `systemInfo` (sys, sysinfo, sysInfo, systeminfo, system-information, dbInfo, dbinfo) | System Admin | View system information |
| `systemInfoUI` (sysUI, sysinfoui, sysInfoUI, systeminfoui) | System Admin | System Admin |
| `tableCopy` (tablecopy, copyTable, copytable) | Mass Operations | Copy table between schemas |
| `tableGroups` (tg, tablegroup, groups, groups-tables) | Schema Tools | View table groups |
| `tableHotspots` (th, hotspots) | Performance Monitoring | Identify heavily accessed tables |
| `tables` (t, listTables, listtables) | Schema Tools | Find tables in schema |
| `tablesPG` (tablespg, tablespostgres, tablesPostgres, tables-postgres, tables-postgressql, tablesPOSTGRES) | Schema Tools | Schema Tools |
| `tablesSQLite` (tablessqlite, tablesqlite, tablesSqlite, tables-sqlite, tables-sql, tablesSQL) | Schema Tools | Schema Tools |
| `tablesUI` (tui, listTablesUI, listtablesui, tablesui) | Schema Tools | Schema Tools |
| `test` | Developer Tools | Developer Tools |
| `timeSeriesTools` (tsTools, timeseries, timeseriestools) | Developer Tools | Work with time series data |
| `traces` (tf, Traces) | System Tools | Manage system traces |
| `triggers` (trig, listTriggers, ListTrigs, listtrigs, Listtrig, listrig) | Schema Tools | List triggers on tables |
| `UI` (ui, gui, GUI, launchpad, LaunchPad, launchPad, server) | Developer Tools | Developer Tools |
| `users` (u, listUsers, listusers) | Security | List database users |
| `version` | System Tools | Check HANA version |
| `viewDocs` (docs, doc, documentation) | Developer Tools | Developer Tools |
| `views` (v, listViews, listviews) | Schema Tools | List views |
| `workloadManagement` (wlm, workloads, workloadClass, workloadmgmt) | System Admin | Manage workload assignments |
| `xsaServices` (xsa, xsaSvc, xsaservices) | System Admin | Manage XSA services |
