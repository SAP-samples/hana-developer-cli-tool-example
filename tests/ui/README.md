# UI Automated Tests with WDI5

This directory contains UI automation tests for the SAPUI5 interfaces using **WDI5** (WebDriver for UI5).

## Overview

These tests validate the actual SAPUI5 user interface functionality, including:

- **🎨 UI Rendering**: Verifies SAPUI5 controls are displayed correctly
- **🖱️ User Interactions**: Tests clicks, input, navigation, and other user actions
- **📊 Data Binding**: Validates data loading and display in UI controls
- **📱 Responsive Design**: Tests mobile, tablet, and desktop layouts
- **⚠️ Error Handling**: Validates error messages and feedback to users
- **🔄 State Management**: Tests UI state changes and transitions

## Test Types

### CLI Tests (E2E) vs UI Tests

| Test Type | Location | What it Tests | Tools |
|-----------|----------|---------------|-------|
| **E2E CLI Tests** | `tests/e2e/` | Command execution, help text, server startup | Mocha, Node exec |
| **UI Tests** | `tests/ui/` | Actual SAPUI5 interface interaction | WDI5, WebdriverIO, Chrome |

## Prerequisites

### Required Dependencies

Install WDI5 and WebdriverIO:

```bash
npm install --save-dev @wdio/cli@9 @wdio/local-runner@9 @wdio/mocha-framework@9 @wdio/spec-reporter@9 @wdio/globals@9 wdio-ui5-service@3 wdio-chromedriver-service@8 webdriverio@9 --legacy-peer-deps
```

> **Note**:
> - WebdriverIO v9 is required for wdio-ui5-service v3
> - `wdio-chromedriver-service@8` is the latest available
> - `--legacy-peer-deps` flag is required for peer dependency conflicts

### Chrome/Chromium

Tests run in Chrome (headless by default). Ensure Chrome is installed:

- **Windows**: Download from https://www.google.com/chrome/
- **macOS**: `brew install --cask google-chrome`
- **Linux**: `sudo apt-get install google-chrome-stable`

## Running UI Tests

### Prerequisites: Start the Server

Before running UI tests, **start the HANA CLI server**:

```bash
# Starts UI server at http://localhost:3010/ui/#tables-ui
node bin/cli.js tablesUI
```

> Note: this command does not support `--port`; the default UI port is `3010`.

Leave the server running in the background.

### Run All UI Tests

```bash
npm run test:ui
```

### Run Specific UI Test

```bash
npm run test:ui -- --spec tests/ui/tablesUI.ui.test.js
```

### Run in Non-Headless Mode (Debug)

```bash
npm run test:ui:debug
```

This opens Chrome with visible browser for debugging.

### Run with Specific Browser Size

Edit `wdio.conf.js` and modify the `args` section:

```javascript
'goog:chromeOptions': {
  args: [
    '--window-size=1920,1080'  // Change this
  ]
}
```

## Test Structure

Each UI test file follows this pattern:

```javascript
describe('ComponentUI - SAPUI5 Interface Tests', function() {
  before(async function() {
    // Navigate to UI and wait for UI5 to load
  })
  
  describe('Page Structure', () => {
    // Test page loads, components initialize
  })
  
  describe('UI Controls', () => {
    // Test buttons, inputs, tables render
  })
  
  describe('User Interactions', () => {
    // Test clicking, typing, selecting
  })
  
  describe('Data Loading', () => {
    // Test backend data binding
  })
  
  describe('Responsive Design', () => {
    // Test mobile/tablet/desktop layouts
  })
  
  describe('Error Handling', () => {
    // Test error messages
  })
})
```

## WDI5 Key Concepts

### Selecting UI5 Controls

```javascript
// By control type and view
const button = await browser.asControl({
  selector: {
    controlType: 'sap.m.Button',
    viewName: 'sap.hanacli.tables.view.App'
  }
})

// By ID
const table = await browser.asControl({
  selector: {
    id: 'myTable',
    viewName: 'sap.hanacli.tables.view.App'
  }
})

// By property
const searchField = await browser.asControl({
  selector: {
    controlType: 'sap.m.SearchField',
    properties: {
      placeholder: 'Search...'
    }
  }
})
```

### Interacting with Controls

```javascript
// Enter text
await input.enterText('Hello World')

// Click button
await button.press()

// Get property
const value = await input.getValue()
const enabled = await button.getEnabled()
```

### Waiting for UI5

```javascript
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
```

## Test Files

| Test File | UI Command | Description |
|-----------|------------|-------------|
| `tablesUI.ui.test.js` | `tablesUI` | Tests table listing and browsing interface |
| `systemInfoUI.ui.test.js` | `systemInfoUI` | Tests system information display |
| `importUI.ui.test.js` | `importUI` | Tests file upload and import interface |

## Configuration

Configuration is in `wdio.conf.js` at the project root:

- **Browser**: Chrome (headless by default)
- **Base URL**: `http://localhost:3010`
- **Timeout**: 60000ms per test
- **Framework**: Mocha
- **Reporters**: Spec (console output)

## Troubleshooting

### TypeScript Errors in Test Files

You may see TypeScript errors related to `controlType` and SAPUI5 types in test files. These are expected due to incomplete type definitions in WDI5 and **do not affect test execution**. The tests will run successfully despite these editor warnings.

**Common TypeScript errors (safe to ignore)**:
- `Object literal may only specify known properties, and 'controlType' does not exist`
- `Property 'require' does not exist on type 'typeof ui'`
- `Parameter 'X' implicitly has an 'any' type`

These errors occur because WDI5 and SAPUI5 type definitions are not complete for all use cases. The code is correct and will execute properly at runtime.

### "UI5 framework did not initialize"

- Ensure the server is running on port 3010 (`node bin/cli.js tablesUI`)
- Check browser console for JavaScript errors
- Increase `waitforTimeout` in `wdio.conf.js`

### "Cannot find control"

- Verify `viewName` matches your SAPUI5 component
- Check `controlType` spelling (case-sensitive)
- Use `browser.execute()` to inspect DOM

### ChromeDriver Version Mismatch

**Problem**: ChromeDriver version doesn't match your Chrome version

```bash
This version of ChromeDriver only supports Chrome version 146
Current browser version is 145.0.7632.160
```

**Solutions**:

1. **Update Chrome** (recommended):
   - Windows: Check for updates in Chrome menu → About Google Chrome
   - macOS/Linux: Update via your package manager

2. **OR Update ChromeDriver to match your Chrome version**:

   ```bash
   npm install --save-dev chromedriver --legacy-peer-deps
   ```

   This automatically downloads the correct version for your installed Chrome.

Always keep Chrome and ChromeDriver versions in sync for UI tests to work.

### Debugging Tests

1. Set `headless: false` in `wdio.conf.js`
2. Add `await browser.debug()` in test to pause
3. Use `await browser.pause(5000)` to add delays
4. Take screenshots: `await browser.saveScreenshot('./screenshot.png')`

## CI/CD Integration

UI tests can be run in CI with headless Chrome:

```yaml
# GitHub Actions example
- name: Install Chrome
  run: |
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
    sudo apt-get update
    sudo apt-get install google-chrome-stable

- name: Run UI Tests
  run: |
    npm run test:ui
```

## Best Practices

1. **Start server before tests**: UI tests require a running server
2. **Use proper waits**: Always wait for UI5 to initialize
3. **Clean test data**: Reset state between tests if needed
4. **Test isolation**: Each test should be independent
5. **Responsive testing**: Test multiple screen sizes
6. **Error scenarios**: Test both success and failure paths

## Resources

- [WDI5 Documentation](https://ui5-community.github.io/wdi5/)
- [WebdriverIO Documentation](https://webdriver.io/)
- [SAPUI5 SDK](https://ui5.sap.com/)
- [Mocha Test Framework](https://mochajs.org/)

## Contributing

When adding new UI tests:

1. Follow the existing test structure
2. Test both happy path and error scenarios
3. Include responsive design tests
4. Document any special setup requirements
5. Ensure tests pass in headless mode
