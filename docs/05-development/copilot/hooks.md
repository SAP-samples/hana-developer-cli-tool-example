# Copilot Hooks

This page documents deterministic Copilot hook behavior configured for this repository.

## Purpose

Hooks enforce runtime checks and reminders that instructions/prompts alone cannot guarantee.

## Current behavior

- **PreToolUse**
  - Asks for confirmation before risky terminal commands (for example install, publish, destructive operations).

- **PostToolUse**
  - Triggers lightweight checks based on changed files (for example docs index rebuild and i18n validation).

- **Stop**
  - Adds end-of-session reminders for follow-up validation tasks.

## Configuration location

- `.github/hooks/quality-gates.json`
- Hook scripts in `.github/hooks/`

## When to use hooks

Use hooks when behavior must be deterministic, auditable, and enforced consistently.

## Source

- `.github/hooks/README.md`

## See Also

- [Copilot Customization Overview](../copilot.md)
- [Workspace Instructions](./workspace-instructions.md)
- [Skills](./skills.md)
