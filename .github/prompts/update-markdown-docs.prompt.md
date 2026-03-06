---
description: "Create or update Markdown documentation in this repo with existing style"
name: "Update Markdown Docs"
argument-hint: "Doc path(s) + intent (e.g., docs/02-commands/data-sync/compare.md: add options section)"
agent: "agent"
---
You are updating Markdown documentation in this repository. Use the user-provided arguments to identify the doc path(s) and the desired change.

Requirements:
- Read and follow the existing documentation style in this repo (headings, tables, tone, examples).
- If the target is under `docs/02-commands/`, follow the command-doc rules in [command documentation instructions](../instructions/command-documentation.instructions.md).
- Keep changes minimal and consistent with existing structure.
- Use accurate terminology that matches the CLI and the repository.

Output:
- Apply edits to the specified Markdown file(s).
- Provide a concise summary of what changed and why.
