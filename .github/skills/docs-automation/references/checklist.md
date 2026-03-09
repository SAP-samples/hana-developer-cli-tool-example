# Docs Automation Checklist

Use this checklist when regenerating or enhancing documentation.

## Generation

- [ ] Run command doc generation scripts from repo root
- [ ] Confirm output files updated under `docs/02-commands/`
- [ ] Verify new/updated docs follow the existing style

## Enhancement

- [ ] Run `enhance-command-docs.js` after generation
- [ ] Validate headings, tables, and code blocks
- [ ] Ensure category names match the folder taxonomy

## Sidebar

- [ ] Regenerate sidebar configuration if structure changed
- [ ] Confirm new pages are linked correctly
- [ ] Keep sections collapsed/expanded consistent with existing patterns

## Validation

- [ ] Build docs to check for dead links
- [ ] Review for broken anchors or missing assets
