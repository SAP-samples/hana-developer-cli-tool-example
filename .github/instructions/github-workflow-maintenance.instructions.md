---
description: "Use when creating or updating GitHub Actions workflow files. Enforces consistent CI/CD patterns, matrix testing strategies, artifact management, deployment automation, secret handling, and integration with repository services. Ensures workflows are secure, maintainable, and follow GitHub Actions best practices."
applyTo: ".github/workflows/*.yml,.github/workflows/*.yaml"
---

# GitHub Workflow Maintenance Guidelines

Use this guide when creating or modifying GitHub Actions workflow files in `.github/workflows/`.

## Scope and Purpose

This guide applies to GitHub Actions workflow configuration:

- CI/CD pipelines for testing and building
- Documentation deployment workflows
- Release automation
- Scheduled maintenance tasks
- Pull request checks
- Package publishing workflows

## Critical Principles

1. **Matrix Testing**: Use matrix strategy for testing across multiple environments
2. **Dependency Caching**: Cache npm dependencies to speed up builds
3. **Artifact Management**: Properly upload and download build artifacts
4. **Secret Security**: Never expose secrets in logs or outputs
5. **Job Dependencies**: Clearly specify job dependencies with `needs`
6. **Fail Fast**: Use `fail-fast: false` for comprehensive testing
7. **Descriptive Names**: Use clear, descriptive names for workflows and jobs
8. **Idempotency**: Jobs should be repeatable and produce consistent results

## Workflow Structure Template

```yaml
name: Descriptive Workflow Name

# Trigger configuration
on:
  push:
    branches: [main, develop]
    paths:
      - 'src/**'
      - 'package.json'
  pull_request:
    branches: [main]
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

# Environment variables
env:
  NODE_VERSION: '20'
  NPM_CONFIG_LOGLEVEL: 'error'

# Workflow permissions
permissions:
  contents: read
  packages: write

jobs:
  # Job definitions
  test:
    name: Test on Node ${{ matrix.node-version }}
    runs-on: ${{ matrix.os }}
    
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20]
    
    steps:
      # Step definitions
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
```

## Trigger Patterns

### Pattern: Comprehensive Trigger Configuration

```yaml
on:
  # Push to specific branches
  push:
    branches:
      - main
      - develop
      - 'release/**'
    # Only trigger when specific paths change
    paths:
      - 'src/**'
      - 'bin/**'
      - 'package.json'
      - 'package-lock.json'
    # Ignore specific paths
    paths-ignore:
      - '**.md'
      - 'docs/**'
  
  # Pull requests
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
  
  # Manual workflow dispatch with inputs
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      debug:
        description: 'Enable debug logging'
        required: false
        type: boolean
  
  # Scheduled execution
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  
  # Repository events
  release:
    types: [published]
```

### Pattern: Path-Based Conditional Execution

```yaml
on:
  push:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest
    # Only run if docs changed
    if: contains(github.event.head_commit.modified, 'docs/')
    steps:
      - uses: actions/checkout@v4
      - name: Build docs
        run: npm run docs:build

  tests:
    runs-on: ubuntu-latest
    # Only run if source code changed
    if: |
      contains(github.event.head_commit.modified, 'src/') ||
      contains(github.event.head_commit.modified, 'bin/')
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
```

## Matrix Testing Strategy

### Pattern: Multi-Dimension Matrix

```yaml
jobs:
  test:
    name: Test on ${{ matrix.os }} with Node ${{ matrix.node-version }}
    runs-on: ${{ matrix.os }}
    
    strategy:
      fail-fast: false  # Continue testing other combinations
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 21]
        # Exclude specific combinations
        exclude:
          - os: macos-latest
            node-version: 18
        # Include specific additional combinations
        include:
          - os: ubuntu-latest
            node-version: 22
            experimental: true
    
    continue-on-error: ${{ matrix.experimental || false }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
```

### Pattern: Database Matrix Testing

```yaml
jobs:
  test:
    name: Test with ${{ matrix.database }}
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false
      matrix:
        database: [postgres, mysql, sqlite]
        include:
          - database: postgres
            db-version: '15'
            port: 5432
          - database: mysql
            db-version: '8.0'
            port: 3306
          - database: sqlite
            db-version: '3'
            port: 0
    
    services:
      db:
        image: ${{ matrix.database }}:${{ matrix.db-version }}
        ports:
          - ${{ matrix.port }}:${{ matrix.port }}
        options: >-
          --health-cmd="pg_isready"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
    
    steps:
      - uses: actions/checkout@v4
      - name: Run database tests
        env:
          DB_TYPE: ${{ matrix.database }}
          DB_PORT: ${{ matrix.port }}
        run: npm run test:database
```

## Dependency Caching

### Pattern: NPM Dependency Caching

```yaml
steps:
  - uses: actions/checkout@v4
  
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'
      cache: 'npm'  # Automatic npm caching
  
  - name: Install dependencies
    run: npm ci  # Use 'ci' for reproducible installs
```

### Pattern: Custom Cache Management

```yaml
steps:
  - uses: actions/checkout@v4
  
  - name: Cache node modules
    uses: actions/cache@v4
    id: cache-npm
    with:
      path: |
        node_modules
        ~/.npm
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-
  
  - name: Install dependencies
    if: steps.cache-npm.outputs.cache-hit != 'true'
    run: npm ci
  
  - name: Cache build output
    uses: actions/cache@v4
    with:
      path: dist
      key: ${{ runner.os }}-build-${{ hashFiles('src/**') }}
```

## Artifact Management

### Pattern: Upload Build Artifacts

```yaml
jobs:
  build:
    name: Build Project
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install and build
        run: |
          npm ci
          npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ github.sha }}
          path: dist/
          retention-days: 7
          if-no-files-found: error
      
      - name: Upload coverage reports
        uses: actions/upload-artifact@v4
        with:
          name: coverage-${{ github.sha }}
          path: coverage/
          retention-days: 30
```

### Pattern: Download and Use Artifacts

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
  
  deploy:
    needs: build  # Wait for build to complete
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Deploy artifacts
        run: npm run deploy
```

## GitHub Pages Deployment

### Pattern: VitePress Documentation Deployment

```yaml
name: Deploy Documentation

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - '.github/workflows/deploy-docs.yml'
  workflow_dispatch:

# Grant write permissions for GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow one concurrent deployment
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    name: Build Documentation
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Fetch all history for lastUpdated
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build VitePress site
        run: npm run docs:build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist
  
  deploy:
    name: Deploy to GitHub Pages
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Secret and Environment Management

### Pattern: Secure Secret Usage

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Use environment protection rules
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy with secrets
        env:
          # Access secrets via environment variables
          API_KEY: ${{ secrets.API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          # NEVER echo secrets!
          echo "Deploying to production..."
          npm run deploy
      
      - name: Mask sensitive output
        run: |
          # Use ::add-mask:: to hide values in logs
          echo "::add-mask::${{ secrets.API_KEY }}"
```

### Pattern: Environment-Specific Deployment

```yaml
jobs:
  deploy:
    name: Deploy to ${{ matrix.environment }}
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        environment: [staging, production]
    
    environment:
      name: ${{ matrix.environment }}
      url: ${{ matrix.environment == 'production' && 'https://app.example.com' || 'https://staging.example.com' }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy
        env:
          ENV_NAME: ${{ matrix.environment }}
          API_URL: ${{ secrets[format('{0}_API_URL', matrix.environment)] }}
        run: npm run deploy
```

## Job Dependencies and Conditions

### Pattern: Sequential Job Execution

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
  
  build:
    needs: test  # Wait for test to succeed
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
  
  deploy:
    needs: [test, build]  # Wait for both
    if: github.ref == 'refs/heads/main'  # Only on main branch
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run deploy
```

### Pattern: Conditional Execution

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    # Complex condition
    if: |
      github.event_name == 'push' &&
      github.ref == 'refs/heads/main' &&
      !contains(github.event.head_commit.message, '[skip ci]')
    
    steps:
      - uses: actions/checkout@v4
      - run: npm run deploy
  
  notify-failure:
    needs: deploy
    runs-on: ubuntu-latest
    if: failure()  # Only run if deploy failed
    steps:
      - name: Send notification
        run: echo "Deployment failed!"
```

## Cross-Platform Compatibility

### Pattern: OS-Specific Steps

```yaml
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v4
      
      # Linux/macOS specific
      - name: Setup (Unix)
        if: runner.os != 'Windows'
        run: |
          chmod +x ./scripts/setup.sh
          ./scripts/setup.sh
      
      # Windows specific
      - name: Setup (Windows)
        if: runner.os == 'Windows'
        run: |
          .\scripts\setup.ps1
        shell: pwsh
      
      # Cross-platform command
      - name: Build
        run: npm run build
```

### Pattern: Shell Selection

```yaml
steps:
  # Explicit shell for PowerShell
  - name: Run PowerShell script
    run: Write-Host "Running on PowerShell"
    shell: pwsh
  
  # Explicit shell for bash (works on all platforms with Git Bash)
  - name: Run bash script
    run: echo "Running on bash"
    shell: bash
  
  # Default shell per OS
  - name: Run with default shell
    run: echo "Running with OS default"
```

## Error Handling and Notifications

### Pattern: Continue on Error with Notification

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      
      - name: Run tests
        id: tests
        continue-on-error: true
        run: npm test
      
      - name: Check test result
        if: steps.tests.outcome == 'failure'
        run: |
          echo "::warning::Tests failed but continuing workflow"
      
      - name: Upload coverage anyway
        if: always()  # Run even if tests failed
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

### Pattern: Slack Notification

```yaml
jobs:
  notify:
    needs: [build, test, deploy]
    runs-on: ubuntu-latest
    if: always()  # Run regardless of previous job status
    
    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Build ${{ job.status }}: ${{ github.repository }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Build Status:* ${{ job.status }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* ${{ github.sha }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Reusable Workflows

### Pattern: Define Reusable Workflow

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '20'
      coverage:
        required: false
        type: boolean
        default: true
    outputs:
      test-result:
        description: "Test execution result"
        value: ${{ jobs.test.outputs.result }}

jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      result: ${{ steps.test.outcome }}
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci
      - id: test
        run: npm test
      - if: inputs.coverage
        run: npm run coverage
```

### Pattern: Call Reusable Workflow

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on: [push, pull_request]

jobs:
  test-node-18:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18'
      coverage: true
  
  test-node-20:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '20'
      coverage: false
```

## Common Mistakes to Avoid

❌ **Using `npm install` instead of `npm ci`** → Non-reproducible builds

❌ **Not caching dependencies** → Slow workflow execution

❌ **Exposing secrets in logs** → Security vulnerability

❌ **Using `fail-fast: true` in matrix** → Incomplete test coverage

❌ **Not specifying job dependencies** → Race conditions

❌ **Hardcoding versions** → Difficult maintenance

❌ **Missing `fetch-depth: 0`** → Breaks lastUpdated in VitePress

❌ **Not using `checkout@v4` latest version** → Missing features

❌ **Overusing `if: always()`** → Masks real failures

❌ **Not setting workflow permissions** → Security issues

## Performance Optimization

### Pattern: Optimized CI Workflow

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          # Shallow clone for faster checkout
          fetch-depth: 1
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # Built-in caching
      
      - name: Install dependencies
        run: npm ci --prefer-offline --no-audit
      
      - name: Run tests in parallel
        run: npm test -- --parallel
      
      - name: Conditional coverage
        if: github.event_name == 'push'  # Only on push, not PR
        run: npm run coverage
```

## Validation Checklist

Before committing workflow changes:

- [ ] Workflow triggers are appropriate
- [ ] Secrets are properly secured
- [ ] Dependencies are cached
- [ ] Matrix testing covers target platforms
- [ ] Job dependencies are explicit
- [ ] Error handling is comprehensive
- [ ] Artifacts have appropriate retention
- [ ] Permissions are minimal and explicit
- [ ] Cross-platform compatibility tested
- [ ] Workflow names are descriptive

## Reference Examples in This Repository

- `.github/workflows/deploy-docs.yml` - Documentation deployment
- `.github/workflows/test.yml` - CI testing pipeline (if exists)
- `.github/workflows/release.yml` - Release automation (if exists)
