# MCP Connection Context - Visual Summary

## The Problem: Connection Mismatch

```mermaid
Project A: ~/projects/project-a          Project B: ~/projects/project-b
├── .env                                 ├── .env  
│   ├── host=db-a.company.com           │   ├── host=db-b.company.com
│   ├── user=admin-a                     │   ├── user=admin-b
│   └── password=pass-a                  │   └── password=pass-b
└── package.json                         └── package.json
                                        
AI Agent asks: "List tables in Project B"
     ↓
MCP Server calls: hana_tables
     ↓
CLI connects via:  ~/.hana-cli/default.json  (WRONG DB!)
     ↓
Result: Tables from Project A's database instead of Project B
```

## The Solution: Project Context Passing

```mermaid
Project A: ~/projects/project-a          Project B: ~/projects/project-b
├── .env                                 ├── .env  
│   └── [database-a credentials]        │   └── [database-b credentials]
└── package.json                         └── package.json
                                        
AI Agent asks: "List tables in Project B" + __projectContext.projectPath
     ↓
MCP Server extracts context
     ↓
CLI changes to: ~/projects/project-b/
     ↓
CLI connects via: ~/projects/project-b/.env  (CORRECT DB!)
     ↓
Result: Tables from Project B's database (CORRECT!)
```

---

## Current Architecture

```mermaid
┌─────────────────────────────────────────────────────┐
│                    AI Agent / LLM                   │
└─────────────────────────────────────────────────────┘
                           │
                    calls MCP tools
                    {"schema": "MY_SCHEMA"}
                           ↓
┌─────────────────────────────────────────────────────┐
│             MCP Server (index.ts)                   │
│  ✓ Lists commands, discovers features              │
│  ✗ NO PROJECT CONTEXT received                     │
└─────────────────────────────────────────────────────┘
                           │
                   executeCommand()
                           ↓
┌─────────────────────────────────────────────────────┐
│            Executor (executor.ts)                   │
│  spawn('node', [cli.js, 'tables', '--schema...'])  │
│  ✗ cwd = install path (HARDCODED)                  │
│  ✗ No project-specific env vars                    │
└─────────────────────────────────────────────────────┘
                           │
                    CLI Process
                           ↓
┌─────────────────────────────────────────────────────┐
│         Database Client (database/index.js)         │
│              dbClientClass.getNewClient()           │
│  ✓ Gets connection options from getConnOptions()   │
└─────────────────────────────────────────────────────┘
                           │
                    Connection Resolution
                           ↓
┌─────────────────────────────────────────────────────┐
│         Connections Module (connections.js)         │
│  Search order (all relative to cwd=install path):  │
│  1. .cdsrc-private.json                            │
│  2. default-env.json (install path) ← USED         │
│  3. ~/.hana-cli/default.json (home dir)            │
│  4. .env file                                       │
│  5. VCAP_SERVICES                                   │
│                                                     │
│  ✗ NEVER looks in project directory!              │
│  ✗ Always uses install path or home dir            │
└─────────────────────────────────────────────────────┘
                           │
                    ✗ WRONG DATABASE!
```

## Proposed Architecture

```mermaid
┌─────────────────────────────────────────────────────┐
│                    AI Agent / LLM                   │
└─────────────────────────────────────────────────────┘
                           │
                  calls MCP tools with context
         {"schema": "MY_SCHEMA",                    
          "__projectContext": {                     
            "projectPath": "/path/to/project",      
            "connectionFile": ".env"                
          }}
                           ↓
┌─────────────────────────────────────────────────────┐
│             MCP Server (index.ts) [UPDATED]         │
│  ✓ Extracts __projectContext from args             │
│  ✓ Removes context from CLI args (not a param)     │
│  ✓ Passes context to executeCommand()              │
└─────────────────────────────────────────────────────┘
                           │
                 executeCommand(cmd, args, context)
                           ↓
┌─────────────────────────────────────────────────────┐
│            Executor (executor.ts) [UPDATED]         │
│  ✓ Receives CONNECTION CONTEXT parameter           │
│  ✓ Sets cwd = context.projectPath                  │
│  ✓ Sets env vars: HANA_CLI_PROJECT_PATH            │
│  ✓ Sets env vars: HANA_CLI_CONN_FILE               │
│  spawn('node', [cli.js, 'tables'...],              │
│    {env, cwd: "/path/to/project"})                 │
└─────────────────────────────────────────────────────┘
                           │
                    CLI Process
                           ↓
┌─────────────────────────────────────────────────────┐
│         Database Client (database/index.js)         │
│              dbClientClass.getNewClient()           │
│  ✓ Gets connection options from getConnOptions()   │
└─────────────────────────────────────────────────────┘
                           │
                    Connection Resolution
                           ↓
┌─────────────────────────────────────────────────────┐
│    Connections Module (connections.js) [UPDATED]    │
│                                                     │
│  NEW: Check environment for project context        │
│  if (process.env.HANA_CLI_PROJECT_PATH) {          │
│    chdir(process.env.HANA_CLI_PROJECT_PATH)        │
│  }                                                  │
│                                                     │
│  Search order (NOW from project directory!):       │
│  1. .cdsrc-private.json (project dir) ← USED       │
│  2. default-env.json (project dir) ← USED          │
│  3. ~/.hana-cli/default.json (fallback)            │
│  4. .env file (project dir) ← USED                 │
│  5. VCAP_SERVICES                                   │
│                                                     │
│  ✓ FIRST looks in project directory!              │
│  ✓ Can still fall back to home dir if not found    │
└─────────────────────────────────────────────────────┘
                           │
                    ✓ CORRECT DATABASE!
```

---

## Message Flow Comparison

### Before (All commands use install path)

```mermaid
│ Agent: "List tables in Project A"
├─→ MCP: tables {schema: 'A_SCHEMA'}
│   └─→ CLI: connects via ~/.hana-cli/default.json (Database A)
│
│ Agent: "List tables in Project B" 
├─→ MCP: tables {schema: 'B_SCHEMA'}
│   └─→ CLI: connects via ~/.hana-cli/default.json (Database A) ✗
│
│ Result: Both commands hit Database A (WRONG!)
```

### After (Each command uses project context)

```mermaid
│ Agent: "List tables in Project A"
├─→ MCP: tables {schema: 'A_SCHEMA', __projectContext: {projectPath: '/proj/a'}}
│   └─→ CLI: changes to /proj/a, connects via ./default-env.json (Database A) ✓
│
│ Agent: "List tables in Project B"
├─→ MCP: tables {schema: 'B_SCHEMA', __projectContext: {projectPath: '/proj/b'}}
│   └─→ CLI: changes to /proj/b, connects via ./default-env.json (Database B) ✓
│
│ Result: Each command hits correct database (CORRECT!)
```

---

## Implementation Timeline

```mermaid
Week 1                                  Week 2                    Week 3 onwards
├─ Day 1-2: Update executor.ts         ├─ Day 8-10: CLI updates  ├─ Testing
├─ Day 3-4: Update index.ts            ├─ Day 11-12: Security    ├─ Documentation
└─ Day 5: Update schemas              └─ Testing                └─ Rollout
```

---

## Key Code Sections to Modify

| Component | File | Lines | Change Type |
| --------- | ---- | ----- | ----------- |
| Context Interface | `mcp-server/src/connection-context.ts` | NEW | Create |
| Executor Function | `mcp-server/src/executor.ts` | 240-280 | Update signature & spawn |
| Tool Handler | `mcp-server/src/index.ts` | 145, 1325 | Update schemas & handler |
| CLI Connections | `utils/connections.js` | 92-110 | Add env var checks |

---

## Data Flow: Single Command Execution

```mermaid
MCP Server (index.ts)
│
├─ Tool Called: hana_tables
│  ├─ Arguments: {schema: 'MY_SCHEMA', __projectContext: {projectPath: '/app'}}
│  │
│  └─ Tool Handler:
│     ├─ Extract context: __projectContext
│     ├─ Clean args: remove __projectContext
│     │
│     └─ Call executeCommand('tables', cleanArgs, context)
│
├─ Executor (executor.ts)
│  ├─ Receive: context = {projectPath: '/app'}
│  │
│  ├─ Build Environment:
│  │  ├─ Set HANA_CLI_PROJECT_PATH=/app
│  │  ├─ Set HANA_CLI_CONN_FILE=.env
│  │  └─ Set other env vars...
│  │
│  └─ Spawn CLI:
│     ├─ Command: node /install/bin/cli.js tables
│     ├─ CWD: /app (not /install)
│     └─ ENV: {HANA_CLI_PROJECT_PATH=/app, ...}
│
├─ CLI Process (bin/cli.js)
│  └─ Table Handler:
│     ├─ getNewClient(prompts)
│     └─ dbClientClass.getNewClient()
│
├─ Database Client (database/index.js)
│  └─ Constructor calls getConnOptions()
│
└─ Connection Module (connections.js)
   ├─ NEW: Check HANA_CLI_PROJECT_PATH=/app
   ├─ NEW: chdir('/app')
   ├─ Search for connection:
   │  ├─ Look for .env in /app ← FOUND!
   │  └─ Load credentials from /app/.env
   │
   └─ Return: Connection to app's database ✓
```

---

## Backward Compatibility

```mermaid
Current Users (No Context)          New Users (With Context)
                                   
MCP Tool Call:                     MCP Tool Call:
├─ hana_tables                     ├─ hana_tables
└─ {schema: 'X_SCHEMA'}             └─ {schema: 'X_SCHEMA',
                                      __projectContext: {...}}
                                   
Behavior:                          Behavior:
├─ No context extracted            ├─ Context extracted
├─ Uses install path (cwd)         ├─ Uses project path (cwd)
├─ Finds ~/.hana-cli/default.json  ├─ Finds /project/.env
└─ Works as before ✓               └─ Works correctly ✓
```

---

## Security Model

```mermaid
┌──────────────────────────────────────────────────┐
│ MCP Tool Input (from AI Agent)                   │
│                                                   │
│ ✓ Can specify projectPath                        │
│ ✓ Can specify connectionFile name                │
│ ✓ Can specify host/port/user/password            │
│   (use cautiously - prefer .env files)           │
└──────────────────────────────────────────────────┘
         ↓
    VALIDATION LAYER
         ↓
┌──────────────────────────────────────────────────┐
│ Executor Security Checks                         │
│                                                   │
│ ✓ Normalize paths (prevent ..)                   │
│ ✓ Check path exists                              │
│ ✓ Optional: Whitelist allowed paths              │
│ ✓ Sanitize env variable names                    │
│ ✓ Don't log passwords                            │
└──────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│ Environment Variables (to CLI)                   │
│                                                   │
│ ✓ HANA_CLI_PROJECT_PATH = /safe/path             │
│ ✓ HANA_CLI_USER = safe_user                      │
│ ✗ HANA_CLI_PASSWORD = [NEVER LOG]                │
└──────────────────────────────────────────────────┘
```

---

## Testing Matrix

```mermaid
Test Case                  | Before | After | Expected
────────────────────────────────────────────────────────
No context param           | ✓ Works | ✓ Works | Same behavior
With projectPath           | ✗ Ignored | ✓ Used | Uses project dir
With connectionFile        | ✗ Ignored | ✓ Used | Uses specified file
With direct credentials    | ✗ Ignored | ✓ Used | Direct connection
Context switching          | ✗ N/A | ✓ Works | Each cmd gets own DB
Multiple projects          | ✗ Fails | ✓ Works | Isolated contexts
```

---

## Benefits Summary

| Perspective | Benefit |
| ----------- | ------- |
| **AI Agents** | Can work with multiple projects, switching databases mid-conversation |
| **Developers** | No manual connection setup per project |
| **Teams** | Project-specific DBs for different environments (dev/test/prod) |
| **Security** | Each project isolated to its credentials |
| **Backward Compat** | Existing integrations work unchanged |

---

## Quick Reference: 5-Step Implementation

1. **Create interface** → `connection-context.ts`
2. **Update executor** → Handle context in `executeCommand()`
3. **Update MCP tools** → Pass context from handler
4. **Update CLI** → Check env vars in `connections.js`
5. **Test & Deploy** → Backward compatible, no breaking changes
