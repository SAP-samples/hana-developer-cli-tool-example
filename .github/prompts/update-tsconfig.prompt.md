---
description: "Create or update TypeScript configuration with repo conventions"
name: "Update TypeScript Config"
argument-hint: "tsconfig file + intent (e.g., mcp-server/tsconfig.json: enable strict null checks)"
agent: "agent"
---
You are updating TypeScript configuration files in this repository. Use the user-provided arguments to identify the target config file(s) and desired change.

Requirements:
- Follow the TypeScript configuration rules in [TypeScript config instructions](../instructions/typescript-configuration.instructions.md).
- Preserve the dual-config strategy: root for type generation, subproject for compilation.
- Keep changes minimal and consistent with existing compiler options.
- Ensure ESM module resolution compatibility.

Output:
- Apply edits to the specified TypeScript config file(s).
- Provide a concise summary of what changed and why.
