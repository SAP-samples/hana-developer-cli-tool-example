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

**Key Test Cases:**

- Promise return validation
- Successful resolution without errors
- Performance within acceptable timeframe

#### 4. **database.Test.js** - 14 tests

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

#### 5. **index.Test.js** - 6 tests

Tests for the index route handler covering:

- Route function exports and structure
- Express app integration
- Error handling during setup

**Key Test Cases:**

- Route function availability and signature
- Integration with fresh Express instances
- Error-free setup process

#### 6. **hanaList.Test.js** - 12 tests

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

## Test Statistics

### Total New Tests Added: 83

- Utils Tests: 65
- Routes Tests: 18

**Test Execution Time:**

- Utils tests: ~2 seconds
- Routes tests: <50ms
- Total: ~2-3 seconds

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

## Coverage Areas

### Well Covered

✅ SQL injection protection
✅ Locale detection
✅ Version checking
✅ Database client factory
✅ Route structure and registration

### Future Enhancements

🔄 Integration tests for route handlers with mocked requests/responses
🔄 Tests for other util modules (connections.js, dbInspect.js, etc.)
🔄 Tests for remaining route files (excel.js, webSocket.js, etc.)
🔄 Code coverage reporting with nyc/istanbul

## Notes

- Route tests focus on structure and exports rather than runtime behavior due to ES Module stubbing limitations
- For full route behavior testing, consider adding integration tests with tools like supertest
- Database tests avoid actual database connections and focus on class structure and logic
- Tests are designed to run quickly and not require external dependencies
