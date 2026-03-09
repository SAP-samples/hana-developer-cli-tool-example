---
description: "Use when creating or updating CHANGELOG.json entries. Enforces the repository's existing JSON schema, ordering, style, and compatibility with generated CHANGELOG.md output."
applyTo: "CHANGELOG.json"
---

# CHANGELOG.json Update Guidelines

Use this guide whenever editing `CHANGELOG.json`.

## Scope and Source of Truth

- This file applies only to `CHANGELOG.json`.
- The canonical history source is `CHANGELOG.json`.
- `CHANGELOG.md` is generated from `CHANGELOG.json` by `CHANGELOG.js`.

## Required JSON Structure

`CHANGELOG.json` must remain a valid JSON array of release objects.

Each release object must use this exact field set and order:
1. `date`
2. `version`
3. `Changed`

Example shape:

```json
{
  "date": "2026-02-16",
  "version": "4.202602.0",
  "Changed": [
    "Update dependency X",
    "Improve behavior Y"
  ]
}
```

## Formatting Rules

- Keep strict JSON (double quotes, no comments, no trailing commas).
- Keep the existing indentation/pretty-print style used in the file.
- Keep `Changed` key capitalization exactly as `Changed`.
- Keep `Changed` as an array of strings.

## Ordering Rules

- Keep entries in reverse chronological order (newest release first).
- Add new releases at the top of the array.
- Do not reorder or rewrite historical entries unless explicitly requested.

## Content Style Rules

- Write concise, factual change statements.
- Keep one distinct change per string entry.
- Preserve existing tone: practical release-note language, not marketing copy.
- Include links (issues, PRs, docs) only when relevant and known.
- Avoid placeholders like "TBD" or unverifiable claims.

## Field Conventions

### `date`

- Required format: `YYYY-MM-DD`.
- Use the release date, not implementation start date.

### `version`

- Follow existing project version patterns already present in the file.
- Keep exact string format used historically (for example `4.202602.0`).

### `Changed`

- Use non-empty strings only.
- Prefer complete statements that can stand alone in generated markdown.
- Keep each item specific enough to be useful to end users.

## Safety and Compatibility Checks

Before finalizing edits:

- [ ] JSON parses successfully.
- [ ] New entry is at top (if adding a release).
- [ ] Field names and field order are correct.
- [ ] `Changed` contains only strings.
- [ ] Existing historical entries were not unintentionally modified.
- [ ] Content is consistent with actual implemented changes.

## Common Mistakes to Avoid

❌ Renaming `Changed` to `changes` or any other key

❌ Adding markdown headers or non-JSON text into `CHANGELOG.json`

❌ Mixing date formats (for example `MM/DD/YYYY`)

❌ Reordering historical releases

❌ Adding speculative or unverified feature claims
