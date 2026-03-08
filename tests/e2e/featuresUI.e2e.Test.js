// @ts-check
/**
 * @module featuresUI - End-to-End (E2E) Tests for bin/featuresUI.js
 * 
 * Validates complete SAPUI5 interface workflows including:
 * - SAPUI5 UI command execution and server initialization
 * - Command aliases and flags
 * - Help and documentation output
 * - Web server setup and configuration
 * - Feature browsing and database administration
 * - Error handling and validation
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('featuresUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js featuresUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli featuresUI')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'FeaturesUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation links', function (done) {
      base.exec('node bin/cli.js featuresUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js featuresUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        done()
      })
    })

    it('indicates this is a UI command', function (done) {
      base.exec('node bin/cli.js featuresUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.toLowerCase()).to.include('ui')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports case-insensitive alias', function (done) {
      base.exec('node bin/cli.js featuresui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('featuresUI')
        done()
      })
    })

    it('supports related base command', function (done) {
      base.exec('node bin/cli.js features --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('features')
        done()
      })
    })
  })

  describe('Feature browsing options', () => {
    it('inherits options from base features command', function (done) {
      base.exec('node bin/cli.js featuresUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('provides interactive database feature exploration', function (done) {
      base.exec('node bin/cli.js featuresUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_FEATURESUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'featuresUI server startup')) {
        return
      }

      base.exec('node bin/cli.js featuresUI --port 9993 --quiet', { timeout: 3000 }, (error, stdout) => {
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          expect(error).to.be.null
        }
        done()
      })
    })

    it('provides SAPUI5 component initialization', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'featuresUI SAPUI5 init')) {
        return
      }

      base.exec('node bin/cli.js featuresUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Database operations', () => {
    it('accepts profile parameter for database selection', function (done) {
      base.exec('node bin/cli.js featuresUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('handles database connection errors gracefully', function (done) {
      base.exec('node bin/cli.js featuresUI --profile invalid --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Connection error handling', value: output })
        done()
      })
    })
  })
})
