---
description: "Use when creating or updating standard documentation pages outside docs/02-commands/. Enforces consistent structure, writing style, cross-linking, and VitePress-friendly markdown patterns already used in this repository."
applyTo: "docs/{01-getting-started,03-features,04-api-reference,05-development,99-reference,troubleshooting}/**/*.md,docs/*.md"
---

# General Documentation Guidelines (Non-Command Docs)

Use this guide for standard documentation pages in `docs/` outside `docs/02-commands/`.

## Scope

This file applies to:
- `docs/01-getting-started/**/*.md`
- `docs/03-features/**/*.md`
- `docs/04-api-reference/**/*.md`
- `docs/05-development/**/*.md`
- `docs/99-reference/**/*.md`
- `docs/troubleshooting/**/*.md`
- root docs pages like `docs/index.md`

This file does **not** apply to command reference pages in `docs/02-commands/**` (handled by `command-documentation.instructions.md`).

## Preservation Rule (Do Not Remove Existing Helpful Context)

When updating existing pages, preserve useful educational and explanatory content unless it is clearly outdated, incorrect, duplicated, or the user explicitly asks to remove it.

Practical rules:
- Update the target section without stripping unrelated narrative value.
- Keep existing examples if still valid; improve rather than delete.
- Maintain page-specific details (platform notes, edge cases, caveats) unless they are wrong.

## Standard Page Structure

Use this baseline structure unless a page type needs a variation:

1. `#` Title (single H1)
2. Short intro paragraph (what this page helps with)
3. Main sections with `##` headings
4. Concrete examples (`bash`, `json`, `text`, etc.)
5. Optional reference tables for options, comparisons, or troubleshooting mappings
6. `## See Also` with related internal links

### Typical Section Patterns

Use patterns already common in this repo:

- **Guide pages**: Prerequisites → Steps/Methods → Validation → Troubleshooting → Next Steps
- **Feature pages**: Overview → Use Cases → Configuration → Examples → Related Topics
- **API pages**: Overview → Endpoints/Contracts → Request/Response examples → Error handling → Security notes
- **Troubleshooting pages**: Problem/Error → Likely causes → Step-by-step fixes → Verification
- **Index/landing pages**: Section overview + concise link lists to child pages

## Writing Style

- Be concise, actionable, and user-focused.
- Prefer direct instructions over vague statements.
- Use consistent terminology: "HANA CLI", "hana-cli", "SAP HANA", "MCP".
- Avoid hype language; prioritize technical clarity.
- Keep headings descriptive and scannable.

## Examples and Snippets

- Every major workflow section should include at least one practical example.
- Use language-tagged fenced blocks (for example: `bash`, `json`, `javascript`, `yaml`, `text`).
- Keep examples realistic and copy/paste friendly.
- Do not include fictional flags, commands, routes, or files.

## Links and Navigation

- Prefer repository-consistent internal links:
  - Absolute doc links for section jumps (for example `/03-features/`)
  - Relative links for nearby pages (for example `./installation.md`, `../04-api-reference/`)
- Ensure links resolve to real files or routes.
- End pages with `## See Also` where useful.

## VitePress/Markdown Conventions

- Use one H1 per page.
- Keep heading levels sequential (`##` then `###`), avoid skipping levels.
- Use tables for comparisons, options, and mappings.
- Use admonitions (`:::info`, `:::warning`, `:::danger`) for important callouts.
- Use Mermaid diagrams when they clarify flow/architecture decisions.

## Accuracy and Validation Requirements

Do not guess technical behavior. Validate claims against implementation and existing docs.

When documenting technical behavior:
- Verify command names/options from source or help output.
- Verify API routes and payload shape from route/source files.
- Verify file paths and referenced documents exist.
- Keep version, prerequisites, and compatibility statements consistent with repository reality.

## Content Quality Checklist

Before finalizing updates:

- [ ] H1 and section structure are clear and consistent
- [ ] Examples are realistic and use correct syntax
- [ ] Internal links resolve correctly
- [ ] Terminology is consistent across sections
- [ ] Existing useful context was preserved
- [ ] `See Also` references relevant related pages

## Common Mistakes to Avoid

❌ Mixing command-doc template sections into non-command pages (for example command epilog or command metadata blocks)

❌ Removing valuable explanatory content while updating a single section

❌ Adding unverified options/endpoints/flags

❌ Broken links to non-existent docs pages

❌ Inconsistent heading hierarchy or missing intro context

## Reference Examples in This Repository

Use these as style references for non-command docs:
- `docs/01-getting-started/installation.md`
- `docs/03-features/output-formats.md`
- `docs/04-api-reference/http-routes.md`
- `docs/05-development/documentation.md`
- `docs/99-reference/faq-extended.md`
- `docs/troubleshooting/index.md`
