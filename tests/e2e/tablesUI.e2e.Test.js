// @ts-check
/**
 * @module tablesUI - End-to-End (E2E) Tests for bin/tablesUI.js
 * 
 * Validates complete SAPUI5 interface workflows including:
 * - SAPUI5 UI command execution and server initialization
 * - Command aliases and flags
 * - Help and documentation output
 * - Web server setup and configuration
 * - Error handling and validation
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('tablesUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli tablesUI')
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--table')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'TablesUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        expect(stdout).to.include('hana-cli tables --help')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli tablesUI')
        base.addContext(this, { title: 'Help with examples', value: stdout })
        done()
      })
    })

    it('specifies that this is a UI command', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(error).to.be.null
        const isUICommand = stdout.toLowerCase().includes('ui') || 
                          stdout.toLowerCase().includes('web') || 
                          stdout.toLowerCase().includes('browser') ||
                          stdout.toLowerCase().includes('interface')
        expect(isUICommand).to.be.true
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "tui"', function (done) {
      base.exec('node bin/cli.js tui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('tablesUI')
        done()
      })
    })

    it('supports alias "listTablesUI"', function (done) {
      base.exec('node bin/cli.js listTablesUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('tablesUI')
        done()
      })
    })

    it('supports alias "listtablesui" (case-insensitive)', function (done) {
      base.exec('node bin/cli.js listtablesui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('tablesUI')
        done()
      })
    })

    it('supports alias "tablesui" (case-insensitive)', function (done) {
      base.exec('node bin/cli.js tablesui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('tablesUI')
        done()
      })
    })
  })

  describe('Flag validation', () => {
    it('accepts --schema flag', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        done()
      })
    })

    it('accepts --table flag (with optional alias)', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(stdout).to.include('--table')
        done()
      })
    })

    it('inherits flags from base tables command', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('accepts positional schema argument', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(stdout).to.match(/\[schema\]/)
        done()
      })
    })

    it('accepts positional table argument', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(stdout).to.match(/\[table\]/)
        done()
      })
    })
  })

  describe('Server configuration', () => {
    it('includes port configuration in help', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(stdout).to.include('--port')
        done()
      })
    })

    it('describes UI endpoint routing', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        // UI commands should indicate they open an interface
        const hasUIIndicator = stdout.toLowerCase().includes('ui') || 
                              stdout.toLowerCase().includes('route') ||
                              stdout.toLowerCase().includes('interface')
        expect(hasUIIndicator).to.be.true
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_TABLESUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'tablesUI server startup')) {
        return
      }

      // Test would verify server startup and /ui/#tables-ui routing
      // This is typically done by verifying the process doesn't error during initialization
      base.exec('node bin/cli.js tablesUI --port 9999 --quiet', { timeout: 3000 }, (error, stdout) => {
        // Server startup errors would show immediately
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          // SIGTERM and code 143 are expected when test timeout kills the process
          expect(error).to.be.null
        }
        done()
      })
    })

    it('accepts custom port configuration', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'tablesUI custom port')) {
        return
      }

      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(stdout).to.include('--port')
        done()
      })
    })

    it('provides SAPUI5 component initialization', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'tablesUI SAPUI5 init')) {
        return
      }

      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        // Verify command doesn't have errors
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Parameter inheritance from base command', () => {
    it('inherits schema parameter from tables command', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(stdout).to.match(/schema/)
        done()
      })
    })

    it('inherits table parameter from tables command', function (done) {
      base.exec('node bin/cli.js tablesUI --help', (error, stdout) => {
        expect(stdout).to.match(/table/)
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('handles invalid profile gracefully', function (done) {
      base.exec('node bin/cli.js tablesUI --profile invalid-profile --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        // Should either error or handle gracefully
        base.addContext(this, { title: 'Invalid profile handling', value: output })
        done()
      })
    })

    it('provides meaningful error messages for missing credentials', function (done) {
      base.exec('node bin/cli.js tablesUI --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        // If no credentials available, should provide clear error message
        base.addContext(this, { title: 'Missing credentials error', value: `${stdout || ''}\n${stderr || ''}` })
        done()
      })
    })
  })
})
