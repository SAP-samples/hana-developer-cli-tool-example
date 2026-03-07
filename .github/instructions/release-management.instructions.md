---
description: "Use when preparing releases, updating CHANGELOG.json, bumping versions, or publishing to npm. Enforces consistent release process, version numbering conventions, changelog maintenance, and publishing workflow."
applyTo: "CHANGELOG.json,package.json,CHANGELOG.js"
---

# Release Management Guidelines

Use this guide when preparing releases, updating the changelog, or publishing new versions of the hana-cli tool.

## Scope and Purpose

This guide applies to:
- **CHANGELOG.json** - Structured changelog entries
- **package.json** - Version number updates
- **CHANGELOG.js** - Changelog generation script
- Release preparation and npm publishing process

## Version Numbering Convention

### Primary Package (hana-cli)

**Format**: `MAJOR.YYYYMM.PATCH`

**Examples:**
- `4.202602.0` - Version 4, released February 2026, patch 0
- `3.202601.0` - Version 3, released January 2026, patch 0
- `3.202511.0` - Version 3, released November 2025, patch 0

**Components:**
- **MAJOR** - Major version number (incremented for breaking changes or significant milestones)
- **YYYYMM** - Year and month of release (e.g., 202602 = February 2026)
- **PATCH** - Patch number within the month (typically 0 for first release, 1+ for hotfixes)

### MCP Server Package

**Format**: `MINOR.YYYYMM.PATCH`

**Example:** `1.202602.0`

**Location**: `mcp-server/package.json`

**Note**: MCP server versioning follows same date-based pattern but with lower major version number since it's a newer component.

### Documentation Package

**Format**: Standard semantic versioning `MAJOR.MINOR.PATCH`

**Example:** `1.0.0`

**Location**: `docs/package.json`

**Note**: Documentation version is independent and follows standard semver.

## CHANGELOG.json Structure

### File Format

**Location**: Root directory `CHANGELOG.json`

**Structure**: Array of release objects

```json
[
  {
    "date": "YYYY-MM-DD",
    "version": "MAJOR.YYYYMM.PATCH",
    "Changed": [
      "Description of change 1",
      "Description of change 2",
      "..."
    ]
  },
  {
    "date": "YYYY-MM-DD",
    "version": "MAJOR.YYYYMM.PATCH",
    "Added": [
      "New feature 1",
      "New feature 2"
    ],
    "Fixed": [
      "Bug fix 1"
    ],
    "Changed": [
      "Changes 1"
    ],
    "Deprecated": [
      "Deprecated item"
    ],
    "Removed": [
      "Removed feature"
    ],
    "Security": [
      "Security fix"
    ]
  }
]
```

### Supported Categories

Based on [Keep a Changelog](http://keepachangelog.com/) convention:

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerabilities fixed

**Note**: Categories are optional. Use only the categories that apply to your release.

### Entry Guidelines

**1. Most Recent First**: New releases go at the beginning of the array

**2. Descriptive Entries**: Each entry should:
   - Start with a clear subject
   - Be specific about what changed
   - Include context if needed (e.g., "for better compatibility with...")
   - Mention related components if applicable

**3. Entry Quality Examples:**

✅ **Good:**
```json
"CLI Startup Performance Optimization - Implemented lazy-loading strategy for command modules and dependencies, resulting in 60-77% faster startup times for most commands."
```

✅ **Good:**
```json
"New import command features - added support for matching columns by order, name, or auto (try name then fall back to order), improved error handling and reporting for mismatched columns"
```

❌ **Too vague:**
```json
"Performance improvements"
"Bug fixes"
"Updated dependencies"
```

**4. Multiple Changes**: When describing multiple related changes, use detailed single entries rather than splitting into many bullet points

**5. Breaking Changes**: Clearly mark breaking changes with prefix or explanation

✅ **Example:**
```json
"BREAKING: Migrate from Express 4.x to 5.x now that CAP supports Express 5 as well. This is a major internal change but should be mostly transparent to users. If you do see any issues please report them."
```

**6. Version Dependency Notes**: Include when changes require specific versions

✅ **Example:**
```json
"Emergency Fix for CAP version 8.9 - changes to how binding works. This version of hana-cli only works with @sap/cds-dk 8.9 and higher. If you are using older version of @sap/cds-dk then you must also use older versions of the hana-cli."
```

### Changelog Generation

**Script**: `CHANGELOG.js` (root directory)

**Purpose**: Converts `CHANGELOG.json` to `CHANGELOG.md` with header

**Usage:**
```bash
npm run changelog
# or
node CHANGELOG.js
```

**Output**: `CHANGELOG.md` with standard header:
```markdown
# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [Version] - Date
...
```

**When to Run:**
- Before committing a new release
- After updating CHANGELOG.json
- As part of release preparation workflow

## Release Preparation Workflow

### Step 1: Prepare Changes

**1. Ensure all changes are committed:**
```bash
git status
git add .
git commit -m "Prepare release vX.YYYYMM.P"
```

**2. Verify tests pass:**
```bash
npm test
npm run coverage:check
```

**3. Verify i18n bundles:**
```bash
npm run validate:i18n
```

### Step 2: Update Version Numbers

**1. Update `package.json` version:**
```bash
# Manual edit or use npm version
npm version 4.202602.0 --no-git-tag-version
```

**2. Update `mcp-server/package.json` if MCP changes were made:**
```json
{
  "version": "1.202602.0"
}
```

**3. Commit version bump:**
```bash
git add package.json mcp-server/package.json
git commit -m "Bump version to 4.202602.0"
```

### Step 3: Update CHANGELOG.json

**1. Add new release entry at the beginning of array:**

```json
[
  {
    "date": "2026-02-16",
    "version": "4.202602.0",
    "Changed": [
      "Major version bump to 4.x reflecting significant internal improvements",
      "Update SAPUI5 version and dependencies to 1.144.1",
      "Various dependency updates and maintenance"
    ],
    "Added": [
      "New feature X for improved workflow"
    ],
    "Fixed": [
      "Issue with database connection pooling"
    ]
  },
  // ... previous releases
]
```

**2. Generate CHANGELOG.md:**
```bash
npm run changelog
```

**3. Review generated CHANGELOG.md:**
```bash
cat CHANGELOG.md
# or
notepad CHANGELOG.md
```

**4. Commit changelog:**
```bash
git add CHANGELOG.json CHANGELOG.md
git commit -m "Update CHANGELOG for v4.202602.0"
```

### Step 4: Tag Release

**1. Create annotated tag:**
```bash
git tag -a v4.202602.0 -m "Release version 4.202602.0"
```

**2. Verify tag:**
```bash
git tag -l
git show v4.202602.0
```

### Step 5: Push to Repository

**1. Push commits and tags:**
```bash
git push origin Feb2026  # or main
git push origin v4.202602.0
```

**2. Verify GitHub Actions:**
- Check that workflows run successfully
- Verify documentation deployment (if docs changed)
- Verify cross-platform tests pass

### Step 6: Publish to npm

**1. Ensure you're logged in to npm:**
```bash
npm whoami
# If not logged in:
npm login
```

**2. Build and verify package:**
```bash
npm pack
# Review generated tarball
tar -tzf hana-cli-4.202602.0.tgz
```

**3. Publish to npm:**
```bash
npm publish
```

**4. Verify publication:**
```bash
npm info hana-cli
npm info hana-cli version
```

**5. Test installation:**
```bash
# In a separate directory
mkdir test-install
cd test-install
npm install -g hana-cli@4.202602.0
hana-cli --version
```

### Step 7: Create GitHub Release

**1. Go to GitHub repository → Releases**

**2. Click "Draft a new release"**

**3. Fill in release details:**
- **Tag**: Select existing tag (v4.202602.0)
- **Release title**: `v4.202602.0 - February 2026 Release`
- **Description**: Copy relevant entries from CHANGELOG.md

**4. Attach assets if needed:**
- Installation guides
- Example configurations
- Migration guides

**5. Publish release**

## Hotfix Release Workflow

For urgent bug fixes between regular releases:

### Step 1: Create Hotfix Branch

```bash
git checkout -b hotfix/4.202602.1 main
```

### Step 2: Apply Fixes

```bash
# Make necessary changes
git add .
git commit -m "Fix critical issue in connection handling"
```

### Step 3: Version and Changelog

**1. Bump patch version:**
```bash
npm version 4.202602.1 --no-git-tag-version
```

**2. Add hotfix entry to CHANGELOG.json:**
```json
[
  {
    "date": "2026-02-20",
    "version": "4.202602.1",
    "Fixed": [
      "Critical issue with database connection timeout handling",
      "Memory leak in long-running interactive sessions"
    ]
  },
  // ... previous releases
]
```

**3. Generate changelog:**
```bash
npm run changelog
git add CHANGELOG.json CHANGELOG.md package.json
git commit -m "Hotfix v4.202602.1"
```

### Step 4: Merge and Release

```bash
# Tag
git tag -a v4.202602.1 -m "Hotfix v4.202602.1"

# Merge to main
git checkout main
git merge hotfix/4.202602.1

# Push
git push origin main
git push origin v4.202602.1

# Publish
npm publish

# Clean up
git branch -d hotfix/4.202602.1
```

## Pre-Release Versions

For beta or alpha releases:

### Version Format

**Alpha**: `4.202602.0-alpha.1`
**Beta**: `4.202602.0-beta.1`
**RC**: `4.202602.0-rc.1`

### Publishing Pre-Release

```bash
# Version bump with pre-release identifier
npm version 4.202602.0-beta.1 --no-git-tag-version

# Publish with tag (not as latest)
npm publish --tag beta

# Users install with:
npm install -g hana-cli@beta
```

### CHANGELOG.json for Pre-Release

```json
[
  {
    "date": "2026-02-10",
    "version": "4.202602.0-beta.1",
    "Changed": [
      "BETA: Testing new database abstraction layer",
      "BETA: Experimental MCP server improvements"
    ]
  }
]
```

## Release Checklist

Use this checklist for every release:

### Before Release

- [ ] All tests pass (`npm test`)
- [ ] Coverage meets threshold (`npm run coverage:check`)
- [ ] i18n bundles validated (`npm run validate:i18n`)
- [ ] Documentation is up to date
- [ ] No uncommitted changes (`git status`)
- [ ] README version references updated if needed

### Version and Changelog

- [ ] Version bumped in `package.json`
- [ ] Version bumped in `mcp-server/package.json` (if applicable)
- [ ] New entry added to `CHANGELOG.json` at beginning of array
- [ ] CHANGELOG.json date is correct (YYYY-MM-DD format)
- [ ] CHANGELOG.json version matches package.json
- [ ] CHANGELOG entries are descriptive and follow guidelines
- [ ] `CHANGELOG.md` regenerated (`npm run changelog`)
- [ ] Changes committed

### Tagging and Pushing

- [ ] Git tag created with correct version (`git tag -a vX.YYYYMM.P`)
- [ ] Tag message is descriptive
- [ ] Commits pushed to GitHub
- [ ] Tag pushed to GitHub
- [ ] GitHub Actions workflows completed successfully

### Publishing

- [ ] Logged in to npm (`npm whoami`)
- [ ] Package built and reviewed (`npm pack`)
- [ ] Published to npm (`npm publish`)
- [ ] Publication verified (`npm info hana-cli`)
- [ ] Global installation tested

### Post-Release

- [ ] GitHub Release created with notes
- [ ] Release announcement prepared (if major release)
- [ ] Documentation site updated (auto-deployed via workflow)
- [ ] Issues/PRs linked to release closed
- [ ] Next milestone created (if applicable)

## Common Issues and Solutions

### Issue: npm publish fails with authentication error

**Solution:**
```bash
npm logout
npm login
npm whoami
npm publish
```

### Issue: Version conflict - "Version already exists"

**Solution:**
```bash
# Check current npm version
npm info hana-cli version

# Bump to next available version
npm version 4.202602.1 --no-git-tag-version
```

### Issue: Git tag already exists

**Solution:**
```bash
# Delete local tag
git tag -d v4.202602.0

# Delete remote tag (if pushed)
git push origin :refs/tags/v4.202602.0

# Recreate tag
git tag -a v4.202602.0 -m "Release v4.202602.0"
```

### Issue: CHANGELOG.md generation fails

**Solution:**
```bash
# Verify CHANGELOG.json is valid JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('CHANGELOG.json')))"

# Regenerate
node CHANGELOG.js
```

### Issue: Package includes unwanted files

**Solution:**
- Check `.npmignore` file
- Review `files` field in `package.json`
- Use `npm pack` to preview contents before publishing

```bash
npm pack
tar -tzf hana-cli-4.202602.0.tgz
```

## npm Scripts for Release Management

**Generate Changelog:**
```bash
npm run changelog
```

**Run Full Test Suite:**
```bash
npm test
npm run coverage
```

**Validate i18n:**
```bash
npm run validate:i18n
```

**Type Checking:**
```bash
npm run types
```

## Related Documentation

- [changelog-json.instructions.md](changelog-json.instructions.md) - Detailed CHANGELOG.json format
- [package-json-scripts.instructions.md](package-json-scripts.instructions.md) - npm scripts conventions
- [github-workflow-maintenance.instructions.md](github-workflow-maintenance.instructions.md) - CI/CD workflows

## Version History Best Practices

### Document Breaking Changes

Always clearly mark breaking changes and provide migration guidance:

```json
{
  "date": "2026-02-16",
  "version": "4.202602.0",
  "Changed": [
    "BREAKING: Migrate from Express 4.x to 5.x. If you extend this tool's Express server, review your middleware for Express 5 compatibility."
  ]
}
```

### Group Related Changes

Group related changes into comprehensive entries:

✅ **Good:**
```json
"CLI Startup Performance Optimization - Implemented lazy-loading strategy for command modules and dependencies, resulting in 60-77% faster startup times. Key improvements: ultra-fast path for --version flag, deferred yargs loading, conditional debug module loading, elimination of completion overhead."
```

❌ **Too fragmented:**
```json
"Added lazy loading",
"Improved version flag performance",
"Deferred yargs loading",
"Conditional debug loading"
```

### Reference External Changes

When depending on external package changes:

```json
"Various dependency updates and maintenance - especially update to @sap/cds-dk 9.7.1 for better compatibility with cds-fiori plugin and the latest CAP features"
```

### Document Impact

Explain user-facing impact:

```json
"New import command features - added support for matching columns by order, name, or auto (try name then fall back to order), improved error handling and reporting for mismatched columns and data type issues"
```

## Critical Rules

1. **Always update CHANGELOG.json before release** - Never release without documenting changes
2. **Version numbers must match everywhere** - package.json, CHANGELOG.json, and git tag
3. **Test before publishing** - Run full test suite and validate i18n
4. **Use semantic versioning date format** - MAJOR.YYYYMM.PATCH
5. **New releases at array start** - Most recent first in CHANGELOG.json
6. **Descriptive changelog entries** - Avoid vague descriptions
7. **Tag after CHANGELOG** - Create git tags after CHANGELOG is updated and committed
8. **Push tags explicitly** - `git push origin <tagname>`
9. **Verify before publishing** - Use `npm pack` to preview package contents
10. **Create GitHub Release** - Document releases on GitHub for visibility

## Summary

Release management for hana-cli follows a structured process:
1. Prepare and test changes
2. Update version numbers (date-based format)
3. Update CHANGELOG.json with descriptive entries
4. Generate CHANGELOG.md
5. Tag release with git
6. Push to GitHub (triggers CI/CD)
7. Publish to npm
8. Create GitHub Release

For hotfixes, use patch version bump (e.g., 4.202602.0 → 4.202602.1)
For pre-releases, use version identifiers (e.g., 4.202602.0-beta.1)

Always follow the release checklist to ensure no steps are missed.
