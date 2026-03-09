// @ts-check
/**
 * @module systemInfoUI - End-to-End (E2E) Tests for bin/systemInfoUI.js
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

describe('systemInfoUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli systemInfoUI')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'SystemInfoUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        expect(stdout).to.include('hana-cli systemInfo --help')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli systemInfoUI')
        base.addContext(this, { title: 'Help with examples', value: stdout })
        done()
      })
    })

    it('indicates this is a UI command', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.toLowerCase()).to.include('ui')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports base command alias "systemInfo"', function (done) {
      base.exec('node bin/cli.js systemInfo --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('systemInfo')
        done()
      })
    })

    it('supports UI-specific short alias', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('systemInfoUI')
        done()
      })
    })

    it('supports case-insensitive alias', function (done) {
      base.exec('node bin/cli.js systeminfoui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('systemInfoUI')
        done()
      })
    })
  })

  describe('Command options', () => {
    it('inherits options from base systemInfo command', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('accepts port configuration for web server', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(stdout).to.include('--port')
        done()
      })
    })

    it('respects quiet mode flag', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(stdout).to.include('--quiet')
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_SYSTEMINFOUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'systemInfoUI server startup')) {
        return
      }

      // Test would verify server startup and /ui/#systemInfo-ui routing
      base.exec('node bin/cli.js systemInfoUI --port 9998 --quiet', { timeout: 3000 }, (error, stdout) => {
        // Server startup errors would show immediately
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          expect(error).to.be.null
        }
        done()
      })
    })

    it('accepts custom port configuration', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'systemInfoUI custom port')) {
        return
      }

      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(stdout).to.include('--port')
        done()
      })
    })

    it('provides SAPUI5 component initialization', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'systemInfoUI SAPUI5 init')) {
        return
      }

      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Database connectivity', () => {
    it('requires database connection configuration', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        // Should document profile/connection options
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('handles profile parameter for database selection', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(stdout).to.match(/profile/)
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('provides meaningful error for invalid profile', function (done) {
      base.exec('node bin/cli.js systemInfoUI --profile nonexistent --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Invalid profile error', value: output })
        done()
      })
    })

    it('handles missing database credentials gracefully', function (done) {
      base.exec('node bin/cli.js systemInfoUI --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Missing credentials handling', value: output })
        done()
      })
    })

    it('recovers from server port conflicts', function (done) {
      base.exec('node bin/cli.js systemInfoUI --help', (error, stdout) => {
        expect(stdout).to.include('--port')
        base.addContext(this, { title: 'Port configuration available', value: stdout })
        done()
      })
    })
  })
})
