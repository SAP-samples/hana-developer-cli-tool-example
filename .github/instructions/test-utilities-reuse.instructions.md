---
description: "Use when creating or updating test files that need to leverage existing test utilities. Enforces consistent discovery and reuse of shared testing infrastructure including base utilities, mocking libraries, and established test patterns. Ensures tests benefit from centralized test helpers rather than duplicating functionality."
applyTo: "tests/**/{*.Test.js,*.test.js}"
---

# Test Utilities Discovery and Reuse Guidelines

Use this guide when creating or updating test files to leverage the established testing infrastructure. This project has comprehensive test utilities in `tests/utils/` and `tests/base.js` that should be discovered and reused rather than recoded.

## Critical Principle: Reuse Before Recode

**Always check `tests/utils/` and `tests/base.js` for existing functionality before implementing new test helpers.**

The project has:
- Comprehensive mocking patterns for ESM modules
- Shared assertion and reporting utilities
- CLI command execution helpers
- Database client testing patterns
- File system mocking conventions
- External CLI integration patterns (BTP, CF)

## Core Test Infrastructure

### Central Base Utilities (`tests/base.js`)

The `tests/base.js` file provides foundational test utilities used across all test files:

```javascript
import { assert, addContext, exec, fork, myTest } from '../base.js'
```

**Available exports:**

1. **`assert`** - Node.js built-in assertion library
   ```javascript
   assert.strictEqual(actual, expected)
   assert.deepStrictEqual(obj1, obj2)
   assert.ok(value)
   assert.throws(() => { /* code */ }, /error pattern/)
   ```

2. **`addContext`** - Mochawesome context injection for HTML reports
   ```javascript
   addContext(this, { title: 'Debug Info', value: data })
   ```

3. **`exec`** - Child process execution for subprocess testing
   ```javascript
   exec('command', (error, stdout, stderr) => { /* callback */ })
   ```

4. **`fork`** - Child process fork for concurrent execution
   ```javascript
   fork('script.js', args, options)
   ```

5. **`myTest(command, done)`** - Specialized CLI command test helper
   - Executes CLI commands via subprocess
   - Automatically filters debug output from stderr
   - Injects stdout into Mochawesome context
   - Throws on unexpected stderr content
   
   **Usage pattern:**
   ```javascript
   it("returns help output", function (done) {
       const localTest = base.myTest.bind(this)
       localTest("node bin/commandName.js --help", done)
   })
   ```

   **Key behaviors:**
   - Filters lines matching `/^\d{4}-\d{2}-\d{2}T[\d:.]+Z hana-cli/` from stderr
   - Ignores benign stderr patterns (`'- \n\n'`, `'-'`)
   - Automatically adds stdout to test context for reports
   - Requires Mocha's `done` callback pattern

### When to Use `myTest` vs Direct `exec`

- **Use `myTest`**: For CLI command tests that need stderr filtering and automatic context injection
- **Use `exec` directly**: For custom subprocess testing with non-standard output handling

### E2E-Specific Shared Helper (`tests/e2e/helpers.js`)

For optional **live E2E tests**, reuse `tests/e2e/helpers.js` instead of duplicating credential discovery logic.

```javascript
import { getLocalConnectionCredentials } from './helpers.js'

it('live test pattern', function (done) {
    getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
            this.skip()
            return done()
        }

        // run live command assertions
        done()
    }).catch(done)
})
```

Credential resolution order used by the helper:
1. `.cdsrc-private.json` (CDS bind)
2. `default-env-admin.json`
3. `default-env.json`

Important Mocha rule for these tests: use **one** async completion style only. Do not use `async function (done)`.

## Mocking Libraries and Patterns

### ESM Module Mocking with `esmock`

The project uses **esmock** for mocking ES modules (required for `import` syntax):

```javascript
import esmock from 'esmock'

const moduleUnderTest = await esmock('../../utils/module.js', {
    'child_process': {
        exec: (cmd, callback) => {
            callback(null, { stdout: mockOutput, stderr: null })
        }
    },
    'fs': {
        existsSync: () => true,
        readFileSync: () => 'mock content'
    }
})
```

**Key esmock patterns:**

1. **Import in describe/it blocks** (not at module level):
   ```javascript
   describe('module tests', () => {
       it('should mock behavior', async () => {
           const module = await esmock('../../utils/target.js', { /* mocks */ })
           // Test with mocked dependencies
       })
   })
   ```

2. **Mock external commands** (child_process.exec):
   ```javascript
   const btp = await esmock('../../utils/btp.js', {
       child_process: {
           exec: (cmd, callback) => {
               callback(null, { stdout: 'mocked output' })
           }
       }
   })
   ```

3. **Mock file system** (for simple cases):
   ```javascript
   const connections = await esmock('../../utils/connections.js', {
       fs: {
           existsSync: () => true,
           readFileSync: () => '{"key": "value"}'
       }
   })
   ```

4. **Multiple dependency mocks**:
   ```javascript
   const module = await esmock('../../utils/target.js', {
       'dependency-one': { method: () => 'mock1' },
       'dependency-two': { method: () => 'mock2' },
       'fs': { readFileSync: () => 'content' }
   })
   ```

### Filesystem Mocking with `mock-fs`

For complex filesystem operations, use **mock-fs**:

```javascript
import mock from 'mock-fs'

describe('filesystem tests', () => {
    afterEach(() => {
        mock.restore()  // CRITICAL: Always restore in afterEach
    })

    it('should handle file operations', () => {
        mock({
            '/home/user/.config': {
                'config.json': '{"key": "value"}',
                'nested': {
                    'file.txt': 'content'
                }
            }
        })

        // Test code that uses fs operations
    })
})
```

**Critical rules:**
- Always call `mock.restore()` in `afterEach` to prevent test pollution
- Define complete directory structures including parent directories
- Use realistic paths matching your target environment (Windows/Unix)

### Spy/Stub/Mock with `sinon`

For monitoring function calls and behavior:

```javascript
import sinon from 'sinon'

describe('component tests', () => {
    afterEach(() => {
        sinon.restore()  // CRITICAL: Restore all stubs
    })

    it('should stub database calls', () => {
        const mockDb = {
            preparePromisified: sinon.stub(),
            statementExecPromisified: sinon.stub()
        }

        mockDb.preparePromisified.resolves(mockStatement)
        mockDb.statementExecPromisified.resolves(mockData)

        // Test with stubbed methods
        
        expect(mockDb.preparePromisified.calledOnce).to.be.true
    })
})
```

**Sinon patterns:**
- **Stub**: Replace method with controlled behavior
  ```javascript
  sinon.stub().resolves(value)
  sinon.stub().rejects(error)
  sinon.stub().returns(value)
  ```

- **Spy**: Monitor calls without changing behavior
  ```javascript
  const spy = sinon.spy(object, 'method')
  expect(spy.calledOnce).to.be.true
  expect(spy.calledWith(arg1, arg2)).to.be.true
  ```

- **Always restore**: Use `sinon.restore()` in `afterEach`

## Assertion Libraries

### Node.js `assert` (Primary)

Use for most tests:

```javascript
import { assert } from '../base.js'

assert.strictEqual(actual, expected)           // ===
assert.deepStrictEqual(obj1, obj2)             // Deep equality
assert.ok(value)                                // Truthy
assert.notOk(value)                             // Falsy
assert.throws(() => { code }, /pattern/)        // Error throwing
assert.doesNotThrow(() => { code })             // No error
```

### Chai `expect` (Alternative)

Some tests use Chai for more expressive syntax:

```javascript
import { expect } from 'chai'

expect(value).to.equal(expected)
expect(value).to.be.true
expect(value).to.be.an('object')
expect(array).to.have.length(3)
expect(obj).to.have.property('key')
expect(fn).to.throw(/pattern/)
```

**Convention**: New tests should prefer `assert` for consistency, but `expect` is acceptable for complex assertions.

## Test Utility Files Reference

### `tests/utils/base.Test.js`

Tests core CLI infrastructure from `utils/base.js`:

**What's tested:**
- `isDebug()` - Debug flag detection
- `isGui()` - GUI mode detection  
- `getBuilder()` - Yargs builder construction with connection/debug options
- `getPromptSchema()` - Prompt schema generation
- `promptHandler()` - Command prompt handling
- Color utilities and output formatters
- Bundle and localization functions

**Reusable patterns:**
```javascript
import * as base from '../../utils/base.js'

// Test builder construction
const builder = base.getBuilder(input, includeConn, includeDebug)
assert.ok(builder.debug)
assert.ok(builder.admin)

// Test debug flag handling
const result = base.isDebug({ debug: true })
assert.strictEqual(result, true)
```

### `tests/utils/connections.Test.js`

Tests connection utilities from `utils/connections.js`:

**What's tested:**
- `getFileCheckParents()` - File discovery up directory tree (5 levels)
- `getPackageJSON()` - package.json discovery
- Environment detection utilities
- Configuration file loading

**Reusable patterns:**
```javascript
// Mock file existence checking
const connections = await esmock('../../utils/connections.js', {
    fs: {
        existsSync: () => callCount++ === 1  // Found on second attempt
    }
})

const result = connections.getFileCheckParents('package.json')
expect(result).to.equal(path.join('..', 'package.json'))
```

**Key insight**: `getFileCheckParents` checks exactly 5 parent levels

### `tests/utils/database.Test.js`

Tests database client from `utils/database/index.js`:

**What's tested:**
- `dbClientClass` constructor
- `adjustWildcard()` - Convert `*` to `%` for SQL
- `schemaCalculation()` - Schema resolution logic
- `getPrompts()`, `getKind()` - Getter methods

**Reusable patterns:**
```javascript
import dbClientClass from '../../utils/database/index.js'

const prompts = { profile: 'test', schema: 'MYSCHEMA' }
const optionsCDS = { kind: 'hana', credentials: { schema: 'DBADMIN' } }
const instance = new dbClientClass(prompts, optionsCDS)

// Test wildcard conversion
assert.strictEqual(instance.adjustWildcard('*'), '%')

// Test schema calculation with CURRENT_SCHEMA token
prompts.schema = '**CURRENT_SCHEMA**'
const schema = instance.schemaCalculation(prompts, optionsCDS)
assert.strictEqual(schema, 'DBADMIN')
```

### `tests/utils/locale.Test.js`

Tests internationalization utilities from `utils/locale.js`:

**What's tested:**
- `getLocale()` - Locale detection from environment variables
- `normalizeLocale()` - Remove encoding suffixes
- Priority order: `LC_ALL` > `LC_MESSAGES` > `LANG` > `LANGUAGE`

**Reusable patterns:**
```javascript
import { getLocale, normalizeLocale } from '../../utils/locale.js'

// Test with mock environment
const testEnv = { 
    LC_ALL: 'en_US.UTF-8',
    LANG: 'de_DE.UTF-8'
}
const result = getLocale(testEnv)
assert.strictEqual(result, 'en_US.UTF-8')  // LC_ALL wins

// Test normalization
assert.strictEqual(normalizeLocale('de_DE.UTF-8'), 'de_DE')
```

### `tests/utils/sqlInjection.Test.js`

Tests SQL injection protection from `utils/sqlInjection.js`:

**What's tested:**
- `whitespaceTable` - Whitespace character detection
- `separatorTable` - SQL separator detection
- `isAcceptableQuotedParameter()` - Quote validation
- `isAcceptableParameter()` - SQL token validation

**Reusable patterns:**
```javascript
import * as sqlInjection from '../../utils/sqlInjection.js'

// Test parameter validation
assert.strictEqual(sqlInjection.isAcceptableParameter('TABLE_NAME'), true)
assert.strictEqual(sqlInjection.isAcceptableParameter('TABLE--comment'), false)

// Test quoted parameter handling
assert.strictEqual(sqlInjection.isAcceptableQuotedParameter('normal'), true)
assert.strictEqual(sqlInjection.isAcceptableQuotedParameter('test"value'), false)
```

**Security note**: These utilities validate user input before SQL operations

### `tests/utils/btp.Test.js`

Tests BTP CLI integration from `utils/btp.js`:

**What's tested:**
- `getVersion()` - BTP CLI version detection
- `getInfo()` - BTP CLI user and config info
- `getBTPConfig()` - Config file discovery
- `getBTPTarget()` - Target subaccount/directory
- Config file resolution with environment variables

**Reusable patterns:**
```javascript
// Mock BTP CLI execution
const btp = await esmock('../../utils/btp.js', {
    child_process: {
        exec: (cmd, callback) => {
            callback(null, { stdout: mockBTPOutput })
        }
    }
})

// Mock config file discovery
mock({
    '/home/user/.config/.btp': {
        'config.json': JSON.stringify({ key: 'value' })
    }
})

// Clean up environment
afterEach(() => {
    delete process.env.BTP_CLIENTCONFIG
    delete process.env.APPDATA
    delete process.env.HOME
})
```

**Environment variables checked:**
1. `BTP_CLIENTCONFIG` (direct path)
2. `APPDATA` (Windows: `%APPDATA%\.btp\config.json`)
3. `HOME` (Unix: `$HOME/.config/.btp/config.json`)

### `tests/utils/cf.Test.js`

Tests Cloud Foundry CLI integration from `utils/cf.js`:

**What's tested:**
- `getVersion()` - CF CLI version detection
- `getCFConfig()` - CF config discovery
- `getCFOrg()`, `getCFOrgName()`, `getCFOrgGUID()` - Organization info
- `getCFSpace()`, `getCFSpaceName()`, `getCFSpaceGUID()` - Space info
- `getCFTarget()` - Current CF target
- `getHANAInstances()` - HANA service instances

**Reusable patterns:**
```javascript
// Mock CF CLI execution
const cf = await esmock('../../utils/cf.js', {
    child_process: {
        exec: (cmd, callback) => {
            callback(null, { stdout: mockCFOutput, stderr: null })
        }
    }
})

// Clear cache between tests
afterEach(async () => {
    const cf = await import('../../utils/cf.js')
    if (cf.clearCFConfigCache) {
        cf.clearCFConfigCache()
    }
})
```

**Error handling**: CF tests validate both stdout and stderr

### `tests/utils/dbInspect.Test.js`

Tests database metadata utilities from `utils/dbInspect.js`:

**What's tested:**
- `getHANAVersion()` - Extract and parse HANA version
- Version caching and major version extraction
- Calculation view detection (HANA 2+ feature)

**Reusable patterns:**
```javascript
import * as dbInspect from '../../utils/dbInspect.js'
import sinon from 'sinon'

beforeEach(() => {
    mockDb = {
        preparePromisified: sinon.stub(),
        statementExecPromisified: sinon.stub()
    }
    dbInspect.resetHANAVersionCache()
})

// Mock HANA version query
mockDb.preparePromisified.resolves(mockStatement)
mockDb.statementExecPromisified.resolves([{
    VERSION: '2.00.065.00.1649859137'
}])

const result = await dbInspect.getHANAVersion(mockDb)
expect(result.versionMajor).to.equal('2')
```

**Cache management**: Always call `resetHANAVersionCache()` in `beforeEach`

### `tests/utils/massConvert.Test.js`

Tests mass conversion utilities from `utils/massConvert.js`:

**What's tested:**
- Module structure and exports
- Conversion functions (`hdbtableSQL`, `hdbmigrationtable`, `hdbcds`)
- ZIP file generation
- Bulk operation workflows

**Note**: This module has placeholder tests validating module structure. Consider expanding with integration tests for actual conversion operations.

### `tests/utils/profileIntegration.Test.js`

Integration tests for database profiles (PostgreSQL, SQLite):

**What's tested:**
- `PostgresClient` instantiation and schema handling
- `SqliteClient` instantiation
- Profile-specific configuration patterns

**Reusable patterns:**
```javascript
import dbClientClass from '../../utils/database/index.js'
import PostgresClient from '../../utils/database/postgres.js'

const prompts = { 
    profile: 'postgres',
    schema: 'public',
    table: '*',
    limit: 200
}
const optionsCDS = { 
    kind: 'postgres',
    credentials: { /* connection details */ }
}

const instance = new PostgresClient(prompts, optionsCDS)
assert.ok(instance instanceof PostgresClient)
assert.ok(instance instanceof dbClientClass)
```

**Integration characteristics:**
- Longer timeout recommended: `this.timeout(30000)`
- Tests actual database client behavior
- Validates inheritance hierarchy

### `tests/utils/versionCheck.Test.js`

Tests version validation from `utils/versionCheck.js`:

**What's tested:**
- `checkVersion()` - Node.js version compatibility
- Promise resolution without errors
- Performance (completes within 5 seconds)

**Reusable patterns:**
```javascript
import { checkVersion } from '../../utils/versionCheck.js'

it('should return a promise', function () {
    const result = checkVersion()
    assert.ok(result instanceof Promise)
})

it('should complete within timeout', async function () {
    this.timeout(10000)
    const startTime = Date.now()
    await checkVersion()
    const duration = Date.now() - startTime
    assert.ok(duration < 5000)
})
```

## Common Test Patterns

### Pattern: External CLI Command Testing

For commands that interact with external CLIs (BTP, CF, kubectl, etc.):

```javascript
// 1. Mock child_process.exec
const module = await esmock('../../utils/target.js', {
    child_process: {
        exec: (cmd, callback) => {
            callback(null, { stdout: mockOutput, stderr: null })
        }
    }
})

// 2. Clear caches in afterEach
afterEach(async () => {
    const module = await import('../../utils/target.js')
    if (module.clearCache) {
        module.clearCache()
    }
})

// 3. Clean environment variables
afterEach(() => {
    delete process.env.CONFIG_VAR
})

// 4. Test both success and error paths
it('should handle execution failure', async () => {
    const module = await esmock('../../utils/target.js', {
        child_process: {
            exec: (cmd, callback) => {
                callback(new Error('Command not found'))
            }
        }
    })

    try {
        await module.getVersion()
        expect.fail('Should have thrown')
    } catch (error) {
        expect(error.message).to.include('Command not found')
    }
})
```

### Pattern: Database Client Testing

For database operation tests:

```javascript
// 1. Create comprehensive mock
let mockDb

beforeEach(() => {
    mockDb = {
        preparePromisified: sinon.stub(),
        statementExecPromisified: sinon.stub(),
        loadProcedurePromisified: sinon.stub(),
        callProcedurePromisified: sinon.stub()
    }
})

afterEach(() => {
    sinon.restore()
})

// 2. Stub sequential operations
it('should query database', async () => {
    mockDb.preparePromisified.resolves(mockStatement)
    mockDb.statementExecPromisified.resolves(mockResults)
    
    const result = await module.queryDatabase(mockDb)
    
    expect(mockDb.preparePromisified.calledOnce).to.be.true
    expect(result).to.deep.equal(expectedResults)
})

// 3. Test error handling
it('should handle query failure', async () => {
    mockDb.preparePromisified.rejects(new Error('Connection lost'))
    
    try {
        await module.queryDatabase(mockDb)
        expect.fail('Should have thrown')
    } catch (error) {
        expect(error.message).to.include('Connection lost')
    }
})
```

### Pattern: File Discovery Testing

For utilities that search for files in parent directories:

```javascript
// 1. Use call counting to simulate file location
let callCount = 0
const module = await esmock('../../utils/target.js', {
    fs: {
        existsSync: () => {
            callCount++
            return callCount === 3  // Found on 3rd attempt (2 levels up)
        }
    }
})

const result = module.findFile('config.json')
expect(result).to.equal(path.join('..', '..', 'config.json'))
expect(callCount).to.equal(3)

// 2. Test not-found scenario
callCount = 0
const module2 = await esmock('../../utils/target.js', {
    fs: {
        existsSync: () => {
            callCount++
            return false
        }
    }
})

const result2 = module2.findFile('config.json')
expect(result2).to.be.undefined
expect(callCount).to.equal(5)  // Checked max levels
```

## Best Practices

### 1. Always Clean Up Mocks

```javascript
afterEach(() => {
    sinon.restore()        // Restore sinon stubs
    mock.restore()         // Restore mock-fs
    delete process.env.VAR // Clean environment
})
```

### 2. Use Appropriate Timeouts

```javascript
// Default: 10 seconds (from .mocharc.json)

describe('integration tests', function () {
    this.timeout(30000)  // Set for entire suite
    
    it('expensive operation', function () {
        this.timeout(60000)  // Set for single test
        // ...
    })
})
```

### 3. Test Both Success and Error Paths

```javascript
describe('function', () => {
    it('should succeed with valid input', () => {
        // Happy path
    })

    it('should handle null input', () => {
        // Null case
    })

    it('should throw on invalid input', () => {
        assert.throws(() => fn(invalid), /error pattern/)
    })
})
```

### 4. Use Descriptive Test Names

```javascript
// ✅ Good
it('should return schema from credentials when CURRENT_SCHEMA is specified')

// ❌ Bad
it('should work')
it('test schema')
```

### 5. Prefer Strict Assertions

```javascript
// ✅ Strict equality
assert.strictEqual(actual, expected)
assert.deepStrictEqual(obj1, obj2)

// ❌ Loose equality (avoid)
assert.equal(actual, expected)
assert.deepEqual(obj1, obj2)
```

### 6. Test Boundary Conditions

```javascript
it('should check up to 5 parent levels', async () => {
    // Test the configured limit
    expect(callCount).to.equal(5)
})

it('should handle single digit major version', async () => {
    // Test edge cases
    expect(result.versionMajor).to.equal('1')
})
```

### 7. Cache Management

Many utilities cache results for performance. Always reset caches:

```javascript
beforeEach(() => {
    dbInspect.resetHANAVersionCache()
})

afterEach(async () => {
    const cf = await import('../../utils/cf.js')
    cf.clearCFConfigCache?.()
})
```

## Integration with Test Infrastructure

### Mocha Configuration (`.mocharc.json`)

The project uses:
- **Parallel execution**: 16 jobs
- **Default timeout**: 10 seconds
- **Reporter**: spec + mochawesome
- **Helper**: `tests/helper.js` (loaded via `require`)

### Mochawesome Context Injection

Always use `addContext` for debugging information:

```javascript
import { addContext } from '../base.js'

it('test name', function () {
    addContext(this, { title: 'Input', value: inputData })
    addContext(this, { title: 'Output', value: outputData })
    // Test logic
})
```

**Note**: `addContext` requires `this` context, so use `function()` not arrow functions.

### Test Execution Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/utils/base.Test.js

# Run with coverage
npm run coverage
```

## Quick Reference: What to Import

### For CLI Command Tests
```javascript
import * as base from './base.js'
const localTest = base.myTest.bind(this)
```

### For Unit Tests (assert-based)
```javascript
import { describe, it } from 'mocha'
import { assert } from '../base.js'
import * as utilities from '../../utils/target.js'
```

### For Unit Tests (chai-based)
```javascript
import { expect } from 'chai'
import esmock from 'esmock'
import sinon from 'sinon'
```

### For Integration Tests
```javascript
import { describe, it, before, after } from 'mocha'
import { assert, addContext, exec } from '../base.js'
import dbClientClass from '../../utils/database/index.js'
```

## Summary Checklist

When creating a new test file:

- [ ] Check `tests/base.js` for applicable utilities (`myTest`, `assert`, `addContext`)
- [ ] Search `tests/utils/` for similar test patterns to reuse
- [ ] Use `esmock` for ESM module mocking (not `proxyquire` or `rewire`)
- [ ] Use `sinon` for stubs/spies when needed
- [ ] Use `mock-fs` for complex filesystem mocking
- [ ] Always clean up mocks in `afterEach`
- [ ] Use strict assertions (`strictEqual`, `deepStrictEqual`)
- [ ] Test both success and error paths
- [ ] Set appropriate timeouts for integration tests
- [ ] Add context with `addContext` for debugging
- [ ] Use descriptive test names
- [ ] Follow the established file naming pattern (`*.Test.js` or `*.test.js`)
- [ ] For optional live E2E tests, use `tests/e2e/helpers.js` (`getLocalConnectionCredentials`) instead of local credential parsers
- [ ] Avoid Mocha overspecification: do not combine `async` and `done` in the same test

## Related Guidelines

- See [testing.instructions.md](testing.instructions.md) for general test structure and organization
- See [e2e-test-creation.instructions.md](e2e-test-creation.instructions.md) for E2E-specific patterns and live helper usage
- See CLI command examples in `tests/*.Test.js` for subprocess testing patterns
- See `tests/helper.js` for global test setup
