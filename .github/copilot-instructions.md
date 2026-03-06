# Workspace Copilot Instructions

These instructions apply to all work in this repository.

## Project Context
- Node.js ESM project ("type": "module"); prefer ESM import/export patterns.
- CLI uses i18n; all user-facing text must go through text bundles.
- Docs are VitePress-based; keep structure and taxonomy consistent.

## General Expectations
- Keep changes minimal and consistent with existing style.
- Prefer updating existing utilities/scripts over introducing new ones.
- Use repository instructions in `.github/instructions/` when they match file scope.
- Avoid modifying docs or workflows unless explicitly requested.
- When adding scripts, keep them cross-platform.

## Testing and Validation
- Run targeted tests only when needed; do not run the full suite unless requested.
- For docs changes, consider regenerating the docs index or building VitePress.
- For i18n changes, validate using the existing i18n validation script.

## Tooling Preferences
- Use the existing scripts in `scripts/` and root automation scripts when available.
- Avoid introducing new dependencies unless necessary and justified.

## Output Expectations
- Provide concise summaries of changes and recommended follow-ups.
