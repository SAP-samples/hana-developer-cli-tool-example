# hana-cli Agent Instructions

**Portable AI coding agent instructions that teach any coding assistant how to use hana-cli for SAP HANA development.**

Think of it as the knowledge of the hana-cli MCP Server — without needing MCP. Just files your coding agent reads.

## What's Inside

| File | Purpose |
| ---- | ------- |
| `HANA_CLI_REFERENCE.md` | Complete command reference (170+ commands, parameters, categories) |
| `HANA_CLI_QUICKSTART.md` | Quick start guide (install, connect, top 10 commands) |
| `HANA_CLI_EXAMPLES.md` | Real-world usage scenarios with concrete parameters |
| `HANA_CLI_WORKFLOWS.md` | Multi-step workflows (data quality, migration, security audit, etc.) |
| `categories/*.md` | Per-category deep dives (16 categories) |
| `llms.txt` | Compact machine-readable reference ([llms.txt convention](https://llmstxt.org)) |
| `copilot/` | GitHub Copilot format (instructions + prompts) |
| `cursor/` | Cursor `.cursorrules` format |
| `claude/` | Claude Code `CLAUDE.md` format |
| `windsurf/` | Windsurf `.windsurfrules` format |
| `cline/` | Cline `.clinerules` format |
| `generic/` | Universal `AGENT_INSTRUCTIONS.md` for any agent |

## Quick Install

### Option 1: npx (recommended)

```bash
# Auto-detect your coding agent and install
npx hana-cli-agent-instructions

# Choose a specific format
npx hana-cli-agent-instructions --format copilot
npx hana-cli-agent-instructions --format cursor
npx hana-cli-agent-instructions --format claude
npx hana-cli-agent-instructions --format all

# Install to a specific project
npx hana-cli-agent-instructions --format copilot --target ./my-sap-project
```

### Option 2: npm package

```bash
npm install --save-dev hana-cli-agent-instructions
```

### Option 3: Manual download

Download the files you need from [GitHub](https://github.com/SAP-samples/hana-developer-cli-tool-example/tree/main/agent-instructions) and place them in your project.

### Option 4: curl one-liners

```bash
# Download quickstart + reference for any agent
curl -sL https://raw.githubusercontent.com/SAP-samples/hana-developer-cli-tool-example/main/agent-instructions/HANA_CLI_QUICKSTART.md -o HANA_CLI_QUICKSTART.md
curl -sL https://raw.githubusercontent.com/SAP-samples/hana-developer-cli-tool-example/main/agent-instructions/HANA_CLI_REFERENCE.md -o HANA_CLI_REFERENCE.md

# Download Cursor rules
curl -sL https://raw.githubusercontent.com/SAP-samples/hana-developer-cli-tool-example/main/agent-instructions/cursor/.cursorrules -o .cursorrules

# Download Claude Code instructions
curl -sL https://raw.githubusercontent.com/SAP-samples/hana-developer-cli-tool-example/main/agent-instructions/claude/CLAUDE.md -o CLAUDE.md
```

## Agent Instructions vs MCP Server

| Feature | Agent Instructions | MCP Server |
| ------- | ----------------- | ---------- |
| **What it provides** | Static knowledge (markdown files) | Dynamic tool execution (JSON-RPC) |
| **Setup** | Copy files to project | Configure MCP client, run server |
| **Agent support** | Any LLM-based agent | MCP-capable clients only |
| **Can execute commands** | No (agent runs them via terminal) | Yes (server executes directly) |
| **Always up-to-date** | Snapshot (re-download for updates) | Live (reads current metadata) |
| **Dependencies** | None (just markdown) | Node.js, hana-cli installed |
| **Best for** | Quick setup, any agent, offline use | Deep integration, automated workflows |

**Use both together:** Instructions for general knowledge, MCP Server for execution.

## Per-Agent Setup

### GitHub Copilot

The installer places files in `.github/`:

- `.github/copilot-instructions.md` — workspace-level context
- `.github/instructions/hana-cli-usage.instructions.md` — auto-activates for HANA file types (`.hdbcds`, `.cds`, `mta.yaml`, etc.)
- `.github/prompts/hana-cli-help.prompt.md` — custom prompt for hana-cli questions

### Cursor

Places `.cursorrules` in your project root. Cursor reads this automatically.

### Claude Code

Places `CLAUDE.md` in your project root. Claude Code reads this automatically.

### Windsurf

Places `.windsurfrules` in your project root. Windsurf reads this automatically.

### Cline

Places `.clinerules` in your project root. Cline reads this automatically.

### Generic / Other Agents

Places `AGENT_INSTRUCTIONS.md` in your project root. Point your agent to read this file.

## What Your Agent Learns

After installing, your coding assistant will know how to:

- **Explore SAP HANA schemas** — suggest `hana-cli tables`, `inspectTable`, `views`
- **Import/export data** — recommend dry-run patterns, batch sizes, error handling
- **Run queries** — use `hana-cli querySimple --query "SQL"` (with correct `--query` flag)
- **Check system health** — suggest `healthCheck`, `expensiveStatements`, `memoryAnalysis`
- **Manage connections** — guide through `connect`, `connectViaServiceKey`, `copy2DefaultEnv`
- **Profile data quality** — recommend `dataProfile` → `dataValidator` → `duplicateDetection` workflows
- **Compare environments** — suggest `compareSchema`, `compareData` for dev-vs-prod analysis
- **Administer security** — recommend `securityScan`, `privilegeAnalysis`, `auditLog`
- **Work with HANA Cloud** — guide through `hanaCloudInstances`, `hanaCloudStart`/`Stop`
- **Manage HDI containers** — suggest `containers`, `adminHDI`, `createContainer`

## Regenerating

These files are auto-generated from hana-cli's metadata. To regenerate:

```bash
cd hana-developer-cli-tool-example
npm run build --prefix mcp-server    # Build MCP server first
node generate-agent-instructions.js --force
```

## Version

Generated from **hana-cli v4.202603.2** on 2026-03-17.
