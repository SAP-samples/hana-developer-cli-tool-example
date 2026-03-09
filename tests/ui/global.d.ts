/**
 * Global type definitions for WebdriverIO and WDI5
 * 
 * These globals are injected by @wdio/globals at runtime and are available
 * in all test files without explicit imports.
 */

/// <reference types="webdriverio/async" />
/// <reference types="@wdio/globals/types" />

declare global {
  const browser: WebdriverIO.Browser
  const driver: WebdriverIO.Browser
  const $: WebdriverIO.Browser['$']
  const $$: WebdriverIO.Browser['$$']
  const expect: typeof import('@wdio/globals').expect

  /**
   * SAPUI5 global namespace available in the browser context
   */
  interface Window {
    sap: {
      ui: {
        getCore(): any
        require(modules: string[], callback: (...args: any[]) => void): void
      }
    }
  }

  /**
   * Extended wdi5 control selector with WDI5-specific properties
   * @see https://ui5-community.github.io/wdi5/
   */
  namespace WebdriverIO {
    interface Browser {
      asControl(selector: {
        selector?: {
          id?: string
          viewName?: string
          controlType?: string
          bindingPath?: object
          properties?: object
          aggregationName?: string
          labelFor?: string
          searchOpenDialogs?: boolean
          [key: string]: any
        }
        [key: string]: any
      }): Promise<any>
    }
  }
}

export {}
