---
description: "Use when creating or updating test files for CLI commands, utilities, and routes. Enforces consistent test structure, Mocha patterns, proper assertion usage, execution isolation, error handling validation, and integration with the project's test infrastructure."
applyTo: "tests/**/{*.Test.js,*.test.js}"
---

# Testing Guidelines

Use this guide when creating or updating test files for this project. Tests validate CLI commands, utilities, routes, and error handling to ensure reliability and prevent regressions.

## Scope and Test Types

This project contains multiple test types:

1. **CLI Command Tests** - Validate `bin/*.js` commands via subprocess execution
2. **Unit Tests** - Test individual utility functions in isolation
3. **Integration Tests** - Test routes and Express app functionality using `appFactory`
4. **Error Handling Tests** - Validate graceful error scenarios and edge cases
5. **Flag Validation Tests** - Verify command-line argument parsing and constraints

## Test Framework and Configuration

- **Test Runner**: Mocha (`@latest`)
- **Assertion Library**: Node.js built-in `assert` module
- **Reporting**: `mochawesome` for HTML reports
- **Execution**: Parallel (16 jobs) via `.mocharc.json`
- **Coverage Tool**: `mochawesome` with context injection  
- **Timeout**: Default 10 seconds (set per describe/it block as needed)

**Configuration file: `.mocharc.json`**
```json
{
    "timeout": "10s",
    "parallel": true,
    "jobs": 16,
    "reporter": "spec",
    "exit": true,
    "require": ["./tests/helper.js"]
}
```

## File Naming and Organization

- **Naming**: Use `FileName.Test.js` or `fileName.test.js` pattern (flexible casing + `.Test.js` or `.test.js` suffix)
- **Location**: Tests live in `tests/` directory, mirroring source structure
- **Grouping**: Organize related tests in subdirectories:
  - `tests/` - CLI command tests
  - `tests/utils/` - Utility function tests
  - `tests/routes/` - Route integration tests

**Examples:**
- CLI command: `tests/tables.Test.js` (tests `bin/tables.js`)
- Utility test: `tests/utils/base.Test.js`
- Route test: `tests/routes/api.test.js`
- Utility helper: `tests/utils/connections.Test.js`

## Test Structure Template

### CLI Command Tests

CLI tests execute commands via subprocess and validate output:

```javascript
// @ts-check
/**
 * @module commandName - Tests for bin/commandName.js
 * 
 * Validates command-line execution, flag parsing, help output,
 * and integration with the CLI framework.
 */

import * as base from './base.js'

describe('commandName', function () {

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/commandName.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/commandName.js --quiet", done)
    })

    it("accepts and uses limit flag", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/commandName.js --limit 10 --quiet", done)
    })

})
```

**Rules for CLI tests:**
- Use `base.myTest.bind(this)` helper to execute commands
- Always test `--help` flag first (validates command registration)
- Test normal operation with minimal flags (usually `--quiet`)
- Test common flag variations (full flag, alias, various values)
- Each test in its own `it()` block with descriptive name
- Use `done` callback (Mocha classic async pattern)
- Let `base.myTest()` handle stderr filtering and addContext automatically

### Unit Tests

Unit tests validate utility functions in isolation:

```javascript
// @ts-check
/**
 * @module utilityName - Tests for utils/utilityName.js
 * 
 * Validates function behavior, edge cases, and error handling.
 */

import { describe, it } from 'mocha'
import { assert } from '../base.js'
import * as utilities from '../../utils/utilityName.js'

describe('Utility Function Name', function () {

    it('should return expected result for normal input', function () {
        const input = { value: 'test' }
        const result = utilities.functionName(input)
        
        assert.strictEqual(result, expectedValue)
    })

    it('should handle null input gracefully', function () {
        const result = utilities.functionName(null)
        
        assert.strictEqual(result, fallbackValue)
    })

    it('should throw on invalid type', function () {
        assert.throws(() => {
            utilities.functionName(123)
        }, /expected string/)
    })

})
```

**Rules for unit tests:**
- Import directly from utilities (no subprocess execution)
- Use `assert.strictEqual()` for exact comparisons
- Use `assert.deepStrictEqual()` for objects/arrays
- Use `assert.ok()` or `assert.notOk()` for boolean checks
- Use `assert.throws()` for error validation
- Test both normal and edge cases (null, undefined, wrong types)
- Test error paths with `assert.throws()`
- No need for `base.myTest()` helper

### Mocking and Stubbing (esmock)

For unit tests that need to mock or stub dependencies, use `esmock`:

```javascript
import { assert } from '../base.js'
import esmock from 'esmock'

describe('Module with dependencies', () => {

    it('should handle mocked fs module', async function () {
        const myModule = await esmock('../../utils/myModule.js', {
            fs: {
                existsSync: () => true,
                readFileSync: () => 'mocked content'
            }
        })
        
        const result = myModule.functionUsingFS('somePath')
        
        assert.strictEqual(result, expectedValue)
    })

    it('should count mocked function calls', async function () {
        let callCount = 0
        const connections = await esmock('../../utils/connections.js', {
            fs: {
                existsSync: () => {
                    callCount++
                    return callCount === 2 // Returns true on second call
                }
            }
        })
        
        const result = connections.getFileCheckParents('package.json')
        
        assert.strictEqual(callCount, 2)
        assert.ok(result)
    })

})
```

**Mocking rules:**
- Use `esmock` for module mocking (most reliable for ES6 modules)
- Mock sparingly—usually for testing specific error paths or control flow
- Mock only external dependencies (fs, network calls), not business logic
- Reset all mock state between tests automatically (esmock handles this)
- Keep mocked function behavior simple and deterministic
- Document why the mock is needed in a comment above the test

### Integration Tests (Routes)

Integration tests validate Express routes using `appFactory`:

```javascript
// @ts-check
/**
 * @module routeName - Tests for routes/routeName.js
 * 
 * Validates HTTP endpoint behavior, response format, error handling,
 * and database integration.
 */

import { assert } from '../base.js'
import request from 'supertest'
import { createApp, createMinimalApp } from '../appFactory.js'

describe('GET /api/endpoint', function () {
    this.timeout(5000)

    it('should return 200 with valid parameters', async function () {
        const app = await createApp()
        
        const response = await request(app)
            .get('/api/endpoint')
            .query({ param: 'value' })
        
        assert.strictEqual(response.status, 200)
        assert.ok(response.body.data)
    })

    it('should return 400 for missing required parameter', async function () {
        const app = await createApp()
        
        const response = await request(app)
            .get('/api/endpoint')
        
        assert.strictEqual(response.status, 400)
    })

})
```

**Rules for integration tests:**
- Import `createApp()` from `appFactory.js`
- Use `supertest` for HTTP assertions
- Use `await` for async operations
- Set `this.timeout()` for operations requiring DB connections
- Test both success (200) and error (400, 500) cases
- Validate response structure with `response.body`
- Test all required parameters

## Critical Test Patterns

### 1. Timeout Management

Set timeouts based on operation type:

```javascript
describe('Feature', function () {
    // Long-running operations (DB queries, network)
    this.timeout(10000)

    it('should complete within timeout', function (done) {
        // Test code
    })

    it('should also respect timeout', function (done) {
        // This inherits 10s timeout from describe block
    })
})

describe('Quick unit tests', function () {
    // No timeout needed for synchronous tests
    
    it('should execute synchronously', function () {
        // No timeout, no done callback needed
    })
})
```

### 2. Error Handling Validation

Test error scenarios with specific error message patterns:

```javascript
it('should reject negative limit values', function (done) {
    child_process.exec('node bin/command.js --limit -5 --quiet', 
        (error, stdout, stderr) => {
            base.addContext(this, { title: 'Stderr', value: stderr })
            
            // Check for error handling (could be error or message in output)
            const hasErrorHandling = error || 
                                    stderr.includes('Invalid') || 
                                    stderr.includes('must be positive')
            
            base.assert.ok(hasErrorHandling, 'Should validate limit value')
            done()
        })
})
```

**Rules:**
- Always capture both stdout and stderr
- Use `base.addContext()` to include output in test report
- Test multiple error conditions (null, out of range, wrong type)
- Validate user receives clear error message, not technical stack trace
- Test recovery/fallback behavior when applicable

### 3. Flag Alias Testing

Test both full flag name and aliases:

```javascript
describe('Schema flag', function () {
    it('should accept --schema flag', function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tables.js --schema SYSTEM --quiet --limit 3", done)
    })

    it('should accept -s alias for schema', function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/tables.js -s SYSTEM --quiet --limit 3", done)
    })
})
```

### 4. Debug Output Handling

The `base.myTest()` helper automatically filters debug messages from stderr:

```javascript
it("should work with debug flag", function (done) {
    const localTest = base.myTest.bind(this)
    // Debug messages (lines matching timestamp pattern) are filtered automatically
    localTest("node bin/command.js --debug --quiet", done)
})
```

Debug lines matching `^\d{4}-\d{2}-\d{2}T[\d:.]+Z hana-cli` are automatically removed.

### 5. Help Output Validation

Every command should be tested for help output:

```javascript
it("returns help output", function (done) {
    const localTest = base.myTest.bind(this)
    localTest("node bin/commandName.js --help", done)
})
```

This validates:
- Command is properly registered in CLI
- Help text displays without error
- No unexpected stderr output

## Assertion Best Practices

Use these assertion patterns:

```javascript
// Existence checks
assert.ok(result, 'should exist')
assert.notOk(result, 'should not exist')

// Exact equality
assert.strictEqual(actual, expected)
assert.notStrictEqual(actual, expected)

// Deep equality (objects/arrays)
assert.deepStrictEqual(actual, expected)
assert.deepNotEqual(actual, expected)

// Boolean checks
assert.equal(result, true)
assert.equal(result, false)

// Error validation
assert.throws(() => fn(), /error message pattern/)
assert.doesNotThrow(() => fn())

// Truthy/falsy checks
assert.ok(condition, 'message for failure')
```

## Test Data and Fixtures

For tests requiring specific data:

1. **Use existing database schema** (SYSTEM, SYS tables)
2. **Use wildcard patterns** for non-existent references
3. **Create minimal fixtures** in test files only if needed
4. **Avoid hardcoded paths** - use relative or environment-based

Example:

```javascript
it('should find system tables', function (done) {
    // Use existing SYSTEM schema
    const localTest = base.myTest.bind(this)
    localTest("node bin/tables.js --schema SYSTEM --limit 5 --quiet", done)
})

it('should handle wildcard patterns', function (done) {
    // Wildcards work without real data
    const localTest = base.myTest.bind(this)
    localTest("node bin/tables.js --table 'M_*' --quiet", done)
})
```

## Base Test Utilities

### `base.myTest(command, done)`

Execute a CLI command and validate output:

```javascript
const localTest = base.myTest.bind(this)
localTest("node bin/command.js --flag value", done)
```

Automatically:
- Executes command via `child_process.exec()`
- Filters debug stderr messages
- Throws if unexpected stderr remains
- Adds stdout to test report via `addContext`
- Calls `done()` callback

### `base.addContext(context, { title, value })`

Add output to test report for debugging:

```javascript
base.addContext(this, { title: 'Response Body', value: JSON.stringify(response) })
```

### `base.assert`

Built-in Node.js assertions:

```javascript
import { assert } from './base.js'
assert.strictEqual(actual, expected)
```

## Test Execution

Run tests:

```bash
# All tests
npm test

# Specific file
npm test -- tests/tables.Test.js

# Matching pattern
npm test -- --grep "flag validation"

# With verbose output
npm test -- --reporter spec
```

Tests run in parallel (16 jobs) by default. Each test file is independent and should not depend on test execution order.

## Test Isolation and Data Management

Tests are isolated by design with no explicit teardown or database cleanup required:

- **Read-only operations**: Most CLI commands are read-only queries returning existing data
- **Independent data**: Tests use existing HANA system schemas (SYSTEM, SYS) that are stable across test runs
- **No dependencies**: Each test is completely independent; tests can run in any order or in parallel
- **Stateless execution**: No test modifies persistent state that affects other tests

**Guidelines for data usage:**
```javascript
// ✅ Good: Use existing, stable system data
it('should query system tables', function (done) {
    const localTest = base.myTest.bind(this)
    localTest("node bin/tables.js --schema SYSTEM --quiet", done)
})

// ✅ Good: Use wildcard patterns (safe, non-destructive)
it('should accept patterns', function (done) {
    const localTest = base.myTest.bind(this)
    localTest("node bin/tables.js --table 'M_*' --quiet", done)
})

// ❌ Avoid: Creating test data that needs cleanup
// If you must create data, document cleanup steps in the test
```

## Common Mistakes to Avoid

❌ Hardcoding connection strings or sensitive data in tests

❌ Forgetting `--quiet` flag (causes help text in output)

❌ Not setting `this.timeout()` for I/O operations

❌ Using `==` instead of `assert.strictEqual()`

❌ Testing implementation details instead of user behavior

❌ Mixing test utilities (use `base.myTest()` for CLI, direct imports for units)

❌ Async tests without `done` callback or `async/await`

❌ Not testing both success and error cases

❌ Creating dependencies between tests (parallel execution breaks this)

## Safety and Compatibility Checks

Before finalizing tests:

- [ ] Test file naming follows `*.Test.js` or `*.test.js` pattern
- [ ] All CLI tests include `--help` validation
- [ ] Error scenarios are tested with `base.addContext()` for debugging
- [ ] Timeouts are set for async operations (default 10s may be too short for DB queries)
- [ ] Assertions use `assert.strictEqual()` not `==` or loose equality
- [ ] No hardcoded paths or credentials
- [ ] Test can run independently (no execution order dependencies)
- [ ] Stderr is properly handled (debug messages filtered or expected)
- [ ] Response validation includes both structure and content checks
- [ ] Mocking is used sparingly and only for external dependencies (fs, network)
- [ ] Tests don't require per-test cleanup (no beforeEach/afterEach teardown)
