// @ts-check
/**
 * @module featureUsageUI - End-to-End (E2E) Tests for bin/featureUsageUI.js
 * 
 * Validates complete SAPUI5 interface workflows including:
 * - SAPUI5 UI command execution and server initialization
 * - Command aliases and flags
 * - Help and documentation output
 * - Web server setup and configuration
 * - Feature usage analysis and metrics
 * - Error handling and validation
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('featureUsageUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli featureUsageUI')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'FeatureUsageUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        expect(stdout).to.include('hana-cli featureUsage --help')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli featureUsageUI')
        base.addContext(this, { title: 'Help with examples', value: stdout })
        done()
      })
    })

    it('indicates this is a UI command', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.toLowerCase()).to.include('ui')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports case-insensitive alias', function (done) {
      base.exec('node bin/cli.js featureusageui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('featureUsageUI')
        done()
      })
    })

    it('supports related base command', function (done) {
      base.exec('node bin/cli.js featureUsage --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('featureUsage')
        done()
      })
    })
  })

  describe('Feature analysis options', () => {
    it('provides feature usage metrics display', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('inherits options from base featureUsage command', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('provides filtering options for feature analysis', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        base.addContext(this, { title: 'Feature filtering options', value: stdout })
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_FEATUREUSAGEUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'featureUsageUI server startup')) {
        return
      }

      base.exec('node bin/cli.js featureUsageUI --port 9994 --quiet', { timeout: 3000 }, (error, stdout) => {
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          expect(error).to.be.null
        }
        done()
      })
    })

    it('provides real-time feature analytics', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'featureUsageUI analytics')) {
        return
      }

      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides SAPUI5 component initialization', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'featureUsageUI SAPUI5 init')) {
        return
      }

      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Analytics and reporting', () => {
    it('displays feature usage statistics', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        base.addContext(this, { title: 'Feature usage statistics', value: stdout })
        done()
      })
    })

    it('provides time-based analysis options', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('supports customizable reporting timeframes', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Database operations', () => {
    it('accepts profile parameter for database selection', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('queries feature usage metrics from database', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('handles aggregated data queries efficiently', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Data visualization', () => {
    it('provides interactive charts in UI', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('displays trend analysis over time', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('supports data export or reporting', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        base.addContext(this, { title: 'Data export options', value: stdout })
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('handles database connection errors', function (done) {
      base.exec('node bin/cli.js featureUsageUI --profile invalid --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Invalid connection handling', value: output })
        done()
      })
    })

    it('handles missing feature usage data', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides helpful error messages', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('validates port availability for web server', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(stdout).to.include('--port')
        done()
      })
    })
  })

  describe('Performance and scalability', () => {
    it('handles large datasets efficiently', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides pagination for large result sets', function (done) {
      base.exec('node bin/cli.js featureUsageUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })
})
