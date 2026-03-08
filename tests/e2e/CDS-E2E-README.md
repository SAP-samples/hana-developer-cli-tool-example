# CDS Command E2E Tests - README

## Overview

The `cds.e2e.Test.js` file contains end-to-end tests for the `hana-cli cds` command, which starts a CAP (Cloud Application Programming) server that exposes database objects via OData v4 services.

## Testing Strategy

The CDS command presents unique testing challenges compared to other CLI commands:

1. **Long-running Process**: Unlike most commands that execute and exit, the CDS command starts an HTTP server that runs indefinitely
2. **HTTP Endpoint Testing**: We need to test the server's HTTP endpoints (homepage, OData service, metadata, API docs)
3. **Process Management**: Proper cleanup of spawned server processes is critical to avoid port conflicts and resource leaks

## Test Structure

### Helper Functions

- **`httpGet(url, timeout)`**: Makes HTTP GET requests with timeout handling
- **`waitForServer(process, timeout)`**: Monitors process output until server startup is confirmed
- **Cleanup hooks**: `after()` hook ensures all spawned processes are terminated

### Test Categories

1. **Help Output Tests** - Verify command help, documentation links, and examples
2. **Aliases Tests** - Verify `cdsPreview` alias works correctly
3. **Validation Tests** - Test parameter validation and error handling
4. **Live Server Tests** - Start actual CDS servers and test HTTP endpoints (optional)

## Running the Tests

### Run All E2E Tests (including CDS)

```bash
npm run test:e2e
```

### Run Only CDS Tests

```bash
npm run test:e2e:grep cds
```

### Run Specific CDS Test

```bash
npm run test:e2e:single tests/e2e/cds.e2e.Test.js
```

## Live Test Configuration

Live tests that start actual CDS servers are **optional** by default. They require:

1. **Database Credentials**: HANA connection credentials via:
   - `.cdsrc-private.json` (CDS bind)
   - `default-env-admin.json`
   - `default-env.json`

2. **Environment Variable**: Set `HANA_CLI_E2E_LIVE_CDS=true` to force execution in CI

### Live Test Behavior

- **In CI without force flag**: Tests are skipped
- **In CI with `HANA_CLI_E2E_LIVE_CDS=true`**: Tests must pass or fail the build
- **Locally**: Tests attempt to run if credentials are available, otherwise skip gracefully

## Test Coverage

### Functional Tests

- ✅ Help output and documentation links
- ✅ Alias support (`cdsPreview`)
- ✅ Parameter validation
- ✅ Port configuration
- ✅ Custom port assignment

### Live HTTP Endpoint Tests

**Note**: Tests use the `SCHEMAS` system view instead of the `DUMMY` table because DUMMY has special characteristics (reserved column name, special metadata) that cause CDS compilation errors. The SCHEMAS view is a standard system view that consistently works with CDS generation.

- ✅ Server startup and homepage
- ✅ OData v4 service document (`/odata/v4/HanaCli`)
- ✅ OData metadata endpoint (`/odata/v4/HanaCli/$metadata`)
- ✅ Swagger UI API documentation (`/api-docs/`)
- ✅ View processing with `--view` flag

### Test Table Selection

The tests use the following SAP HANA system views:

- **SCHEMAS** (SYS schema): Used in most tests - simple structure, always available
- **M_TABLES** (SYS schema): Used in view-specific test - monitoring view with rich metadata

**Why not DUMMY table?**
The DUMMY table is a special SAP HANA system table with characteristics that cause CDS compilation to fail:

- Column named "DUMMY" which is a reserved word in some contexts  
- Special internal metadata  
- Non-standard structure optimized for single-row responses


Always use standard system views (SCHEMAS, M_TABLES, M_DATABASES, etc.) for CDS tests.

## Technical Implementation Details

### Process Spawning

```javascript
const serverProcess = spawn('node', [
  'bin/cli.js',
  'cds',
  '--table', 'DUMMY',
  '--schema', 'SYS',
  '--port', testPort.toString(),
  '--quiet'
], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { 
    ...process.env, 
    NODE_ENV: 'test',
    // Suppress unhandled rejection warnings from CDS server internals
    NODE_OPTIONS: '--unhandled-rejections=warn'
  }
})
```

**Note**: The `NODE_OPTIONS: '--unhandled-rejections=warn'` setting prevents the spawned CDS server process from crashing the test suite when internal promise rejections occur within the CDS framework. The CDS server may experience internal promise rejections that don't affect its functionality, so we configure the subprocess to log warnings instead of throwing errors.

### Server Ready Detection

The test monitors stdout/stderr for the server startup message:

```text
http server.*http://localhost:3010
```

Once detected, HTTP endpoints are tested sequentially. The `waitForServer()` function includes safeguards to prevent multiple resolutions and properly handle edge cases where the URL extraction fails.

### Cleanup Strategy

1. **Test-level cleanup**: Each test cleans up its own process on completion/failure
2. **Suite-level cleanup**: `after()` hook ensures all processes are terminated
3. **Graceful shutdown**: First attempts `SIGTERM`, then `SIGKILL` after 1 second

### Port Randomization

Tests use random ports to avoid conflicts:

```javascript
const testPort = 3000 + Math.floor(Math.random() * 1000)
```

## Troubleshooting

### CDS Compilation Errors

**Symptom**: Server process exits with "CDS compilation failed" error

**Cause**: Some SAP HANA system tables (like DUMMY) have special characteristics that don't translate well to CDS syntax. These may include:

- Reserved words as column names
- Special metadata that CDS compiler cannot parse
- Unusual data types or constraints

**Solution**: Use standard system views like `SCHEMAS`, `M_TABLES`, or `M_DATABASES` which have well-defined structures that work with CDS. The tests already use these views for this reason.

### Unhandled Promise Rejections

**Symptom**: Warning about unhandled promise rejection from CDS server

**Cause**: The CDS framework may emit internal promise rejections that don't affect server functionality

**Solution**: Already handled - tests use `NODE_OPTIONS: '--unhandled-rejections=warn'` to prevent test failures from internal CDS warnings

### Tests Hang or Timeout

**Symptom**: Test times out waiting for server to start

**Possible Causes**:

- Database connection issues
- Port already in use
- Missing dependencies (@sap/cds-dk, @sap/cds-fiori)

**Solution**: Check server output in test context/logs

### Port Already in Use

**Symptom**: Error about address already in use

**Solution**: Tests use random ports, but if conflicts persist:

- Ensure previous test processes were cleaned up
- Check for other services using port 3000-4000 range
- Restart the test suite

### Process Not Cleaned Up

**Symptom**: Multiple node processes remain after test failure

**Solution**:

```bash
# Find processes
ps aux | grep "bin/cli.js cds"

# Kill manually
kill -9 <PID>
```

## Future Enhancements

Potential improvements for these tests:

1. **Data Manipulation Tests**: Test POST/PATCH/DELETE operations on OData entities
2. **GraphQL Endpoint Tests**: Test GraphQL queries (CDS supports both OData and GraphQL)
3. **Fiori Preview Tests**: Test the Fiori launchpad preview functionality
4. **Error Handling**: Test invalid table/schema scenarios with server responses
5. **Performance Tests**: Measure server startup time and response times
6. **Multi-table Tests**: Test complex scenarios with multiple entities

## Related Documentation

- [Command Documentation](../../docs/02-commands/developer-tools/cds.md)
- [E2E Test Helpers](./helpers.js)
- [CAP CDS Documentation](https://cap.cloud.sap/docs/)
