# MCP Server Tool Reduction Plan

## Problem Statement

The hana-cli MCP server exposes **203 tools** on `tools/list`. When an MCP client (e.g., Claude Code, Cursor, Copilot) connects, all 203 tool definitions are injected into the AI's context window, consuming ~6,000-10,000 tokens before any user interaction begins. Most MCP servers expose 5-20 tools. This is unsustainable and crowds out space for actual work.

## Agreed Approach: Router + Tier-1 + Dynamic Registration

Combine three strategies:

1. **Router pattern** — a single `hana_execute` tool that can dispatch any command by name
2. **Tier-1 always-exposed** — a small set of high-value commands with full schemas
3. **Dynamic registration** — when the AI explores a category via discovery tools, register those tools and emit `listChanged` (progressive enhancement for capable clients)

## Architecture

### Initial `tools/list` Response (~12-15 tools)

#### Discovery Tools (keep as-is)
- `hana_discover_categories` — browse command categories
- `hana_discover_by_category` — list commands in a category (**+ triggers dynamic registration**)
- `hana_discover_by_tag` — search by tag
- `hana_recommend` — natural-language intent → command suggestion
- `hana_search` — full-text search across docs/commands/workflows
- `hana_get_doc` — retrieve full documentation page
- `hana_examples` — usage examples for a command
- `hana_parameter_presets` — parameter templates for a command

#### Router Tool (new)
- `hana_execute` — generic router that accepts `{command, args, __projectContext}` and dispatches to any CLI command internally

#### Tier-1 Commands (always exposed with full schema)
- `hana_query_simple` — direct SQL execution (most common need)
- `hana_tables` — list tables in schema
- `hana_inspect_table` — table structure/metadata
- `hana_views` — list views
- `hana_status` — connection check / current user

### Dynamic Registration (Option 2 enhancement)

**Trigger:** When `hana_discover_by_category` is called, the server:
1. Returns the category listing (command names, descriptions, use cases) as it does today
2. Registers all tools in that category with full input schemas
3. Emits `notifications/tools/list_changed`

**Client behavior:**
- Clients supporting `listChanged`: re-fetch `tools/list`, see newly registered tools with full schemas
- Clients not supporting `listChanged`: ignore the notification, continue using `hana_execute` router

**Accumulation cap:** Dynamically registered tools accumulate up to ~50 tools. If the cap is hit, the oldest activated category is deregistered. (In practice, sessions focus on 1-2 categories so this is unlikely to trigger.)

## Implementation Scope

All changes in `mcp-server/src/`:

### 1. New file: `tools/router-tool.ts`
- Define `hana_execute` tool with schema: `{command: string, args: object, __projectContext?}`
- Handler: validate command exists in commandsMap, delegate to existing `executeCommand()`
- Return formatted result same as current CLI tool handler

### 2. New file: `tools/tier-config.ts`
- Export `TIER_1_COMMANDS: string[]` — the always-exposed command names
- Export `isDiscoveryTool(name)`, `isRouterTool(name)` helpers

### 3. Modify: `tools/cli-tools.ts`
- `getCliToolDefinitions()` → only return tools for TIER_1_COMMANDS
- New export: `getDynamicCliToolDefinitions(category: string)` → returns tool definitions for a specific category
- `handleCliTool()` — unchanged (still resolves any command name)

### 4. Modify: `tools/discovery-tools.ts`
- `handleDiscoveryTool("discover_by_category", ...)` — after returning results, call a callback/event to trigger dynamic registration

### 5. Modify: `index.ts`
- `ListToolsRequestSchema` handler: return discovery + router + tier-1 + any dynamically registered tools
- Track `activatedCategories: Set<string>` as server state
- When a category is activated: merge those tool definitions into the active set, emit `notifications/tools/list_changed`
- Declare `listChanged: true` in capabilities

### 6. Existing infrastructure to leverage
- `commandMetadata.js` already categorizes all 187 commands into 15 groups
- `command-metadata.ts` already has `getCommandsInCategory()` helper
- `extractCommandInfo()` already generates full schemas from yargs builders
- Discovery tools already return category/command listings

## Migration / Backwards Compatibility

- **Default behavior changes** — clients will see ~12 tools instead of 203
- Consider a `--full` CLI flag on the MCP server binary for users who want legacy behavior: `hana-cli-mcp --full` exposes all 203 tools as before
- Document the change in release notes

## Token Budget Estimate

| Mode | Tools exposed | Estimated tokens |
|------|--------------|-----------------|
| Current (all) | 203 | ~8,000-10,000 |
| New default (initial) | ~12-15 | ~500-700 |
| After 1 category activation | ~25-30 | ~1,200-1,500 |
| After 3 category activations | ~55-60 | ~2,500-3,000 |

## Open Questions

1. **Tier-1 list** — are `querySimple`, `tables`, `inspectTable`, `views`, `status` the right set? Should `schemas` or `healthCheck` be included?
2. **`hana_execute` schema richness** — should the router tool's description include a condensed list of all available command names (costs tokens but helps the AI without discovery round-trips)?
3. **Deactivation** — should there be a way to deactivate a category (shrink the tool list back)? Probably not needed in practice.
4. **`hana_recommend` integration** — when `hana_recommend` suggests a command, should it also trigger registration of that command's category?

## Decision Log

- 2026-05-14: Agreed on Router + Tier-1 + Dynamic Registration approach
- 2026-05-14: Dynamic registration triggered implicitly by `discover_by_category` (option A, no separate activate call)
- 2026-05-14: User configuration (profiles) deferred — most users won't know what to configure
- 2026-05-14: `--full` flag for backwards compat retained as escape hatch
