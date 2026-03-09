---
description: "Use when creating or updating GitHub Actions workflow files. Enforces consistent CI/CD patterns, matrix testing strategies, artifact management, deployment automation, secret handling, and integration with repository services. Ensures workflows are secure, maintainable, and follow GitHub Actions best practices."
applyTo: ".github/workflows/*.yml,.github/workflows/*.yaml"
---

# CI/CD Pipeline Guidelines

Use this guide when creating, modifying, or troubleshooting GitHub Actions workflows for this project.

## Scope and Purpose

This guide applies to all GitHub Actions workflow files in `.github/workflows/`:
- **deploy-docs.yml** - Documentation deployment to GitHub Pages
- **cross-platform-tests.yml** - Multi-OS, multi-Node.js version testing
- Future workflow files

## Existing Workflows

### 1. Deploy Documentation (deploy-docs.yml)

**Purpose**: Automatically deploy VitePress documentation to GitHub Pages

**Triggers:**
- Push to `main` or `Feb2026` branches
- Changes in `docs/**` or workflow file
- Manual trigger via `workflow_dispatch`

**Jobs:**
1. **build** - Build VitePress documentation
2. **deploy** - Deploy to GitHub Pages

**Key Features:**
- Node.js 20 with npm caching
- Artifact upload with 1-day retention
- Permissions: read contents, write pages, id-token

**Usage:**
- Automatic on push to tracked branches
- Manual: Actions tab → Deploy Documentation → Run workflow

**Troubleshooting Common Issues:**

**Issue**: Build fails with "Module not found"
```bash
# Solution: Check docs/package.json dependencies
cd docs
npm ci
npm run docs:build
```

**Issue**: Deployment fails with permission error
- Check repository Settings → Pages → Source is "GitHub Actions"
- Verify workflow has `pages: write` permission

**Issue**: Documentation not updating
- Check artifact was uploaded successfully
- Verify deploy job ran after build job
- Clear browser cache (Ctrl+Shift+R)

### 2. Cross-Platform Tests (cross-platform-tests.yml)

**Purpose**: Test hana-cli across operating systems and Node.js versions

**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests to these branches
- Manual trigger via `workflow_dispatch`

**Matrix Strategy:**
- **Operating Systems**: Ubuntu, Windows, macOS
- **Node.js Versions**: 20.x, 22.x, 24.x
- **Total Combinations**: 9 test runs per trigger

**Jobs:**

**1. test** - Run platform-specific tests
- Install dependencies with `npm ci`
- Run linter (continue-on-error: true)
- Execute `npm run test:platform`
- Upload test results and coverage artifacts
- Upload coverage to Codecov (Ubuntu + Node 20.x only)

**2. platform-verification** - Verify CLI installation
- Test `npm link` and `hana-cli --version`
- Verify platform-specific features (Windows, macOS, Linux)

**Key Features:**
- Fail-fast disabled (all combinations run even if one fails)
- Test results retained for 30 days
- Codecov integration for coverage tracking
- Platform-specific verification steps

**Usage:**
- Automatic on push/PR
- Manual: Actions tab → Cross-Platform Tests → Run workflow

**Troubleshooting Common Issues:**

**Issue**: Tests fail on specific OS
```bash
# Run locally with platform tag
npm run test:windows  # Windows-specific
npm run test:unix     # Unix-specific
npm run test:platform # All platform tests
```

**Issue**: Matrix job timeout
- Default timeout is 6 hours per job
- Check if specific test is hanging
- Add timeout for specific steps if needed

**Issue**: npm ci fails with "lock file mismatch"
```bash
# Regenerate lock file
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

**Issue**: Coverage upload fails
- Codecov failures are set to `continue-on-error: true`
- Check Codecov token if needed (usually not required for public repos)
- Verify coverage files exist in `coverage/` directory

## Workflow Structure Best Practices

### Standard Workflow Template

```yaml
name: Workflow Name

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

jobs:
  job-name:
    name: Job Display Name
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
```

### Trigger Patterns

**Push to branches:**
```yaml
on:
  push:
    branches:
      - main
      - develop
      - 'release/**'
```

**Pull requests:**
```yaml
on:
  pull_request:
    branches: [ main ]
```

**Path filtering:**
```yaml
on:
  push:
    paths:
      - 'docs/**'
      - '!docs/README.md'  # Exclude specific file
```

**Manual trigger:**
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
```

**Scheduled runs:**
```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday at midnight
```

### Matrix Testing Strategy

**Basic matrix:**
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [20.x, 22.x, 24.x]

runs-on: ${{ matrix.os }}

steps:
- uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
```

**Matrix with exclusions:**
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [20.x, 22.x]
    exclude:
      - os: macos-latest
        node-version: 20.x
```

**Matrix with includes (additional combinations):**
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [20.x]
    include:
      - os: ubuntu-latest
        node-version: 24.x
        experimental: true
```

**Fail-fast behavior:**
```yaml
strategy:
  fail-fast: false  # Continue all jobs even if one fails
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
```

### Caching Strategies

**npm cache:**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: 'package-lock.json'
```

**Multiple cache paths:**
```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
      docs/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Artifact Management

**Upload artifacts:**
```yaml
- name: Upload test results
  uses: actions/upload-artifact@v4
  if: always()  # Upload even if tests fail
  with:
    name: test-results-${{ matrix.os }}
    path: |
      mochawesome-report/
      coverage/
    retention-days: 30
```

**Download artifacts:**
```yaml
- name: Download build artifacts
  uses: actions/download-artifact@v4
  with:
    name: dist-files
    path: dist/
```

### Secrets and Environment Variables

**Using secrets:**
```yaml
- name: Deploy to production
  env:
    DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
    API_KEY: ${{ secrets.API_KEY }}
  run: npm run deploy
```

**Environment variables:**
```yaml
env:
  NODE_ENV: production
  CI: true

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      BUILD_ENV: staging
    
    steps:
    - name: Build
      env:
        SPECIFIC_VAR: value
      run: npm run build
```

**Conditional secrets:**
```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  env:
    PRODUCTION_KEY: ${{ secrets.PRODUCTION_KEY }}
  run: npm run deploy:production
```

### Conditional Execution

**Run on specific branch:**
```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

**Run on specific OS:**
```yaml
- name: Windows-specific setup
  if: runner.os == 'Windows'
  run: echo "Windows configuration"
  
- name: macOS-specific setup
  if: runner.os == 'macOS'
  run: echo "macOS configuration"
  
- name: Linux-specific setup
  if: runner.os == 'Linux'
  run: echo "Linux configuration"
```

**Run on success/failure:**
```yaml
- name: Upload logs on failure
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: failure-logs
    path: logs/

- name: Notify on success
  if: success()
  run: echo "Build succeeded!"

- name: Always run cleanup
  if: always()
  run: npm run cleanup
```

**Run on specific event:**
```yaml
- name: Deploy on push only
  if: github.event_name == 'push'
  run: npm run deploy

- name: Comment on PR
  if: github.event_name == 'pull_request'
  run: npm run pr:comment
```

### Permissions

**Minimal permissions (recommended):**
```yaml
permissions:
  contents: read
```

**Specific permissions:**
```yaml
permissions:
  contents: read      # Read repository contents
  pull-requests: write  # Write to PRs
  issues: write       # Write to issues
  packages: read      # Read packages
```

**GitHub Pages deployment:**
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

**Full permissions (use sparingly):**
```yaml
permissions:
  contents: write
  packages: write
```

### Concurrency Control

**Prevent concurrent deployments:**
```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

**Branch-based concurrency:**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**PR-based concurrency:**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

## Creating New Workflows

### Workflow for Running Full Test Suite

```yaml
name: Full Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linter
      run: npm run lint
      continue-on-error: true
      
    - name: Run tests
      run: npm test
      
    - name: Generate coverage
      run: npm run coverage
      
    - name: Check coverage threshold
      run: npm run coverage:check
      
    - name: Upload coverage
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: coverage-report
        path: coverage/
        retention-days: 30
```

### Workflow for npm Package Publishing

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  publish:
    name: Publish Package
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        registry-url: 'https://registry.npmjs.org'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build types
      run: npm run types
      
    - name: Publish to npm
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Workflow for Linting and Type Checking

```yaml
name: Code Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run ESLint
      run: npm run lint
      
    - name: Validate i18n bundles
      run: npm run validate:i18n
      
    - name: Generate TypeScript types
      run: npm run types
      
    - name: Check for TypeScript errors
      run: npx tsc --noEmit
```

### Workflow for Scheduled Dependency Updates

```yaml
name: Dependency Check

on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday at midnight
  workflow_dispatch:

jobs:
  check-dependencies:
    name: Check Dependencies
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        
    - name: Check for outdated dependencies
      run: npm outdated || true
      
    - name: Audit dependencies
      run: npm audit
      continue-on-error: true
      
    - name: Run tests with latest dependencies
      run: |
        npm update
        npm test
```

## Troubleshooting CI/CD Issues

### Common Workflow Failures

**1. Checkout Failures**

**Symptom**: Error during actions/checkout
```
Error: fatal: unable to access 'https://github.com/...': Could not resolve host
```

**Solution:**
- Check repository permissions
- Verify GitHub is accessible
- Check if repository is private and runner has access

**2. Node.js Setup Failures**

**Symptom**: actions/setup-node fails to cache
```
Error: Cache folder path is retrieved for npm but doesn't exist on disk
```

**Solution:**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: 'package-lock.json'  # Specify path
```

**3. npm ci Failures**

**Symptom**: Dependencies fail to install
```
Error: ERESOLVE unable to resolve dependency tree
```

**Solution:**
- Update package-lock.json locally and commit
- Use `npm install` instead of `npm ci` temporarily
- Check for peer dependency conflicts

**4. Test Failures on Specific OS**

**Symptom**: Tests pass locally but fail on CI
```
Error: ENOENT: no such file or directory
```

**Solution:**
- Check file path separators (use path.join())
- Verify cross-platform compatibility
- Run tests locally with platform tags:
  ```bash
  npm run test:windows
  npm run test:unix
  ```

**5. Artifact Upload Failures**

**Symptom**: Upload artifact step fails
```
Error: Path does not exist: coverage/
```

**Solution:**
```yaml
- name: Upload coverage
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: coverage
    path: coverage/
    if-no-files-found: warn  # Don't fail if no files
```

**6. Permission Denied Errors**

**Symptom**: Workflow can't write to repository
```
Error: Resource not accessible by integration
```

**Solution:**
- Add appropriate permissions to workflow:
  ```yaml
  permissions:
    contents: write
    pull-requests: write
  ```

**7. Timeout Issues**

**Symptom**: Job exceeds time limit
```
Error: The job running on runner ... has exceeded the maximum execution time
```

**Solution:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # Set specific timeout
```

### Viewing Workflow Logs

**1. GitHub UI:**
- Repository → Actions tab
- Select workflow run
- Click on specific job
- Expand step to see detailed logs

**2. Download logs:**
- Actions → Workflow run → "..." menu → Download log archive

**3. Enable debug logging:**
```yaml
- name: Debug information
  run: |
    echo "GitHub ref: ${{ github.ref }}"
    echo "GitHub event: ${{ github.event_name }}"
    echo "Runner OS: ${{ runner.os }}"
    env
```

**4. Add step summaries:**
```yaml
- name: Test Summary
  if: always()
  run: |
    echo "## Test Results" >> $GITHUB_STEP_SUMMARY
    echo "Tests: ${{ steps.test.outputs.total }}" >> $GITHUB_STEP_SUMMARY
    echo "Passed: ${{ steps.test.outputs.passed }}" >> $GITHUB_STEP_SUMMARY
```

### Debugging Strategies

**1. Run step locally:**
```bash
# Test exact command from workflow
npm ci
npm test
```

**2. Use act for local workflow testing:**
```bash
# Install act (https://github.com/nektos/act)
act -l  # List available workflows
act push  # Simulate push event
```

**3. Add conditional debugging:**
```yaml
- name: Debug on failure
  if: failure()
  run: |
    echo "=== Environment ==="
    env
    echo "=== Files ==="
    ls -la
    echo "=== Logs ==="
    cat logs/*.log || true
```

**4. Enable runner diagnostics:**
```yaml
- name: Enable debug logging
  run: echo "::debug::This is a debug message"
  
- name: Set output
  run: echo "result=success" >> $GITHUB_OUTPUT
  
- name: Create notice
  run: echo "::notice::Build completed successfully"
```

## Performance Optimization

### Speed Up Workflow Execution

**1. Use caching effectively:**
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

**2. Parallelize jobs:**
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    # Runs in parallel
    
  test:
    runs-on: ubuntu-latest
    # Runs in parallel
    
  deploy:
    needs: [lint, test]
    # Runs after both complete
    runs-on: ubuntu-latest
```

**3. Use npm ci instead of npm install:**
```yaml
- run: npm ci  # Faster, uses lock file exactly
```

**4. Reduce matrix size for PRs:**
```yaml
strategy:
  matrix:
    os: ${{ github.event_name == 'pull_request' && '[ubuntu-latest]' || '[ubuntu-latest, windows-latest, macos-latest]' }}
```

**5. Skip redundant steps:**
```yaml
- name: Deploy
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: npm run deploy
```

## Security Best Practices

### 1. Use Pinned Action Versions

❌ **Bad:**
```yaml
- uses: actions/checkout@v4
```

✅ **Good:**
```yaml
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

### 2. Minimize Token Permissions

```yaml
permissions:
  contents: read  # Minimal necessary permission
```

### 3. Never Log Secrets

❌ **Bad:**
```yaml
- run: echo "Token: ${{ secrets.API_TOKEN }}"
```

✅ **Good:**
```yaml
- run: echo "Token is configured"
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}
```

### 4. Use Environment Protection

```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://example.com
    runs-on: ubuntu-latest
```

### 5. Validate External Inputs

```yaml
- name: Validate input
  run: |
    if [[ ! "${{ github.event.inputs.version }}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "Invalid version format"
      exit 1
    fi
```

## Best Practices Summary

### Workflow Design

✅ **Do:**
- Use `workflow_dispatch` for manual triggers
- Set appropriate permissions (minimal necessary)
- Use caching for dependencies
- Include `continue-on-error` for non-critical steps
- Upload artifacts for debugging
- Use matrix for cross-platform testing
- Add timeout limits to prevent runaway jobs
- Use `if: always()` for cleanup steps

❌ **Don't:**
- Hardcode secrets in workflow files
- Use deprecated action versions
- Run unnecessary steps on all branches
- Forget to handle job failures
- Upload sensitive data as artifacts
- Use `GITHUB_TOKEN` more broadly than needed

### Naming Conventions

**Workflows:**
- Use kebab-case: `deploy-docs.yml`, `cross-platform-tests.yml`
- Descriptive names: `build-and-test.yml` not `ci.yml`

**Jobs:**
- Use lowercase with hyphens: `run-tests`, `deploy-production`
- Action-oriented names: `build`, `test`, `deploy`

**Steps:**
- Start with capital letter: `Install dependencies`
- Action-oriented: `Run tests`, `Upload artifacts`

## Integration with Project

### This Project's CI/CD Strategy

**Current workflows:**
1. **deploy-docs.yml** - Automatic documentation deployment
2. **cross-platform-tests.yml** - Multi-platform testing

**Coverage:**
- ✅ Documentation deployment
- ✅ Cross-platform testing
- ✅ Multiple Node.js versions
- ✅ Test result artifacts
- ✅ Coverage reporting

**Potential additions:**
- npm publish automation (on tag push)
- Scheduled dependency audits
- Automated changelog generation check
- i18n validation on PR
- Performance benchmarking

### When to Add New Workflows

**Add new workflow when:**
- New deployment target (e.g., Docker registry, cloud platform)
- New quality check needed (e.g., security scanning, performance tests)
- Scheduled maintenance tasks (e.g., dependency updates)
- Release automation requirements

**Don't add new workflow if:**
- Can be added as job to existing workflow
- Can be triggered manually when needed
- Rarely used (use workflow_dispatch in existing workflow)

## Related Documentation

- [github-workflow-maintenance.instructions.md](github-workflow-maintenance.instructions.md) - Already exists
- [release-management.instructions.md](release-management.instructions.md) - Release process
- [testing.instructions.md](testing.instructions.md) - Testing guidelines
- [project-overview.instructions.md](project-overview.instructions.md) - Project architecture

## Critical Rules

1. **Always use actions/checkout@v4** - First step in every job
2. **Always cache npm dependencies** - Speeds up builds significantly
3. **Use npm ci not npm install** - Faster and more reliable
4. **Set appropriate permissions** - Minimal necessary access
5. **Never log secrets** - Use environment variables
6. **Always upload artifacts on failure** - For debugging
7. **Use matrix for cross-platform** - Test on all target OSes
8. **Set job timeouts** - Prevent runaway processes
9. **Use workflow_dispatch** - Enable manual triggers
10. **Document workflow purpose** - Add description in workflow name or comments

## Summary

GitHub Actions workflows automate testing, deployment, and maintenance tasks. This project uses:
- **deploy-docs.yml** for automatic documentation deployment
- **cross-platform-tests.yml** for multi-platform testing

When creating new workflows:
1. Start with standard template
2. Use matrix for cross-platform testing
3. Cache dependencies
4. Upload artifacts
5. Set minimal permissions
6. Add manual trigger option
7. Document purpose and usage

Common issues:
- Check logs in Actions tab
- Verify permissions
- Test locally before pushing
- Use platform-specific test tags
- Enable debug logging when needed

Follow security best practices and maintain workflow documentation.
