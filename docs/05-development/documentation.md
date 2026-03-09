# Documentation Structure

This page explains how documentation is organized and maintained for SAP HANA Developer CLI using VitePress.

## Quick Start

### Build and serve locally

```bash
cd docs

# Install dependencies
npm install

# Start development server
npm run docs:dev

# Build static site
npm run docs:build

# Preview locally
npm run docs:serve
```

Development server default URL: <http://localhost:5173>

## Folder Structure

Current high-level structure:

```text
docs/
├── .vitepress/               # VitePress configuration and theme
├── 01-getting-started/       # Onboarding, installation, configuration
├── 02-commands/              # Command reference, grouped by category
├── 03-features/              # Feature guides (API server, MCP, output formats, etc.)
├── 04-api-reference/         # API and route documentation
├── 05-development/           # Contributor and implementation docs
├── 99-reference/             # FAQ, changelog, reference material
├── troubleshooting/          # Troubleshooting index and topic pages
├── developer-notes/          # Internal-oriented technical notes
├── index.md                  # Documentation landing page
└── package.json              # Docs-specific scripts and dependencies
```

## Configuration

### `.vitepress/config.ts`

The VitePress config currently includes:

- Site metadata (`title`, `description`, `lang`)
- Navigation and sidebar definitions
- Local search (`provider: 'local'`)
- Edit links targeting branch `Feb2026`
- Mermaid integration through `vitepress-plugin-mermaid`
- `cleanUrls: true` and `lastUpdated` support

### `.vitepress/theme/`

Theme customizations and styles are defined in the theme directory.

## Navigation Structure

Top-level navigation currently links to:

1. Home
2. Getting Started
3. Commands
4. Features
5. API Reference
6. Development
7. References (includes Troubleshooting)

Command documentation under `02-commands/` is grouped into multiple categories (for example: Analysis Tools, Data Tools, Schema Tools, System Tools, Security, and others).

## Build and Deployment Notes

### Local development

Use:

```bash
npm run docs:dev
```

### Production build

Use:

```bash
npm run docs:build
```

With the current setup, static files are generated in `.vitepress/dist/`.

### GitHub Pages deployment (manual example)

If deploying via subtree, push the built output folder:

```bash
npm run docs:build
git add docs/.vitepress/dist
git commit -m "docs: build for deployment"
git subtree push --prefix docs/.vitepress/dist origin gh-pages
```

:::warning
If your deployment workflow uses a different output path or GitHub Actions workflow, align the path with that workflow instead of this manual example.
:::

## Content Guidelines

When updating docs:

1. Use one `#` heading per page
2. Keep heading levels sequential (`##`, then `###`)
3. Use language-tagged code blocks (`bash`, `json`, `text`, etc.)
4. Prefer internal links that match existing docs routes
5. Include practical examples for workflows
6. Add `## See Also` links where helpful

## VitePress Markdown Features

### Admonitions

```markdown
:::info
Informational note.
:::

:::warning
Important caveat.
:::

:::danger
Potentially destructive action.
:::
```

### Expandable details

```markdown
<details>
<summary>Click to expand</summary>

Additional content.

</details>
```

## Troubleshooting

### Build fails

- Reinstall dependencies in `docs/`
- Re-run `npm run docs:build`
- Review build output for broken links or Markdown issues

### Search expectations

- Search is configured with the local provider in VitePress config
- Rebuild if newly added pages are not appearing as expected

### Styling issues

- Check `.vitepress/theme/style.css`
- Hard refresh the browser cache
- Verify behavior using the production build output

## Resources

- [VitePress Documentation](https://vitepress.dev/)
- [VitePress Markdown Guide](https://vitepress.dev/guide/markdown)
- [Vue 3 Documentation](https://vuejs.org/)

## Maintenance

Update documentation when:

- Commands or options change
- New features are introduced
- API behavior changes
- Navigation or section taxonomy is updated

## See Also

- [Development Guide](./index.md)
- [Documentation Home](../index.md)
- [Commands Overview](../02-commands/index.md)
- [Troubleshooting](../troubleshooting/index.md)
