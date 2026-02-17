# MCP Connection Context - Visual Summary

## The Problem: Connection Mismatch

```mermaid
flowchart LR
     subgraph PA[Project A: ~/projects/project-a]
          Aenv[.env<br/>host=db-a.company.com<br/>user=admin-a<br/>password=pass-a]
          Apkg[package.json]
     end
     subgraph PB[Project B: ~/projects/project-b]
          Benv[.env<br/>host=db-b.company.com<br/>user=admin-b<br/>password=pass-b]
          Bpkg[package.json]
     end

     Q["AI Agent asks:<br/>List tables in Project B"] --> M["MCP Server calls: hana_tables"]
     M --> C["CLI connects via:<br/>~/.hana-cli/default.json<br/>(WRONG DB)"]
     C --> R["Result:<br/>Tables from Project A's database"]
```

## The Solution: Project Context Passing

```mermaid
flowchart LR
  subgraph PA2[Project A: ~/projects/project-a]
    A2env[.env<br/>database-a credentials]
    A2pkg[package.json]
  end
  subgraph PB2[Project B: ~/projects/project-b]
    B2env[.env<br/>database-b credentials]
    B2pkg[package.json]
  end

  Q2["AI Agent asks:<br/>List tables in Project B<br/>+ __projectContext.projectPath"] --> M2["MCP Server extracts context"]
  M2 --> X2["CLI changes to:<br/>~/projects/project-b/"]
  X2 --> C2["CLI connects via:<br/>~/projects/project-b/.env<br/>(CORRECT DB)"]
  C2 --> R2["Result:<br/>Tables from Project B's database"]
```

---

## Current Architecture

```mermaid
flowchart TB
  A["AI Agent / LLM"] --> B["MCP Server (index.ts)<br/>✓ Lists commands, discovers features<br/>✗ No project context received"]
  B --> C["Executor (executor.ts)<br/>spawn('node', [cli.js, 'tables', '--schema...'])<br/>✗ cwd = install path (hardcoded)<br/>✗ No project-specific env vars"]
  C --> D["CLI Process"]
  D --> E["Database Client (database/index.js)<br/>dbClientClass.getNewClient()<br/>✓ Gets connection options from getConnOptions()"]
  E --> F["Connections Module (connections.js)<br/>Search order (cwd=install path):<br/>1. .cdsrc-private.json<br/>2. default-env.json (install path) ← USED<br/>3. ~/.hana-cli/default.json (home dir)<br/>4. .env file<br/>5. VCAP_SERVICES<br/>✗ Never looks in project dir<br/>✗ Always uses install path or home dir"]
  F --> G["✗ WRONG DATABASE!"]
```

## Proposed Architecture

```mermaid
flowchart TB
  A2["AI Agent / LLM"] --> B2["MCP Server (index.ts) [UPDATED]<br/>✓ Extracts __projectContext from args<br/>✓ Removes context from CLI args (not a param)<br/>✓ Passes context to executeCommand()"]
  B2 --> C2["Executor (executor.ts) [UPDATED]<br/>✓ Receives connection context<br/>✓ Sets cwd = context.projectPath<br/>✓ Sets env vars: HANA_CLI_PROJECT_PATH<br/>✓ Sets env vars: HANA_CLI_CONN_FILE<br/>spawn('node', [cli.js, 'tables'...], {env, cwd})"]
  C2 --> D2["CLI Process"]
  D2 --> E2["Database Client (database/index.js)<br/>dbClientClass.getNewClient()<br/>✓ Gets connection options from getConnOptions()"]
  E2 --> F2["Connections Module (connections.js) [UPDATED]<br/>NEW: Check HANA_CLI_PROJECT_PATH and chdir<br/>Search order (project directory):<br/>1. .cdsrc-private.json (project) ← USED<br/>2. default-env.json (project) ← USED<br/>3. ~/.hana-cli/default.json (fallback)<br/>4. .env file (project) ← USED<br/>5. VCAP_SERVICES<br/>✓ First looks in project directory<br/>✓ Can still fall back to home dir"]
  F2 --> G2["✓ CORRECT DATABASE!"]
```

---

## Message Flow Comparison

### Before (All commands use install path)

```mermaid
flowchart TB
     subgraph Before[Before: install path always used]
          B1["Agent: List tables in Project A"] --> B2["MCP: tables {schema: 'A_SCHEMA'}"]
          B2 --> B3["CLI connects via ~/.hana-cli/default.json (Database A)"]
          B4["Agent: List tables in Project B"] --> B5["MCP: tables {schema: 'B_SCHEMA'}"]
          B5 --> B6["CLI connects via ~/.hana-cli/default.json (Database A) ✗"]
          B3 --> B7["Result: Both commands hit Database A (WRONG)"]
          B6 --> B7
     end
```

### After (Each command uses project context)

```mermaid
flowchart TB
     subgraph After[After: project context applied]
          A1["Agent: List tables in Project A"] --> A2["MCP: tables {schema: 'A_SCHEMA', __projectContext: {projectPath: '/proj/a'}}"]
          A2 --> A3["CLI changes to /proj/a, connects via ./default-env.json (Database A) ✓"]
          A4["Agent: List tables in Project B"] --> A5["MCP: tables {schema: 'B_SCHEMA', __projectContext: {projectPath: '/proj/b'}}"]
          A5 --> A6["CLI changes to /proj/b, connects via ./default-env.json (Database B) ✓"]
          A3 --> A7["Result: Each command hits correct database (CORRECT)"]
          A6 --> A7
     end
```

---

## Implementation Timeline

```mermaid
timeline
     title Implementation Timeline
     Week 1 : Update executor.ts, Update index.ts, Update schemas
     Week 2 : CLI updates, Security, Testing
     Week 3 onwards : Testing, Documentation, Rollout
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
flowchart TB
     A["Tool Called: hana_tables"] --> B["Arguments: {schema: 'MY_SCHEMA', __projectContext: {projectPath: '/app'}}"]
     B --> C["Tool Handler<br/>Extract context and remove __projectContext"]
     C --> D["executeCommand('tables', cleanArgs, context)"]
     D --> E["Executor builds env<br/>HANA_CLI_PROJECT_PATH=/app<br/>HANA_CLI_CONN_FILE=.env"]
     E --> F["Spawn CLI<br/>node /install/bin/cli.js tables<br/>cwd=/app"]
     F --> G["CLI Process (bin/cli.js)<br/>Table handler → getNewClient()"]
     G --> H["Database Client (database/index.js)<br/>getConnOptions()"]
     H --> I["Connections Module (connections.js)<br/>chdir('/app') and search .env<br/>Load credentials"]
     I --> J["Return: Connection to app's database ✓"]
```

---

## Backward Compatibility

```mermaid
flowchart LR
     subgraph Current[Current Users (No Context)]
          C1["MCP Tool Call: hana_tables<br/>{schema: 'X_SCHEMA'}"] --> C2["Behavior:<br/>No context extracted<br/>Uses install path (cwd)<br/>Finds ~/.hana-cli/default.json<br/>Works as before ✓"]
     end
     subgraph New[New Users (With Context)]
          N1["MCP Tool Call: hana_tables<br/>{schema: 'X_SCHEMA', __projectContext: {...}}"] --> N2["Behavior:<br/>Context extracted<br/>Uses project path (cwd)<br/>Finds /project/.env<br/>Works correctly ✓"]
     end
```

---

## Security Model

```mermaid
flowchart TB
     S1["MCP Tool Input (from AI Agent)<br/>✓ projectPath<br/>✓ connectionFile name<br/>✓ host/port/user/password (prefer .env files)"]
     S1 --> S2["Validation Layer"]
     S2 --> S3["Executor Security Checks<br/>✓ Normalize paths (prevent ..)<br/>✓ Check path exists<br/>✓ Optional: whitelist allowed paths<br/>✓ Sanitize env variable names<br/>✓ Don't log passwords"]
     S3 --> S4["Environment Variables (to CLI)<br/>✓ HANA_CLI_PROJECT_PATH=/safe/path<br/>✓ HANA_CLI_USER=safe_user<br/>✗ HANA_CLI_PASSWORD=[NEVER LOG]"]
```

---

## Testing Matrix

| Test Case | Before | After | Expected |
| --- | --- | --- | --- |
| No context param | ✓ Works | ✓ Works | Same behavior |
| With projectPath | ✗ Ignored | ✓ Used | Uses project dir |
| With connectionFile | ✗ Ignored | ✓ Used | Uses specified file |
| With direct credentials | ✗ Ignored | ✓ Used | Direct connection |
| Context switching | ✗ N/A | ✓ Works | Each cmd gets own DB |
| Multiple projects | ✗ Fails | ✓ Works | Isolated contexts |

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
