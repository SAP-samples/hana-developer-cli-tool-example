# Hooks

This folder contains Copilot hook configurations for deterministic workflow checks.

Canonical docs: [`docs/05-development/copilot/hooks.md`](../../docs/05-development/copilot/hooks.md)

## When to use hooks

Hooks are best for enforcing actions that must *always* happen, such as:

- Blocking risky commands
- Requiring confirmation before destructive operations
- Automatically running validation checks

## Recommended hook ideas for this repo

- **PreToolUse**: Ask for confirmation before running terminal commands that modify files or install packages.
- **PostToolUse**: Trigger lightweight validation after edits to docs or configs.
- **Stop**: Suggest running tests or doc builds when changes were made.

## Configuration

Hook configurations live in `.github/hooks/*.json`.
See the Copilot hooks reference for the JSON schema and supported events.
