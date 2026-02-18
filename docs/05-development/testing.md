# Testing & Quality Assurance

Comprehensive testing infrastructure for HANA CLI with over 1247+ tests covering utilities, routes, and CLI integration.

## Overview

This document describes the unit tests and integration tests that provide comprehensive coverage for:

- Utility functions in `/utils`
- Route handlers in `/routes`  
- CLI command integration
- Cross-platform compatibility
- HTTP API endpoints
- WebSocket communication

**Total Tests Added: 1247+**

- **Utils Tests: 438+** - Core utilities and helper functions
- **Routes Tests: 368+** - HTTP routes and API endpoints
- **CLI Integration Tests: 200+** - Command-line interface
- **HTTP Integration Tests: 128+** - HTTP request/response handling
- **Cross-Platform Tests: 165+** - Windows, Linux, macOS support

**Test Execution Time: ~25-35 minutes for full suite**

## Utilities Tests

Tests for utility functions in `/utils` folder covering database, connection, inspection, and CLI integration utilities.

### Key Test Files

**sqlInjection.Test.js** - 40 tests
Tests for SQL injection protection utilities covering whitespace handling, parameter validation, and quote escaping.

**locale.Test.js** - 8 tests
Tests for locale detection with environment variable priority handling.

**versionCheck.Test.js** - 3 tests
Tests for Node.js version validation.

**base.Test.js** - 33 tests
Tests for core base utility functions including debug flag detection, GUI mode, command builders, and prompt schema generation.

**database.Test.js** - 14 tests
Tests for database client class covering constructor initialization, wildcard conversion, and schema calculation.

**connections.Test.js** - 60+ tests
Tests for connection management covering file discovery, environment detection, and connection creation from various sources.

**dbInspect.Test.js** - 85+ tests  
Tests for database inspection and metadata retrieval including version detection, calculation view identification, and object definition retrieval.

**btp.Test.js** - 45+ tests
Tests for BTP CLI interaction utilities covering version detection, info parsing, configuration reading, and target hierarchy.

**cf.Test.js** - 50+ tests
Tests for Cloud Foundry CLI interaction including org/space management and HANA instance discovery.

**xs.Test.js** - 60+ tests
Tests for XSA CLI interaction covering configuration parsing and service discovery.

**massConvert.Test.js** - 40+ tests
Tests for mass conversion utility module structure and export validation.

**profileIntegration.Test.js** - 70+ tests
Integration tests for PostgreSQL and SQLite profile functionality with actual database client behavior.

## Routes Tests

Tests for HTTP route handlers and API endpoints accessed through the web server.

### Key Test Files

**index.Test.js** - 30 tests (enhanced)
Integration tests for the index route handler covering GET and PUT operations with mocked HTTP requests/responses.

**hanaList.Test.js** - 50+ tests (enhanced)
Integration tests for HANA list routes covering route registration and path validation.

**docs.Test.js** - 45 tests
Integration tests for documentation routes (README, changelog) with markdown to HTML conversion.

**hanaInspect.Test.js** - 55 tests
Integration tests for HANA inspect routes covering table and view inspection operations.

**webSocket.Test.js** - 40 tests
Integration tests for WebSocket routes and HTTP endpoints.

**webSocket.e2e.Test.js** - 60+ tests
End-to-end tests for WebSocket real-time communication with real client-server interaction.

**excel.Test.js** - 17 tests
Integration tests for Excel export routes (currently disabled with 503 status).

**dfa.Test.js** - 53 tests
Integration tests for Digital Foundation Adapter routes with catalogue and context help.

**static.Test.js** - 38 tests
Integration tests for static file serving and Fiori sandbox configuration.

### HTTP Integration Tests (with supertest)

Additional HTTP integration tests for full end-to-end request/response validation:

- **index.http.Test.js** - 17 tests
- **docs.http.Test.js** - 26 tests
- **static.http.Test.js** - 32 tests
- **fullApp.http.Test.js** - 53 tests

## CLI Integration Tests

### genericFlags.Test.js - 200+ tests

Comprehensive cross-command integration tests for generic CLI flags tested across 60+ commands:

- `--debug` / `--Debug` - Enables debug output
- `--quiet` / `--disableVerbose` - Suppresses verbose output
- `--help` / `-h` - Displays command help
- `--admin` / `-a` - Uses admin connection
- `--conn` - Specifies connection file

**Commands Tested:** Database commands, inspect commands, HDI commands, system queries, cloud instances, utilities, connections, and BTP commands.

### errorHandling.Test.js - 30+ tests

Error handling validation for invalid parameters, connection errors, SQL injection prevention, and special character handling.

### flagValidation.Test.js - 40+ tests

Command-line flag validation covering limit values, schema/table names, output formats, and boolean flags.

### outputFormats.Test.js - 25+ tests

Output format validation for SQL, JSON, YAML, CDS, CDL, EDMX, OpenAPI, GraphQL, and database-specific formats.

### commandAliases.Test.js - 30+ tests

Command alias testing ensuring all aliases work identically to main commands.

### edgeCases.Test.js - 50+ tests

Edge case and boundary condition testing for empty results, wildcards, special characters, Unicode, case sensitivity, and concurrent execution.

### tableOutput.Test.js - 20 tests

Unit tests for table output enhancements covering column width management, pagination, and type-aware formatting.

### querySimple.Test.js - 8 tests (enhanced)

Integration tests for querySimple command with table format output and file export validation.

### typeAwareFormatting.Test.js - 20 tests

Type-aware formatting tests for dates, numbers, text, and NULL values in text exports.

## Test Framework

**Test Runner:** Mocha  
**Assertion Library:** Node.js built-in assert  
**Reporter:** Mochawesome (generates HTML reports)  
**Configuration:** tests/.mocharc.json

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Utils tests only
npm run test:utils

# Routes tests only  
npm run test:routes

# CLI tests only
npm run test:cli

# Generic flags tests
npm test tests/genericFlags.Test.js
```

### Run Specific Test Files

```bash
# Database utilities
npm test tests/utils/database.Test.js

# Connection utilities
npm test tests/utils/connections.Test.js

# Route integration
npm test tests/routes/index.Test.js

# WebSocket end-to-end
npm test tests/routes/webSocket.e2e.Test.js
```

### Run HTTP Integration Tests

```bash
# All HTTP tests
npm test tests/routes/*.http.Test.js

# Specific HTTP test
npm test tests/routes/index.http.Test.js
```

## Test Reports

After running tests, Mochawesome generates HTML reports in:

```
mochawesome-report/test-report_XXX.html
```

Open in a browser for detailed results with pass/fail statistics and execution times.

## Code Coverage

The project uses nyc (Istanbul) for code coverage reporting.

### Running Coverage Reports

```bash
# Run all tests with coverage
npm run coverage

# Run specific suites with coverage
npm run coverage:cli
npm run coverage:utils
npm run coverage:routes

# Check coverage meets thresholds
npm run coverage:check
```

### Coverage Configuration

Coverage settings in `.nycrc.json`:

- **Lines:** 80% target
- **Statements:** 80% target  
- **Functions:** 80% target
- **Branches:** 80% target

HTML coverage reports generated in `./coverage/index.html`

## Cross-Platform Testing

Tests validate behavior across Windows, Linux, and macOS:

- Path handling with platform-specific separators
- Environment variable detection
- Platform-specific config paths
- Line ending management (LF vs CRLF)
- ES module compatibility

### Test Organization

```bash
describe('Feature @all', () => {
  // Runs on all platforms
})

describe('Windows Paths @windows', () => {
  if (process.platform !== 'win32') this.skip()
  // Windows-only tests
})
```

### CI/CD Integration

GitHub Actions runs full test suite on:
- **Operating Systems:** Ubuntu, Windows, macOS
- **Node.js Versions:** 20.x, 22.x, 24.x

## Testing Best Practices

### Unit Tests

- Focus on pure function testing
- Cover edge cases and error conditions
- Validate input/output contracts
- Test both success and failure paths

### Integration Tests

- Test route registration and structure
- Validate HTTP request/response handling
- Test error propagation through middleware
- Test mocked database connections

### CLI Integration Tests

- Execute actual CLI commands as subprocess
- Validate flag parsing and behavior
- Ensure consistent behavior across commands
- Test cross-command consistency

### End-to-End Tests

- Test complete workflows
- Real network communication (WebSocket tests)
- Concurrent execution scenarios
- Performance under load

## Writing New Tests

When adding new features:

1. Add unit tests for utility functions
2. Add integration tests for route handlers  
3. Add CLI tests for commands
4. Test error cases and edge conditions
5. Test cross-command consistency
6. Validate output formats
7. Test flag combinations

## Test Development Guidelines

When writing tests, follow these patterns:

1. **Clear Test Names:** Describe what is being tested
2. **Arrange-Act-Assert:** Organize test logic clearly
3. **Single Responsibility:** Test one thing per test
4. **Error Path Testing:** Include failure scenarios
5. **Mocked Dependencies:** Mock external systems
6. **Isolated Tests:** Tests should run independently

## Debugging Tests

### Run with Debug Output

```bash
npm test -- --reporter spec tests/targetTest.js
```

### Print Debug Info

```javascript
console.log('Debug info:', variable)
```

### Inspect Specific Test

Add `.only()` to run single test:

```javascript
it.only('should test this', () => {
  // Only this test runs
})
```

See Also:

- [Development Guide](./index.md)
- [Architecture](./architecture/)
- [Troubleshooting](../../troubleshooting.md)
