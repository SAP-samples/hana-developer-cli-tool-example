---
name: release
description: Guide through the hana-cli release process — version bump, changelog, i18n validation, tests, tagging, and npm publish. Use when preparing a release.
disable-model-invocation: true
---

# Release Checklist

This skill walks through the hana-cli release process step by step. It has side effects (git tags, npm publish), so it is user-invoked only.

**Version format:** `MAJOR.YYYYMM.PATCH` (e.g., `4.202604.0`)

## Pre-Flight Checks

Before starting, verify the workspace is clean and tests pass:

```bash
git status                      # No uncommitted changes
npm test                        # All tests pass
npm run coverage:check          # 80% threshold met
npm run validate:i18n           # i18n bundles complete
npm run lint                    # No lint errors
```

If any check fails, fix it before proceeding. Do NOT skip checks.

## Step 1: Determine Version

Calculate the new version number:
- **Regular release**: `MAJOR.YYYYMM.0` (e.g., `4.202604.0`)
- **Hotfix**: `MAJOR.YYYYMM.PATCH+1` (e.g., `4.202604.1`)
- **Pre-release**: `MAJOR.YYYYMM.0-beta.N`

Ask the user what type of release this is and confirm the version number.

## Step 2: Bump Version

```bash
npm version <new-version> --no-git-tag-version
```

If MCP server changes were included, also bump `mcp-server/package.json`.

## Step 3: Update CHANGELOG.json

Add a new entry at the **beginning** of the `CHANGELOG.json` array:

```json
{
  "date": "YYYY-MM-DD",
  "version": "<new-version>",
  "Added": ["..."],
  "Changed": ["..."],
  "Fixed": ["..."]
}
```

Use `git log --oneline <last-tag>..HEAD` to gather changes since the last release.

Write descriptive, grouped entries — not fragmented one-liners. See `.github/instructions/release-management.instructions.md` for examples.

Then regenerate the markdown changelog:

```bash
npm run changelog
```

## Step 4: Commit, Tag, and Push

```bash
git add package.json CHANGELOG.json CHANGELOG.md
# Also add mcp-server/package.json if bumped
git commit -m "Version Bump and Changelog Maintenance"
git tag -a v<new-version> -m "Release v<new-version>"
```

**STOP** — confirm with the user before pushing:

```bash
git push origin <branch>
git push origin v<new-version>
```

## Step 5: Publish to npm

**STOP** — confirm with the user before publishing:

```bash
npm whoami                      # Verify logged in
npm pack                        # Preview package contents
npm publish                     # Publish (or npm publish --tag beta for pre-release)
```

## Step 6: Post-Release

- [ ] Verify: `npm info hana-cli version`
- [ ] Create GitHub Release at https://github.com/SAP-samples/hana-developer-cli-tool-example/releases
- [ ] Verify docs deployment workflow completed
