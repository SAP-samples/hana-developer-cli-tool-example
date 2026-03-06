---
description: "Use when adding or updating scripts in package.json. Enforces consistent naming conventions, script categories, environment variable handling, cross-platform command compatibility, npm lifecycle hooks, script composition patterns, and integration with CI/CD pipelines. Ensures npm scripts are maintainable, discoverable, and work across all platforms."
applyTo: "package.json,**/package.json"
---

# Package.json Scripts Management Guidelines

Use this guide when creating or modifying npm scripts in `package.json`.

## Scope and Purpose

This guide applies to npm script management in:

- Root `package.json` - Main project scripts
- Subproject `package.json` files (e.g., `mcp-server/package.json`)
- Workspace package.json files in monorepos

## Critical Principles

1. **Naming Convention**: Use consistent, predictable script names
2. **Category Prefixes**: Group related scripts with prefixes (`test:*`, `build:*`, `docs:*`)
3. **Cross-Platform**: Write scripts that work on Windows, macOS, and Linux
4. **Composability**: Build complex scripts from simpler ones
5. **Lifecycle Hooks**: Use npm lifecycle scripts appropriately
6. **Environment Variables**: Handle variables safely and consistently
7. **Documentation**: Add comments in package.json for complex scripts
8. **Exit Codes**: Respect exit codes for CI/CD integration

## Script Naming Conventions

### Pattern: Standard Script Names

```json
{
  "scripts": {
    // Development
    "start": "node index.js",        // Primary entry point
    "dev": "nodemon index.js",       // Development with watch
    "serve": "node server.js",       // Start server
    
    // Building
    "build": "tsc",                  // Main build
    "build:watch": "tsc --watch",    // Watch mode
    "prebuild": "npm run clean",     // Runs before build
    "postbuild": "npm run types",    // Runs after build
    
    // Testing
    "test": "mocha",                 // Run all tests
    "test:unit": "mocha tests/unit", // Unit tests only
    "test:integration": "mocha tests/integration",
    "test:watch": "mocha --watch",   // Watch mode
    "pretest": "npm run lint",       // Runs before test
    
    // Code Quality
    "lint": "eslint .",              // Lint all files
    "lint:fix": "eslint . --fix",    // Auto-fix
    "format": "prettier --write .",  // Format code
    "format:check": "prettier --check .",
    
    // Coverage
    "coverage": "nyc npm test",      // Generate coverage
    "coverage:report": "nyc report --reporter=html",
    "coverage:check": "nyc check-coverage",
    
    // Documentation
    "docs": "npm run docs:dev",      // Alias for main docs task
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs",
    
    // Cleaning
    "clean": "rimraf dist coverage .nyc_output types",
    "clean:all": "npm run clean && rimraf node_modules",
    
    // Utilities
    "validate": "npm run lint && npm run test",
    "prepare": "husky install"       // Lifecycle hook
  }
}
```

### Pattern: Category Prefixes

```json
{
  "scripts": {
    // test:* for all testing
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "mocha tests/unit",
    "test:integration": "mocha tests/integration",
    "test:e2e": "mocha tests/e2e",
    "test:watch": "mocha --watch",
    "test:coverage": "nyc npm test",
    
    // build:* for all building
    "build": "npm run build:clean && npm run build:compile",
    "build:clean": "rimraf dist",
    "build:compile": "tsc",
    "build:watch": "tsc --watch",
    "build:mcp": "npm run build --prefix mcp-server",
    
    // docs:* for documentation
    "docs": "npm run docs:dev",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "docs:generate": "node generate-command-docs.js",
    
    // gen:* or generate:* for generation
    "gen:types": "tsc --project tsconfig.json",
    "gen:docs": "node generate-command-docs.js",
    "gen:sidebar": "node generate-sidebar-config.js",
    "gen:all": "npm run gen:types && npm run gen:docs && npm run gen:sidebar",
    
    // validate:* for validation tasks
    "validate": "npm run validate:lint && npm run validate:test",
    "validate:lint": "eslint .",
    "validate:test": "npm test",
    "validate:types": "tsc --noEmit",
    "validate:all": "npm run validate && npm run validate:types"
  }
}
```

## Cross-Platform Compatibility

### Pattern: Use Cross-Platform Tools

```json
{
  "scripts": {
    // ✓ Cross-platform with rimraf
    "clean": "rimraf dist coverage",
    
    // ✗ Platform-specific
    "clean": "rm -rf dist coverage",      // Fails on Windows
    "clean": "del /s /q dist coverage",   // Fails on Unix
    
    // ✓ Cross-platform with mkdirp
    "mkdir": "mkdirp dist/types",
    
    // ✗ Platform-specific
    "mkdir": "mkdir -p dist/types",       // Fails on Windows
    "mkdir": "md dist\\types",            // Fails on Unix
    
    // ✓ Cross-platform path separators
    "test": "mocha tests/unit/**/*.test.js",
    
    // ✗ Windows-specific
    "test": "mocha tests\\unit\\**\\*.test.js"
  },
  "devDependencies": {
    "rimraf": "^5.0.0",          // Cross-platform rm -rf
    "mkdirp": "^3.0.0",          // Cross-platform mkdir -p
    "cross-env": "^7.0.3"        // Cross-platform env vars
  }
}
```

### Pattern: Cross-Platform Environment Variables

```json
{
  "scripts": {
    // ✓ Cross-platform with cross-env
    "test:prod": "cross-env NODE_ENV=production npm test",
    
    // ✗ Unix-style (fails on Windows CMD)
    "test:prod": "NODE_ENV=production npm test",
    
    // ✗ Windows-style (fails on Unix)
    "test:prod": "set NODE_ENV=production && npm test",
    
    // ✓ Multiple variables
    "start": "cross-env NODE_ENV=production PORT=3000 node index.js"
  }
}
```

## Script Composition

### Pattern: Chain Scripts Sequentially

```json
{
  "scripts": {
    // Run one after another (stops on first failure)
    "validate": "npm run lint && npm run test && npm run build",
    
    // More readable multi-line (requires npm >=7)
    "ci": "npm run clean && npm run lint && npm run test && npm run build"
  }
}
```

### Pattern: Run Scripts in Parallel

```json
{
  "scripts": {
    // Run multiple scripts in parallel
    "test:all": "npm run test:unit & npm run test:integration",
    
    // Better: use npm-run-all
    "test:all": "npm-run-all --parallel test:unit test:integration",
    
    // Run all test:* scripts in parallel
    "test:parallel": "npm-run-all --parallel test:*",
    
    // Run all build:* scripts sequentially
    "build:all": "npm-run-all --sequential build:*"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}
```

### Pattern: Conditional Script Execution

```json
{
  "scripts": {
    // Run script only if file exists
    "postinstall": "[ -f scripts/postinstall.js ] && node scripts/postinstall.js || echo 'No postinstall script'",
    
    // Run different scripts based on environment
    "start": "node -e \"require('./scripts/start.js')(process.env.NODE_ENV || 'development')\"",
    
    // Continue even if script fails (with || true)
    "optional": "npm run might-fail || true"
  }
}
```

## Lifecycle Hooks

### Pattern: npm Lifecycle Scripts

```json
{
  "scripts": {
    // Runs at 'npm install' after package installed
    "prepare": "husky install",           // Git hooks setup
    
    // DEPRECATED: Use 'prepare' instead
    // "postinstall": "node scripts/setup.js",
    
    // Runs before 'npm publish'
    "prepublishOnly": "npm run build && npm test",
    
    // Runs before 'npm version'
    "preversion": "npm test",
    
    // Runs after 'npm version'
    "version": "npm run gen:docs && git add -A docs",
    
    // Runs after 'npm version' and after commit
    "postversion": "git push && git push --tags",
    
    // pre/post hooks for any script
    "pretest": "npm run lint",            // Runs before 'npm test'
    "test": "mocha",
    "posttest": "npm run coverage:check", // Runs after 'npm test'
    
    "prebuild": "npm run clean",          // Runs before 'npm run build'
    "build": "tsc",
    "postbuild": "npm run gen:types"      // Runs after 'npm run build'
  }
}
```

### Pattern: Workspace Lifecycle Scripts

```json
{
  "scripts": {
    // Run script in all workspace packages
    "test:all": "npm test --workspaces",
    
    // Run in specific workspace
    "test:mcp": "npm test --workspace=mcp-server",
    
    // Run in all workspaces if exists
    "build:all": "npm run build --workspaces --if-present"
  }
}
```

## Environment Variable Handling

### Pattern: Environment-Specific Scripts

```json
{
  "scripts": {
    // Development
    "start:dev": "cross-env NODE_ENV=development nodemon index.js",
    
    // Production
    "start:prod": "cross-env NODE_ENV=production node index.js",
    
    // Test
    "test": "cross-env NODE_ENV=test mocha",
    
    // Custom env vars
    "test:db": "cross-env DB_TYPE=postgres DB_PORT=5432 npm test",
    
    // Multiple env vars
    "start": "cross-env NODE_ENV=production PORT=3000 LOG_LEVEL=info node index.js"
  }
}
```

### Pattern: Load Environment from File

```json
{
  "scripts": {
    // Using dotenv-cli
    "start": "dotenv -e .env -- node index.js",
    "start:prod": "dotenv -e .env.production -- node index.js",
    
    // With cross-env for additional vars
    "start:test": "dotenv -e .env.test -- cross-env DEBUG=true npm start"
  },
  "devDependencies": {
    "dotenv-cli": "^7.0.0"
  }
}
```

## Testing Scripts

### Pattern: Comprehensive Test Scripts

```json
{
  "scripts": {
    // Main test command
    "test": "mocha",
    
    // Test variants
    "test:unit": "mocha tests/unit/**/*.test.js",
    "test:integration": "mocha tests/integration/**/*.test.js",
    "test:e2e": "mocha tests/e2e/**/*.test.js",
    
    // Test with options
    "test:watch": "mocha --watch",
    "test:bail": "mocha --bail",                   // Stop on first failure
    "test:grep": "mocha --grep",                   // Filter tests by pattern
    
    // Coverage
    "test:coverage": "nyc npm test",
    "test:coverage:report": "nyc report --reporter=html",
    "test:coverage:check": "nyc check-coverage --lines 80 --functions 80",
    
    // Cross-platform test execution
    "test:windows": "cross-env OS=windows npm test",
    "test:unix": "cross-env OS=unix npm test",
    "test:all-os": "npm run test:windows && npm run test:unix",
    
    // CI-specific
    "test:ci": "cross-env CI=true npm run test:coverage"
  }
}
```

## Documentation Scripts

### Pattern: Documentation Generation and Serving

```json
{
  "scripts": {
    // Documentation development
    "docs": "npm run docs:dev",
    "docs:dev": "vitepress dev docs",
    "docs:serve": "vitepress serve docs",
    
    // Documentation building
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs",
    
    // Documentation generation
    "docs:generate": "node generate-command-docs.js",
    "docs:enhance": "node enhance-command-docs.js",
    "docs:sidebar": "node generate-sidebar-config.js",
    
    // Full documentation workflow
    "docs:full": "npm run docs:generate && npm run docs:enhance && npm run docs:build",
    
    // Documentation validation
    "docs:lint": "markdownlint docs/**/*.md",
    "docs:links": "markdown-link-check docs/**/*.md",
    
    // API documentation
    "docs:api": "typedoc --out docs/api src"
  }
}
```

## Build Scripts

### Pattern: Multi-Stage Build Process

```json
{
  "scripts": {
    // Main build
    "build": "npm run build:clean && npm run build:compile && npm run build:types",
    
    // Build stages
    "build:clean": "rimraf dist types",
    "build:compile": "tsc --project tsconfig.build.json",
    "build:types": "tsc --project tsconfig.json",
    "build:watch": "tsc --watch",
    
    // Subproject builds
    "build:mcp": "npm run build --workspace=mcp-server",
    "build:all": "npm run build && npm run build:mcp",
    
    // Production build
    "build:prod": "cross-env NODE_ENV=production npm run build",
    
    // Build validation
    "postbuild": "node scripts/validate-build.js"
  }
}
```

## Linting and Formatting

### Pattern: Code Quality Scripts

```json
{
  "scripts": {
    // Linting
    "lint": "npm run lint:js && npm run lint:md",
    "lint:js": "eslint . --ext .js,.ts",
    "lint:md": "markdownlint docs/**/*.md",
    "lint:fix": "eslint . --ext .js,.ts --fix",
    
    // Formatting
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    // Type checking (for TypeScript)
    "typecheck": "tsc --noEmit",
    
    // Combined validation
    "validate": "npm run lint && npm run typecheck && npm test"
  }
}
```

## Utility Scripts

### Pattern: Development Utilities

```json
{
  "scripts": {
    // Cleaning
    "clean": "rimraf dist coverage .nyc_output types",
    "clean:all": "npm run clean && rimraf node_modules",
    "clean:cache": "rimraf node_modules/.cache",
    
    // Dependency management
    "deps:check": "npm outdated",
    "deps:update": "npm update",
    "deps:audit": "npm audit",
    "deps:audit:fix": "npm audit fix",
    
    // Version management
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major",
    
    // Database utilities
    "db:setup": "node scripts/setup-database.js",
    "db:seed": "node scripts/seed-database.js",
    "db:reset": "npm run db:setup && npm run db:seed",
    
    // Code generation
    "generate": "npm run gen:types && npm run gen:docs",
    "gen:types": "tsc --project tsconfig.json",
    "gen:docs": "node generate-command-docs.js"
  }
}
```

## CI/CD Scripts

### Pattern: CI Pipeline Scripts

```json
{
  "scripts": {
    // CI validation
    "ci": "npm run ci:validate && npm run ci:test && npm run ci:build",
    "ci:validate": "npm run lint && npm run typecheck",
    "ci:test": "cross-env CI=true npm run test:coverage",
    "ci:build": "npm run build",
    
    // Coverage reporting
    "ci:coverage": "nyc report --reporter=text-lcov | coveralls",
    
    // Security checks
    "ci:security": "npm audit --audit-level=moderate",
    
    // Pre-commit
    "precommit": "lint-staged",
    
    // Pre-push
    "prepush": "npm test"
  }
}
```

## Publishing Scripts

### Pattern: Package Publishing Workflow

```json
{
  "scripts": {
    // Prepare for publishing
    "prepublishOnly": "npm run ci && npm run build",
    
    // Version bumping
    "release": "npm run release:patch",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish",
    
    // Changelog generation
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "version": "npm run changelog && git add CHANGELOG.md"
  }
}
```

## Monorepo/Workspace Scripts

### Pattern: Workspace Management

```json
{
  "scripts": {
    // Run in all workspaces
    "test:all": "npm test --workspaces",
    "build:all": "npm run build --workspaces",
    "clean:all": "npm run clean --workspaces",
    
    // Run in specific workspace
    "test:mcp": "npm test --workspace=mcp-server",
    "build:mcp": "npm run build --workspace=mcp-server",
    
    // Run if script exists
    "optional:all": "npm run optional --workspaces --if-present"
  },
  "workspaces": [
    "packages/*",
    "mcp-server"
  ]
}
```

## Script Documentation

### Pattern: Inline Documentation

```json
{
  "scripts": {
    "// Build Commands": "",
    "build": "npm run build:clean && npm run build:compile",
    "build:clean": "rimraf dist",
    "build:compile": "tsc",
    
    "// Test Commands": "",
    "test": "mocha",
    "test:coverage": "nyc npm test",
    
    "// Documentation": "",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs"
  }
}
```

## Common Mistakes to Avoid

❌ **Platform-specific commands** → Fails on other operating systems

❌ **Not using `&&` for dependencies** → Scripts run even if previous failed

❌ **Hardcoding environment variables** → Not configurable

❌ **Too many nested scripts** → Difficult to debug

❌ **Not using `cross-env`** → Environment vars fail on Windows

❌ **Using `rm -rf` instead of `rimraf`** → Windows incompatibility

❌ **Forgetting `npm ci` in CI** → Non-reproducible builds

❌ **Using `postinstall` in published packages** → Slow installs

❌ **Not respecting exit codes** → CI doesn't catch failures

❌ **Overly complex one-liners** → Use script files instead

## Advanced Patterns

### Pattern: Version Management with Scripts

```json
{
  "scripts": {
    "preversion": "npm run ci",
    "version": "npm run build && npm run gen:docs && git add -A",
    "postversion": "git push && git push --tags && npm publish"
  }
}
```

### Pattern: Custom Script Runner

```json
{
  "scripts": {
    "run-script": "node scripts/run-script.js",
    "custom": "npm run run-script -- --task=custom-task"
  }
}
```

### Pattern: Script with Arguments

```bash
# In package.json
{
  "scripts": {
    "test:file": "mocha"
  }
}

# Usage:
npm run test:file -- tests/specific.test.js

# With npm-run-all:
{
  "scripts": {
    "test:grep": "mocha --grep"
  }
}

# Usage:
npm run test:grep -- "pattern"
```

## Validation Checklist

Before committing script changes:

- [ ] Scripts work on Windows, macOS, and Linux
- [ ] Environment variables use `cross-env`
- [ ] File operations use cross-platform tools (rimraf, mkdirp)
- [ ] Scripts have descriptive names
- [ ] Related scripts use category prefixes
- [ ] Complex scripts are documented
- [ ] Exit codes are respected
- [ ] CI/CD scripts are tested
- [ ] Lifecycle hooks are appropriate
- [ ] Script dependencies use `&&` or `npm-run-all`

## Performance Tips

- Cache dependencies in CI (handled by GitHub Actions)
- Use `npm ci` instead of `npm install` in CI
- Run independent tests in parallel with `npm-run-all`
- Use `--if-present` for optional scripts in workspaces
- Enable incremental TypeScript compilation

## Documentation Requirements

Scripts should be organized and commented:
- Group related scripts together
- Add inline comment sections for clarity
- Document required environment variables
- Note platform-specific requirements
- Include examples in README

## Reference Examples in This Repository

- `package.json` - Root package scripts
- `mcp-server/package.json` - MCP server scripts
- `scripts/` directory - Complex script implementations
- `.github/workflows/` - CI/CD integration examples
