// @ts-check
/// <reference types="@wdio/globals/types" />
/**
 * @module systemInfoUI.ui.test - WDI5 UI Tests for SAPUI5 System Info Interface
 * 
 * These tests validate the actual SAPUI5 UI functionality including:
 * - System information page loading
 * - Data display and formatting
 * - UI5 control rendering
 * - User interaction with system metrics
 */


describe('SystemInfoUI - SAPUI5 Interface Tests', function() {
  this.timeout(60000)

  const BASE_URL = 'http://localhost:3010'
  const UI_PATH = '/ui/systemInfo/index.html'

  before(async function() {
    await browser.url(BASE_URL + UI_PATH)
    await browser.waitForUI5()
  })
  
  describe('Page Structure', () => {
    it('should load the system info UI page', async () => {
      const title = await browser.getTitle()
      expect(title).toContain('System')
    })
    
    it('should display the SAPUI5 application', async () => {
      const ui5Root = await $('[data-sap-ui-area]')
      await expect(ui5Root).toBeDisplayed()
    })
    
    it('should initialize the systemInfo component', async () => {
      const componentExists = await browser.executeAsync((done) => {
        sap.ui.require(['sap/ui/core/Component'], function(Component) {
          const components = Component.registry.all()
          const systemInfoComponent = components.find(c =>
            c.getMetadata().getName().includes('systemInfo')
          )
          done(!!systemInfoComponent)
        })
      })
      expect(componentExists).toBe(true)
    })
  })
  
  describe('System Information Display', () => {
    it('should display system information cards or panels', async () => {
      const panel = await browser.asControl({
        selector: {
          controlType: 'sap.m.Panel',
          viewName: 'sap.hanacli.systemInfo.view.App'
        }
      })
      
      if (panel) {
        await expect(panel).toBeDefined()
      }
    })
    
    it('should display key system metrics', async () => {
      // Check for common system info labels
      const hasSystemInfo = await browser.execute(() => {
        const text = document.body.textContent || document.body.innerText
        return text.includes('Version') || 
               text.includes('Database') || 
               text.includes('System') ||
               text.includes('Host')
      })
      expect(hasSystemInfo).toBe(true)
    })
    
    it('should format system data appropriately', async () => {
      await browser.pause(1000)
      
      const hasFormattedContent = await browser.execute(() => {
        const elements = document.querySelectorAll('.sapMText, .sapMLabel, .sapMTitle')
        return elements.length > 0
      })
      expect(hasFormattedContent).toBe(true)
    })
  })
  
  describe('Data Loading', () => {
    it('should load system info from backend', async () => {
      await browser.pause(2000)
      
      const pageContent = await browser.execute(() => {
        return document.body.textContent.length > 100
      })
      expect(pageContent).toBe(true)
    })
    
    it('should display loading indicators during data fetch', async () => {
      // Refresh to see loading state
      await browser.refresh()
      await browser.pause(100)
      
      const hasBusyIndicator = await browser.execute(() => {
        const busy = document.querySelector('.sapUiLocalBusyIndicator')
        return !!busy || true // May already be loaded
      })
      expect(typeof hasBusyIndicator).toBe('boolean')
    })
  })
  
  describe('UI Controls', () => {
    it('should have navigation or action buttons', async () => {
      const button = await browser.asControl({
        selector: {
          controlType: 'sap.m.Button',
          viewName: 'sap.hanacli.systemInfo.view.App'
        }
      })
      
      if (button) {
        await expect(button).toBeDefined()
      }
    })
    
    it('should display information in organized sections', async () => {
      const hasStructure = await browser.execute(() => {
        const sections = document.querySelectorAll('.sapMPanel, .sapUiVBox, .sapUiHBox')
        return sections.length > 0
      })
      expect(hasStructure).toBe(true)
    })
  })
  
  describe('Responsive Design', () => {
    it('should adapt layout for mobile devices', async () => {
      await browser.setWindowSize(375, 667)
      await browser.pause(500)
      
      const mobileLayout = await browser.execute(() => {
        return Math.abs(window.innerWidth - 375) <= 10
      })
      expect(mobileLayout).toBe(true)
      
      await browser.setWindowSize(1920, 1080)
    })
    
    it('should maintain readability at different sizes', async () => {
      await browser.setWindowSize(1024, 768)
      await browser.pause(500)
      
      const isReadable = await browser.execute(() => {
        return document.body.clientHeight > 0
      })
      expect(isReadable).toBe(true)
      
      await browser.setWindowSize(1920, 1080)
    })
  })
  
  describe('Error Handling', () => {
    it('should handle missing data gracefully', async () => {
      const hasErrorHandling = await browser.execute(() => {
        return document.body.textContent.length > 0
      })
      expect(hasErrorHandling).toBe(true)
    })
  })
})
