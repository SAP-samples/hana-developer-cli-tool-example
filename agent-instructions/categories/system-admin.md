# System Administration

System health, configuration, diagnostics, and maintenance

| Command | Aliases | Description |
|---------|---------|-------------|
| `diagnose` | `diag` | Run diagnostics |
| `healthCheck` | `health`, `h` | Perform system health check |
| `status` | `s`, `whoami` | Check current database user and connection |
| `systemInfo` | `sys`, `sysinfo`, `sysInfo`, `systeminfo`, `system-information`, `dbInfo`, `dbinfo` | View system information |
| `systemInfoUI` | `sysUI`, `sysinfoui`, `sysInfoUI`, `systeminfoui` | - |
| `workloadManagement` | `wlm`, `workloads`, `workloadClass`, `workloadmgmt` | Manage workload assignments |
| `xsaServices` | `xsa`, `xsaSvc`, `xsaservices` | Manage XSA services |

## `diagnose`

**Aliases:** `diag`
**Tags:** diagnose, troubleshoot, issues
- Run diagnostics
- Troubleshoot problems

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--checks` (`-c`) | string | `'all'` | checks |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `healthCheck`, `systemInfo`, `status`

---

## `healthCheck`

**Aliases:** `health`, `h`
**Tags:** health, check, diagnostics
- Perform system health check
- Verify system status

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--checks` (`-c`) | string | `'all'` | Health checks to perform (all, memory, disk, connection, transaction, backup, replication, resources) |

### Examples

**System health check:** `hana-cli healthCheck `

**Related:** `systemInfo`, `status`, `diagnose`

---

## `status`

**Aliases:** `s`, `whoami`
**Tags:** connection, user, session, roles, diagnostic
- Check current database user and connection
- View granted roles
- Verify database connection
**Prerequisites:** Active database connection

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--priv` (`-p`, `--privileges`) | boolean | `false` | privileges |

### Examples

**Check connection:** `hana-cli status `
> First command to run when connecting

**Related:** `systemInfo`, `healthCheck`, `connections`

---

## `systemInfo`

**Aliases:** `sys`, `sysinfo`, `sysInfo`, `systeminfo`, `system-information`, `dbInfo`, `dbinfo`
**Tags:** system, info, diagnostics, hardware
- View system information
- Check hardware resources

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--output` (`-o`, `--Output`) | string | `"basic"` | outputType |

**Related:** `status`, `healthCheck`, `version`

---

## `systemInfoUI`

**Aliases:** `sysUI`, `sysinfoui`, `sysInfoUI`, `systeminfoui`

**Related:** `systemInfo`, `healthCheck`

---

## `workloadManagement`

```bash
hana-cli workloadManagement [schema] [group]
```

**Aliases:** `wlm`, `workloads`, `workloadClass`, `workloadmgmt`
**Tags:** workload, resource, management
- Manage workload assignments

### Parameters

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

## `xsaServices`

```bash
hana-cli xsaServices [action]
```

**Aliases:** `xsa`, `xsaSvc`, `xsaservices`
**Tags:** xsa, service
- Manage XSA services

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--action` (`-a`, `--Action`) | string | `'list'` | action |
| `--service` (`--sv`, `--Service`) | string | - | service |
| `--details` (`-d`, `--Details`) | boolean | `false` | details |

**Related:** `systemInfo`, `status`

---
