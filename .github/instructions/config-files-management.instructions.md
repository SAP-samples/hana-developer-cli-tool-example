---
description: "Use when creating or updating project configuration files for linting, testing, coverage, and code quality tools. Enforces consistent config structure, extends shared configurations, manages ignore patterns, handles multi-language setup, and integrates tools with CI/CD. Ensures all tools work harmoniously and follow project conventions."
applyTo: ".eslintrc.*,.prettierrc.*,.nycrc.*,.mocharc.*,.markdownlintrc.*,jest.config.*,tsconfig.json,.editorconfig"
---

# Configuration Files Management Guidelines

Use this guide when creating or modifying configuration files for development tools.

## Scope and Purpose

This guide applies to configuration files for:

- ESLint (`.eslintrc.json`, `.eslintrc.js`)
- Prettier (`.prettierrc.json`, `.prettierrc.js`)
- NYC/Istanbul coverage (`.nycrc`, `.nycrc.json`)
- Mocha testing (`.mocharc.json`, `.mocharc.js`)
- Markdown linting (`.markdownlintrc.json`)
- EditorConfig (`.editorconfig`)
- Git ignore patterns (`.gitignore`, `.npmignore`)

## Critical Principles

1. **Shared Configs**: Extend from shared configurations when available
2. **Consistency**: Align configs across similar projects
3. **Override Hierarchy**: Understand config precedence and overrides
4. **Ignore Patterns**: Maintain comprehensive ignore lists
5. **JSON vs JS**: Choose appropriate format (JSON for simple, JS for complex)
6. **Comments**: Use JS format when extensive comments needed
7. **Integration**: Ensure tools work together harmoniously
8. **CI/CD Alignment**: Config should work in both local and CI environments

## ESLint Configuration

### Pattern: ESLint for JavaScript with CDS Plugin

```json
{
  "env": {
    "es2022": true,
    "node": true,
    "mocha": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "plugins": [
    "@sap/cds"
  ],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    // Possible Errors
    "no-console": "off",              // Allow console in Node.js
    "no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",    // Allow _unused variables
        "varsIgnorePattern": "^_"
      }
    ],
    
    // Best Practices
    "eqeqeq": ["error", "always"],    // Require === and !==
    "no-eval": "error",               // No eval()
    "no-implied-eval": "error",       // No setTimeout("string")
    "no-return-await": "error",       // No unnecessary await
    
    // Code Style
    "indent": ["error", 4],           // 4-space indentation
    "quotes": ["error", "single"],    // Single quotes
    "semi": ["error", "always"],      // Always semicolons
    "comma-dangle": ["error", "never"], // No trailing commas
    
    // CDS-specific rules
    "@sap/cds/no-dollar-prefixed-names": "off"
  },
  "overrides": [
    {
      // Relaxed rules for test files
      "files": ["**/*.test.js", "**/*.Test.js"],
      "rules": {
        "no-unused-expressions": "off" // For should/expect
      }
    }
  ],
  "ignorePatterns": [
    "node_modules/",
    "dist/",
    "coverage/",
    "*.min.js",
    "mochawesome-report/"
  ]
}
```

### Pattern: ESLint for TypeScript

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "plugins": ["@typescript-eslint"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"      // Required for type-aware rules
  },
  "rules": {
    // TypeScript-specific
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    
    // Disable base rules (handled by TS)
    "no-unused-vars": "off",          // Use @typescript-eslint version
    "no-undef": "off",                // TypeScript handles this
    
    // Code style
    "indent": "off",                  // Use @typescript-eslint/indent
    "@typescript-eslint/indent": ["error", 2]
  }
}
```

### Pattern: ESLint with Prettier Integration

```json
{
  "extends": [
    "eslint:recommended",
    "prettier"                         // Disables ESLint rules that conflict
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"      // Show Prettier issues as errors
  }
}
```

## Prettier Configuration

### Pattern: Prettier for Consistent Formatting

```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 4,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "bracketSameLine": false,
  
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "tabWidth": 2
      }
    },
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always"
      }
    },
    {
      "files": "*.yml",
      "options": {
        "tabWidth": 2
      }
    }
  ]
}
```

### Pattern: Prettier Ignore

```
# .prettierignore
node_modules
dist
coverage
.nyc_output
mochawesome-report
types
*.min.js
*.min.css
package-lock.json
npm-shrinkwrap.json
CHANGELOG.md
```

## NYC (Istanbul) Coverage Configuration

### Pattern: Comprehensive Coverage Setup

```json
{
  "all": true,
  "check-coverage": true,
  "reporter": [
    "text",
    "text-summary",
    "html",
    "lcov",
    "json"
  ],
  "report-dir": "./coverage",
  "temp-dir": "./.nyc_output",
  
  "branches": 80,
  "lines": 80,
  "functions": 80,
  "statements": 80,
  
  "include": [
    "bin/**/*.js",
    "routes/**/*.js",
    "utils/**/*.js",
    "index.js"
  ],
  
  "exclude": [
    "**/*.test.js",
    "**/*.Test.js",
    "**/__tests__/**",
    "**/__mocks__/**",
    "tests/**",
    "coverage/**",
    "types/**",
    "mochawesome-report/**",
    "node_modules/**",
    "scripts/**",
    "generate-*.js",
    "enhance-*.js",
    "update-*.js",
    "populate-*.js"
  ],
  
  "extension": [
    ".js"
  ],
  
  "cache": true,
  "sourceMap": false,
  "instrument": true,
  "produce-source-map": false,
  "skip-full": false
}
```

### Pattern: CI-Specific Coverage

```json
{
  "extends": "./.nycrc.json",
  "reporter": [
    "text",
    "lcov"                             // For coverage services
  ],
  "branches": 90,                      // Stricter in CI
  "lines": 90,
  "functions": 85,
  "statements": 90
}
```

## Mocha Test Configuration

### Pattern: Mocha with Multiple Test Types

```json
{
  "require": [
    "tests/setup.js"                   // Global test setup
  ],
  "spec": [
    "tests/**/*.test.js",
    "tests/**/*.Test.js"
  ],
  "ignore": [
    "node_modules/**",
    "coverage/**"
  ],
  "timeout": 5000,
  "slow": 2000,
  "bail": false,                       // Continue after failures
  "recursive": true,
  "reporter": "spec",
  "ui": "bdd",
  "color": true,
  "exit": true,                        // Force exit after tests
  "grep": "",                          // Filter pattern (override via CLI)
  
  "reporter-option": [
    "reportDir=mochawesome-report",
    "reportFilename=index.html",
    "quiet=false",
    "json=true",
    "inline=false",
    "code=true"
  ]
}
```

### Pattern: Separate Config for Integration Tests

```json
{
  "extends": "./.mocharc.json",
  "spec": [
    "tests/integration/**/*.test.js"
  ],
  "timeout": 30000,                    // Longer timeout for integration
  "slow": 10000,
  "require": [
    "tests/setup.js",
    "tests/integration/setup.js"       // Additional integration setup
  ]
}
```

## Markdown Linting Configuration

### Pattern: Markdown Linting Rules

```json
{
  "default": true,
  "extends": "default",
  
  "MD001": true,                       // Heading levels increment by one
  "MD003": { "style": "atx" },        // ATX-style headers (# ## ###)
  "MD004": { "style": "dash" },       // Dash style for unordered lists
  "MD007": { "indent": 2 },           // 2-space list indentation
  "MD013": {                          // Line length
    "line_length": 120,
    "code_blocks": false,
    "tables": false
  },
  "MD024": { "siblings_only": true }, // Allow duplicate headings in different sections
  "MD033": false,                     // Allow HTML (for Vue components)
  "MD034": false,                     // Allow bare URLs
  "MD041": false,                     // First line doesn't need to be h1
  "MD046": { "style": "fenced" },     // Fenced code blocks
  "MD060": false                      // Allow Vue template syntax
}
```

### Pattern: Markdown Lint Ignore

```
# .markdownlintignore
node_modules
coverage
mochawesome-report
CHANGELOG.md
```

## EditorConfig

### Pattern: Cross-Editor Consistency

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.{json,yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
max_line_length = off

[{package.json,package-lock.json,npm-shrinkwrap.json}]
indent_size = 2

[*.{ts,tsx}]
indent_size = 2

[Makefile]
indent_style = tab
```

## Git Ignore Patterns

### Pattern: Comprehensive .gitignore

```
# Dependencies
node_modules/
jspm_packages/

# Build outputs
dist/
build/
types/
*.tsbuildinfo

# Testing and coverage
coverage/
.nyc_output/
mochawesome-report/
*.lcov

# Environment
.env
.env.local
.env.*.local
default-env.json
secrets/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
Thumbs.db
Desktop.ini

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~

# Cache
.cache/
.npm/
.eslintcache
.node_repl_history

# Temporary
tmp/
temp/
*.tmp
*.bak

# Build tools
.vitepress/cache/
.vitepress/dist/

# Project specific
output.csv
error.txt
hana-cli_cache.json
```

## NPM Ignore Patterns

### Pattern: .npmignore for Package Publishing

```
# Source files
src/
tests/
scripts/

# Documentation
docs/
*.md
!README.md

# Configuration
.eslintrc.*
.prettierrc.*
.nycrc.*
.mocharc.*
.editorconfig
tsconfig*.json

# CI/CD
.github/
.travis.yml
.gitlab-ci.yml
azure-pipelines.yml

# Development
coverage/
.nyc_output/
mochawesome-report/
node_modules/

# Files
.env*
*.log
.DS_Store
```

## TypeScript Configuration Integration

### Pattern: TSConfig for Linting

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*", "bin/**/*", "routes/**/*", "utils/**/*"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

## Husky Git Hooks Configuration

### Pattern: Pre-commit and Pre-push Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### Pattern: Lint-Staged Configuration

```json
{
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.md": [
      "markdownlint --fix"
    ]
  }
}
```

## Multi-Language Project Setup

### Pattern: Mixed JavaScript/TypeScript Config

```json
{
  "eslintConfig": {
    "overrides": [
      {
        "files": ["*.js"],
        "extends": ["eslint:recommended"],
        "env": { "node": true, "es2022": true }
      },
      {
        "files": ["*.ts"],
        "parser": "@typescript-eslint/parser",
        "extends": [
          "eslint:recommended",
          "plugin:@typescript-eslint/recommended"
        ],
        "parserOptions": {
          "project": "./tsconfig.json"
        }
      }
    ]
  }
}
```

## Tool Integration Matrix

### Pattern: Ensure Compatible Configuration

```
ESLint → Prettier: Use eslint-config-prettier to disable conflicts
ESLint → TypeScript: Use @typescript-eslint/parser and plugins
Mocha → NYC: NYC wraps Mocha, shares exclude patterns
Prettier → EditorConfig: Prettier respects EditorConfig
Git Hooks → Lint-Staged: Husky triggers lint-staged on commit
```

## Configuration File Locations

### Pattern: Standard Locations

```
/
├── .eslintrc.json          # ESLint config
├── .eslintignore           # ESLint ignore
├── .prettierrc.json        # Prettier config
├── .prettierignore         # Prettier ignore
├── .nycrc.json             # NYC coverage config
├── .mocharc.json           # Mocha test config
├── .markdownlintrc.json    # Markdown lint config
├── .markdownlintignore     # Markdown lint ignore
├── .editorconfig           # Editor config
├── .gitignore              # Git ignore
├── .npmignore              # NPM publish ignore
├── tsconfig.json           # TypeScript config
└── package.json            # Can also contain configs
```

## Package.json Embedded Configs

### Pattern: Simple Configs in package.json

```json
{
  "prettier": {
    "semi": true,
    "singleQuote": true
  },
  
  "eslintConfig": {
    "extends": ["eslint:recommended"]
  },
  
  "lint-staged": {
    "*.js": ["eslint --fix"]
  },
  
  "mocha": {
    "timeout": 5000,
    "reporter": "spec"
  }
}
```

**Note**: Use separate files for complex configurations to keep package.json clean.

## CI/CD Configuration Alignment

### Pattern: CI-Specific Overrides

```bash
# In CI pipeline
npm run lint -- --max-warnings=0    # Fail on warnings in CI
npm run test:coverage -- --forbid-only  # No .only() in CI
npm run build -- --strict           # Strict build in CI
```

## Configuration Validation

### Pattern: Validate Configs on Install

```json
{
  "scripts": {
    "postinstall": "npm run validate:config",
    "validate:config": "node scripts/validate-configs.js"
  }
}
```

## Common Mistakes to Avoid

❌ **Conflicting ESLint and Prettier rules** → Use eslint-config-prettier

❌ **Forgetting to exclude build outputs** → Add to all ignore files

❌ **Too strict coverage thresholds initially** → Start lower, increase gradually

❌ **Not ignoring test files in coverage** → Include in .nycrc exclude

❌ **Platform-specific line endings** → Set `"endOfLine": "lf"` in Prettier

❌ **Missing .editorconfig** → Team uses inconsistent formatting

❌ **Hardcoding paths in configs** → Use glob patterns

❌ **Not syncing ignore patterns** → Keep .gitignore, .eslintignore, .prettierignore aligned

❌ **Complex configs in package.json** → Move to separate files

❌ **No comments in JSON configs** → Use .js format for complex configs

## Cross-Tool Consistency

Ensure these patterns are aligned across all config files:

- **Indentation**: 4 spaces for JS, 2 for JSON/YAML
- **Line endings**: LF (Unix-style)
- **Quotes**: Single quotes for JS, double for JSON
- **Trailing commas**: None in this project
- **Semicolons**: Always in JS
- **Exclude patterns**: node_modules, dist, coverage, types, mochawesome-report

## Version Control

### Pattern: Commit Config Files

```
✓ Commit: .eslintrc.json, .prettierrc.json, .nycrc.json
✓ Commit: .editorconfig, .gitignore, .npmignore
✓ Commit: .mocharc.json, .markdownlintrc.json
✗ Don't commit: .eslintcache, .DS_Store, *.log
```

## Configuration Documentation

Each config file should:
- Have a header comment explaining its purpose (in .js format)
- Document unusual or project-specific settings
- Reference shared configs being extended
- List integration requirements

## Upgrade and Maintenance

### Pattern: Config Upgrade Checklist

When upgrading tools:
- [ ] Review breaking changes in config schema
- [ ] Update extends references to new versions
- [ ] Test config with new tool version
- [ ] Update CI/CD pipeline if needed
- [ ] Document config changes in commit message
- [ ] Update team on any new rules or settings

## Reference Examples in This Repository

- `.nycrc.json` - Coverage configuration with 80% thresholds
- `.markdownlintrc.json` - Markdown linting with Vue template support
- `package.json` - ESLint, Prettier, Mocha integration
- `.github/workflows/` - CI/CD tool integration
- `tsconfig.json` - Type generation configuration
- `mcp-server/tsconfig.json` - TypeScript compilation configuration
