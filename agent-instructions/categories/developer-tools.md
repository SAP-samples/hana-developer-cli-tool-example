# Developer Tools

Developer utilities, templates, docs, and interactive helpers

| Command | Aliases | Description |
|---------|---------|-------------|
| `callProcedure` | `cp`, `callprocedure`, `callProc`, `callproc`, `callSP`, `callsp` | Call stored procedure |
| `cds` | `cdsPreview` | Work with CDS models |
| `codeTemplate` | `template`, `codegen`, `scaffold`, `boilerplate` | Generate code templates |
| `createModule` | `createDB`, `createDBModule` | - |
| `examples` | `example` | - |
| `generateDocs` | `docs`, `gendocs`, `generateDocumentation` | Generate documentation |
| `generateTestData` | `testdata`, `gendata`, `generateData` | Generate test data |
| `hdbsql` | - | Execute SQL directly |
| `helpDocu` | `openDocu`, `openDocumentation`, `documentation`, `docu` | - |
| `interactive` | `i`, `repl`, `shell` | - |
| `issue` | `Issue`, `openIssue`, `openissue`, `reportIssue`, `reportissue` | Report issues or get help |
| `kb` | - | - |
| `readMe` | `readme` | View help documentation |
| `readMeUI` | `readmeui`, `readMeUi`, `readmeUI` | - |
| `sdiTasks` | `sditasks`, `sdi`, `smartDataIntegration` | Manage SDI tasks |
| `test` | - | - |
| `timeSeriesTools` | `tsTools`, `timeseries`, `timeseriestools` | Work with time series data |
| `UI` | `ui`, `gui`, `GUI`, `launchpad`, `LaunchPad`, `launchPad`, `server` | - |
| `viewDocs` | `docs`, `doc`, `documentation` | - |

## `callProcedure`

```bash
hana-cli callProcedure [schema] [procedure]
```

**Aliases:** `cp`, `callprocedure`, `callProc`, `callproc`, `callSP`, `callsp`
**Tags:** procedure, execution, call
- Call stored procedure
- Execute procedure

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--procedure` (`-p`, `--sp`) | string | - | procedure |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--profile` (`-p`) | string | - | profile |

**Related:** `inspectProcedure`, `procedures`

---

## `cds`

```bash
hana-cli cds [schema] [table]
```

**Aliases:** `cdsPreview`
**Tags:** cds, cap, data-model
- Work with CDS models

### Parameters

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

## `codeTemplate`

**Aliases:** `template`, `codegen`, `scaffold`, `boilerplate`
**Tags:** template, code-generation
- Generate code templates

**Related:** `createModule`, `generateTestData`

---

## `createModule`

**Aliases:** `createDB`, `createDBModule`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--folder` | string | - | folder |
| `--hanaCloud` | boolean | `true` | hanaCloud |

**Related:** `generateTestData`, `codeTemplate`

---

## `examples`

```bash
hana-cli examples [command] [query...]
```

**Aliases:** `example`

**Related:** `viewDocs`, `interactive`, `kb`

---

## `generateDocs`

**Aliases:** `docs`, `gendocs`, `generateDocumentation`
**Tags:** documentation, generate, docs
- Generate documentation
- Create docs from schema

**Related:** `viewDocs`, `helpDocu`, `readMe`

---

## `generateTestData`

**Aliases:** `testdata`, `gendata`, `generateData`
**Tags:** test-data, generate, sample
- Generate test data
- Create sample records

**Related:** `codeTemplate`, `import`, `dataProfile`

---

## `hdbsql`

**Tags:** sql, query, execution
- Execute SQL directly

**Related:** `querySimple`, `callProcedure`

---

## `helpDocu`

**Aliases:** `openDocu`, `openDocumentation`, `documentation`, `docu`

**Related:** `viewDocs`, `kb`, `readMe`

---

## `interactive`

**Aliases:** `i`, `repl`, `shell`

**Related:** `helpDocu`, `examples`, `kb`

---

## `issue`

**Aliases:** `Issue`, `openIssue`, `openissue`, `reportIssue`, `reportissue`
**Tags:** issue, report, help
- Report issues or get help

**Related:** `diagnose`, `helpDocu`

---

## `kb`

```bash
hana-cli kb [query...]
```


**Related:** `viewDocs`, `helpDocu`, `examples`

---

## `readMe`

**Aliases:** `readme`
**Tags:** readme, documentation
- View help documentation

**Related:** `readMeUI`, `helpDocu`, `openReadMe`

---

## `readMeUI`

**Aliases:** `readmeui`, `readMeUi`, `readmeUI`

**Related:** `readMe`, `UI`, `openReadMe`

---

## `sdiTasks`

**Aliases:** `sditasks`, `sdi`, `smartDataIntegration`
**Tags:** sdi, task, data-provisioning
- Manage SDI tasks
- Monitor data provisioning

### Parameters

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

## `test`


**Related:** `cds`, `activateHDI`

---

## `timeSeriesTools`

```bash
hana-cli timeSeriesTools [action]
```

**Aliases:** `tsTools`, `timeseries`, `timeseriestools`
**Tags:** time-series, temporal
- Work with time series data

### Parameters

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

## `UI`

**Aliases:** `ui`, `gui`, `GUI`, `launchpad`, `LaunchPad`, `launchPad`, `server`

**Related:** `readMeUI`, `helpDocu`

---

## `viewDocs`

```bash
hana-cli viewDocs [topic]
```

**Aliases:** `docs`, `doc`, `documentation`

**Related:** `helpDocu`, `kb`, `examples`

---
