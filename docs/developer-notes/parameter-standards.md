# HANA-CLI Parameter Standardization Remediation Plan

**Generated:** February 16, 2026  
**Scope:** 171 commands in ./bin folder  
**Objective:** Standardize parameter naming, aliasing, and default values across all CLI commands

---

## Executive Summary

| Category | Issues | Severity |
| -------- | ------ | -------- |
| Alias Conflicts | 3 critical duplicates | 🔴 HIGH |
| Naming Inconsistency | 15+ variations | 🟡 MEDIUM |
| Default Values | 8 inconsistent patterns | 🟡 MEDIUM |
| Case Sensitivity | 12+ casing issues | 🟠 LOW-MEDIUM |

---

## Part 1: Global Standards to Adopt

### 1.1 Standard Parameter Definitions

#### Dry Run / Preview Operations

**Standard Name:** `dryRun`  
**Type:** boolean  
**Default:** false  
**Alias:** `['dr', 'preview']`  
**Description Key:** "dryRun"

**Current Issues:**

- `dryRun` used in: generateTestData.js, restore.js
- `dry` used in: massGrant.js, massUpdate.js, massDelete.js

**Affected Commands (14):**

- generateTestData.js ✓ (already correct)
- restore.js ✓ (already correct)
- massGrant.js ❌ (fix: dry → dryRun)
- massUpdate.js ❌ (fix: dry → dryRun)
- massDelete.js ❌ (fix: dry → dryRun)
- massExport.js ❌ (fix: dry → dryRun)
- massRename.js ❌ (fix: dry → dryRun)
- massConvert.js ❌ (fix: dry → dryRun)
- schemaClone.js ❌ (fix: dryRun if exists)
- tableCopy.js (add: if missing)
- dataSync.js (add: if missing)
- import.js ✓ (already dryRun)
- export.js (add: dryRun with preview alias)
- dataValidator.js (add: dryRun)

---

#### Batch Size (Data Operations)

**Standard Name:** `batchSize`  
**Type:** number  
**Default:** 1000  
**Alias:** `['b', 'batch']`  
**Description Key:** "batchSize"

**Current Issues:**

- Default 1000: import.js, restore.js, tableCopy.js, dataSync.js, backup.js
- Default 5000: some commands
- Default 10000: some commands
- Different aliases used

**Affected Commands (18):**

- import.js ✓ (1000 - correct)
- restore.js ✓ (1000 - correct)
- tableCopy.js ✓ (1000 - correct)
- dataSync.js ✓ (1000 - correct)
- backup.js (verify default)
- compareData.js (add: batchSize)
- compareSchema.js (verify default)
- duplicateDetection.js (verify default)
- dataValidator.js (verify default)
- referentialCheck.js (add: batchSize)
- massExport.js (standardize to 1000)
- massUpdate.js (add/standardize)
- massDelete.js (add if missing)
- dataMask.js (standardize)
- dataLineage.js (add: batchSize)
- dataDiff.js (add: batchSize)
- generateTestData.js (add: batchSize)
- schemaClone.js (standardize)

---

#### Timeout (Long-Running Operations)

**Standard Name:** `timeout`  
**Type:** number  
**Default:** 3600 (1 hour in seconds)  
**Alias:** `['to', 'timeoutSeconds']`  
**Description Key:** "timeout"  
**Min:** 60, **Max:** 86400

**Current Status:**

- Most compare/sync/validation commands have: 3600 ✓
- But not all at 3600

**Affected Commands (50+):**

- export.js ✓ (3600)
- import.js (verify 3600)
- compareData.js ✓ (3600)
- compareSchema.js ✓ (3600)
- dataSync.js (verify 3600)
- duplicateDetection.js ✓ (3600)
- dataValidator.js ✓ (3600)
- referentialCheck.js ✓ (3600)
- All other long-running commands (add if missing)

---

#### Schema Selection

**Standard Pattern:** Single parameter named `schema`  
**Type:** string  
**Default:** `'**CURRENT_SCHEMA**'`  
**Alias:** `['s']`  
**Description Key:** "schema"

**For Source/Target Operations:**

- `sourceSchema` / `targetSchema` pattern (mandatory pair)
- Same default: `'**CURRENT_SCHEMA**'`
- Same aliases: `['ss']` / `['ts']`

**Current Issues:**

- Inconsistent defaults (some missing)
- Inconsistent aliasing

**Affected Commands:**

- Single schema (should have default):
  - schemas.js ✓ (default: "*")
  - tables.js ✓ (default: '**CURRENT_SCHEMA**')
  - users.js (no schema)
  - procedures.js (verify default)
  - functions.js (verify default)
  - views.js (verify default)
  - triggers.js (verify default)
  - roles.js (verify default)

- Source/Target (verify both have defaults):
  - compareData.js ❌ (no defaults - ADD)
  - compareSchema.js ❌ (no defaults - ADD)
  - tableCopy.js ✓ (both have defaults)
  - dataSync.js ✓ (both have defaults)
  - schemaClone.js (verify)

---

#### Format/Output Parameters

**Standard Pattern:** Two separate parameters

**File Output:**

- **Standard Name:** `output`
- **Type:** string (file path)
- **Alias:** `['o', 'outputFile']`
- **Description Key:** "output"

**Format Selection:**

- **Standard Name:** `format`
- **Type:** string (choices)
- **Alias:** `['f']`
- **Common Choices:** "csv", "json", "excel"
- **Default:** Command-dependent (csv for data, json for structured)

**Current Issues:**

- Some commands have `output` only
- Some have `format` only
- Some have both but inconsistent naming
- Inconsistent defaults

**Affected Commands (30+):**

- export.js: ✓ Both parameters correct
- import.js: Verify format parameter
- compareData.js: ✓ Both correct
- compareSchema.js: Verify format
- dataValidator.js: ✓ Both correct
- duplicateDetection.js: ✓ Both correct
- referentialCheck.js: ✓ Both correct
- generateTestData.js: ✓ Both correct
- massExport.js: Verify both
- All other output-producing commands

---

#### Limit (Result Set Size)

**Standard Name:** `limit`  
**Type:** number  
**Default:** 1000 (for list operations) or command-specific for data operations  
**Alias:** `['l']`  
**Description Key:** "limit"

**Current Issues:**

- tables.js: default 200
- schemas.js: default 200
- compareData.js: default 1000
- duplicateDetection.js: default 10000
- dataValidator.js: default 10000

**Recommendation:** Standardize based on command category

- List commands (tables, schemas, users, etc.): 200
- Data operations (compare, validate, analyze): 10000
- Other operations: 1000

---

### 1.2 Alias Standardization

#### Primary Alias Pattern

- First letter of parameter (lowercase)
- Additional short meaningful abbreviation
- Maximum 2 aliases per parameter

**Format:**

```javascript
parameterName: {
  alias: ['p', 'abbrev'],  // NOT ['p', 'parameterName']
  // ... rest of config
}
```

#### Forbidden Alias Patterns

- ❌ Self-referential: `schema: {alias: ['s', 'schema']}`
- ❌ Case-inconsistent: `BackupFile`, `Schema` (use lowercase)
- ❌ Duplicates: Two parameters with alias `['u']`
- ❌ Redundant: `log: {alias: ['log']}`

---

## Part 2: Priority 1 - CRITICAL FIXES (Alias Conflicts)

### Issue 2.1: DUPLICATE ALIAS in connect.js

**File:** `bin/connect.js`  
**Problem:** Both `user` and `userstorekey` have alias `'u'`

**Current Code:**

```javascript
user: {
  alias: ['u'],
  desc: baseLite.bundle.getText("user")
},
userstorekey: {
  alias: ['u', 'userstorekey'],  // ❌ CONFLICT with user
  desc: baseLite.bundle.getText("userstorekey")
}
```

**Fix:**

```javascript
user: {
  alias: ['u'],  // Keep: most common usage
  desc: baseLite.bundle.getText("user")
},
userstorekey: {
  alias: ['uk', 'userstore'],  // ❌ Changed from ['u', 'userstorekey']
  desc: baseLite.bundle.getText("userstorekey")
}
```

---

### Issue 2.2: Case-Inconsistent Aliases in restore.js

**File:** `bin/restore.js`  
**Problem:** Capital letter aliases break consistency

**Current Code:**

```javascript
backupFile: {
  alias: ['bf', 'BackupFile'],  // ❌ Capital B
  // ...
},
schema: {
  alias: ['s', 'Schema'],  // ❌ Capital S
  // ...
},
batchSize: {
  alias: ['b', 'BatchSize'],  // ❌ Capital B
  // ...
},
dryRun: {
  alias: ['dr', 'DryRun'],  // ❌ Capital D
  // ...
}
```

**Fix:** Remove capital letter aliases, keep only lowercase abbreviations

```javascript
backupFile: {
  alias: ['bf', 'file'],
  // ...
},
schema: {
  alias: ['s'],
  // ...
},
batchSize: {
  alias: ['b', 'batch'],
  // ...
},
dryRun: {
  alias: ['dr', 'preview'],
  // ...
}
```

---

### Issue 2.3: Case Issues in tables.js

**File:** `bin/tables.js`  
**Problem:** Capital letter in alias `['t', 'Table']`

**Current Code:**

```javascript
table: {
  alias: ['t', 'Table'],  // ❌ Capital T
  type: 'string',
  default: "*",
  desc: baseLite.bundle.getText("table")
},
profile: {
  alias: ['p', 'Profile'],  // ❌ Capital P
  type: 'string',
  desc: baseLite.bundle.getText("profile")
}
```

**Fix:**

```javascript
table: {
  alias: ['t'],
  type: 'string',
  default: "*",
  desc: baseLite.bundle.getText("table")
},
profile: {
  alias: ['p'],
  type: 'string',
  desc: baseLite.bundle.getText("profile")
}
```

---

## Part 3: Priority 2 - HIGH IMPACT (Naming Standardization)

### Group 2.1: Batch Mass Operations

**Commands:** massGrant.js, massUpdate.js, massDelete.js, massExport.js, massRename.js, massConvert.js

**Change Required:** `dry` → `dryRun`

**Before:**

```javascript
dry: {
  alias: ['d', 'dryrun'],
  type: 'boolean',
  desc: baseLite.bundle.getText("dryRun"),
  default: false
}
```

**After:**

```javascript
dryRun: {
  alias: ['dr', 'preview'],
  type: 'boolean',
  desc: baseLite.bundle.getText("dryRun"),
  default: false
}
```

**Updates in handler (3 locations per file):**

1. In builder definition
2. In inputPrompts
3. In function parameter usage (argv.dryRun)

---

### Group 2.2: Log Parameter Standardization

**Commands:** massGrant.js, massUpdate.js, massDelete.js

**Issue:** Redundant alias `['log']` when name is already `log`

**Current:**

```javascript
log: {
  alias: ['log'],  // ❌ Redundant
  type: 'boolean',
  desc: baseLite.bundle.getText("mass.log")
}
```

**Fix:**

```javascript
log: {
  alias: ['l'],  // Changed: meaningful abbreviation
  type: 'boolean',
  desc: baseLite.bundle.getText("mass.log")
}
```

---

### Group 2.3: Schema Defaults

**Commands:** compareData.js, compareSchema.js, and similar source/target operations

**Issue:** Missing default values for schema parameters

**Current:**

```javascript
sourceSchema: {
  alias: ['ss'],
  type: 'string',
  desc: baseLite.bundle.getText("compareDataSourceSchema")
},
targetSchema: {
  alias: ['ts'],
  type: 'string',
  desc: baseLite.bundle.getText("compareDataTargetSchema")
}
```

**Fix:**

```javascript
sourceSchema: {
  alias: ['ss'],
  type: 'string',
  default: '**CURRENT_SCHEMA**',
  desc: baseLite.bundle.getText("compareDataSourceSchema")
},
targetSchema: {
  alias: ['ts'],
  type: 'string',
  default: '**CURRENT_SCHEMA**',
  desc: baseLite.bundle.getText("compareDataTargetSchema")
}
```

---

### Group 2.4: Format Default Standardization

**Commands:** export.js, dataValidator.js, duplicateDetection.js, referentialCheck.js

**Issue:** Inconsistent format defaults

**Current:**

```javascript
// export.js
format: {
  default: "csv",  // ✓
  // ...
},

// dataValidator.js
format: {
  default: "summary",  // ❌ Should be "csv" or standardized
  // ...
},

// duplicateDetection.js
format: {
  default: "summary",  // ❌
  // ...
}
```

**Fix - Establish Standard Defaults:**

- **Data export commands (export.js):** default: "csv"
- **Report/summary commands (dataValidator.js, duplicateDetection.js):** default: "json" (structured output)
- **Comparison commands (compareSchema.js):** default: "json"

**Example Fix for dataValidator.js:**

```javascript
format: {
  alias: ['f'],
  choices: ["json", "csv", "summary", "detailed"],
  default: "json",  // Changed from "summary"
  type: 'string',
  desc: baseLite.bundle.getText("dataValidatorFormat")
}
```

---

## Part 4: Priority 3 - MEDIUM IMPACT (Missing Standard Parameters)

### Group 3.1: Add dryRun to Commands Missing It

**Commands needing addition (12):**

- export.js
- import.js ✓ (has it)
- compareData.js
- compareSchema.js
- dataSync.js
- tableCopy.js
- schemaClone.js
- generateTestData.js
- dataValidator.js
- duplicateDetection.js
- referentialCheck.js
- dataMask.js

**Template to Add:**

```javascript
// In builder:
dryRun: {
  alias: ['dr', 'preview'],
  type: 'boolean',
  default: false,
  desc: baseLite.bundle.getText("dryRun")
},

// In inputPrompts:
dryRun: {
  description: baseLite.bundle.getText("dryRun"),
  type: 'boolean',
  required: false,
  ask: () => false
}
```

---

### Group 3.2: Ensure Timeout on All Long-Running Commands

**Commands needing verification/addition (40+):**

Check and standardize to `timeout: 3600` (one hour default) in:

- All export/import commands
- All compare/sync commands
- All data manipulation commands
- All validation commands
- All batch operations

**Template:**

```javascript
timeout: {
  alias: ['to', 'timeoutSeconds'],
  type: 'number',
  default: 3600,
  desc: baseLite.bundle.getText("timeout")
}
```

---

### Group 3.3: Add Profile Parameter to Data Commands

**Why:** Multi-database support (PostgreSQL, SQLite)

**Commands needing addition (8-10):**

- backup.js
- restore.js
- import.js
- export.js
- dataValidator.js (has it ✓)
- tableCopy.js (has it ✓)

**Template:**

```javascript
profile: {
  alias: ['p', 'db'],
  type: 'string',
  desc: baseLite.bundle.getText("profile")
}
```

---

## Part 5: Low Priority - Code Quality (Case Standardization)

### Group 5.1: Remove Self-Referential Aliases

**Pattern to eliminate:**

```javascript
// ❌ BAD
schema: {
  alias: ['s', 'schema'],  // 'schema' is redundant
  // ...
}

// ✓ GOOD
schema: {
  alias: ['s'],
  // ...
}
```

**Affected:**

- massGrant.js: `schema: {alias: ['s', 'schema']}`
- massGrant.js: `object: {alias: ['o', 'object']}`
- massGrant.js: `privilege: {alias: ['p', 'privilege']}`
- massGrant.js: `grantee: {alias: ['g', 'grantee']}`
- massUpdate.js: similar patterns
- massDelete.js: similar patterns

---

## Part 6: Implementation Roadmap

### Phase 1: Critical Fixes (Session 1)

**Timeline:** 1-2 hours  
**Files:** 3  
**Commands affected:** 3

1. ✅ connect.js - Fix userstorekey alias
2. ✅ restore.js - Remove capital aliases
3. ✅ tables.js - Remove capital aliases

### Phase 2: High Impact Standardization (Session 2)

**Timeline:** 2-3 hours  
**Files:** 15  
**Commands affected:** 20+

1. ✅ Convert all `dry` → `dryRun` (6 commands)
2. ✅ Remove redundant log aliases (3 commands)
3. ✅ Add schema defaults to comparison commands (4 commands)
4. ✅ Standardize format defaults (4 commands)

### Phase 3: Medium Impact Additions (Session 3)

**Timeline:** 3-4 hours  
**Files:** 20+  
**Commands affected:** 40+

1. ✅ Add dryRun to commands missing it (12 commands)
2. ✅ Add timeout to commands missing it (30+ commands)
3. ✅ Add profile to data commands (10 commands)

### Phase 4: Code Quality Polish (Session 4)

**Timeline:** 1-2 hours  
**Files:** 8+  
**Commands affected:** 15+

1. ✅ Remove self-referential aliases (8 commands)
2. ✅ Standardize remaining naming patterns

---

## Part 7: Testing Checklist

After each phase, verify:

- [ ] Command-line help shows correct parameters
- [ ] Aliases work correctly: `hana-cli <cmd> --param` and `hana-cli <cmd> -alias`
- [ ] Default values apply when parameter omitted
- [ ] No alias conflicts in help output
- [ ] Prompt handling accepts new parameter names
- [ ] Documentation reflects new names

**Test Commands:**

```bash
# Test alias
hana-cli command --dryRun
hana-cli command --dr
hana-cli command -dr

# Test defaults
hana-cli command [required-param]  # Should use defaults for optional

# Test help
hana-cli help command | grep -E "alias|default"
```

---

## Part 8: Documentation Updates

After implementation, update:

1. **Help text** in `_i18n/messages.properties`
   - Ensure parameter descriptions are clear
   - Verify alias explanations

2. **README.md**
   - Add parameter standardization guide
   - Document standard parameter meanings

3. **Command-specific docs** (if they exist)
   - Update with new parameter names

4. **Type definitions** (TypeScript if used)
   - Update interfaces for standardized parameters

---

## Appendix A: Quick Reference - Standard Parameters

| Parameter | Type | Default | Aliases | Notes |
| --------- | ---- | ------- | ------- | ----- |
| `dryRun` | bool | false | `dr`, `preview` | STANDARD - use everywhere |
| `batchSize` | num | 1000 | `b`, `batch` | Data operations only |
| `timeout` | num | 3600 | `to`, `timeoutSeconds` | Long-running commands |
| `schema` | str | `**CURRENT_SCHEMA**` | `s` | Single schema context |
| `sourceSchema` | str | `**CURRENT_SCHEMA**` | `ss` | With targetSchema pair |
| `targetSchema` | str | `**CURRENT_SCHEMA**` | `ts` | With sourceSchema pair |
| `output` | str | none | `o`, `outputFile` | File path/name |
| `format` | str | "csv" or "json" | `f` | Output format selection |
| `limit` | num | 1000 | `l` | Result set limit |
| `profile` | str | none | `p`, `db` | Database profile |
| `log` | bool | false | `l` | Logging enabled |

---

## Appendix B: Commands by Standardization Status

### ✅ Already Compliant (20+)

- generateTestData.js
- import.js
- export.js
- compareData.js
- compareSchema.js
- dataValidator.js
- duplicateDetection.js
- referentialCheck.js
- [others with correct patterns]

### 🔴 Critical Issues (3)

- connect.js
- restore.js
- tables.js

### 🟡 High Priority (15)

- massGrant.js
- massUpdate.js
- massDelete.js
- massExport.js
- massRename.js
- massConvert.js
- dataSync.js
- schemaClone.js
- [others missing standard params]

### 🟠 Medium Priority (20)

- All list commands (schemas, users, roles, etc.)
- All backup/restore related
- All data operation commands without dryRun

---

## Appendix C: Command Group Reference

### Data Manipulation (9)

export, import, compareData, compareSchema, dataSync, tableCopy, dataMask, dataLineage, dataDiff

### Batch Operations (6)

massGrant, massUpdate, massDelete, massExport, massRename, massConvert

### Validation & Analysis (5)

dataValidator, duplicateDetection, referentialCheck, generateTestData, [others]

### Backup & Restore (4)

backup, restore, backupList, backupStatus

### List/Inspect (20+)

tables, schemas, users, views, procedures, functions, roles, sequences, synonyms, triggers, indexes, [others]

### Infrastructure (10+)

status, healthCheck, systemInfo, containers, hanaCloudInstances, [others]

---
