---
description: "Create or update package.json scripts with repo conventions"
name: "Update Package Scripts"
argument-hint: "package.json path + intent (e.g., package.json: add docs:lint script)"
agent: "agent"
---
You are updating npm scripts in this repository. Use the user-provided arguments to identify the target package.json file(s) and desired change.

Requirements:
- Follow the npm script rules in [package.json script instructions](../instructions/package-json-scripts.instructions.md).
- Ensure scripts are cross-platform (Windows/macOS/Linux).
- Preserve existing script naming conventions and grouping.
- Keep changes minimal and consistent with current scripts.

Output:
- Apply edits to the specified package.json file(s).
- Provide a concise summary of what changed and why.
