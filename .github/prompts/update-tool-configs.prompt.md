---
description: "Create or update lint/test/coverage/tooling configs with repo conventions"
name: "Update Tooling Configs"
argument-hint: "Config file(s) + intent (e.g., .nycrc.json: adjust include/exclude patterns)"
agent: "agent"
---
You are updating tooling configuration files in this repository. Use the user-provided arguments to identify the target file(s) and desired change.

Requirements:
- Follow the tooling config rules in [config file instructions](../instructions/config-files-management.instructions.md).
- Preserve existing structure and formatting.
- Keep ignore patterns consistent across related tools.
- Keep changes minimal and aligned with existing conventions.

Output:
- Apply edits to the specified config file(s).
- Provide a concise summary of what changed and why.
