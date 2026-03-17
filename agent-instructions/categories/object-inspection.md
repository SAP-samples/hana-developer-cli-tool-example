# Object Inspection

Inspect tables, views, procedures, indexes, and related objects

| Command | Aliases | Description |
|---------|---------|-------------|
| `inspectFunction` | `if`, `function`, `insFunc`, `inspectfunction` | Inspect function details |
| `inspectIndex` | `ii`, `index`, `insIndex`, `inspectindex` | Inspect index details |
| `inspectJWT` | `jwt`, `ijwt`, `iJWT`, `iJwt` | Analyze JWT token |
| `inspectLibMember` | `ilm`, `libraryMember`, `librarymember`, `insLibMem`, `inspectlibrarymember` | Inspect library member details |
| `inspectLibrary` | `il`, `library`, `insLib`, `inspectlibrary` | Inspect library details |
| `inspectProcedure` | `ip`, `procedure`, `insProc`, `inspectprocedure`, `inspectsp` | Inspect procedure details |
| `inspectTable` | `it`, `table`, `insTbl`, `inspecttable`, `inspectable` | Inspect table structure and properties |
| `inspectTableUI` | `itui`, `tableUI`, `tableui`, `insTblUI`, `inspecttableui`, `inspectableui` | - |
| `inspectTrigger` | `itrig`, `trigger`, `insTrig`, `inspecttrigger`, `inspectrigger` | Inspect trigger details |
| `inspectView` | `iv`, `view`, `insVew`, `inspectview` | Inspect view details |

## `inspectFunction`

```bash
hana-cli inspectFunction [schema] [function]
```

**Aliases:** `if`, `function`, `insFunc`, `inspectfunction`
**Tags:** function, inspection
- Inspect function details

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--functionName` (`-f`, `--function`) | string | - | function |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `functions`, `inspectProcedure`

---

## `inspectIndex`

```bash
hana-cli inspectIndex [schema] [index]
```

**Aliases:** `ii`, `index`, `insIndex`, `inspectindex`
**Tags:** index, inspection, analysis
- Inspect index details

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--index` (`-i`) | string | - | index |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |

**Related:** `indexes`, `tables`, `tableHotspots`

---

## `inspectJWT`

**Aliases:** `jwt`, `ijwt`, `iJWT`, `iJwt`
**Tags:** jwt, token, analysis
- Analyze JWT token

**Related:** `createJWT`

---

## `inspectLibMember`

```bash
hana-cli inspectLibMember [schema] [library] [libraryMem]
```

**Aliases:** `ilm`, `libraryMember`, `librarymember`, `insLibMem`, `inspectlibrarymember`
**Tags:** library, member
- Inspect library member details

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--library` (`--lib`) | string | - | library |
| `--libraryMem` (`-m`, `--libMem`) | string | - | libMember |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `libraries`, `inspectLibrary`

---

## `inspectLibrary`

```bash
hana-cli inspectLibrary [schema] [library]
```

**Aliases:** `il`, `library`, `insLib`, `inspectlibrary`
**Tags:** library, inspection
- Inspect library details

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--library` (`--lib`) | string | - | library |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `libraries`, `inspectLibMember`

---

## `inspectProcedure`

```bash
hana-cli inspectProcedure [schema] [procedure]
```

**Aliases:** `ip`, `procedure`, `insProc`, `inspectprocedure`, `inspectsp`
**Tags:** procedure, inspection
- Inspect procedure details

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--procedure` (`-p`, `--sp`) | string | - | procedure |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `procedures`, `inspectFunction`, `callProcedure`

---

## `inspectTable`

```bash
hana-cli inspectTable [schema] [table]
```

**Aliases:** `it`, `table`, `insTbl`, `inspecttable`, `inspectable`
**Tags:** table, inspection, analysis
- Inspect table structure and properties

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--table` (`-t`) | string | - | table |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |
| `--useHanaTypes` (`--hana`) | boolean | `false` | useHanaTypes |
| `--useExists` (`--exists`, `--persistence`) | boolean | `true` | useExists |
| `--useQuoted` (`-q`, `--quoted`) | boolean | `false` | useQuoted |
| `--noColons` | boolean | `false` | noColons |

### Examples

**View table structure:** `hana-cli inspectTable --table "CUSTOMERS" --schema "SALES"`

**Related:** `tables`, `inspectView`, `columnStats`

---

## `inspectTableUI`

```bash
hana-cli inspectTableUI [schema] [table]
```

**Aliases:** `itui`, `tableUI`, `tableui`, `insTblUI`, `inspecttableui`, `inspectableui`

**Related:** `tables`, `inspectTable`

---

## `inspectTrigger`

```bash
hana-cli inspectTrigger [schema] [trigger]
```

**Aliases:** `itrig`, `trigger`, `insTrig`, `inspecttrigger`, `inspectrigger`
**Tags:** trigger, inspection
- Inspect trigger details

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--trigger` (`-t`) | string | `"*"` | sequence |
| `--schema` (`-s`) | string | `'**CURRENT_SCHEMA**'` | schema |
| `--output` (`-o`) | string | `"tbl"` | outputType |

**Related:** `triggers`, `inspectProcedure`, `tables`

---

## `inspectView`

```bash
hana-cli inspectView [schema] [view]
```

**Aliases:** `iv`, `view`, `insVew`, `inspectview`
**Tags:** view, inspection
- Inspect view details

### Parameters

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
