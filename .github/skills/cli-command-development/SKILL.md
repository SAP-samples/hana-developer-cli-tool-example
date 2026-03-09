---
name: cli-command-development
description: "Create or update CLI commands, routes, utilities, and tests in this repo. Use when adding or modifying bin/*, routes/*, utils/*, or related tests."
argument-hint: "Command or file path + intent (e.g., bin/data-sync.js: add new option)"
user-invocable: true
---

# CLI Command Development Skill

Use this skill for CLI-related implementation work across commands, routes, utilities, and tests.

## When to Use
- Adding or modifying CLI commands in `bin/`
- Updating routes in `routes/`
- Modifying shared utilities in `utils/`
- Adding or adjusting tests in `tests/`
- Updating i18n text and translations

## Procedure
1. Identify the target file(s) and the command/feature scope.
2. Apply the relevant instructions:
   - CLI command development rules
   - Route development rules (if under `routes/`)
   - Utility module development rules (if under `utils/`)
   - i18n translation and text handling rules
   - Testing rules and utilities reuse
3. Make minimal, testable changes following existing patterns.
4. Update i18n properties for any new user-facing text.
5. Run targeted tests only if needed.

## Notes
- All user-facing text must use text bundles (`bundle.getText`).
- Keep CLI command options and validation consistent with existing commands.
- Prefer existing helpers in `utils/` rather than adding new ones.

## References
- [CLI command instructions](../../instructions/cli-command-development.instructions.md)
- [Route development instructions](../../instructions/route-development.instructions.md)
- [Utility module instructions](../../instructions/utility-module-development.instructions.md)
- [i18n translation instructions](../../instructions/i18n-translation-management.instructions.md)
- [Translatable text instructions](../../instructions/translatable-text-handling.instructions.md)
- [Testing instructions](../../instructions/testing.instructions.md)
- [Test utilities reuse](../../instructions/test-utilities-reuse.instructions.md)
