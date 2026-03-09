# Testing & Quality Assurance

Comprehensive testing infrastructure for HANA CLI with over 1400 tests covering utilities, routes, and CLI integration.

## Overview

This document describes the unit tests and integration tests that provide comprehensive coverage for:

- Utility functions in `/utils`
- Route handlers in `/routes`
- CLI command integration
- Cross-platform compatibility
- HTTP API endpoints
- WebSocket communication
- End-to-end (E2E) command-line workflows
- SAPUI5 user interface automation

### Total Tests: 1500+

- **Utils Tests: 438+** - Core utilities and helper functions
- **Routes Tests: 368+** - HTTP routes and API endpoints
- **CLI Integration Tests: 200+** - Command-line interface
- **HTTP Integration Tests: 128+** - HTTP request/response handling
- **Cross-Platform Tests: 165+** - Windows, Linux, macOS support
- **E2E Tests: 35 test files** - End-to-end command execution workflows
- **UI Tests: 3 test files** - SAPUI5 interface automation with WDI5

### Test Execution Time

- **Unit & Integration Tests**: ~25-35 minutes
- **E2E Tests**: ~5-10 minutes (requires local connection)
- **UI Tests**: ~2-5 minutes per test (requires server + Chrome)

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

### Route Test Files (HTTP Endpoints)

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

### CLI Flag Integration Tests

#### genericFlags.Test.js - 200+ tests

Comprehensive cross-command integration tests for generic CLI flags tested across 60+ commands:

- `--debug` / `--Debug` - Enables debug output
- `--quiet` / `--disableVerbose` - Suppresses verbose output
- `--help` / `-h` - Displays command help
- `--admin` / `-a` - Uses admin connection
- `--conn` - Specifies connection file

**Commands Tested:** Database commands, inspect commands, HDI commands, system queries, cloud instances, utilities, connections, and BTP commands.

#### errorHandling.Test.js - 30+ tests

Error handling validation for invalid parameters, connection errors, SQL injection prevention, and special character handling.

#### flagValidation.Test.js - 40+ tests

Command-line flag validation covering limit values, schema/table names, output formats, and boolean flags.

#### outputFormats.Test.js - 25+ tests

Output format validation for SQL, JSON, YAML, CDS, CDL, EDMX, OpenAPI, GraphQL, and database-specific formats.

#### commandAliases.Test.js - 30+ tests

Command alias testing ensuring all aliases work identically to main commands.

#### edgeCases.Test.js - 50+ tests

Edge case and boundary condition testing for empty results, wildcards, special characters, Unicode, case sensitivity, and concurrent execution.

#### tableOutput.Test.js - 20 tests

Unit tests for table output enhancements covering column width management, pagination, and type-aware formatting.

#### querySimple.Test.js - 8 tests (enhanced)

Integration tests for querySimple command with table format output and file export validation.

#### typeAwareFormatting.Test.js - 20 tests

Type-aware formatting tests for dates, numbers, text, and NULL values in text exports.

## End-to-End (E2E) CLI Tests

End-to-end tests validate complete command-line workflows using subprocess execution. These tests focus on CLI behavior, not unit testing.

### Purpose

E2E tests verify:

- **Command Execution**: Commands run successfully from the command line
- **Help Text**: `--help` displays correct information
- **Server Startup**: UI commands start web servers without errors
- **Flag Handling**: Command flags are parsed correctly
- **Output Validation**: Command output matches expected format
- **Alias Support**: Command aliases work identically to main commands
- **Error Messages**: Invalid inputs produce helpful error messages

### Test Location

```text
tests/e2e/
├── backup.e2e.Test.js              # Backup command E2E tests
├── cds.e2e.Test.js                 # CDS command tests
├── compareData.e2e.Test.js         # Data comparison workflow
├── compareSchema.e2e.Test.js       # Schema comparison workflow
├── connect.e2e.Test.js             # Connection establishment
├── dataProfile.e2e.Test.js         # Data profiling workflow
├── dataValidator.e2e.Test.js       # Data validation workflow
├── duplicateDetection.e2e.Test.js  # Duplicate detection workflow
├── export.e2e.Test.js              # Export command workflow
├── import.e2e.Test.js              # Import command workflow
├── indexes.e2e.Test.js             # Index inspection
├── massExport.e2e.Test.js          # Mass export workflow
├── querySimple.e2e.Test.js         # Simple query execution
├── restore.e2e.Test.js             # Restore command workflow
├── schemas.e2e.Test.js             # Schema listing
├── status.e2e.Test.js              # System status
├── systemInfo.e2e.Test.js          # System information
├── tableCopy.e2e.Test.js           # Table copy workflow
├── tables.e2e.Test.js              # Table listing
├── version.e2e.Test.js             # Version command
├── containersUI.e2e.Test.js        # Containers UI command
├── dataTypesUI.e2e.Test.js         # Data Types UI command
├── featuresUI.e2e.Test.js          # Features UI command
├── featureUsageUI.e2e.Test.js      # Feature Usage UI command
├── functionsUI.e2e.Test.js         # Functions UI command
├── importUI.e2e.Test.js            # Import UI command
├── inspectTableUI.e2e.Test.js      # Inspect Table UI command
├── massConvertUI.e2e.Test.js       # Mass Convert UI command
├── systemInfoUI.e2e.Test.js        # System Info UI command
├── tablesUI.e2e.Test.js            # Tables UI command
└── routes/
    └── webSocket.e2e.Test.js       # WebSocket E2E tests
```

### E2E Test Structure

E2E tests follow a consistent pattern:

```javascript
import * as base from '../base.js'
import { expect } from 'chai'

describe('commandName - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js commandName --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli commandName')
        expect(stdout).to.include('Options:')
        done()
      })
    })
  })

  describe('Command execution', () => {
    it('runs command successfully', function (done) {
      base.exec('node bin/cli.js commandName', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.not.be.empty
        done()
      })
    })
  })
})
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific E2E test file
npx mocha tests/e2e/tables.e2e.Test.js --config=tests/.mocharc.e2e.json

# Run E2E tests matching a pattern
npm run test:e2e:grep "systemInfo"

# Run E2E tests in strict mode (no pending tests)
npm run test:e2e:strict
```

### E2E Configuration

Configuration in `tests/.mocharc.e2e.json`:

```json
{
  "timeout": "20s",
  "slow": "5s",
  "parallel": true,
  "jobs": 16,
  "reporter": "spec",
  "exit": true
}
```

  ```javascript

**Parallel Execution**: E2E tests run in parallel (16 jobs) for faster execution

**CI Awareness**: E2E tests are skipped in CI environments (require local database connections)

**Live Test Gating**: Helper functions control whether tests require live connections:

```javascript
import { getLiveTestControl, gateLiveTestInCI } from './helpers.js'

describe('Live database tests', function () {
  before(function() {
    gateLiveTestInCI(this)  // Skip in CI
  })
})
```

**Connection Helpers**: Utility functions provide connection credentials:

```javascript
import { getLocalConnectionCredentials } from './helpers.js'

const credentials = getLocalConnectionCredentials()
// Returns: { host, port, user, password, schema }
```

### E2E vs Unit Tests

| Aspect | E2E Tests | Unit Tests |
|--------|-----------|------------|
| **Execution** | Subprocess (child_process) | Direct function calls |
| **Scope** | Full command workflow | Individual functions |
| **Speed** | Slower (~seconds per test) | Faster (~milliseconds) |
| **Dependencies** | Requires complete CLI setup | Mocked dependencies |
| **Purpose** | Validate user experience | Validate logic |

### UI Command E2E Tests

UI commands (e.g., `tablesUI`, `systemInfoUI`) have E2E tests that validate:


**Important**: E2E tests for UI commands do NOT test the actual SAPUI5 interface. Use WDI5 UI tests for that (see next section).

## UI Automation Tests with WDI5

WDI5 (WebDriver for UI5) tests validate the actual SAPUI5 user interface behavior through browser automation.

### What UI Tests Validate

UI tests verify:


### UI Test File Structure

```text
tests/ui/
├── README.md                   # UI test documentation
├── global.d.ts                 # TypeScript definitions
├── tsconfig.json               # TypeScript config for UI tests
├── importUI.ui.test.js         # Import interface tests
├── systemInfoUI.ui.test.js     # System Info interface tests
└── tablesUI.ui.test.js         # Tables interface tests
```

### WDI5 Test Structure

```javascript
// @ts-check
/// <reference types="@wdio/globals/types" />

describe('TablesUI - SAPUI5 Interface Tests', function() {
  this.timeout(60000)

  const BASE_URL = 'http://localhost:3010'
  const UI_PATH = '/ui/tables/index.html'

  before(async function() {
    await browser.url(BASE_URL + UI_PATH)
    await browser.waitForUI5()
  })
  
  describe('Page Structure', () => {
    it('should load the tables UI page', async () => {
      const title = await browser.getTitle()
      expect(title).toContain('Tables')
    })
  })
  
  describe('UI Controls', () => {
    it('should display the tables table control', async () => {
      const table = await browser.asControl({
        selector: {
          controlType: 'sap.m.Table',
          viewName: 'sap.hanacli.tables.view.App'
        }
      })
      await expect(table).toBeDefined()
    })
  })
})
```

### Prerequisites for UI Tests

#### 1. Install WDI5 Dependencies

```bash
npm install --save-dev @wdio/cli@9 @wdio/local-runner@9 @wdio/mocha-framework@9 @wdio/spec-reporter@9 @wdio/globals@9 wdio-ui5-service@3 wdio-chromedriver-service@8 webdriverio@9 --legacy-peer-deps
```

**Note**:

- WebdriverIO v9 is required for wdio-ui5-service v3
- `--legacy-peer-deps` flag handles peer dependency conflicts

#### 2. Verify Chrome Installation

```bash
# Windows
where chrome

# macOS/Linux
which google-chrome
```

Install Chrome if needed:

- **Windows**: <https://www.google.com/chrome/>
- **macOS**: `brew install --cask google-chrome`
- **Linux**: `sudo apt-get install google-chrome-stable`

#### 3. Start the HANA CLI Server

UI tests require the server to be running:

```bash
# Start a UI command (keeps server running)
node bin/cli.js tablesUI --port 8080
```

Leave this terminal open while running tests.

### Running UI Tests

```bash
# Run all UI tests (headless Chrome)
npm run test:ui

# Run specific UI test file
npm run test:ui:single tests/ui/tablesUI.ui.test.js

# Run in debug mode (visible browser)
npm run test:ui:debug
```

### UI Test Configuration

Configuration in `wdio.conf.js`:

- **Port**: 3010 (default server port for tests)
- **Browser**: Chrome (headless by default)
- **Framework**: Mocha
- **Services**: wdio-ui5-service (SAPUI5 integration)
- **Timeout**: 60 seconds for UI5 initialization

### E2E vs UI Tests Comparison

| Test Type | Location | What it Tests | Tools | Browser? | Server? |
|-----------|----------|---------------|-------|----------|---------|
| **E2E CLI** | `tests/e2e/` | Command execution, help, server startup | Mocha, Node exec | ❌ No | ❌ No |
| **UI Tests** | `tests/ui/` | SAPUI5 interface interaction | WDI5, WebdriverIO | ✅ Yes (Chrome) | ✅ Yes (port 8080) |

### Troubleshooting UI Tests

#### TypeScript Errors (Safe to Ignore)

TypeScript may show errors in UI test files. These are **safe to ignore** and don't affect test execution.

Common errors (expected):

```text
- Object literal may only specify known properties
- Property 'require' does not exist on type 'typeof ui'
- Parameter implicitly has an 'any' type
```

**Why**: WDI5 and SAPUI5 have incomplete TypeScript definitions.

**Optional fix**: Remove `// @ts-check` from test files to disable TypeScript checking.

#### Connection Refused / ECONNREFUSED

**Problem**: Server is not running

**Solution**: Start the server first:

```bash
node bin/cli.js tablesUI --port 8080
```

#### UI5 Framework Did Not Initialize

**Problem**: SAPUI5 took too long to load

**Solution**: Increase timeout in `wdio.conf.js`:

```javascript
waitforTimeout: 60000,  // Increase from 30000
```

#### ChromeDriver Version Mismatch

**Problem**: ChromeDriver version doesn't match Chrome

**Solution**: Update Chrome or ChromeDriver:

```bash
# Update Chrome (recommended)
# Chrome menu → About Google Chrome → Auto-updates

# OR update ChromeDriver
npm install --save-dev chromedriver --legacy-peer-deps
```

#### Cannot Find Control

**Problem**: Control selector is incorrect

**Solution**:

1. Check `viewName` matches your SAPUI5 component
2. Verify `controlType` spelling (case-sensitive)
3. Use browser dev tools to inspect DOM

#### Tests Pass But Nothing Visible

**Problem**: Tests run in headless mode by default

**Solution**: Use debug mode:

```bash
npm run test:ui:debug
```

Or edit `wdio.conf.js` and remove `--headless` from Chrome args.

### UI Test Best Practices

1. **Wait for UI5**: Always use `await browser.waitForUI5()` before interactions
2. **Use Control Selectors**: Prefer `browser.asControl()` over DOM selectors
3. **Descriptive Names**: Test names should describe user behavior
4. **Independent Tests**: Each test should work in isolation
5. **Cleanup**: Reset state between tests if needed
6. **Timeouts**: Set reasonable timeouts for slow-loading UIs

### Writing New UI Tests

When adding new SAPUI5 interfaces:

1. **Create E2E test** first (in `tests/e2e/`) - validates command execution
2. **Create UI test** (in `tests/ui/`) - validates actual UI behavior
3. **Test core workflows** - focus on critical user paths
4. **Test error cases** - validate error messages display
5. **Test data loading** - ensure data binds correctly to controls
6. **Test interactions** - validate clicks, navigation, input

Example:

```javascript
// tests/e2e/newCommandUI.e2e.Test.js
describe('newCommandUI - E2E Tests', function () {
  it('starts server successfully', function (done) {
    base.exec('node bin/cli.js newCommandUI --help', (error, stdout) => {
      expect(error).to.be.null
      done()
    })
  })
})

// tests/ui/newCommandUI.ui.test.js
describe('NewCommandUI - SAPUI5 Tests', function() {
  it('should display the main table', async () => {
    const table = await browser.asControl({
      selector: { controlType: 'sap.m.Table' }
    })
    await expect(table).toBeDefined()
  })
})
```

### Additional Resources

- **WDI5 Documentation**: <https://ui5-community.github.io/wdi5/>
- **WebdriverIO Docs**: <https://webdriver.io/>
- **SAPUI5 Test Automation**: <https://ui5.sap.com/#/topic/ae448243822448d8ba04b4784f4b09a0>
- **WDI5 Setup Guide**: See [WDI5-SETUP.md](../../WDI5-SETUP.md) in project root

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
npm test tests/e2e/routes/webSocket.e2e.Test.js
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

```bash
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

### CLI Tests

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
- [Troubleshooting](../../troubleshooting/)
