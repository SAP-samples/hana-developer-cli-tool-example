# Schema Tools

Explore schemas, tables, views, and database object metadata

| Command | Aliases | Description |
|---------|---------|-------------|
| `dataTypes` | `dt`, `datatypes`, `dataType`, `datatype` | - |
| `dataTypesUI` | `dtui`, `datatypesUI`, `dataTypeUI`, `datatypeui`, `datatypesui` | - |
| `ftIndexes` | `fti`, `ftIndex`, `fulltext`, `fulltextIndexes` | - |
| `functions` | `f`, `listFuncs`, `ListFunc`, `listfuncs`, `Listfunc`, `listFunctions`, `listfunctions` | List functions |
| `functionsUI` | `fui`, `listFuncsUI`, `ListFuncUI`, `listfuncsui`, `Listfuncui`, `listFunctionsUI`, `listfunctionsui` | - |
| `indexes` | `ind`, `listIndexes`, `ListInd`, `listind`, `Listind`, `listfindexes` | List indexes on tables |
| `indexesUI` | `indUI`, `listIndexesUI`, `ListIndUI`, `listindui`, `Listindui`, `listfindexesui`, `indexesui` | - |
| `libraries` | `l`, `listLibs`, `ListLibs`, `listlibs`, `ListLib`, `listLibraries`, `listlibraries` | List managed libraries |
| `objects` | `o`, `listObjects`, `listobjects` | List all database objects |
| `partitions` | `parts`, `partition`, `partitioning`, `tablePartitions` | - |
| `procedures` | `p`, `listProcs`, `ListProc`, `listprocs`, `Listproc`, `listProcedures`, `listprocedures`, `sp` | Find stored procedures |
| `schemaClone` | `schemaclone`, `cloneSchema`, `copyschema` | Clone entire schema |
| `schemas` | `sch`, `getSchemas`, `listSchemas`, `s` | List all schemas |
| `schemasUI` | `schui`, `getSchemasUI`, `listSchemasUI`, `schemasui`, `getschemasui`, `listschemasui` | - |
| `sequences` | `seq`, `listSeqs`, `ListSeqs`, `listseqs`, `Listseq`, `listSequences` | List sequences |
| `synonyms` | `syn`, `listSynonyms`, `listsynonyms` | List synonyms |
| `tableGroups` | `tg`, `tablegroup`, `groups`, `groups-tables` | View table groups |
| `tables` | `t`, `listTables`, `listtables` | Find tables in schema |
| `tablesPG` | `tablespg`, `tablespostgres`, `tablesPostgres`, `tables-postgres`, `tables-postgressql`, `tablesPOSTGRES` | - |
| `tablesSQLite` | `tablessqlite`, `tablesqlite`, `tablesSqlite`, `tables-sqlite`, `tables-sql`, `tablesSQL` | - |
| `tablesUI` | `tui`, `listTablesUI`, `listtablesui`, `tablesui` | - |
| `triggers` | `trig`, `listTriggers`, `ListTrigs`, `listtrigs`, `Listtrig`, `listrig` | List triggers on tables |
| `views` | `v`, `listViews`, `listviews` | List views |

## `dataTypes`

**Aliases:** `dt`, `datatypes`, `dataType`, `datatype`

**Related:** `dataTypesUI`, `tables`

---

## `dataTypesUI`

**Aliases:** `dtui`, `datatypesUI`, `dataTypeUI`, `datatypeui`, `datatypesui`

**Related:** `dataTypes`

---

## `ftIndexes`

```bash
hana-cli ftIndexes [schema] [index]
```

**Aliases:** `fti`, `ftIndex`, `fulltext`, `fulltextIndexes`

### Parameters

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

## `functions`

```bash
hana-cli functions [schema] [function]
```

**Aliases:** `f`, `listFuncs`, `ListFunc`, `listfuncs`, `Listfunc`, `listFunctions`, `listfunctions`
**Tags:** function, metadata, sql
- List functions
- Analyze function definitions

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--functionName` (`-f`, `--function`) | string | `"*"` | function |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectFunction`, `procedures`, `objects`

---

## `functionsUI`

```bash
hana-cli functionsUI [schema] [function]
```

**Aliases:** `fui`, `listFuncsUI`, `ListFuncUI`, `listfuncsui`, `Listfuncui`, `listFunctionsUI`, `listfunctionsui`

**Related:** `functions`

---

## `indexes`

```bash
hana-cli indexes [schema] [indexes]
```

**Aliases:** `ind`, `listIndexes`, `ListInd`, `listind`, `Listind`, `listfindexes`
**Tags:** index, metadata, performance
- List indexes on tables
- Analyze index definitions

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--indexes` (`-i`) | string | `"*"` | function |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectIndex`, `tables`, `tableHotspots`

---

## `indexesUI`

```bash
hana-cli indexesUI [schema] [indexes]
```

**Aliases:** `indUI`, `listIndexesUI`, `ListIndUI`, `listindui`, `Listindui`, `listfindexesui`, `indexesui`

**Related:** `indexes`

---

## `libraries`

```bash
hana-cli libraries [schema] [library]
```

**Aliases:** `l`, `listLibs`, `ListLibs`, `listlibs`, `ListLib`, `listLibraries`, `listlibraries`
**Tags:** library, managed-library
- List managed libraries

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--library` (`--lib`) | string | `"*"` | library |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectLibrary`, `inspectLibMember`

---

## `objects`

```bash
hana-cli objects [schema] [object]
```

**Aliases:** `o`, `listObjects`, `listobjects`
**Tags:** object, metadata, catalog
- List all database objects
- Search by object type

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--object` (`-o`) | string | `"*"` | object |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `schemas`, `tables`, `views`

---

## `partitions`

```bash
hana-cli partitions [schema] [table]
```

**Aliases:** `parts`, `partition`, `partitioning`, `tablePartitions`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | `"*"` | partitionTable |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--type` (`--pt`) | string | - | partitionType |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `tables`, `inspectTable`, `tableHotspots`

---

## `procedures`

```bash
hana-cli procedures [schema] [procedure]
```

**Aliases:** `p`, `listProcs`, `ListProc`, `listprocs`, `Listproc`, `listProcedures`, `listprocedures`, `sp`
**Tags:** procedure, metadata, sql
- Find stored procedures
- Analyze procedure definitions

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--procedure` (`-p`, `--Procedure`) | string | `"*"` | procedure |
| `--schema` (`-s`, `--Schema`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectProcedure`, `functions`, `views`

---

## `schemaClone`

**Aliases:** `schemaclone`, `cloneSchema`, `copyschema`
**Tags:** clone, copy-schema, replication
- Clone entire schema
- Duplicate schema structure
**Prerequisites:** Active database connection, Source schema exists, SCHEMA admin privileges

### Parameters

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

### Examples

**Clone schema structure:** `hana-cli schemaClone --sourceSchema "PROD_SCHEMA" --targetSchema "TEST_SCHEMA"`
> Clones tables, views, stored procedures, but not data

**Related:** `schemas`, `tables`, `export`

---

## `schemas`

```bash
hana-cli schemas [schema]
```

**Aliases:** `sch`, `getSchemas`, `listSchemas`, `s`
**Tags:** schema, metadata, structure
- List all schemas
- Discover database structure
**Prerequisites:** Active database connection

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`) | string | `"*"` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--all` (`--al`, `--allSchemas`) | boolean | `false` | allSchemas |

**Related:** `objects`, `schemaClone`, `tables`

---

## `schemasUI`

```bash
hana-cli schemasUI [schema]
```

**Aliases:** `schui`, `getSchemasUI`, `listSchemasUI`, `schemasui`, `getschemasui`, `listschemasui`

**Related:** `schemas`

---

## `sequences`

```bash
hana-cli sequences [schema] [sequence]
```

**Aliases:** `seq`, `listSeqs`, `ListSeqs`, `listseqs`, `Listseq`, `listSequences`
**Tags:** sequence, metadata
- List sequences

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--sequence` (`--seq`) | string | `"*"` | sequence |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `tables`, `objects`

---

## `synonyms`

```bash
hana-cli synonyms [schema] [synonym] [target]
```

**Aliases:** `syn`, `listSynonyms`, `listsynonyms`
**Tags:** synonym, metadata
- List synonyms

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--synonym` (`--syn`, `--Synonym`) | string | `"*"` | synonym |
| `--target` (`-t`, `--Target`) | string | `"*"` | target |
| `--schema` (`-s`, `--Schema`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `tables`, `views`, `procedures`

---

## `tableGroups`

```bash
hana-cli tableGroups [action] [groupName]
```

**Aliases:** `tg`, `tablegroup`, `groups`, `groups-tables`
**Tags:** table-group, organization
- View table groups

### Parameters

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

## `tables`

```bash
hana-cli tables [schema] [table]
```

**Aliases:** `t`, `listTables`, `listtables`
**Tags:** table, metadata, structure, catalog
- Find tables in schema
- Analyze table properties
**Prerequisites:** Active database connection

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`, `--Table`) | string | `"*"` | table |
| `--schema` (`-s`, `--Schema`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

### Examples

**List all tables in schema:** `hana-cli tables --schema "MY_SCHEMA"`

**Search for tables by pattern:** `hana-cli tables --schema "MY_SCHEMA" --table "SALES%"`
> Use % as wildcard, similar to SQL LIKE

**Related:** `inspectTable`, `tableGroups`, `schemas`

---

## `tablesPG`

```bash
hana-cli tablesPG [schema] [table]
```

**Aliases:** `tablespg`, `tablespostgres`, `tablesPostgres`, `tables-postgres`, `tables-postgressql`, `tablesPOSTGRES`

**Related:** `tables`, `tablesSQLite`

---

## `tablesSQLite`

```bash
hana-cli tablesSQLite [table]
```

**Aliases:** `tablessqlite`, `tablesqlite`, `tablesSqlite`, `tables-sqlite`, `tables-sql`, `tablesSQL`

**Related:** `tables`, `tablesPG`

---

## `tablesUI`

```bash
hana-cli tablesUI [schema] [table]
```

**Aliases:** `tui`, `listTablesUI`, `listtablesui`, `tablesui`

**Related:** `tables`, `inspectTable`

---

## `triggers`

```bash
hana-cli triggers [schema] [trigger] [target]
```

**Aliases:** `trig`, `listTriggers`, `ListTrigs`, `listtrigs`, `Listtrig`, `listrig`
**Tags:** trigger, metadata
- List triggers on tables

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--trigger` (`-t`, `--Trigger`) | string | `"*"` | sequence |
| `--target` (`--to`, `--Target`) | string | `"*"` | target |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectTrigger`, `procedures`, `tables`

---

## `views`

```bash
hana-cli views [schema] [view]
```

**Aliases:** `v`, `listViews`, `listviews`
**Tags:** view, metadata, structure
- List views
- Analyze view definitions

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--view` (`-v`, `--View`) | string | `"*"` | view |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectView`, `tables`, `procedures`

---
