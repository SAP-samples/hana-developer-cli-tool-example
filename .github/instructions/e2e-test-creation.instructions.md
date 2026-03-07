---
description: "Use when creating end-to-end (E2E) tests for CLI commands. Enforces consistent test structure, subprocess execution patterns, output validation, flag testing, and integration testing. Covers complete command workflows from execution through verification."
applyTo: "tests/e2e/**/*.e2e.Test.js"
---

# End-to-End (E2E) Test Creation Guide

Use this guide when creating **end-to-end tests** that validate complete CLI command workflows through subprocess execution. E2E tests execute real commands and verify their output, behavior, flags, and integration scenarios.

## What Are E2E Tests?

E2E tests are subprocess-based tests that:
- Execute real CLI commands via `node bin/cli.js <command>`
- Validate actual command output (stdout/stderr)
- Verify flag behavior and combinations
- Test help output and documentation
- Validate error conditions and edge cases
- Ensure commands work independently and in sequences

**When to use E2E tests:**
- Testing CLI command behavior and output
- Validating command flags and options work correctly
- Verifying help/documentation output
- Testing commands that require real execution (not mock-friendly)
- Integration tests between command and system

**When NOT to use E2E tests:**
- Unit testing utility functions (use `tests/utils/*.test.js` instead)
- Testing route handlers (use `tests/routes/*.test.js` instead)
- Testing internal class methods (use unit tests instead)

## File Naming and Organization

- **Naming Convention**: `commandName.e2e.Test.js`
- **Location**: `tests/e2e/` directory (use `tests/e2e/routes/` for route/WebSocket E2E tests)
- **Pattern**: Files matching `tests/e2e/**/*.e2e.Test.js` are discovered and run by E2E test scripts

**Examples:**
- `tests/e2e/version.e2e.Test.js` - E2E tests for version command
- `tests/e2e/tables.e2e.Test.js` - E2E tests for tables command
- `tests/e2e/status.e2e.Test.js` - E2E tests for status command

## Test Infrastructure

### Base Module (`tests/base.js`)

The `base.js` module provides core functionality for E2E tests:

```javascript
import * as base from '../base.js'

// Execute a CLI command and capture output
base.exec(command, (error, stdout, stderr) => {
  // error: null if command succeeded, otherwise Error object
  // stdout: standard output as string
  // stderr: standard error as string
})

// Add test context to mochawesome report
base.addContext(this, { title: 'Label', value: 'content' })

// Assertion library
import { expect } from 'chai'
expect(value).to.equal(expected)
```

### Mocha Configuration

E2E tests run using `.mocharc.json`:
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

**Key settings:**
- `timeout: "10s"` - Default 10-second timeout per test (override with `this.timeout(ms)`)
- `parallel: true` - Tests run in parallel (16 jobs)
- `reporter: "spec"` - Console output shows test names and results
- `exit: true` - Process exits after tests complete

### Package.json Scripts

Standard npm scripts for running E2E tests:
```json
{
  "test:e2e": "cross-env NODE_ENV=test mocha --config=tests/.mocharc.json \"./tests/e2e/**/*.e2e.Test.js\"",
  "test:e2e:single": "cross-env NODE_ENV=test mocha --config=tests/.mocharc.json \"./tests/e2e/**/*.e2e.Test.js\"",
  "test:e2e:grep": "cross-env NODE_ENV=test mocha --config=tests/.mocharc.json \"./tests/e2e/**/*.e2e.Test.js\" --grep"
}
```

**Usage:**
```bash
npm run test:e2e                    # Run all E2E tests
npm run test:e2e:single             # Run all E2E tests (same as test:e2e)
npm run test:e2e:grep "pattern"     # Run E2E tests matching pattern
```

## E2E Test Structure Template

### Complete Example Template

```javascript
// @ts-check
/**
 * @module commandName - End-to-End (E2E) Tests for bin/commandName.js
 * 
 * Validates complete command workflows including:
 * - Basic execution and output format
 * - Command flags and options
 * - Help and documentation
 * - Error handling
 * - Integration scenarios
 */

import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'

describe('commandName command - E2E Tests', function () {
  // Set timeout for entire suite (increase for long-running commands)
  this.timeout(15000)

  // GROUP 1: Basic Execution
  describe('Basic execution', () => {
    it('executes without arguments', function (done) {
      base.exec('node bin/cli.js commandName', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('expected-output')
        base.addContext(this, { title: 'Output', value: stdout })
        done()
      })
    })

    it('executes with common flags', function (done) {
      base.exec('node bin/cli.js commandName --quiet', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.length).to.be.greaterThan(0)
        done()
      })
    })

    it('returns consistent results on repeated calls', function (done) {
      base.exec('node bin/cli.js commandName', (error1, stdout1) => {
        base.exec('node bin/cli.js commandName', (error2, stdout2) => {
          expect(stdout1).to.equal(stdout2)
          done(error1 || error2)
        })
      })
    })
  })

  // GROUP 2: Help and Documentation
  describe('Help output', () => {
    it('displays help with --help flag', function (done) {
      base.exec('node bin/cli.js commandName --help', (error, stdout) => {
        expect(stdout).to.include('commandName')
        expect(stdout).to.include('Options:')
        expect(stdout).to.include('Examples:')
        done()
      })
    })

    it('shows available flags in help', function (done) {
      base.exec('node bin/cli.js commandName --help', (error, stdout) => {
        expect(stdout).to.include('--flag1')
        expect(stdout).to.include('--flag2')
        base.addContext(this, { title: 'Help', value: stdout })
        done()
      })
    })
  })

  // GROUP 3: Flag Behavior
  describe('Flags and options', () => {
    it('accepts --flag1 with value', function (done) {
      base.exec('node bin/cli.js commandName --flag1 value', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('expected-result')
        done()
      })
    })

    it('handles combined flags', function (done) {
      base.exec('node bin/cli.js commandName --flag1 value --flag2', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('validates flag values', function (done) {
      base.exec('node bin/cli.js commandName --flag1 invalid-value', (error, stdout) => {
        expect(error).to.exist
        expect(stdout).to.include('error') || expect(error.message).to.include('expected')
        done()
      })
    })
  })

  // GROUP 4: Output Format
  describe('Output format', () => {
    it('produces consistent output structure', function (done) {
      base.exec('node bin/cli.js commandName', (error, stdout) => {
        const lines = stdout.split('\n').filter(l => l.trim())
        expect(lines.length).to.be.greaterThan(0)
        base.addContext(this, { title: 'Line count', value: `${lines.length} lines` })
        done()
      })
    })

    it('uses consistent formatting (colon-separated values)', function (done) {
      base.exec('node bin/cli.js commandName', (error, stdout) => {
        const formattedLines = stdout.split('\n').filter(l => l.includes(':'))
        expect(formattedLines.length).to.be.greaterThan(0)
        done()
      })
    })
  })

  // GROUP 5: Error Handling
  describe('Error handling', () => {
    it('handles missing required parameters', function (done) {
      base.exec('node bin/cli.js commandName --flag1', (error, stdout) => {
        // Either error exists or output contains error message
        const hasError = error || stdout.includes('error') || stdout.includes('required')
        expect(hasError).to.be.true
        done()
      })
    })

    it('provides helpful error messages', function (done) {
      base.exec('node bin/cli.js commandName --invalid-flag', (error, stdout) => {
        const output = stdout + (error?.message || '')
        expect(output.toLowerCase()).to.include('error') || expect(output).to.include('Unknown')
        done()
      })
    })
  })

  // GROUP 6: Integration
  describe('Integration scenarios', () => {
    it('works in command sequence', function (done) {
      base.exec('node bin/cli.js commandName', (error1, stdout1) => {
        base.exec('node bin/cli.js commandName --flag1 value', (error2, stdout2) => {
          expect(stdout1).to.include('expected-output')
          expect(stdout2).to.include('expected-output')
          done(error1 || error2)
        })
      })
    })

    it('does not require database connection', function (done) {
      base.exec('node bin/cli.js commandName', (error, stdout) => {
        // Command should work regardless of database availability
        expect(stdout).to.include('expected-output')
        done()
      })
    })
  })
})
```

## Common Test Patterns

### Pattern 1: Basic Execution and Output Validation

```javascript
it('displays expected output', function (done) {
  base.exec('node bin/cli.js commandName', (error, stdout) => {
    expect(error).to.be.null
    expect(stdout).to.include('specific-text')
    done()
  })
})
```

### Pattern 2: Flag Validation

```javascript
it('accepts --flag with value', function (done) {
  base.exec('node bin/cli.js commandName --flag value', (error, stdout) => {
    expect(error).to.be.null
    expect(stdout).to.include('expected-output')
    done()
  })
})
```

### Pattern 3: Help Command

```javascript
it('shows help with --help flag', function (done) {
  base.exec('node bin/cli.js commandName --help', (error, stdout) => {
    expect(stdout).to.include('commandName')
    expect(stdout).to.include('Options:')
    done()
  })
})
```

### Pattern 4: Regex-based Output Matching

```javascript
it('outputs in correct format', function (done) {
  base.exec('node bin/cli.js commandName', (error, stdout) => {
    expect(stdout).to.match(/output:\s+\d+/)  // Match pattern
    done()
  })
})
```

### Pattern 5: Error Handling

```javascript
it('handles invalid input gracefully', function (done) {
  base.exec('node bin/cli.js commandName --flag invalid', (error, stdout) => {
    expect(error).to.exist  // Command should error
    done()
  })
})
```

### Pattern 6: Context Injection for Reporting

```javascript
it('returns command output', function (done) {
  base.exec('node bin/cli.js commandName', (error, stdout) => {
    expect(stdout).to.include('data')
    // Add output to mochawesome HTML report
    base.addContext(this, { title: 'Command Output', value: stdout })
    done()
  })
})
```

### Pattern 7: Sequential Execution

```javascript
it('works in command chains', function (done) {
  base.exec('node bin/cli.js commandName', (error1, stdout1) => {
    base.exec('node bin/cli.js commandName --flag value', (error2, stdout2) => {
      expect(stdout1).to.include('expected')
      expect(stdout2).to.include('expected')
      done(error1 || error2)
    })
  })
})
```

## Assertion Patterns

### Using Chai Expect

```javascript
import { expect } from 'chai'

// String operations
expect(stdout).to.include('text')           // Contains
expect(stdout).to.not.include('text')       // Does not contain
expect(stdout).to.match(/regex/)            // Matches regex
expect(stdout).to.equal('exact-string')     // Exact match

// Number operations
expect(lines.length).to.be.greaterThan(5)
expect(lines.length).to.equal(10)
expect(value).to.be.lessThan(100)

// Existence and truthiness
expect(error).to.be.null
expect(error).to.exist
expect(value).to.be.true
expect(value).to.be.false
expect(array).to.be.empty

// Matching patterns
expect(output).to.match(/version:\s+\d+\.\d+\.\d+/i)  // Pattern matching
```

## Test Organization and Grouping

Structure tests in logical groups using nested `describe()` blocks:

```javascript
describe('commandName command - E2E Tests', function () {
  describe('Basic execution', () => {
    it('test 1', ...)
    it('test 2', ...)
  })

  describe('Flags', () => {
    it('test 3', ...)
    it('test 4', ...)
  })

  describe('Error handling', () => {
    it('test 5', ...)
    it('test 6', ...)
  })
})
```

**Standard grouping categories:**
1. **Basic execution** - Default behavior without flags
2. **Help output** - `--help` flag and documentation
3. **Flags and options** - Individual and combined flags
4. **Output format** - Structure and consistency of output
5. **Error handling** - Invalid inputs and error messages
6. **Integration** - Multi-command sequences and interactions

## Timeout Management

Adjust timeouts based on command execution time:

```javascript
describe('commandName command - E2E Tests', function () {
  // Suite timeout (applies to all tests)
  this.timeout(20000)

  describe('Long-running operations', function () {
    // Override for specific describe block
    this.timeout(30000)

    it('executes slow operation', function (done) {
      // Individual test timeout
      this.timeout(60000)
      base.exec('node bin/cli.js commandName --heavy-operation', (error, stdout) => {
        expect(stdout).to.include('result')
        done()
      })
    })
  })
})
```

**Default:** 10 seconds (set in `.mocharc.json`)
**Increase for:** Network operations, database queries, long-running processes
**Increase to:** 15000-30000ms for typical CLI commands, up to 60000ms for heavy operations

## Best Practices

### DO:
- ✅ Test the complete command execution flow
- ✅ Validate both stdout and exit codes (error)
- ✅ Group related tests in describe blocks
- ✅ Use descriptive test names that explain what's being tested
- ✅ Add context to mochawesome reports using `base.addContext()`
- ✅ Test common flag variations
- ✅ Always test help output (validates command registration)
- ✅ Use regex for flexible pattern matching (case-insensitive where appropriate)
- ✅ Use `done` callback for async operations
- ✅ Set appropriate timeouts for slow commands

### DON'T:
- ❌ Test internal functions (use unit tests instead)
- ❌ Create shell script files or modify the file system during tests
- ❌ Depend on database availability (isolate from DB if possible)
- ❌ Use sleep/setTimeout for synchronization (often causes flakiness)
- ❌ Ignore error conditions
- ❌ Create overly complex assertions (break into multiple tests)
- ❌ Assume output format without validation
- ❌ Mix unit tests and E2E tests in the same file

## Running E2E Tests

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run specific E2E test file:
```bash
npm run test:e2e:single -- tests/e2e/version.e2e.Test.js
```

### Run E2E tests matching a pattern:
```bash
npm run test:e2e:grep "Basic execution"
npm run test:e2e:grep "Flags"
```

### View results:
- **Terminal output**: Immediate console feedback
- **HTML report**: View detailed results in `mochawesome-report/` directory
- **Coverage**: Automatic context injection to reports

## Debugging E2E Tests

### Run with verbose output:
```bash
NODE_ENV=test npx mocha tests/e2e/commandName.e2e.Test.js --reporter spec
```

### Run a single test:
```bash
NODE_ENV=test npx mocha tests/e2e/commandName.e2e.Test.js --grep "test name"
```

### Manual command execution:
```bash
# Run the command directly to see actual output
node bin/cli.js commandName
node bin/cli.js commandName --flag value
node bin/cli.js commandName --help
```

### Add temporary logging:
```javascript
it('debug test', function (done) {
  base.exec('node bin/cli.js commandName', (error, stdout) => {
    console.log('STDOUT:', stdout)      // Log to console
    console.log('ERROR:', error)        // Log error details
    expect(stdout).to.include('text')
    done()
  })
})
```

## Example from version.e2e.Test.js

The [version.e2e.Test.js](../../tests/e2e/version.e2e.Test.js) file demonstrates these patterns:

- **Test structure**: Organized into logical groups (Basic execution, Help outputs, Version components, etc.)
- **Output validation**: Uses both `include()` and `match()` for flexible assertions
- **Context injection**: Captures output to mochawesome reports
- **Regex patterns**: Validates semantic content (versions, URLs, formats)
- **Sequential testing**: Tests multiple executions to verify consistency
- **Error handling**: Validates error conditions and null checks
- **Integration**: Tests multi-command sequences

## Integration with CI/CD

E2E tests in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run E2E Tests
  run: npm run test:e2e:single
  
- name: Upload Test Reports
  if: always()
  uses: actions/upload-artifact@v2
  with:
    name: e2e-test-reports
    path: mochawesome-report/
```

---

**For additional test patterns, see:**
- [version.e2e.Test.js](../../tests/e2e/version.e2e.Test.js) - Complete working example
- [testing.instructions.md](./testing.instructions.md) - General testing guidelines
- [test-utilities-reuse.instructions.md](./test-utilities-reuse.instructions.md) - Reusing test helpers
