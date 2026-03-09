---
description: "Create or update VitePress config, theme, and sidebar files with repository conventions"
name: "Update VitePress Config"
argument-hint: "File path(s) + intent (e.g., docs/.vitepress/config.ts: add new sidebar section for 06-tools)"
agent: "agent"
---
You are updating VitePress configuration or theme files in this repository. Use the user-provided arguments to identify the target file(s) and desired change.

Requirements:
- Follow the VitePress configuration rules in [VitePress config instructions](../instructions/vitepress-config-management.instructions.md).
- Preserve existing structure, ordering, and formatting.
- Keep changes minimal and consistent with existing VitePress patterns.
- Ensure base URL, sidebar, and navigation remain consistent with the docs taxonomy.
- Use Mermaid integration patterns where needed.

Output:
- Apply edits to the specified file(s).
- Provide a concise summary of what changed and why.
