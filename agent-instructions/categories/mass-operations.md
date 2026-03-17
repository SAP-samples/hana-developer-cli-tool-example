# Mass Operations

Bulk operations for grants, updates, deletions, and conversions

| Command | Aliases | Description |
|---------|---------|-------------|
| `massConvert` | `mc`, `massconvert`, `massConv`, `massconv` | Convert data types |
| `massConvertUI` | `mcui`, `massconvertui`, `massConvUI`, `massconvui` | - |
| `massDelete` | `md`, `massdelete`, `massDel`, `massdel` | Delete records in bulk |
| `massExport` | `me`, `mexport`, `massExp`, `massexp` | Export multiple tables at once |
| `massGrant` | `mg`, `massgrant`, `massGrn`, `massgrn` | Grant permissions in bulk |
| `massRename` | `mr`, `massrename`, `massRN`, `massrn` | Rename objects in bulk |
| `massUpdate` | `mu`, `massupdate`, `massUpd`, `massupd` | Update many records at once |
| `massUsers` | `massUser`, `mUsers`, `mUser`, `mu` | - |
| `tableCopy` | `tablecopy`, `copyTable`, `copytable` | Copy table between schemas |

## `massConvert`

```bash
hana-cli massConvert [schema] [table] [view]
```

**Aliases:** `mc`, `massconvert`, `massConv`, `massconv`
**Tags:** convert, bulk-operation, data-type
- Convert data types
- Bulk data conversion

**Related:** `massUpdate`, `massRename`

---

## `massConvertUI`

```bash
hana-cli massConvertUI [schema] [table]
```

**Aliases:** `mcui`, `massconvertui`, `massConvUI`, `massconvui`

**Related:** `massConvert`

---

## `massDelete`

```bash
hana-cli massDelete [schema] [object]
```

**Aliases:** `md`, `massdelete`, `massDel`, `massdel`
**Tags:** delete, bulk-operation, purge
- Delete records in bulk
- Purge old data

### Parameters

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

## `massExport`

```bash
hana-cli massExport [schema] [object]
```

**Aliases:** `me`, `mexport`, `massExp`, `massexp`
**Tags:** export, bulk-operation, extract
- Export multiple tables at once

### Parameters

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

## `massGrant`

```bash
hana-cli massGrant [schema] [object]
```

**Aliases:** `mg`, `massgrant`, `massGrn`, `massgrn`
**Tags:** grant, permission, bulk-operation
- Grant permissions in bulk
- Bulk privilege assignment

### Parameters

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

## `massRename`

**Aliases:** `mr`, `massrename`, `massRN`, `massrn`
**Tags:** rename, bulk-operation
- Rename objects in bulk

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--schema` (`-s`) | string | - | schemaCDS |
| `--namespace` (`-n`) | string | - | namespace |
| `--prefix` (`-p`) | string | - | prefix |
| `--case` (`-c`) | string | - | case |

**Related:** `massConvert`, `massUpdate`

---

## `massUpdate`

```bash
hana-cli massUpdate [schema] [object]
```

**Aliases:** `mu`, `massupdate`, `massUpd`, `massupd`
**Tags:** update, bulk-operation
- Update many records at once

### Parameters

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

## `massUsers`

```bash
hana-cli massUsers [user] [password]
```

**Aliases:** `massUser`, `mUsers`, `mUser`, `mu`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--user` (`-u`) | string | - | user |
| `--password` (`-p`) | string | - | password |

**Related:** `users`, `roles`, `massGrant`

---

## `tableCopy`

**Aliases:** `tablecopy`, `copyTable`, `copytable`
**Tags:** copy, transfer, data-movement
- Copy table between schemas
- Copy table to another system
**Prerequisites:** Active database connection, Source table exists, Target schema accessible

### Parameters

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

### Examples

**Copy table with data:** `hana-cli tableCopy --sourceTable "CUSTOMERS" --sourceSchema "PROD" --targetTable "CUSTOMERS_BACKUP" --targetSchema "BACKUP"`

**Related:** `export`, `import`, `tables`

---
