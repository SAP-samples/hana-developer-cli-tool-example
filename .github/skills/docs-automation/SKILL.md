---
name: docs-automation
description: "Automate docs updates and command documentation generation. Use for generate-command-docs, enhance-command-docs, sidebar generation, and VitePress build checks."
argument-hint: "Doc scope + intent (e.g., update command docs for data-sync, regenerate sidebar)"
user-invocable: true
---

# Docs Automation Skill

Use this skill for documentation generation and maintenance tasks.

## When to Use
- Regenerating command documentation in `docs/02-commands/`
- Enhancing command docs after generation
- Updating or regenerating the VitePress sidebar
- Validating doc builds and link consistency

## Procedure
1. Identify the docs scope (all commands vs specific folders).
2. Run the relevant automation scripts in the repo root:
   - `generate-command-docs.js`
   - `enhance-command-docs.js`
   - `populate-command-docs.js`
   - `generate-sidebar-config.js` or `generate-sidebar-config-fixed.js`
3. Spot-check updated markdown for formatting and taxonomy alignment.
4. If needed, run `vitepress build docs` to validate the output.

## Notes
- Follow the command documentation instructions for `docs/02-commands/`.
- Preserve existing category names and ordering in the sidebar.
- Use existing scripts rather than manual edits whenever possible.

## References
- [Docs automation checklist](./references/checklist.md)
