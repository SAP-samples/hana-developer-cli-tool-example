---
name: mcp-server-workflows
description: "Create or update MCP server tools, JSON-RPC handlers, and registrations. Use when working in mcp-server/src/**."
argument-hint: "MCP file path + intent (e.g., mcp-server/src/index.ts: register new tool)"
user-invocable: true
---

# MCP Server Workflows Skill

Use this skill for MCP server updates, tool registration, and JSON-RPC handling.

## When to Use
- Adding or modifying tools in the MCP server
- Adjusting JSON-RPC handlers or schemas
- Updating MCP server utilities in `mcp-server/src/`

## Procedure
1. Identify the target MCP file(s) and tool/handler scope.
2. Apply MCP server development instructions for JSON-RPC compliance.
3. Ensure tool registration and schema conversion patterns are preserved.
4. Make minimal, testable changes and keep logging consistent.
5. Recommend validation steps (build or tests) as needed.

## Notes
- Keep tool naming and argument schemas aligned with CLI metadata.
- Use structured logging (stderr) and avoid console.log for protocol data.

## References
- [MCP server instructions](../../instructions/mcp-server-development.instructions.md)
- [TypeScript configuration instructions](../../instructions/typescript-configuration.instructions.md)
