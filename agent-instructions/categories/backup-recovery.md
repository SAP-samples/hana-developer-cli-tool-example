# Backup & Recovery

Create backups, manage restores, and verify recovery readiness

| Command | Aliases | Description |
|---------|---------|-------------|
| `backup` | `bkp`, `createBackup` | Create backup |
| `backupList` | `blist`, `listBackups`, `backups` | List available backups |
| `backupStatus` | `bstatus`, `backupstate`, `bkpstatus` | Check backup status |
| `replicationStatus` | `replstatus`, `replication`, `replstat` | Check replication status |
| `restore` | `rst`, `restoreBackup` | Restore from backup |

## `backup`

```bash
hana-cli backup [target] [name]
```

**Aliases:** `bkp`, `createBackup`
**Tags:** backup, recovery
- Create backup
- Start backup process
**Prerequisites:** Active database connection, Sufficient disk space, BACKUP admin privileges

### Parameters

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

## `backupList`

```bash
hana-cli backupList [directory]
```

**Aliases:** `blist`, `listBackups`, `backups`
**Tags:** backup, list, catalog
- List available backups
- View backup history
**Prerequisites:** Active database connection

### Parameters

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

## `backupStatus`

**Aliases:** `bstatus`, `backupstate`, `bkpstatus`
**Tags:** backup, status, monitoring
- Check backup status
- Monitor backup progress
**Prerequisites:** Active database connection

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--catalogOnly` (`--co`) | boolean | `false` | backupStatusCatalogOnly |
| `--limit` (`-l`) | number | `20` | limit |
| `--backupType` (`--type`) | string | `"all"` | backupStatusType |
| `--status` (`--st`) | string | `"all"` | backupStatusState |
| `--days` | number | `7` | backupStatusDays |

**Related:** `backup`, `backupList`, `replicationStatus`

---

## `replicationStatus`

**Aliases:** `replstatus`, `replication`, `replstat`
**Tags:** replication, status, monitoring
- Check replication status
- Monitor data replication

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--type` (`--ty`) | string | `'system'` | replicationStatusType |
| `--serviceName` (`--sn`) | string | - | replicationStatusServiceName |
| `--detailed` (`-d`) | boolean | `false` | replicationStatusDetailed |
| `--watch` (`-w`) | boolean | `false` | replicationStatusWatch |
| `--profile` (`-p`) | string | - | profile |

**Related:** `backupStatus`, `backup`, `healthCheck`

---

## `restore`

```bash
hana-cli restore [backupFile]
```

**Aliases:** `rst`, `restoreBackup`
**Tags:** restore, recovery
- Restore from backup
- Recover database
**Prerequisites:** Active database connection, Backup file available, Database access privileges

### Parameters

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
