# MCP Connection Context Documentation Index

## Quick Answer to Your Question

**Q: How is the MCP server getting its connection context and how do I fix it to use project-specific connections instead of install path?**

**A**: Currently, the MCP server always uses connection files from the install path (`~/.hana-cli/default.json`) or user home directory. The solution is to pass project-specific context through MCP tool parameters, which the executor then applies as the working directory and environment variables when spawning the CLI.

---

## Documentation Guide

This directory contains comprehensive documentation for implementing project-specific connection context in the MCP server. Choose your starting point based on your role:

### 🎯 Quick Start (5-10 minutes)

**[visual-summary.md](./visual-summary.md)** - Problem visualization and architecture flows

- Before/after diagrams
- Data flow examples
- Quick reference diagrams

**Best for**: Getting a mental model quickly

---

### 👨‍💻 Implementation (2-3 hours)

**[implementation-guide.md](./implementation-guide.md)** - Step-by-step checklist

- Exact code changes with line numbers
- Before/after code snippets
- Testing checklist
- Validation steps

**Best for**: Developers ready to implement the solution

---

### 📚 Understanding (30-60 minutes)

**[connection-context-solution.md](./connection-context-solution.md)** - Detailed walkthrough

- Current flow explanation with code
- Key code locations
- Step-by-step implementation walkthrough
- Real usage examples
- Files to modify summary

**Best for**: Understanding the complete solution approach

---

### 🏗️ Architecture (1 hour)

**[connection-context-analysis.md](./connection-context-analysis.md)** - Deep architectural analysis

- Multiple implementation options
- Pros/cons of each approach
- Architecture diagrams
- Security considerations
- Future enhancements
- Migration strategies

**Best for**: Architects and decision makers

---

### 📋 Historical Reference

**[implementation-complete.md](./implementation-complete.md)** - Implementation status snapshot (Feb 2026)

- Historical snapshot of what was implemented
- Specific code changes made
- Build status from Feb 2026
- Usage examples from initial implementation

**Note**: This is a historical document. For current implementation, use the guides above.

---

## Related Documentation

**MCP Server Core:**

- [Architecture](./architecture.md) - Overall MCP technical architecture
- [Server Usage](./server-usage.md) - Running and configuring the MCP server
- [Connection Guide](./connection-guide.md) - General connection configuration

**Other Features:**

- [MCP Index](./index.md) - Main MCP documentation hub
- [Server Updates](./server-updates.md) - Recent MCP server enhancements

---

## How to Use These Documents

### For Quick Understanding (15 minutes)

1. Read **visual-summary.md** - Get mental model
2. Skim **implementation-guide.md** - See what needs to change

### For Implementation (2-3 hours)

1. Read **implementation-guide.md** - Follow step-by-step
2. Reference **connection-context-solution.md** - For detailed explanations
3. Reference **visual-summary.md** - If confused about flow

### For Design Review (1 hour)

1. Read **connection-context-analysis.md** - Understand all options
2. Review **visual-summary.md** - Verify architecture
3. Check **implementation-guide.md** - Assess effort

---

## The Problem in One Diagram

```bash
┌─────────────────────────────────────────────┐
│ AI Agent working on Project A               │
│ → Asks: "List tables in my database"        │
└─────────────────────────────────────────────┘
                    ↓
        MCP Server gets request
                    ↓
        Spawns CLI with:
        • cwd = /install/path (WRONG!)
        • env = parent environment (NO PROJECT CONTEXT)
                    ↓
        CLI looks for connection file
        • Searches from /install/path upward
        • Finds ~/.hana-cli/default.json
        • Connects to DEFAULT DATABASE
                    ↓
        ✗ WRONG! Should connect to Project A's database
        ✗ Agent gets data from wrong database
        ✗ All projects use same default connection
```

## The Solution in One Diagram

```bash
┌─────────────────────────────────────────────────────┐
│ AI Agent working on Project A                       │
│ → Asks: "List tables in my database"                │
│    + Provides: __projectContext.projectPath=/proj/a │
└─────────────────────────────────────────────────────┘
                    ↓
    MCP Server extracts context & spawns CLI with:
    • cwd = /proj/a (✓ PROJECT DIRECTORY!)
    • env.HANA_CLI_PROJECT_PATH = /proj/a
    • env.HANA_CLI_CONN_FILE = ".env"
                    ↓
    CLI looks for connection file
    • Searches from /proj/a upward
    • Finds /proj/a/.env
    • Connects to PROJECT A'S DATABASE
                    ↓
    ✓ CORRECT! Connects to Project A's database
    ✓ Agent gets data from correct database
    ✓ Each project uses its own connection
```

---

## Current System Flow

```bash
MCP Tool Call
    ↓
Tool Handler (index.ts line 1325)
    ↓
executeCommand(commandName, args) ← No project context!
    ↓
spawn('node', [cli.js], {
  cwd: /install/path ← HARDCODED!
  env: process.env ← Parent env, no project context
})
    ↓
CLI Process
    ↓
Connection Resolution (connections.js)
    • Starts from cwd = /install/path
    • Finds ~/.hana-cli/default.json
    • Uses default database ✗
```

## New System Flow

```bash
MCP Tool Call with __projectContext
    ↓
Tool Handler (index.ts) ← UPDATED
    ├─ Extract: context = args.__projectContext
    ├─ Clean args (remove context key)
    └─ Pass: executeCommand(cmd, args, context) ← NEW!
    ↓
executeCommand(commandName, args, context) ← UPDATED
    ├─ Build env with: HANA_CLI_PROJECT_PATH, etc.
    ├─ Set cwd = context.projectPath ← DYNAMIC!
    └─ spawn('node', [cli.js], {env, cwd})
    ↓
CLI Process
    ↓
Connection Resolution ← UPDATED
    • Checks: process.env.HANA_CLI_PROJECT_PATH
    • Starts from cwd = /project/path
    • Finds /project/path/.env
    • Uses project database ✓
```

---

## Step-by-Step Implementation Priority

### Phase 1: Core Implementation (HIGH PRIORITY)

**Time**: ~4 hours | **Complexity**: Medium

1. ✏️ Create `connection-context.ts` interface
2. ✏️ Update `executor.ts` - add context param, build env, set cwd
3. ✏️ Update `index.ts` - extract context, update schemas
4. ✏️ Update `connections.js` - check env vars
5. ✅ Test basic functionality

### Phase 2: Enhancement (MEDIUM PRIORITY)

**Time**: ~2-3 hours | **Complexity**: Low-Medium

1. 📋 Add connection management tools
2. 📋 Add project auto-detection
3. 📋 Add connection switching within conversation

### Phase 3: Polish (LOW PRIORITY)

**Time**: ~2 hours | **Complexity**: Low

1. 🔒 Add security validations
2. 📖 Update documentation
3. 🧪 Add comprehensive tests

---

## Key Technical Insights

### Why It Currently Doesn't Work

1. **Hardcoded CWD**: `executor.ts` line 270 has `cwd: join(__dirname, '..', '..')`
2. **No Context Passing**: Connection context never flows from MCP to CLI
3. **Parent Environment Only**: Spawned process inherits parent env, no project override
4. **Search Order**: `connections.js` searches up from cwd, which is always install path

### Why The Solution Works

1. **Dynamic CWD**: Pass `context.projectPath` as cwd to spawn
2. **Environment Signaling**: Use env vars (HANA_CLI_PROJECT_PATH, etc.) to signal project context
3. **CLI Auto-Detection**: CLI looks for these env vars first, changes directory if set
4. **Correct Search Order**: Connection resolution now starts from project directory

---

## Technical Debt & Future Work

### Potential Enhancements

- **Connection Registry**: Store project connections for reuse
- **Session Context**: Set context once, use for multiple commands
- **Auto-Detection**: Automatically detect project from CLI context
- **Secure Vault**: Encrypted credential storage
- **Connection Profiles**: Named connection sets for different environments

### Security Improvements

- Path validation/normalization
- Credential encryption
- Audit logging for connections
- Access control per project

---

## Questions Answered

**Q: Where does the MCP server currently get credentials?**

- From `~/.hana-cli/default.json` or `default-env.json` in install path

**Q: Why doesn't it use project's .env?**

- Because the CLI is spawned with `cwd = /install/path`, not project path

**Q: How do I send project context to MCP?**

- Add `__projectContext` object to any tool parameter

**Q: Will existing integrations break?**

- No! `__projectContext` is optional, backward compatible

**Q: What's the simplest way to implement this?**

- Follow **implementation-guide.md** step 1-5

**Q: How do I test if it works?**

- See validation checklist in **implementation-guide.md**

---

## Document Recommendation by Role

### 👨‍💼 Project Manager / Decision Maker

→ Start with: **visual-summary.md**
→ Decision: 15 minutes, understand scope and benefits

### 👨‍💻 Developer / Implementation

→ Start with: **implementation-guide.md**
→ Implement: 2-3 hours, line-by-line code changes

### 🏗️ Architect / Technical Lead

→ Start with: **connection-context-analysis.md**
→ Design: 1 hour, evaluate options and approach

### 🔎 Code Reviewer

→ Check against: **implementation-guide.md** checklist
→ Review: Cross-verify all modified files

### 🤔 Understanding Decision

→ Read in order:

1. **visual-summary.md** (5 min)
2. **connection-context-solution.md** (15 min)
3. **implementation-guide.md** (10 min)

→ Total: 30 minutes for complete understanding

---

## Success Criteria

After implementation, you should be able to:

- ✅ Pass project path to MCP tools via `__projectContext.projectPath`
- ✅ Have CLI execute from that project directory
- ✅ Connection files found in project directory first
- ✅ Multiple projects use different databases in one conversation
- ✅ Backward compatible with existing integrations
- ✅ No breaking changes to any APIs

---

## Support Matrix

| Issue | Solution | Document |
| -------- | -------- | -------- |
| "What's the problem?" | Start here | visual-summary.md |
| "How do I fix it?" | Code changes | implementation-guide.md |
| "Walk me through it" | Detailed explanation | connection-context-solution.md |
| "What about X?" | Design considerations | connection-context-analysis.md |
| "Show me diagrams" | Visual explanations | visual-summary.md |
| "I need the code" | Exact changes | implementation-guide.md |

---

## Next Steps

1. **Choose your starting document** based on your role above
2. **Understand the problem** using diagrams and flows
3. **Plan implementation** using the guide
4. **Execute changes** following the step-by-step process
5. **Test thoroughly** using provided test matrix
6. **Deploy with confidence** - fully backward compatible!

---

## Quick Links to Documents

| Document | Purpose | Time |
| -------- | ------- | ---- |
| 📊 [visual-summary.md](./visual-summary.md) | Diagrams & quick overview | 15 min |
| 🛠️ [implementation-guide.md](./implementation-guide.md) | Code changes & checklist | 2-3 hrs |
| 📝 [connection-context-solution.md](./connection-context-solution.md) | Detailed walkthrough | 30 min |
| 🎯 [connection-context-analysis.md](./connection-context-analysis.md) | Full analysis & options | 1 hour |

---

## Questions?

If you have questions about:

- **The problem**: Check visual-summary.md diagrams
- **The implementation**: Check implementation-guide.md code sections
- **The design choices**: Check connection-context-analysis.md options
- **The flow**: Check connection-context-solution.md walkthrough

All documents include examples, diagrams, and detailed explanations for different learning styles.
