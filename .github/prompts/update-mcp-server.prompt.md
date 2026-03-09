---
description: "Create or update MCP server components with repo conventions"
name: "Update MCP Server"
argument-hint: "MCP file path + intent (e.g., mcp-server/src/index.ts: register new tool)"
agent: "agent"
---
You are updating MCP server TypeScript files in this repository. Use the user-provided arguments to identify the target file(s) and desired change.

Requirements:
- Follow the MCP server rules in [MCP server instructions](../instructions/mcp-server-development.instructions.md).
- Preserve JSON-RPC compliance and tool registration patterns.
- Keep changes minimal and consistent with existing MCP structure.

Output:
- Apply edits to the specified file(s).
- Provide a concise summary of what changed and why.
