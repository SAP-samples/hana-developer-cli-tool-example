# E2E Test Examples & Patterns

## Pattern 1: Simple Command Test with Output Validation

```javascript
import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'

describe('Export Command E2E', () => {
  it('exports data with specified format', function (done) {
    const localTest = base.myTest.bind(this)
    localTest('node bin/export.js --table CUSTOMERS --format json', done)
  })

  it('handles missing required options', function (done) {
    const localTest = base.myTest.bind(this)
    localTest('node bin/export.js', (err, stdout, stderr) => {
      expect(stderr).to.include('required')
      done()
    })
  })
})
```

## Pattern 2: Interactive Prompt Testing

For commands that use interactive prompts, use stdin redirection:

```javascript
describe('Connect Command with Prompts', () => {
  it('prompts for password when not provided', function (done) {
    const cmd = 'echo "mypassword" | node bin/connect.js --connection localhost:30015 --user SYSTEM'
    base.exec(cmd, (err, stdout, stderr) => {
      if (!err) {
        expect(stdout).to.include('success') // Adjust based on actual output
      }
      done(err)
    })
  })
})
```

## Pattern 3: Multi-Step Workflow

```javascript
describe('Complete Data Pipeline E2E', () => {
  it('validates and exports data in one workflow', async function () {
    // Step 1: Validate data
    await new Promise((resolve, reject) => {
      const validate = base.myTest.bind(this)
      validate('node bin/dataValidator.js --table ORDERS', (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    // Step 2: Export validated data
    await new Promise((resolve, reject) => {
      const exp = base.myTest.bind(this)
      exp('node bin/export.js --table ORDERS --format csv', (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  })
})
```

## Pattern 4: Testing with Connection Setup

```javascript
describe('Schema Inspection E2E', () => {
  let connection

  before(async function () {
    // Set up test connection
    connection = {
      host: 'localhost',
      port: 30015,
      user: 'SYSTEM',
      password: process.env.HANA_PASSWORD
    }
  })

  it('lists all tables in schema', function (done) {
    const cmd = `node bin/tables.js --connection ${connection.host}:${connection.port} --user ${connection.user}`
    const localTest = base.myTest.bind(this)
    localTest(cmd, (err, stdout) => {
      expect(stdout).to.include('TABLE_NAME')
      done(err)
    })
  })

  after(function () {
    // Cleanup if needed
  })
})
```

## Pattern 5: Error Handling & Edge Cases

```javascript
describe('Export Command Error Handling', () => {
  it('fails gracefully with invalid table name', function (done) {
    const localTest = base.myTest.bind(this)
    localTest('node bin/export.js --table NONEXISTENT_TABLE', (err, stdout, stderr) => {
      // Command should fail
      expect(err).to.exist
      expect(stderr || stdout).to.include('not found') // Adjust message
      done()
    })
  })

  it('handles connection timeout', function (done) {
    this.timeout(15000) // Extend timeout for this test
    const localTest = base.myTest.bind(this)
    localTest('node bin/connect.js --connection invalid-host:99999', (err) => {
      expect(err).to.exist
      done()
    })
  })

  it('validates option format', function (done) {
    const localTest = base.myTest.bind(this)
    localTest('node bin/export.js --format invalid', (err, stderr) => {
      expect(stderr || err).to.exist
      done()
    })
  })
})
```

## Pattern 6: Output Parsing & Validation

```javascript
describe('Data Operations E2E', () => {
  it('parses JSON output correctly', function (done) {
    const cmd = 'node bin/export.js --table CUSTOMERS --format json'
    base.exec(cmd, (err, stdout) => {
      try {
        const data = JSON.parse(stdout)
        expect(data).to.be.an('array')
        expect(data[0]).to.have.property('id')
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('validates CSV format output', function (done) {
    const cmd = 'node bin/export.js --table CUSTOMERS --format csv'
    base.exec(cmd, (err, stdout) => {
      const lines = stdout.split('\n').filter(l => l)
      expect(lines.length).to.be.greaterThan(1) // Header + data
      expect(lines[0]).to.include(',') // CSV delimiter
      done(err)
    })
  })
})
```

## Pattern 7: Interactive Mode Testing

```javascript
describe('Interactive Mode E2E', () => {
  it('launches interactive menu', function (done) {
    this.timeout(5000)
    const cmd = 'echo "0" | node bin/interactive.js' // Select first option then exit
    base.exec(cmd, (err, stdout) => {
      expect(stdout).to.include('search') // Menu should appear
      done(err)
    })
  })

  it('displays recent commands from history', function (done) {
    const cmd = 'echo "2" | node bin/interactive.js' // Select "Recent Commands"
    base.exec(cmd, (err, stdout) => {
      // Verify history display
      done(err)
    })
  })
})
```

## Pattern 8: Testing Status & Health Checks

```javascript
describe('System Health E2E', () => {
  it('performs system health check', function (done) {
    this.timeout(10000)
    const cmd = 'node bin/healthCheck.js --connection localhost:30015'
    base.exec(cmd, (err, stdout) => {
      expect(stdout).to.include('status') // Should contain status indicator
      done(err)
    })
  })

  it('validates system requirements', function (done) {
    const cmd = 'node bin/systemInfo.js'
    const localTest = base.myTest.bind(this)
    localTest(cmd, (err, stdout) => {
      expect(stdout).to.include('Node.js')
      expect(stdout).to.include('Platform')
      done(err)
    })
  })
})
```

## Pattern 9: Using Test Fixtures

```javascript
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Data Sync E2E', () => {
  let testData

  before(function () {
    // Load test fixture
    const fixturePath = join(process.cwd(), 'tests', 'fixtures', 'sample-data.json')
    testData = JSON.parse(readFileSync(fixturePath, 'utf8'))
  })

  it('syncs fixture data correctly', function (done) {
    const cmd = `node bin/dataSync.js --data '${JSON.stringify(testData)}' --mode test`
    base.exec(cmd, (err, stdout) => {
      expect(stdout).to.include('synced')
      done(err)
    })
  })
})
```

## Pattern 10: Cleanup & Isolation

```javascript
describe('Import/Export Workflow', () => {
  const testFile = 'test-export.csv'

  afterEach(function () {
    // Clean up test files
    try {
      if (require('fs').existsSync(testFile)) {
        require('fs').unlinkSync(testFile)
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  })

  it('exports and imports data correctly', function (done) {
    // First: export to file
    const export_cmd = `node bin/export.js --table TEST --file ${testFile}`
    base.exec(export_cmd, (err) => {
      if (err) return done(err)

      // Then: import from file
      const import_cmd = `node bin/import.js --file ${testFile} --table TEST_IMPORTED`
      base.exec(import_cmd, (err) => {
        done(err)
      })
    })
  })
})
```

## Quick Reference: Common Assertions

```javascript
expect(output).to.include('text')           // Contains text
expect(output).to.match(/regex/)            // Matches regex
expect(data).to.be.an('array')              // Type checking
expect(data).to.have.length(5)              // Length
expect(data[0]).to.have.property('id')      // Property exists
expect(error).to.exist                      // Error occurred
expect(error).to.not.exist                  // No error
expect(stdout).to.match(/success|completed/)// Alternative values
```

## Running Your E2E Tests

```bash
# Run E2E tests only
npm run test:cli -- --grep "E2E|e2e"

# Run with coverage
npm run coverage

# Run sequential (no parallelization)
npm run test:sequential

# Generate report
npm run test:report

# Run specific test file
npm test tests/export.e2e.Test.js
```
