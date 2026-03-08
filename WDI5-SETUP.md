# WDI5 UI Testing Setup Guide

This guide explains how to set up and run WDI5 (WebDriver for UI5) automated tests for the SAPUI5 interfaces.

## Quick Start

### 1. Install Dependencies

Run this command to install all required WDI5 and WebdriverIO packages:

```bash
npm install --save-dev @wdio/cli@9 @wdio/local-runner@9 @wdio/mocha-framework@9 @wdio/spec-reporter@9 @wdio/globals@9 wdio-ui5-service@3 wdio-chromedriver-service@8 webdriverio@9 --legacy-peer-deps
```

> **Note**: 
> - WebdriverIO v9 is required for compatibility with wdio-ui5-service v3
> - `wdio-chromedriver-service@8` is the latest available (v9 doesn't exist yet)
> - The `--legacy-peer-deps` flag is required to bypass peer dependency conflicts
> - `@wdio/globals@9` is required by wdio-ui5-service for global test APIs

### 2. Verify Chrome Installation

WDI5 tests run in Chrome. Verify it's installed:

```bash
# Windows
where chrome

# macOS/Linux
which google-chrome
```

If Chrome is not installed:
- **Windows**: Download from https://www.google.com/chrome/
- **macOS**: `brew install --cask google-chrome`
- **Linux**: `sudo apt-get install google-chrome-stable`

### 3. Start the HANA CLI Server

Before running UI tests, start the server:

```bash
# Start a UI command (this keeps server running)
node bin/cli.js tablesUI --port 8080
```

Leave this terminal open.

### 4. Run UI Tests

In a new terminal:

```bash
# Run all UI tests
npm run test:ui

# Run specific test file
npm run test:ui:single tests/ui/tablesUI.ui.test.js

# Run in debug mode (visible browser)
npm run test:ui:debug
```

## What You Get

### Two Types of Tests

| Test Type | Purpose | Browser Needed? | Server Needed? |
|-----------|---------|-----------------|----------------|
| **E2E CLI Tests** (`tests/e2e/*.e2e.Test.js`) | Test command execution, help text, server startup | ❌ No | ❌ No |
| **UI Tests** (`tests/ui/*.ui.test.js`) | Test actual SAPUI5 interface interaction | ✅ Yes (Chrome) | ✅ Yes (port 8080) |

### E2E CLI Tests

```javascript
// tests/e2e/tablesUI.e2e.Test.js
it('shows help with --help flag', function (done) {
  base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
    expect(stdout).to.include('hana-cli tablesUI')
    done()
  })
})
```

**What it tests:**
- ✅ Command can be invoked
- ✅ Help text displays
- ✅ Server starts without errors
- ❌ Does NOT test actual UI

### WDI5 UI Tests

```javascript
// tests/ui/tablesUI.ui.test.js
it('should display the tables table control', async () => {
  const table = await browser.asControl({
    selector: {
      controlType: 'sap.m.Table',
      viewName: 'sap.hanacli.tables.view.App'
    }
  })
  await expect(table).toBeDefined()
})
```

**What it tests:**
- ✅ SAPUI5 controls render
- ✅ User can interact with UI
- ✅ Data loads from backend
- ✅ UI responds to actions

## Test Structure

```
tests/
├── e2e/                         # CLI-level E2E tests
│   ├── tablesUI.e2e.Test.js    # Tests CLI command execution
│   ├── systemInfoUI.e2e.Test.js
│   └── importUI.e2e.Test.js
│
└── ui/                          # WDI5 UI automation tests
    ├── README.md                # UI test documentation
    ├── tablesUI.ui.test.js      # Tests SAPUI5 interface
    ├── systemInfoUI.ui.test.js
    └── importUI.ui.test.js
```

## Running Tests

### E2E CLI Tests (Existing)

```bash
# Run all E2E CLI tests (no browser needed)
npm run test:e2e

# Run specific E2E test
npx mocha tests/e2e/tablesUI.e2e.Test.js
```

### WDI5 UI Tests (New)

```bash
# Run all UI tests (requires browser + server)
npm run test:ui

# Run single UI test file
npm run test:ui:single tests/ui/tablesUI.ui.test.js

# Debug mode (visible browser)
npm run test:ui:debug
```

## Troubleshooting

### TypeScript Errors in Test Files

**Problem**: TypeScript shows errors in UI test files related to WDI5 types

**Explanation**: These errors are **expected and safe to ignore**. They do not affect test execution.

**Common errors (safe to ignore)**:
```typescript
- Object literal may only specify known properties, and 'controlType' does not exist
- Property 'require' does not exist on type 'typeof ui'
- Parameter implicitly has an 'any' type
```

**Why this happens**: WDI5 and SAPUI5 have incomplete TypeScript type definitions. The code is correct and executes successfully at runtime.

**Optional fix**: Remove `// @ts-check` from the top of test files to disable TypeScript checking.

### "Connection refused" or "ECONNREFUSED"

**Problem**: Server is not running

**Solution**: Start the server first:
```bash
node bin/cli.js tablesUI --port 8080
```

### "UI5 framework did not initialize"

**Problem**: SAPUI5 took too long to load

**Solution**: Increase timeout in `wdio.conf.js`:
```javascript
waitforTimeout: 60000,  // Increase from 30000
```

### "ChromeDriver version mismatch"

**Problem**: ChromeDriver version doesn't match your Chrome version

```
This version of ChromeDriver only supports Chrome version 146
Current browser version is 145.0.7632.160
```

**Solutions**:

1. **Update Chrome** (recommended):
   - Windows: Chrome menu → About Google Chrome → Auto-updates
   - macOS/Linux: Update via package manager or download from google.com/chrome

2. **OR Update ChromeDriver to match your Chrome**:
   ```bash
   npm install --save-dev chromedriver --legacy-peer-deps
   ```

Keep Chrome and ChromeDriver versions synchronized for best results.

### "Cannot find control"

**Problem**: Control selector is incorrect

**Solution**: 
1. Check `viewName` matches your SAPUI5 component
2. Verify `controlType` spelling (case-sensitive)
3. Use browser dev tools to inspect DOM

### Tests Pass but Nothing Visible

**Problem**: Tests run in headless mode by default

**Solution**: Use debug mode to see the browser:
```bash
npm run test:ui:debug
```

Or edit `wdio.conf.js` and remove `--headless` from Chrome args.

## Configuration

### wdio.conf.js

Main configuration file at project root:

```javascript
exports.config = {
  specs: ['./tests/ui/**/*.ui.test.js'],
  baseUrl: 'http://localhost:8080',
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: [
        '--headless',           // Remove to see browser
        '--window-size=1920,1080'
      ]
    }
  }],
  services: ['chromedriver', ['ui5', { /* WDI5 options */ }]],
  framework: 'mocha',
  mochaOpts: {
    timeout: 60000
  }
}
```

## Package.json Scripts

New scripts added:

```json
{
  "scripts": {
    "test:ui": "wdio run wdio.conf.js",
    "test:ui:debug": "wdio run wdio.conf.js --debug",
    "test:ui:single": "wdio run wdio.conf.js --spec"
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: UI Tests

on: [push, pull_request]

jobs:
  ui-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Chrome
        run: |
          wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
          sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
          sudo apt-get update
          sudo apt-get install google-chrome-stable
      
      - name: Start server
        run: |
          node bin/cli.js tablesUI --port 8080 &
          sleep 5
      
      - name: Run UI tests
        run: npm run test:ui
```

## Writing New UI Tests

### Basic Test Template

```javascript
const { wdi5 } = require('wdio-ui5-service')

describe('MyUI - SAPUI5 Interface Tests', function() {
  this.timeout(60000)
  
  before(async function() {
    await browser.url('http://localhost:8080/ui/#my-ui')
    
    // Wait for UI5 to initialize
    await browser.waitUntil(async () => {
      const ready = await browser.executeAsync((done) => {
        if (window.sap && window.sap.ui) {
          sap.ui.require(['sap/ui/core/Core'], function(Core) {
            done(Core.isInitialized())
          })
        } else {
          done(false)
        }
      })
      return ready
    }, { timeout: 30000 })
  })
  
  it('should display my control', async () => {
    const control = await browser.asControl({
      selector: {
        controlType: 'sap.m.Button',
        viewName: 'sap.hanacli.my.view.App'
      }
    })
    await expect(control).toBeDefined()
  })
})
```

### Common WDI5 Patterns

```javascript
// Get control
const button = await browser.asControl({
  selector: {
    id: 'myButton',
    viewName: 'sap.hanacli.my.view.App'
  }
})

// Click button
await button.press()

// Enter text
const input = await browser.asControl({
  selector: {
    controlType: 'sap.m.Input'
  }
})
await input.enterText('Hello World')

// Get property
const text = await button.getText()
const enabled = await button.getEnabled()

// Check visibility
await expect(button).toBeDefined()
```

## Resources

- [WDI5 Documentation](https://ui5-community.github.io/wdi5/)
- [WebdriverIO Documentation](https://webdriver.io/)
- [SAPUI5 SDK](https://ui5.sap.com/)
- [Mocha Test Framework](https://mochajs.org/)

## Next Steps

1. ✅ Install dependencies: `npm install --save-dev @wdio/cli@8 ...`
2. ✅ Verify Chrome is installed
3. ✅ Start server: `node bin/cli.js tablesUI --port 8080`
4. ✅ Run tests: `npm run test:ui`
5. ✅ Write more tests for other UI commands

## Support

For issues or questions:
1. Check [tests/ui/README.md](tests/ui/README.md) for detailed documentation
2. Review existing test files for examples
3. Consult WDI5 documentation
4. Open an issue in the repository
