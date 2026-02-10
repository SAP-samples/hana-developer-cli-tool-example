# Unit Tests for Utils and Routes

This document describes the unit tests that have been added to complement the existing CLI command tests.

## Overview

While the project already had good coverage for CLI commands in the `/tests` folder, it was missing unit tests for:

- Utility functions in `/utils`
- Route handlers in `/routes`

## New Test Files

### Utils Tests (`/tests/utils/`)

#### 1. **sqlInjection.Test.js** - 40 tests

Tests for SQL injection protection utilities covering:

- `whitespaceTable` - Whitespace character definitions
- `separatorTable` - SQL separator and operator definitions
- `isAcceptableQuotedParameter()` - Validation of quoted parameters
- `isAcceptableParameter()` - General parameter validation with token counting
- `escapeDoubleQuotes()` - Double quote escaping
- `escapeSingleQuotes()` - Single quote escaping

**Key Test Cases:**

- Valid and invalid parameter formats
- SQL injection attempt detection (comments, multiple statements)
- Token counting with various separators
- Quote escaping and handling

#### 2. **locale.Test.js** - 8 tests

Tests for locale detection utilities covering:

- `getLocale()` - Environment variable priority handling

**Key Test Cases:**

- Priority order: LC_ALL > LC_MESSAGES > LANG > LANGUAGE
- Default to process.env when no environment provided
- Handling of missing locale variables

#### 3. **versionCheck.Test.js** - 3 tests

Tests for version checking functionality covering:

- `checkVersion()` - Node.js version validation

#### 4. **base.Test.js** - 33 tests ⭐ NEW

Tests for core base utility functions covering:

- `isDebug()` - Debug flag detection and handling
- `isGui()` - GUI mode detection
- `getBuilder()` - Command option builder with debug/connection groups
- `getPromptSchema()` - Prompt schema generation with flag injection
- `askFalse()` - Helper function for non-prompted options
- `debug()` - Debug logging function
- `promptHandler()` - Critical path validation for argv value transfer
- `colors` and `bundle` - Utility availability

**Key Test Cases:**

- Debug flag handling in various scenarios (true/false/missing/null/undefined)
- GUI mode detection
- Builder includes/excludes debug and connection options based on flags
- Prompt schema includes/excludes properties based on flags
- Correct group assignments and aliases for flags
- **Critical fix validation:** Debug/admin/conn flags copied from argv even when `ask()` returns false
- Prompt handler preserves all argv values in result object
- Color and localization utilities availability

#### 5. **database.Test.js** - 14 tests

Tests for database client class covering:

- Constructor initialization
- `adjustWildcard()` - Wildcard character conversion
- Getter methods: `getPrompts()`, `getKind()`, `getDB()`
- Setter methods: `setDB()`
- `schemaCalculation()` - Schema name resolution
- `getNewClient()` - Static factory method

**Key Test Cases:**

- Proper instance creation
- Wildcard conversion (* to %)
- Schema defaults and overrides
- Database kind/flavor detection
- Error handling for invalid configurations

### Routes Tests (`/tests/routes/`)

#### 6. **index.Test.js** - 6 tests

Tests for the index route handler covering:

- Route function exports and structure
- Express app integration
- Error handling during setup

**Key Test Cases:**

- Route function availability and signature
- Integration with fresh Express instances
- Error-free setup process

#### 7. **hanaList.Test.js** - 12 tests

Tests for HANA list routes covering:

- Route function structure
- `listHandler()` export and signature
- Express app integration
- Multiple route configurations

**Key Test Cases:**

- Route function availability
- Async function validation for listHandler
- Error-free setup with Express
- Idempotent route configuration

### CLI Integration Tests (`/tests/`)

#### 8. **genericFlags.Test.js** - 26 tests ⭐ NEW

Comprehensive integration tests for generic command-line flags that are shared across ALL hana-cli commands. These tests ensure framework-level flags work consistently and catch issues early.

**Flags Tested:**

- `--debug` / `--Debug` - Enables debug output with detailed logging
- `--quiet` / `--disableVerbose` - Suppresses verbose output
- `--help` / `-h` - Displays command help
- `--admin` / `-a` - Uses admin connection
- `--conn` - Specifies connection file

**Test Categories:**

1. **Debug Flag Tests (5 tests)**
   - Validates debug output appears in stdout/stderr when `--debug` is used
   - Tests across multiple commands: tables, functions, views, procedures
   - Validates the `--Debug` alias works correctly

2. **Quiet Flag Tests (2 tests)**
   - Ensures no debug output when `--quiet` or `--disableVerbose` is used
   - Validates verbose suppression across commands

3. **Help Flag Tests (3 tests)**
   - Verifies help output contains usage and options information
   - Tests `-h` alias functionality
   - Ensures debug flag is documented in help

4. **Flag Combination Tests (3 tests)**
   - Validates `--debug` works with other flags (--limit, --schema)
   - Ensures `--quiet` prevents debug output even with other flags

5. **Admin and Connection Flag Tests (3 tests)**
   - Validates `--admin` and `-a` alias are recognized
   - Tests `--conn` accepts file path values
   - Ensures no argument parsing errors

6. **Cross-Command Persistence Tests (10 tests)**
   - Validates `--debug` works consistently across 5 commands
   - Validates `--quiet` works consistently across 5 commands
   - Commands tested: tables, views, functions, procedures, schemas

**Why These Tests Matter:**

- **Framework-Level Validation:** These flags are injected by the base framework, not individual commands
- **Regression Prevention:** Catches issues like the recent --debug flag bug early
- **Consistency:** Ensures all commands behave the same way with generic flags
- **Documentation:** Serves as living documentation for flag behavior

**Test Execution Time:** ~1 minute (tests are slower as they spawn actual CLI processes)

## Test Statistics

### Total New Tests Added: 142

- Utils Tests: 98 (was 65, added 33 base.Test.js)
- Routes Tests: 18
- CLI Integration Tests: 26 (new)

**Test Execution Time:**

- Utils tests: ~2-3 seconds
- Routes tests: <50ms
- CLI Integration tests (genericFlags): ~1 minute
- Total: ~1-2 minutes

## Running the Tests

### Run All Tests

```bash
npm test
```

### Run Utils Tests Only

```bash
npm run test:utils
```

### Run Routes Tests Only

```bash
npm run test:routes
```

### Run CLI Tests Only (Original)

```bash
npm run test:cli
```

## Test Framework

- **Test Runner:** Mocha
- **Assertion Library:** Node.js built-in `assert`
- **Reporter:** Mochawesome (generates HTML reports)
- **Configuration:** `tests/.mocharc.json`

## Test Reports

After running tests, HTML reports are generated in:

```bash
mochawesome-report/test-report_XXX.html
```

Open these files in a browser for detailed test results with:

- Pass/fail statistics
- Execution times
- Test hierarchy
- Failure details

## Testing Approach

### Utils Tests

- Focus on pure function testing
- Cover edge cases and error conditions
- Validate input/output contracts
- Test both success and failure paths

### Routes Tests

- Test route registration and structure
- Validate function exports
- Test Express integration
- Focus on setup and configuration (not runtime behavior)
- Note: Full integration tests with mocked HTTP requests would require additional tooling

### CLI Integration Tests

- Execute actual CLI commands as subprocess
- Validate flag parsing and behavior
- Ensure consistent behavior across all commands
- Test framework-level functionality (not command-specific logic)
- Capture and validate stdout/stderr output

## Coverage Areas

### Well Covered

✅ SQL injection protection
✅ Locale detection
✅ Version checking
✅ Database client factory
✅ Route structure and registration
✅ **Base utility functions (isDebug, getBuilder, promptHandler)** ⭐ NEW
✅ **Generic CLI flags (--debug, --quiet, --help, --admin, --conn)** ⭐ NEW
✅ **Flag consistency across commands** ⭐ NEW

### Future Enhancements

🔄 Integration tests for route handlers with mocked requests/responses
🔄 Tests for other util modules (connections.js, dbInspect.js, etc.)
🔄 Tests for remaining route files (excel.js, webSocket.js, etc.)
🔄 Code coverage reporting with nyc/istanbul

## Notes

- Route tests focus on structure and exports rather than runtime behavior due to ES Module stubbing limitations
- For full route behavior testing, consider adding integration tests with tools like supertest
- Database tests avoid actual database connections and focus on class structure and logic
- Most tests are designed to run quickly and not require external dependencies
- **CLI integration tests (genericFlags.Test.js) spawn actual CLI processes and take longer (~1 min)** ⭐ NEW
- **base.Test.js includes critical regression tests for the --debug flag fix** ⭐ NEW
- Generic flags tests help catch framework-level issues before they affect all commands
