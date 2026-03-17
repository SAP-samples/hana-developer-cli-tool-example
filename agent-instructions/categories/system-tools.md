# System Tools

System diagnostics, logs, host info, and runtime utilities

| Command | Aliases | Description |
|---------|---------|-------------|
| `alerts` | `a`, `alert` | View system alerts |
| `cacheStats` | - | - |
| `crashDumps` | `crash`, `cd` | Check crash dumps |
| `dataVolumes` | `dv`, `datavolumes` | Check data volumes |
| `disks` | `di`, `Disks` | Check disk usage |
| `features` | `fe`, `Features` | List available features |
| `featuresUI` | `feui`, `featuresui`, `FeaturesUI` | - |
| `featureUsage` | `fu`, `FeaturesUsage` | Check feature usage |
| `featureUsageUI` | `fuui`, `featureusageui`, `FeaturesUsageUI`, `featuresusageui` | - |
| `hostInformation` | `hi`, `HostInformation`, `hostInfo`, `hostinfo` | Get host information |
| `iniContents` | `if`, `inifiles`, `ini` | View INI file contents |
| `iniFiles` | `if`, `inifiles`, `ini` | Manage INI files |
| `ports` | - | Check open ports |
| `rick` | - | - |
| `spatialData` | `spatial`, `geoData`, `geographic`, `geo` | Work with spatial data |
| `traces` | `tf`, `Traces` | Manage system traces |
| `version` | - | Check HANA version |

## `alerts`

**Aliases:** `a`, `alert`
**Tags:** alert, event, monitoring
- View system alerts
- Monitor events

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--limit` (`-l`) | number | `100` | limit |
| `--severity` (`-s`) | string | `'all'` | alertSeverity |
| `--acknowledge` (`--ack`) | string | - | Acknowledge alert by ID |
| `--delete` (`--del`) | string | - | Delete alert by ID |

**Related:** `healthCheck`, `systemInfo`

---

## `cacheStats`


### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--cacheType` (`-t`) | string | `'all'` | cacheType |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `memoryAnalysis`, `systemInfo`

---

## `crashDumps`

**Aliases:** `crash`, `cd`
**Tags:** crash, dump, diagnostics
- Check crash dumps
- Diagnose crashes

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--days` (`-d`) | number | `7` | days |
| `--type` (`-t`) | string | `null` | crashType |
| `--limit` (`-l`) | number | `50` | limit |

**Related:** `diagnose`, `healthCheck`

---

## `dataVolumes`

**Aliases:** `dv`, `datavolumes`
**Tags:** volume, storage, data
- Check data volumes
- Analyze storage distribution

**Related:** `disks`, `fragmentationCheck`, `reclaim`

---

## `disks`

**Aliases:** `di`, `Disks`
**Tags:** disk, storage, resource
- Check disk usage
- Monitor storage capacity

**Related:** `hostInformation`, `dataVolumes`, `ports`

---

## `features`

**Aliases:** `fe`, `Features`
**Tags:** feature, capability, version
- List available features
- Check feature support

**Related:** `featuresUI`, `systemInfo`

---

## `featuresUI`

**Aliases:** `feui`, `featuresui`, `FeaturesUI`

**Related:** `features`

---

## `featureUsage`

**Aliases:** `fu`, `FeaturesUsage`
**Tags:** feature, usage, analytics
- Check feature usage
- Understand feature adoption

**Related:** `featureUsageUI`, `features`

---

## `featureUsageUI`

**Aliases:** `fuui`, `featureusageui`, `FeaturesUsageUI`, `featuresusageui`

**Related:** `featureUsage`

---

## `hostInformation`

**Aliases:** `hi`, `HostInformation`, `hostInfo`, `hostinfo`
**Tags:** host, hardware, system
- Get host information
- Check hardware details

**Related:** `systemInfo`, `disks`, `ports`

---

## `iniContents`

```bash
hana-cli iniContents [file] [section]
```

**Aliases:** `if`, `inifiles`, `ini`
**Tags:** configuration, ini-file
- View INI file contents

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--file` (`-f`) | string | `"*"` | file |
| `--section` (`-s`) | string | `"*"` | section |
| `--limit` (`-l`) | number | `200` | limit |

**Related:** `iniFiles`, `config`

---

## `iniFiles`

**Aliases:** `if`, `inifiles`, `ini`
**Tags:** configuration, ini-file
- Manage INI files

**Related:** `iniContents`, `config`

---

## `ports`

**Tags:** port, network, connectivity
- Check open ports
- Verify network connectivity

**Related:** `hostInformation`, `disks`, `systemInfo`

---

## `rick`


**Related:** `version`, `healthCheck`

---

## `spatialData`

```bash
hana-cli spatialData [schema] [table]
```

**Aliases:** `spatial`, `geoData`, `geographic`, `geo`
**Tags:** spatial, geometry, gis
- Work with spatial data

### Parameters

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

## `traces`

**Aliases:** `tf`, `Traces`
**Tags:** trace, sql-trace, sql-plan-cache
- Manage system traces
- Analyze SQL execution

**Related:** `traceContents`, `healthCheck`

---

## `version`

**Tags:** version, build, platform
- Check HANA version
- Verify platform information
**Prerequisites:** Active database connection

**Related:** `systemInfo`, `status`

---
