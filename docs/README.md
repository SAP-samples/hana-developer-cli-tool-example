# Documentation Structure

This folder contains the complete documentation for SAP HANA Developer CLI, structured and built with VitePress.

## Quick Start

### Build & Serve Locally

```bash
cd docs

# Install dependencies
npm install

# Start development server
npm run docs:dev
# Visit http://localhost:5173

# Or build for production
npm run docs:build

# Serve built docs
npm run docs:serve
```

## Folder Structure

```
docs/
├── .vitepress/
│   ├── config.ts              # VitePress configuration
│   └── theme/
│       ├── index.ts           # Theme customization
│       └── style.css          # Custom styles
│
├── 01-getting-started/        # Getting Started Section
│   ├── index.md               # Overview
│   ├── installation.md        # Installation guide
│   ├── quick-start.md         # Quick start tutorial
│   ├── configuration.md       # Configuration guide
│   └── environments.md        # Supported environments
│
├── 02-commands/               # Commands Reference
│   ├── index.md               # Commands overview
│   ├── analysis-tools/        # Data analysis commands
│   ├── data-tools/            # Data manipulation commands
│   ├── schema-tools/          # Schema operations
│   └── system-tools/          # System administration
│
├── 03-features/               # Features & Guides
│   ├── index.md               # Features overview
│   ├── cli-features.md        # CLI capabilities
│   ├── api-server.md          # REST API server
│   ├── mcp-integration.md     # AI integration
│   ├── output-formats.md      # Output formats
│   ├── internationalization.md# Multi-language support
│   └── knowledge-base.md      # Built-in help
│
├── 04-api-reference/          # API Documentation
│   ├── index.md               # API overview
│   ├── swagger.md             # Swagger/OpenAPI docs
│   └── endpoints.md           # REST endpoints
│
├── index.md                   # Home/landing page
├── faq.md                     # Frequently asked questions
├── troubleshooting.md         # Troubleshooting guide
├── package.json               # npm configuration
└── README.md                  # This file
```

## Configuration

### config.ts

Main VitePress configuration with:
- Site title and metadata
- Navigation sidebar structure
- Theme colors (SAP HANA blue)
- Search configuration
- GitHub integration

### theme/

Custom styling to match SAP HANA branding.

## Navigation Structure

The sidebar navigation is intelligently organized:

1. **Getting Started** - For new users
2. **Commands** - Organized by category
3. **Features** - Advanced capabilities
4. **API Reference** - For developers

Each section has clear hierarchies and cross-links.

## Building & Deploying

### Local Development

```bash
npm run docs:dev
```

Open http://localhost:5173 to view.

### Production Build

```bash
npm run docs:build
```

Generates static site in `dist/` folder.

### Deploy to GitHub Pages

```bash
# After building
npm run docs:build

# Push dist folder to gh-pages branch
git add dist
git commit -m "docs: build for deployment"
git subtree push --prefix docs/dist origin gh-pages
```

## Content Guidelines

When adding documentation:

1. **Use clear headings** - Start with `#`
2. **Add examples** - All guides should have examples
3. **Link related docs** - Use `[Link](./path.md)` for cross-references
4. **Format code blocks** - Include language: ` ```bash`, ` ```json`, etc.
5. **Use tables** - Organize options/parameters in tables
6. **Add warnings** - Use `:::warning` for important notes
7. **Include See Also sections** - Link to related topics

### Example Template

```markdown
# Command Name

> [!NOTE]
> Introductory sentence with purpose.

## Quick Start

Include basic usage example.

## Options

| Option | Type | Description |
| ------ | ---- | ----------- |

## Examples

Provide real-world examples.

## See Also

- [Related Topic](./path.md)
```

## Styling Features

VitePress supports:

### Info Box
```markdown
:::info
This is informational content.
:::
```

### Warning Box
```markdown
:::warning
This is important!
:::
```

### Danger Box
```markdown
:::danger
This could be destructive.
:::
```

### Details/Expandable
```markdown
<details>
<summary>Click to expand</summary>

Hidden content here.

</details>
```

## Search

Full-text search is enabled in the documentation:
- Uses local search provider
- No external dependencies
- Indexes all content
- Fast and responsive

## Git Integration

The config includes:
- Edit on GitHub links
- View on GitHub links
- Automatic branch detection (Feb2026)

## SEO & Metadata

Built-in SEO features:
- Proper OpenGraph metadata
- Semantic HTML
- Clean URLs (cleanUrls: true)
- Sitemap generation

## Customization

To customize further:

1. **Colors** - Edit `:root` in `theme/style.css`
2. **Logo** - Add `public/logo.png`
3. **Fonts** - Modify `theme/style.css`
4. **Layout** - Extend `theme/index.ts`

## FAQ About VitePress

**Q: Why VitePress?**
A: Fast, lightweight, Vue-powered, perfect for technical documentation.

**Q: How do I update?**
A: `npm install vitepress@latest` then rebuild.

**Q: Can I add custom components?**
A: Yes, in `.vitepress/theme/` add Vue components.

**Q: Mobile support?**
A: Yes, fully responsive by default.

## Troubleshooting

### Build fails
```bash
rm -rf node_modules dist
npm install
npm run docs:build
```

### Search not working
- Rebuild with `npm run docs:build`
- Search only works in built version, not dev mode

### Style issues
- Check `theme/style.css`
- Clear browser cache
- Run `npm run docs:build` to test production

## Resources

- [VitePress Documentation](https://vitepress.dev/)
- [Vue 3 Guide](https://vuejs.org/)
- [Markdown Extensions](https://vitepress.dev/guide/markdown)

## Maintenance

The documentation typically needs updates when:
- New commands are added
- Command syntax changes
- Bug fixes or improvements
- New features are released

Update frequency: As needed per release cycle.

## Contributing

To contribute documentation:

1. Edit markdown files
2. Test locally: `npm run docs:dev`
3. Submit pull request
4. Review and merge

---

**Last Updated:** February 2026
**Version:** 1.0.0
**Next:** Deploy to production
