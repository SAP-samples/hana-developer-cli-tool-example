# Testing & Quality Assurance

Comprehensive testing infrastructure and practices.

## Test Suite Overview

HANA CLI includes over 300 tests across multiple categories.

For detailed coverage analysis, see: [TEST_COVERAGE_ANALYSIS.md](../../../TEST_COVERAGE_ANALYSIS.md)

## Unit Tests

Testing individual functions and modules in isolation.

**Location:** `tests/unit/`

**Coverage Areas:**
- Utility functions (formatting, validation, parsing)
- Database operation builders
- Error handling
- Data transformation

**Example:**
```bash
npm test -- tests/unit/utils/formatting.js
```

## Integration Tests

Testing how components work together.

**Location:** `tests/integration/`

**Coverage Areas:**
- Command workflows (import → export → compare)
- Database connections
- File I/O operations
- Error recovery

**Example:**
```bash
npm test -- tests/integration/import-export.js
```

## End-to-End Tests

Testing complete workflows through the CLI.

**Location:** `tests/e2e/`

**Coverage Areas:**
- Full command execution
- Exit codes
- Console output
- Error messages

**Example:**
```bash
npm test -- tests/e2e/import.e2e.js
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test -- tests/unit/utils/validation.js
```

### Watch Mode
```bash
npm test -- --watch
```

### With Coverage
```bash
npm test -- --coverage
```

## Using Mocks

Tests use mocked database connections:

```javascript
const mockDb = {
  execute: jest.fn().mockResolvedValue({
    rows: [{ id: 1, name: 'Test' }]
  })
}
```

## Test Assertions

Using Jest matchers:

```javascript
expect(result).toBeDefined()
expect(result).toEqual(expected)
expect(result).not.toThrow()
expect(mockDb.execute).toHaveBeenCalled()
```

## Coverage Goals

Target metrics:
- **Line Coverage:** 85%+
- **Branch Coverage:** 80%+
- **Function Coverage:** 90%+

Currently tracked in: [TEST_COVERAGE_COMPLETION_SUMMARY.md](../../../TEST_COVERAGE_COMPLETION_SUMMARY.md)

## Performance Benchmarks

Startup time benchmarks:
- **Before optimization:** 2.2 seconds
- **After optimization:** 700ms
- **Improvement:** ~7x faster

See: [OPTIMIZATION_PATTERN.md](../../../OPTIMIZATION_PATTERN.md)

## CI/CD Testing

Automated testing on every commit:
- Run full test suite
- Generate coverage reports
- Block merging if tests fail
- Report to pull request

## Testing Best Practices

1. **Arrange-Act-Assert Pattern**
   ```javascript
   // Arrange
   const input = { name: 'test' }
   
   // Act
   const result = processData(input)
   
   // Assert
   expect(result).toBeDefined()
   ```

2. **Descriptive Test Names**
   ```javascript
   it('should throw error when file does not exist', () => {
     // test code
   })
   ```

3. **Single Responsibility**
   - Test one thing per test
   - Clear expected behavior
   - Easy to debug when failing

4. **Mock External Dependencies**
   - Database calls
   - File system operations
   - Network requests

5. **Use Fixtures**
   - Prepare test data
   - Reusable across tests
   - Easier maintenance

## Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Single Test
```bash
node --inspect-brk node_modules/.bin/jest tests/unit/specific-test.js
```

Then open `chrome://inspect` in Chrome DevTools.

### Print Debug Info
```javascript
console.log('Current state:', { input, output })
```

## Writing New Tests

For new commands:
1. Create test file: `tests/unit/commands/new-command.js`
2. Test builder function
3. Test handler function (mocked)
4. Test error cases
5. Add integration test: `tests/integration/new-command.js`

Example template:
```javascript
describe('NewCommand', () => {
  it('should accept required options', () => {
    // test code
  })
  
  it('should throw error without options', () => {
    // test code
  })
  
  it('should execute handler', async () => {
    // test code
  })
})
```

## Test Data

Sample test data files in `tests/fixtures/`:
- CSV files for import testing
- Excel files for format testing
- SQL scripts for schema testing
- Sample JSON for output validation

## Performance Profiling

Identify bottlenecks:
```bash
node --prof app/import.js
node --prof-process isolate-*.log > profile.txt
```

## Continuous Monitoring

Tools in use:
- Jest for test execution
- Coverage reports showing gaps
- Benchmarks tracking performance
- GitHub Actions for CI/CD

See Also:
- [Development Guide](../index.md)
- [Architecture](./project-structure.md)
- [Troubleshooting](../../troubleshooting.md)
