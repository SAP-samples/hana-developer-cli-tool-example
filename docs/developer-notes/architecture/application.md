# Application Architecture

Detailed architecture and design of HANA CLI components.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Usage Interfaces                               │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│  Command Line   │   Web UI        │   REST API      │   MCP Server  │
│  (Terminal)     │   (Browser)     │   (HTTP)        │   (AI/Agent)  │
└────────┬────────┴────────┬────────┴────────┬────────┴────────┬──────┘
         │                 │                 │                │
         └─────────────────┴─────────────────┴────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │   HANA CLI Core Engine            │
         │  ├─ Command Router                │
         │  ├─ Command Loader (Lazy-load)    │
         │  ├─ Parameter Parser              │
         │  ├─ Formatter (JSON/CSV/Excel)    │
         │  └─ Error Handler                 │
         └─────────────────┬─────────────────┘
                           │
              ┌────────────┴────────────┐
              │  Database Utilities     │
              ├─ Connection Manager     │
              ├─ Query Executor         │
              ├─ Result Formatter       │
              └─ Cache Layer            │
              │
              ↓
         ┌─────────────────┐
         │  SAP HANA DB    │
         │                 │
         │ SYSTEMDB        │
         │  ├─ Schemas     │
         │  ├─ Tables      │
         │  ├─ Views       │
         │  └─ ...         │
         └─────────────────┘
```

## Module Organization

### bin/ - Entry Point

- `hana-cli` - Executable entry point
- `hana-cli.js` - Main CLI boot file
- Minimal code - offloads to app/

### app/ - Commands Implementation

**Command Structure:**

```javascript
exports.command = 'export'
exports.aliases = ['e', 'exp']
exports.describe = 'Export data from HANA'
exports.builder = (yargs) => { /* define CLI arguments */ }
exports.handler = async (argv) => { /* execute command */ }
```

**Key Commands:**
- Data tools: import, export, compareData, dataDiff, etc.
- Schema tools: schemaClone, compareSchema, erdDiagram, etc.
- Query tools: callProcedure, querySimple, etc.
- System tools: backup, partitions, indexes, roles, etc.

### utils/ - Shared Utilities

**Core Utilities:**

- `database.js` - Database operations and connection
- `formatting.js` - Output formatting (JSON, CSV, Excel, HTML)
- `validation.js` - Data type and value validation
- `translation.js` - Internationalization and i18n
- `logger.js` - Debug and error logging
- `cache.js` - Optional result caching

### routes/ - REST API Server

**Express Routes:**

- `/api/tables` - List tables
- `/api/execute` - Run SQL
- `/api/import` - Import data
- `/api/export` - Export data
- `/api/health` - Health check

### app/resources/ - Web UI

**Fiori Launchpad & UI5 Apps:**

- `tables/` - Tables browser
- `inspect/` - Object inspector
- `massConvert/` - Bulk converter
- `systemInfo/` - System information
- `common/` - Shared UI5 components

### _i18n/ - Internationalization

**Language Files:**

- `messages.properties` - English
- `messages_de.properties` - German
- Format: Properties file with key=value pairs
- One file per command/feature

### mcp-server/ - AI Integration

**MCP Protocol Server:**

- Tool definitions and documentation
- Database introspection
- Command wrapping for AI agents
- Connection context support

### tests/ - Test Suite

**Test Organization:**

- `unit/` - Function unit tests
- `integration/` - Component integration tests
- `e2e/` - End-to-end CLI tests
- `fixtures/` - Test data

## Performance Optimizations

### Startup Performance

**Before:** 2.2 seconds (all commands loaded)

**After:** 700ms (~7x improvement)

**Techniques:**
- Lazy loading of commands on-demand
- Deferred yargs initialization
- Conditional debug loading
- Module caching

### Query Performance

**Optimizations:**
- Connection pooling
- Result caching
- Batch processing
- Pagination for large datasets

### Memory Efficiency

**Techniques:**
- Streaming large result sets
- Lazy evaluation
- Garbage collection tuning
- Memory limits for batch operations

## Data Flow

### Command Execution Flow

```
1. User Input (CLI / Web UI / API / MCP)
   │
2. Parameter Parsing (yargs)
   │
3. Command Routing (app/*.js)
   │
4. Validation (utils/validation.js)
   │
5. Database Connection (utils/database.js)
   │
6. Query Execution (database.js → HANA)
   │
7. Result Formatting (utils/formatting.js)
   │
8. Output (stdout / HTTP response / WebSocket)
```

### Plugin Architecture

Commands are designed as plugins:

```javascript
// app/myCommand.js
module.exports = {
  command: 'myCommand',
  describe: 'My command description',
  builder: (yargs) => yargs.option('schema', {...}),
  handler: (argv) => { /* execution */ }
}

// Auto-loaded by yargs from app/
```

## Extension Points

### Adding Commands

1. Create `app/mycommand.js`
2. Export: command, aliases, describe, builder, handler
3. Auto-discovered and loaded

### Adding Database Types

1. Update `utils/database.js`
2. Add profile type (hana, postgres, etc.)
3. Implement connection factory
4. Update tests

### Adding Output Formats

1. Update `utils/formatting.js`
2. Add formatter function
3. Register in format options
4. Add tests

### Adding Languages

1. Create `_i18n/messages_xx.properties`
2. Copy-paste and translate from English version
3. Update language detection in `utils/translation.js`

## Configuration Management

### Priority Order

1. `.cdsrc-private.json` (project CDS config)
2. `default-env.json` (SAP CAP default)
3. `.env` (dot-env file)
4. `~/.hana-cli/default.json` (home directory)
5. `VCAP_SERVICES` (environment variable)
6. Command-line parameters

## Error Handling

### Error Categories

- **Connection errors** - Database unreachable
- **Permission errors** - Insufficient privileges
- **Data errors** - Invalid data types
- **Syntax errors** - Invalid SQL/parameters
- **System errors** - Out of memory, disk full

### Error Flow

```
Error Occurs
   │
Caught by handler
   │
Format for output (errors/utils.js)
   │
Log if debug enabled
   │
Return user-friendly message
   │
Exit with appropriate code
```

## Security Considerations

### Credential Handling

- Passwords never logged
- Credentials stored only in config files
- Environment variables supported
- Command-line passwords not recommended (visible in processes)

### Input Validation

- All user input validated
- SQL parameters escaped
- File paths sanitized
- Schema/table names verified

### Access Control

- Database user permissions enforced
- No privilege escalation
- Multi-user support
- Audit logging available

## See Also

- [Project Structure](./project-structure.md)
- [Implementation Details](../../05-development/implementation.md)
- [Testing Guide](../testing-guide.md)
