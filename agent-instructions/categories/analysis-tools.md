# Analysis Tools

Analyze dependencies, privileges, calculations, and relationships

| Command | Aliases | Description |
|---------|---------|-------------|
| `calcViewAnalyzer` | `cva`, `analyzeCalcView`, `calcview` | Analyze calculation views |
| `dependencies` | `deps`, `depend`, `dependency-graph`, `relationships` | Find object dependencies |
| `erdDiagram` | `erd`, `er`, `schema-diagram`, `entityrelation` | Generate ER diagram |
| `grantChains` | `grants`, `grantchain` | Analyze privilege grant chains |
| `graphWorkspaces` | `gws`, `graphs`, `graphWorkspace`, `graphws` | Explore graph workspaces |
| `privilegeAnalysis` | `privanalysis`, `privanalyze` | Analyze privilege distribution |
| `privilegeError` | `pe`, `privilegeerror`, `privilegerror`, `getInsuffficientPrivilegeErrorDetails` | - |
| `referentialCheck` | `refcheck`, `checkReferential`, `fkcheck` | Check foreign key integrity |

## `calcViewAnalyzer`

```bash
hana-cli calcViewAnalyzer [schema] [view]
```

**Aliases:** `cva`, `analyzeCalcView`, `calcview`
**Tags:** calc-view, analysis
- Analyze calculation views

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--view` (`-v`) | string | `"*"` | view |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--metrics` (`-m`) | boolean | `false` | metrics |
| `--limit` (`-l`) | number | `100` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `views`, `erdDiagram`

---

## `dependencies`

**Aliases:** `deps`, `depend`, `dependency-graph`, `relationships`
**Tags:** dependency, metadata, analysis
- Find object dependencies
- Understand impact of drops

**Related:** `objects`, `views`, `procedures`

---

## `erdDiagram`

**Aliases:** `erd`, `er`, `schema-diagram`, `entityrelation`
**Tags:** diagram, entity-relationship, visualization
- Generate ER diagram
- Visualize schema structure

**Related:** `calcViewAnalyzer`, `schemaClone`, `graphWorkspaces`

---

## `grantChains`

**Aliases:** `grants`, `grantchain`
**Tags:** grant, privilege, chain
- Analyze privilege grant chains

**Related:** `privilegeAnalysis`, `privilegeError`, `roles`

---

## `graphWorkspaces`

```bash
hana-cli graphWorkspaces [schema] [workspace]
```

**Aliases:** `gws`, `graphs`, `graphWorkspace`, `graphws`
**Tags:** graph, visualization
- Explore graph workspaces

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--workspace` (`-w`) | string | `"*"` | graphWorkspaceName |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--limit` (`-l`) | number | `200` | limit |
| `--profile` (`-p`) | string | - | profile |

**Related:** `erdDiagram`, `objects`

---

## `privilegeAnalysis`

**Aliases:** `privanalysis`, `privanalyze`
**Tags:** privilege, security, analysis
- Analyze privilege distribution
- Find over-privileged users

**Related:** `roles`, `users`, `grantChains`

---

## `privilegeError`

```bash
hana-cli privilegeError [guid]
```

**Aliases:** `pe`, `privilegeerror`, `privilegerror`, `getInsuffficientPrivilegeErrorDetails`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--guid` (`-g`, `--error`) | string | - | errorGuid |

**Related:** `grantChains`, `privilegeAnalysis`

---

## `referentialCheck`

**Aliases:** `refcheck`, `checkReferential`, `fkcheck`
**Tags:** referential-integrity, foreign-keys, validation
- Check foreign key integrity
- Find orphaned records
**Prerequisites:** Active database connection, Foreign key constraints defined

### Parameters

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
