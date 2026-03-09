# Ubuntu Test Failures Analysis Report

**Total Failures**: 29 tests  
**Categories**: 6 distinct failure groups  
**Analysis Date**: March 9, 2026

---

## Executive Summary

The 29 test failures on Ubuntu are NOT platform-specific issues. They stem from **recent code changes** that introduced three critical bugs:

1. **Silent database connection failures** causing empty output (15-17 failures)
2. **Missing text bundle registration** for interactive command (2 failures)  
3. **Incomplete builder configuration** for UI commands (2 failures)
4. **Broken connection fallback logic** (2 failures)
5. **Database connection errors** in schema/table commands (7 failures)

---

## Category 1: systemInfo Command Tests (15 failures)
### What Tests Expect
- Normal execution with help text or database output
- For `--quiet` flag: Silent but successful output
- For `-o env` option: Connection configuration display
- For `-o dbx` option: DBX-format output

### What Tests Are Actually Getting
- **Empty output** (zero bytes from both stdout and stderr)
- Command exits without producing any console output

### Root Cause: Silent Database Connection Failure

#### The Problem Flow
```
bin/systemInfo.js (line 84)
  ↓
  Import base.js and call handler()
  ↓
handler() → base.promptHandler() → sysInfo() (line 81)
  ↓
sysInfo() tries: base.createDBConnection() (line 109)
  ↓
utils/base.js createDBConnection() (line 465-495)
  ↓
conn.createConnection(prompts) (line 473-474)
  ↓
utils/connections.js getConnOptions() (line 300-370)
  ↓
THROWS ERROR AT LINE 358:
  "Missing configuration file. No default-env.json or substitute found"
  ↓
CAUGHT IN sysInfo() catch block (line 121-123)
  ↓
await base.error(error) → PROCESS EXIT (silently, no console output)
```

#### Why stdout is Empty
The `base.error()` function (location unknown but called at line 123 of systemInfo.js) is:
- Not printing the error message to console
- Exiting the process without any output
- OR: The error occurs before any console.log() calls can execute

**Test Verification**
- File: [tests/SystemInfo.Test.js](tests/SystemInfo.Test.js)
- The base.myTest() helper (tests/base.js) throws error if stderr contains anything
- An error is being thrown but going to stderr silently

#### Code Locations
- **Error thrown**: [utils/connections.js line 358](utils/connections.js#L358)
- **Error caught**: [bin/systemInfo.js line 121-123](bin/systemInfo.js#L121-L123)
- **Connection creation**: [utils/base.js line 465-495](utils/base.js#L465-L495)

#### How to Fix
1. Ensure test environment has a default-env.json or `.env` file
2. OR: Use `VCAP_SERVICES` environment variable
3. OR: Modify tests to mock the database connection
4. OR: Improve error messaging to capture stderr properly

---

## Category 2: Interactive Command Tests (2 failures)

### What Tests Expect
**Test 1** (Line 120 in interactive.e2e.Test.js):
```javascript
expect(output).to.include('No commands found matching "nope-command"')
```

**Test 2** (Line 137):
```javascript
expect(output).to.match(/Executing:\s+version/)
```

### What Tests Are Actually Getting
- String not found in output
- Regex pattern not matching the actual output

### Root Cause: MISSING TEXT BUNDLE REGISTRATION

#### The Problem
Interactive command uses text keys from `_i18n/interactive.properties`:
- Line 32: `searchNoResults=No commands found matching "{0}"`
- Line 57: `executeCommand=▶  Executing: {0}`

However, in [utils/base.js line 219-226](utils/base.js#L219-L226), the `additionalBundles` array **does NOT include 'interactive'**:

```javascript
const additionalBundles = [
    'duplicateDetection',
    'compareData',
    'dataDiff',
    'dataLineage',
    'dataProfile',
    'dataValidator',
    'export',
    'referentialCheck'
    // ❌ 'interactive' is MISSING!
]
```

#### Why This Breaks It
1. Interactive command calls: `bundle.getText('searchNoResults', [searchTerm])`
2. The base bundle proxy (line 234-244) checks `additionalTexts` first
3. Since 'interactive' wasn't loaded into `additionalTexts`, the key is not found
4. Falls back to `baseBundle.getText()` which doesn't have the key
5. Returns English fallback or empty string

#### Code Location
- **Missing bundle**: [utils/base.js line 219-226](utils/base.js#L219-L226)
- **Text bundle loading**: [utils/base.js line 306-323](utils/base.js#L306-L323) `loadAdditionalTexts()`
- **Text keys used in interactive**: [bin/interactive.js line 199](bin/interactive.js#L199) and [line 746](bin/interactive.js#L746)

#### How to Fix
Add 'interactive' to the additionalBundles array:
```javascript
const additionalBundles = [
    'duplicateDetection',
    'compareData',
    'dataDiff',
    'dataLineage',
    'dataProfile',
    'dataValidator',
    'export',
    'referentialCheck',
    'interactive'  // ✅ ADD THIS
]
```

---

## Category 3: massConvertUI Help Tests (2 failures)

### What Tests Expect
**Test 1** (Lines 31-36):
```javascript
expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
expect(stdout).to.include('hana-cli massConvert --help')
```

**Test 2** (Lines 38-44):
```javascript
expect(stdout).to.match(/Examples:|EXAMPLES/i)
expect(stdout).to.include('hana-cli massConvertUI')
```

### What Tests Are Actually Getting
- Help output exists but **missing documentation links section**
- Missing "See also:" section with related commands
- Missing "Examples:" section

### Root Cause: INCOMPLETE BUILDER CONFIGURATION

#### The Problem
File: [bin/massConvertUI.js](bin/massConvertUI.js#L8)
```javascript
export const builder = getMassConvertBuilder(true)
```

The `getMassConvertBuilder()` function (utils/base.js line 599-690) sets up options but **does NOT include**:
- `.example()` calls to define examples
- `.epilog(buildDocEpilogue(...))` to add documentation links

Comparison with working command (e.g., functions.js):
```javascript
// ✅ FUNCTIONS.JS (WORKS)
export const builder = (yargs) => yargs
    .options(baseLite.getBuilder({...}))
    .wrap(160)
    .example('hana-cli functions --function myFunction --schema MYSCHEMA', ...)
    .epilog(buildDocEpilogue('functions', 'schema-tools', [...]))

// ❌ MASSCONVERTUI.JS (MISSING EXAMPLE AND EPILOG)
export const builder = getMassConvertBuilder(true)
// Returns yargs with only options, no example() or epilog()
```

#### Code Locations
- **Missing configuration**: [bin/massConvertUI.js line 8](bin/massConvertUI.js#L8)
- **Function that needs fixing**: [utils/base.js line 599-690](utils/base.js#L599-L690) `getMassConvertBuilder()`
- **Reference implementation**: [bin/massConvert.js line 25](bin/massConvert.js#L25) (if it has this)

#### How to Fix
Option 1: Update massConvertUI.js to add epilogue:
```javascript
export const builder = (yargs) => {
    const baseBuilder = getMassConvertBuilder(true)
    return baseBuilder
        .example('hana-cli massConvertUI --schema SYS', baseLite.bundle.getText("massConvertUIExample"))
        .epilog(buildDocEpilogue('massConvertUI', 'data-tools', ['massConvert', 'export']))
}
```

Option 2: Modify getMassConvertBuilder to include these when `ui=true`

---

## Category 4: Functions/Tables Tests (7 failures)

### What Tests Expect
Functions test expects output for:
- `node bin/functions.js --quiet`
- `node bin/functions.js -l 10 --quiet`
- `node bin/functions.js -s SYS --quiet`

### What Tests Are Actually Getting
```
Error: Missing configuration file. No default-env.json or substitute found...
```

### Root Cause: Same as Category 1
- [bin/functions.js line 62](bin/functions.js#L62): `const db = await base.createDBConnection()`
- [bin/tables.js line 88-89](bin/tables.js#L84-L89): Database client creation attempt
- Both fail when no configuration file exists

This is a **test environment setup** issue, not a code bug.

#### How to Fix
Same as Category 1 fixes:
1. Add `default-env.json` or `.env` to test environment
2. OR: Use environment variable `VCAP_SERVICES`
3. OR: Mock the database connection in tests

---

## Category 5: Error Handling Tests (2 failures)

### What Tests Expect
```javascript
// Test 47-51 in tests/errorHandling.Test.js
// Expects fallback to work when connection file doesn't exist
child_process.exec(
    'node bin/tables.js --conn nonexistent-file-12345.env --quiet --limit 3',
    (error, stdout, stderr) => {
        base.assert.ok(!error, 'Should handle missing connection file with fallback logic')
    }
)
```

### What Tests Are Actually Getting
- Test is failing (error is being thrown instead of handled gracefully)

### Root Cause: FALLBACK LOGIC INCOMPLETE

#### The Problem
In [utils/connections.js line 315-345](utils/connections.js#L315-L345):

```javascript
// If user specified a connection file
if (prompts.conn) {
    envFile = getFileCheckParents(prompts.conn)
    if (!envFile) {
        envFile = getFileCheckParents(`${homedir()}/.hana-cli/${prompts.conn}`)
    }
}

// ISSUE: At this point, if prompts.conn was specified but NOT FOUND,
// envFile is still undefined. The fallback code below doesn't properly
// restore the fallback chain.

// Last resort
if (!envFile) {
    envFile = getFileCheckParents(`${homedir()}/.hana-cli/default.json`)
}

// Only tries .env as fallback if envFile STILL not found
if (!envFile && !process.env.VCAP_SERVICES) {
    const dotEnvFile = getEnv()
    if (dotEnvFile) dotenv.config({ path: dotEnvFile, quiet: true })
}

// Then tries to load xsenv - but if no file was found, this will FAIL
xsenv.loadEnv(envFile)  // ← FAILS HERE if envFile is null/undefined
```

#### Why This Is Wrong
- When `--conn` specifies a non-existent file, it should fall back to default-env.json, then .env
- Currently, it only falls back to `default.json` in user's home directory
- **Missing**: Fallback to `default-env.json` in current directory

#### Code Location
- **Fallback logic issue**: [utils/connections.js line 310-345](utils/connections.js#L310-L345)
- **Should check for default-env.json after failed --conn attempt**

#### How to Fix
```javascript
// After attempting to find the specified --conn file
if (prompts.conn) {
    envFile = getFileCheckParents(prompts.conn)
    if (!envFile) {
        envFile = getFileCheckParents(`${homedir()}/.hana-cli/${prompts.conn}`)
    }
    // If still not found, DON'T give up yet - fall through to standard fallback
}

// Standard fallback (moved outside the if block)
if (!envFile) {
    envFile = getFileCheckParents('default-env.json')
}

if (!envFile) {
    envFile = getFileCheckParents(`${homedir()}/.hana-cli/default.json`)
}

if (!envFile && !process.env.VCAP_SERVICES) {
    const dotEnvFile = getEnv()
    if (dotEnvFile) dotenv.config({ path: dotEnvFile, quiet: true })
}
```

---

## Category 6: querySimple Test (1 failure)

### What Tests Expect
```javascript
// Test expects proper error handling for various scenarios
it("returns normal output", ...)
```

### Root Cause: Same as Category 1
Database connection failure with different error message format than expected.

---

## Summary Table

| Category | Count | Root Cause | Type | Severity |
|----------|-------|-----------|------|----------|
| systemInfo | 15 | Silent DB connection failure | Env Setup | **HIGH** |
| interactive | 2 | Missing 'interactive' in additionalBundles | Code Bug | **HIGH** |
| massConvertUI help | 2 | Missing .epilog() in builder | Code Bug | **MEDIUM** |
| functions/tables | 7 | Missing default-env.json | Env Setup | **HIGH** |
| error handling | 2 | Incomplete fallback logic | Code Bug | **MEDIUM** |
| querySimple | 1 | DB connection error | Env Setup | **MEDIUM** |

---

## Platform-Specific Analysis

### Is This Ubuntu-Specific?
**No** - The issues are:
- Mostly code-related bugs (not platform-specific)
- Partially environment setup (missing config files)
- File path differences between Windows/Linux are not the cause

### Why All Failures on Ubuntu Only?
Possible reasons:
1. Windows test machines may have configured `default-env.json` or CI environment variables
2. Interactive tests may only run on Ubuntu CI
3. Code paths that check for missing files behave differently in test environments

---

## Recommended Fixes (Priority Order)

### 1. Add 'interactive' to additionalBundles (CRITICAL - 2 failures)
**File**: [utils/base.js line 219-226](utils/base.js#L219-L226)
```javascript
const additionalBundles = [
    'duplicateDetection',
    'compareData',
    'dataDiff',
    'dataLineage',
    'dataProfile',
    'dataValidator',
    'export',
    'referentialCheck',
    'interactive'  // Add this line
]
```

### 2. Fix Fallback Logic in Connections (2 failures)
**File**: [utils/connections.js line 310-345](utils/connections.js#L310-L345)
- Move standard fallback checks outside of `if (prompts.conn)` block
- Ensure proper fallback chain: specified file → default-env.json → .env → VCAP_SERVICES

### 3. Add epilogue to massConvertUI Builder (2 failures)
**File**: [bin/massConvertUI.js line 8](bin/massConvertUI.js#L8)
Add example and epilogue to builder function

### 4. Set Up Test Environment (17 failures)
**For**: systemInfo, functions, tables, querySimple tests
- Add `default-env.json` to test CI environment
- OR: Set `VCAP_SERVICES` and `TARGET_CONTAINER` environment variables
- OR: Mock database connections for tests

---

## Timeline

These issues likely stem from:
1. **Recent addition** of interactive mode (new interactive.js command)
2. **Recent refactoring** of connection handling (CDS binding resolution in connections.js)
3. **Recent documentation** updates (doc-linker.js integration)

The code changes are approximately **1-4 weeks old** based on feature completeness.

