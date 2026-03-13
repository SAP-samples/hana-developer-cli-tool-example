// @ts-check
/**
 * WebdriverIO Configuration for WDI5 UI Tests
 * 
 * This configuration enables automated testing of SAPUI5 interfaces
 * using WDI5 (WebDriver for UI5) framework.
 * 
 * @see https://ui5-community.github.io/wdi5/
 */

export const config = {
  //
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  
  //
  // ==================
  // Specify Test Files
  // ==================
  specs: [
    './tests/ui/**/*.ui.test.js'
  ],
  exclude: [],
  
  //
  // ============
  // Capabilities
  // ============
  maxInstances: 1,
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome',
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--window-size=1920,1080'
      ]
    }
  }],
  
  //
  // ===================
  // Test Configurations
  // ===================
  logLevel: 'error',
  bail: 0,
  baseUrl: 'http://localhost:3010/ui/',
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  wdi5: {
    logLevel: 'error',
    waitForUI5Timeout: 30000,
    screenshotPath: './tests/ui/screenshots',
    screenshotsDisabled: false,
    btpWorkZoneEnablement: false,
    skipInjectUI5OnStart: true
  },
  
  //
  // =====
  // Hooks
  // =====
  before: async function() {
    // Import WDI5 for UI5 testing
    const { wdi5 } = await import('wdio-ui5-service')
    await browser.url('/')
  },
  
  //
  // ========
  // Services
  // ========
  services: [
    'devtools',
    [
      'ui5',
      {
        screenshotPath: './tests/ui/screenshots',
        screenshotsDisabled: false,
        logLevel: 'error',
        waitForUI5Timeout: 30000,
        btpWorkZoneEnablement: false
      }
    ]
  ],
  
  //
  // ==============
  // Test Framework
  // ==============
  framework: 'mocha',
  reporters: ['spec'],
  
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  }
}
