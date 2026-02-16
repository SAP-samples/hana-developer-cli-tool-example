# MCP Connection Context Documentation Index

## Quick Answer to Your Question

**Q: How is the MCP server getting its connection context and how do I fix it to use project-specific connections instead of install path?**

**A**: Currently, the MCP server always uses connection files from the install path (`~/.hana-cli/default.json`) or user home directory. The solution is to pass project-specific context through MCP tool parameters, which the executor then applies as the working directory and environment variables when spawning the CLI.

**Key Files to Modify**:

- `mcp-server/src/executor.ts` - Add context parameter and environment setup
- `mcp-server/src/index.ts` - Extract context from tool parameters and pass it
- `utils/connections.js` - Check for context environment variables
- Create `mcp-server/src/connection-context.ts` - Define the interface

---

## Documentation Files Created

### 1. **MCP_VISUAL_SUMMARY.md** ← START HERE

**Best for**: Visual learners, quick understanding

- Problem visualization (before/after diagrams)
- Architecture flows
- Data flow examples
- Testing matrix
- 5-step quick reference

**Read this if**: You want to understand the problem quickly without deep technical details

---

### 2. **MCP_IMPLEMENTATION_GUIDE.md** ← IMPLEMENTATION CHECKLIST

**Best for**: Developers implementing the solution

- Exact code changes needed
- Line-by-line modifications
- Before/after code snippets
- Testing checklist
- Validation steps

**Read this if**: You're ready to code the solution

---

### 3. **MCP_CONNECTION_CONTEXT_SOLUTION.md** ← DETAILED WALKTHROUGH

**Best for**: Understanding the full solution approach

- Current flow explanation with code
- Key code locations identified
- Step-by-step implementation with code
- Real usage examples
- Files to modify summary

**Read this if**: You want detailed explanation of changes and examples

---

### 4. **MCP_CONNECTION_CONTEXT_ANALYSIS.md** ← DEEP DIVE

**Best for**: Architects, decision makers

- Multiple implementation options
- Pros/cons of each approach
- Architecture diagrams
- Security considerations
- Future enhancements
- Migration strategies

**Read this if**: You want to understand all possible approaches and make design decisions

---

## How to Use These Documents

### For Quick Understanding (15 minutes)

1. Read **MCP_VISUAL_SUMMARY.md** - Get mental model
2. Skim **MCP_IMPLEMENTATION_GUIDE.md** - See what needs to change

### For Implementation (2-3 hours)

1. Read **MCP_IMPLEMENTATION_GUIDE.md** - Follow step-by-step
2. Reference **MCP_CONNECTION_CONTEXT_SOLUTION.md** - For detailed explanations
3. Reference **MCP_VISUAL_SUMMARY.md** - If confused about flow

### For Design Review (1 hour)

1. Read **MCP_CONNECTION_CONTEXT_ANALYSIS.md** - Understand all options
2. Review **MCP_VISUAL_SUMMARY.md** - Verify architecture
3. Check **MCP_IMPLEMENTATION_GUIDE.md** - Assess effort

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

- Follow **MCP_IMPLEMENTATION_GUIDE.md** step 1-5

**Q: How do I test if it works?**

- See validation checklist in **MCP_IMPLEMENTATION_GUIDE.md**

---

## Document Recommendation by Role

### 👨‍💼 Project Manager / Decision Maker

→ Start with: **MCP_VISUAL_SUMMARY.md**
→ Decision: 15 minutes, understand scope and benefits

### 👨‍💻 Developer / Implementation

→ Start with: **MCP_IMPLEMENTATION_GUIDE.md**
→ Implement: 2-3 hours, line-by-line code changes

### 🏗️ Architect / Technical Lead

→ Start with: **MCP_CONNECTION_CONTEXT_ANALYSIS.md**
→ Design: 1 hour, evaluate options and approach

### 🔎 Code Reviewer

→ Check against: **MCP_IMPLEMENTATION_GUIDE.md** checklist
→ Review: Cross-verify all modified files

### 🤔 Understanding Decision

→ Read in order:

  1. **MCP_VISUAL_SUMMARY.md** (5 min)
  2. **MCP_CONNECTION_CONTEXT_SOLUTION.md** (15 min)
  3. **MCP_IMPLEMENTATION_GUIDE.md** (10 min)
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
| "What's the problem?" | Start here | MCP_VISUAL_SUMMARY.md |
| "How do I fix it?" | Code changes | MCP_IMPLEMENTATION_GUIDE.md |
| "Walk me through it" | Detailed explanation | MCP_CONNECTION_CONTEXT_SOLUTION.md |
| "What about X?" | Design considerations | MCP_CONNECTION_CONTEXT_ANALYSIS.md |
| "Show me diagrams" | Visual explanations | MCP_VISUAL_SUMMARY.md |
| "I need the code" | Exact changes | MCP_IMPLEMENTATION_GUIDE.md |

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
| 📊 [MCP_VISUAL_SUMMARY.md](./MCP_VISUAL_SUMMARY.md) | Diagrams & quick overview | 15 min |
| 🛠️ [MCP_IMPLEMENTATION_GUIDE.md](./MCP_IMPLEMENTATION_GUIDE.md) | Code changes & checklist | 2-3 hrs |
| 📝 [MCP_CONNECTION_CONTEXT_SOLUTION.md](./MCP_CONNECTION_CONTEXT_SOLUTION.md) | Detailed walkthrough | 30 min |
| 🎯 [MCP_CONNECTION_CONTEXT_ANALYSIS.md](./MCP_CONNECTION_CONTEXT_ANALYSIS.md) | Full analysis & options | 1 hour |

---

## Questions?

If you have questions about:

- **The problem**: Check MCP_VISUAL_SUMMARY.md diagrams
- **The implementation**: Check MCP_IMPLEMENTATION_GUIDE.md code sections
- **The design choices**: Check MCP_CONNECTION_CONTEXT_ANALYSIS.md options
- **The flow**: Check MCP_CONNECTION_CONTEXT_SOLUTION.md walkthrough

All documents include examples, diagrams, and detailed explanations for different learning styles.
