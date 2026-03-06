---
description: "Create or update root automation scripts (generate/enhance/update/populate) with repo conventions"
name: "Update Automation Scripts"
argument-hint: "Script path + intent (e.g., generate-command-docs.js: add new section output)"
agent: "agent"
---
You are updating root-level automation scripts in this repository. Use the user-provided arguments to identify the target script(s) and desired change.

Requirements:
- Follow the automation script rules in [automation script instructions](../instructions/automation-script-development.instructions.md).
- Preserve existing I/O, error handling, and output formats.
- Keep changes minimal and consistent with current generation patterns.
- Ensure any doc outputs remain VitePress-compatible.

Output:
- Apply edits to the specified script file(s).
- Provide a concise summary of what changed and why.
