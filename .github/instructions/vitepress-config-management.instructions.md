---
description: "Use when creating or updating VitePress documentation site configuration. Enforces consistent config structure, sidebar generation patterns, theme customization, Mermaid integration, navigation organization, and deployment settings. Ensures documentation site maintains proper structure and user experience."
applyTo: "docs/.vitepress/**/*.{ts,js,json}"
---

# VitePress Configuration Management Guidelines

Use this guide when creating or modifying VitePress configuration files in the `docs/.vitepress/` directory.

## Scope and Purpose

This guide applies to VitePress documentation site configuration:

- `docs/.vitepress/config.ts` - Main site configuration
- `docs/.vitepress/theme/` - Custom theme files
- `docs/.vitepress/components/` - Custom Vue components
- Build and deployment configurations

## Critical Principles

1. **Base URL**: Always configure correct base URL for GitHub Pages deployment
2. **Sidebar Structure**: Maintain hierarchical, collapsible sidebar navigation
3. **Mermaid Integration**: Use `withMermaid()` wrapper for diagram support
4. **Language Alias**: Map custom syntaxes to supported highlighters
5. **SEO Optimization**: Include proper meta tags and descriptions
6. **Clean URLs**: Enable clean URLs for better user experience
7. **Type Safety**: Use TypeScript for configuration

## Main Configuration Structure

### Template: `docs/.vitepress/config.ts`

```typescript
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    // Site Metadata
    base: '/repository-name/',
    title: 'Site Title',
    description: 'Site description for SEO',
    lang: 'en-US',
    
    // Features
    cleanUrls: true,
    ignoreDeadLinks: false,  // Set true only if needed
    appearance: 'dark',
    lastUpdated: true,
    
    // Markdown Configuration
    markdown: {
      languageAlias: {
        customLang: 'typescript'
      }
    },
    
    // HTML Head
    head: [
      ['link', { rel: 'icon', href: '/base-path/favicon.ico' }],
      ['meta', { name: 'theme-color', content: '#0092d1' }],
      ['meta', { name: 'og:type', content: 'website' }],
      ['meta', { name: 'keywords', content: 'keyword1, keyword2' }],
    ],

    // Theme Configuration
    themeConfig: {
      logo: '/logo.svg',
      siteTitle: 'Short Title',
      
      // Navigation
      nav: [
        // Navigation items
      ],
      
      // Sidebar
      sidebar: {
        // Sidebar configuration
      },
      
      // Social Links
      socialLinks: [
        { icon: 'github', link: 'https://github.com/...' }
      ],
      
      // Search
      search: {
        provider: 'local'
      },
      
      // Footer
      footer: {
        message: 'Released under the Apache License.',
        copyright: 'Copyright © 2024-present SAP'
      }
    }
  })
)
```

## Base URL Configuration

### Pattern: GitHub Pages Base URL

```typescript
export default defineConfig({
  // CRITICAL: Must match repository name for GitHub Pages
  base: '/hana-developer-cli-tool-example/',
  
  // All asset links must respect base URL
  head: [
    ['link', { rel: 'icon', href: '/hana-developer-cli-tool-example/favicon.ico' }],
    ['link', { rel: 'icon', href: '/logo.svg' }],  // ❌ Wrong - missing base
  ]
})
```

### Pattern: Environment-Based Base URL

```typescript
const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  base: isProd ? '/hana-developer-cli-tool-example/' : '/',
  // ... rest of config
})
```

## Sidebar Configuration Patterns

### Pattern: Multi-Section Sidebar with Collapse

```typescript
sidebar: {
  '/01-getting-started/': [
    {
      text: 'Getting Started',
      // collapsed: false means expanded by default
      items: [
        { text: 'Introduction', link: '/01-getting-started/' },
        { text: 'Installation', link: '/01-getting-started/installation' },
        { text: 'Quick Start', link: '/01-getting-started/quick-start' }
      ]
    }
  ],
  
  '/02-commands/': [
    {
      text: 'Commands Reference',
      collapsed: false,  // Always expanded
      items: [
        { text: '📋 All Commands A-Z', link: '/02-commands/all-commands' },
        { text: 'Commands Overview', link: '/02-commands/' }
      ]
    },
    {
      text: 'Analysis Tools',
      collapsed: true,  // Collapsed by default
      items: [
        { text: 'Data Profile', link: '/02-commands/analysis-tools/data-profile' },
        { text: 'Data Lineage', link: '/02-commands/analysis-tools/data-lineage' }
      ]
    }
  ]
}
```

### Pattern: Auto-Generated Sidebar from Directory Structure

```typescript
import fs from 'fs'
import path from 'path'

/**
 * Generate sidebar configuration from directory structure
 * @param {string} baseDir - Base documentation directory
 * @param {string} section - Section path (e.g., '/02-commands/')
 * @returns {Array} Sidebar configuration
 */
function generateSidebar(baseDir: string, section: string) {
  const sectionPath = path.join(baseDir, section)
  const categories = fs.readdirSync(sectionPath)
    .filter(name => fs.statSync(path.join(sectionPath, name)).isDirectory())
    .sort()
  
  return categories.map(category => {
    const categoryPath = path.join(sectionPath, category)
    const files = fs.readdirSync(categoryPath)
      .filter(f => f.endsWith('.md'))
      .sort()
    
    return {
      text: toTitleCase(category),
      collapsed: true,
      items: files.map(file => ({
        text: fileToTitle(file),
        link: `${section}${category}/${file.replace('.md', '')}`
      }))
    }
  })
}

function toTitleCase(str: string): string {
  return str.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function fileToTitle(filename: string): string {
  return filename
    .replace('.md', '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
```

## Navigation Configuration

### Pattern: Multi-Level Navigation with Dropdowns

```typescript
nav: [
  { text: 'Home', link: '/' },
  { text: 'Getting Started', link: '/01-getting-started/' },
  { text: 'Commands', link: '/02-commands/' },
  
  // Dropdown menu
  {
    text: 'References',
    items: [
      { text: 'Overview', link: '/99-reference/' },
      { text: 'Troubleshooting', link: '/troubleshooting/' },
      { text: 'FAQ', link: '/99-reference/faq' }
    ]
  },
  
  // External links
  {
    text: 'Resources',
    items: [
      { 
        text: 'GitHub', 
        link: 'https://github.com/SAP-samples/hana-developer-cli-tool-example' 
      },
      { 
        text: 'NPM Package', 
        link: 'https://www.npmjs.com/package/hana-cli' 
      }
    ]
  }
]
```

## Markdown Configuration

### Pattern: Syntax Highlighting Language Aliases

```typescript
markdown: {
  // Map custom language identifiers to supported highlighters
  languageAlias: {
    cds: 'typescript',        // CDS entities look like TypeScript
    abap: 'sql',              // ABAP syntax similar to SQL
    hdbsql: 'sql',            // HANA SQL
    hdbprocedure: 'sql'       // HANA procedures
  },
  
  // Code block options
  lineNumbers: true,
  
  // Custom container aliases
  container: {
    tipLabel: '💡 Tip',
    warningLabel: '⚠️ Warning',
    dangerLabel: '🚫 Danger'
  }
}
```

## Mermaid Diagram Integration

### Pattern: Enable Mermaid Support

```typescript
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    // ... your config
  })
)

// In markdown files, users can now use:
// ```mermaid
// graph TD
//   A[Start] --> B[Process]
//   B --> C[End]
// ```
```

### Pattern: Mermaid Theme Configuration

```typescript
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    // ... other config
    
    mermaid: {
      theme: 'dark',
      themeVariables: {
        primaryColor: '#0092d1',
        primaryTextColor: '#fff',
        primaryBorderColor: '#0078a8',
        lineColor: '#F8B229',
        secondaryColor: '#006699',
        tertiaryColor: '#fff'
      }
    }
  })
)
```

## SEO and Meta Tags

### Pattern: Complete SEO Configuration

```typescript
head: [
  // Favicon
  ['link', { rel: 'icon', href: '/hana-developer-cli-tool-example/favicon.ico' }],
  ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
  
  // Theme color
  ['meta', { name: 'theme-color', content: '#0092d1' }],
  
  // Open Graph
  ['meta', { name: 'og:type', content: 'website' }],
  ['meta', { name: 'og:title', content: 'SAP HANA Developer CLI' }],
  ['meta', { name: 'og:description', content: 'Complete CLI tool for SAP HANA development' }],
  ['meta', { name: 'og:image', content: '/logo.svg' }],
  ['meta', { name: 'og:site_name', content: 'SAP HANA Developer CLI' }],
  
  // Twitter Card
  ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ['meta', { name: 'twitter:title', content: 'SAP HANA Developer CLI' }],
  
  // Additional SEO
  ['meta', { name: 'keywords', content: 'SAP HANA, CLI, developer tools, database, command-line' }],
  ['meta', { name: 'author', content: 'SAP' }],
  ['meta', { name: 'robots', content: 'index, follow' }],
  
  // Analytics (if needed)
  // ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXX' }],
]
```

## Theme Customization

### Pattern: Custom Theme Configuration

```typescript
themeConfig: {
  logo: '/logo.svg',
  siteTitle: 'HANA CLI',
  
  // Outline/table of contents
  outline: {
    level: [2, 3],          // Show h2 and h3 headings
    label: 'On this page'
  },
  
  // Edit link
  editLink: {
    pattern: 'https://github.com/SAP-samples/hana-developer-cli-tool-example/edit/main/docs/:path',
    text: 'Edit this page on GitHub'
  },
  
  // Last updated timestamp
  lastUpdated: {
    text: 'Last updated',
    formatOptions: {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  },
  
  // Social links
  socialLinks: [
    { icon: 'github', link: 'https://github.com/SAP-samples/hana-developer-cli-tool-example' },
    { icon: 'npm', link: 'https://www.npmjs.com/package/hana-cli' }
  ],
  
  // Footer
  footer: {
    message: 'Released under the Apache 2.0 License.',
    copyright: 'Copyright © 2024-present SAP'
  }
}
```

## Search Configuration

### Pattern: Local Search

```typescript
themeConfig: {
  search: {
    provider: 'local',
    options: {
      locales: {
        root: {
          translations: {
            button: {
              buttonText: 'Search',
              buttonAriaLabel: 'Search'
            },
            modal: {
              noResultsText: 'No results for',
              resetButtonTitle: 'Clear query',
              footer: {
                selectText: 'to select',
                navigateText: 'to navigate'
              }
            }
          }
        }
      }
    }
  }
}
```

### Pattern: Algolia Search (Alternative)

```typescript
themeConfig: {
  search: {
    provider: 'algolia',
    options: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_API_KEY',
      indexName: 'hana-cli'
    }
  }
}
```

## Build Configuration

### Pattern: Build Output Configuration

```typescript
export default defineConfig({
  // Output directory
  outDir: '.vitepress/dist',
  
  // Cache directory
  cacheDir: '.vitepress/cache',
  
  // Asset handling
  assetsDir: 'assets',
  
  // Build optimization
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'mermaid': ['mermaid']
          }
        }
      }
    }
  }
})
```

## Dead Link Handling

### Pattern: Configure Dead Link Checking

```typescript
export default defineConfig({
  // Strict mode - fail build on dead links
  ignoreDeadLinks: false,
  
  // Ignore specific patterns
  ignoreDeadLinks: [
    // Ignore external links to specific domains
    /^https?:\/\/example\.com/,
    // Ignore anchors
    /^#/,
    // Ignore specific paths
    '/some/path'
  ],
  
  // Or ignore all (use sparingly!)
  // ignoreDeadLinks: true
})
```

## Multi-Language Support

### Pattern: i18n Configuration

```typescript
export default defineConfig({
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/' }
        ]
      }
    },
    de: {
      label: 'Deutsch',
      lang: 'de-DE',
      link: '/de/',
      themeConfig: {
        nav: [
          { text: 'Anleitung', link: '/de/guide/' }
        ]
      }
    }
  }
})
```

## Custom Vue Components

### Pattern: Register Global Components

```typescript
// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import CustomComponent from './components/CustomComponent.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register global components
    app.component('CustomComponent', CustomComponent)
  }
}
```

## Development vs Production Configuration

### Pattern: Environment-Specific Settings

```typescript
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  base: isDev ? '/' : '/hana-developer-cli-tool-example/',
  
  // More verbose logging in dev
  cleanUrls: !isDev,
  
  // Strict checking in dev, lenient in prod
  ignoreDeadLinks: !isDev,
  
  vite: {
    server: {
      port: 5173,
      strictPort: false
    }
  }
})
```

## Common Mistakes to Avoid

❌ **Wrong base URL** → Assets not loading in GitHub Pages

❌ **Not using `withMermaid()` wrapper** → Mermaid diagrams don't render

❌ **Hardcoding paths without base** → Broken links in production

❌ **Too many top-level nav items** → Cluttered navigation

❌ **No collapsed sections** → Overwhelming sidebar

❌ **Missing language aliases** → Code blocks not highlighted properly

❌ **Ignoring dead links in production** → Broken documentation

❌ **Not setting lastUpdated** → Users don't know content freshness

❌ **Missing meta tags** → Poor SEO and social sharing

## Build and Deployment Scripts

### Pattern: Package.json Scripts

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "docs:serve": "vitepress serve docs"
  }
}
```

## Validation Checklist

Before deploying VitePress configuration:

- [ ] Base URL matches repository name
- [ ] All sidebar links resolve to existing files
- [ ] Mermaid integration working for diagrams
- [ ] Meta tags properly configured
- [ ] Search functionality working
- [ ] Mobile responsive testing done
- [ ] Build succeeds without warnings
- [ ] Dead link checking passes
- [ ] Dark/light mode switching works
- [ ] Custom components render correctly

## Documentation Requirements

VitePress configuration should be documented with:
- Comments explaining non-obvious settings
- Base URL configuration reasoning
- Custom language alias mappings
- Sidebar generation strategies
- Build optimization choices

## Reference Examples in This Repository

- `docs/.vitepress/config.ts` - Complete VitePress configuration
- `generate-sidebar-config.js` - Automated sidebar generation
- `.github/workflows/deploy-docs.yml` - Documentation deployment
