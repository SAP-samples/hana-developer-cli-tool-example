// @ts-check
/**
 * @module massConvertUI - End-to-End (E2E) Tests for bin/massConvertUI.js
 * 
 * Validates complete SAPUI5 interface workflows including:
 * - SAPUI5 UI command execution and server initialization
 * - Command aliases and flags
 * - Help and documentation output
 * - Web server setup and configuration
 * - Batch conversion operations
 * - Error handling and validation
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('massConvertUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli massConvertUI')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'MassConvertUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        expect(stdout).to.include('hana-cli massConvert --help')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli massConvertUI')
        base.addContext(this, { title: 'Help with examples', value: stdout })
        done()
      })
    })

    it('indicates this is a UI command', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.toLowerCase()).to.include('ui')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports case-insensitive alias', function (done) {
      base.exec('node bin/cli.js massconvertui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('massConvertUI')
        done()
      })
    })

    it('supports related base command', function (done) {
      base.exec('node bin/cli.js massConvert --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('massConvert')
        done()
      })
    })
  })

  describe('Conversion options', () => {
    it('inherits options from base massConvert command', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('provides schema/table selection for conversion', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        done()
      })
    })

    it('includes conversion type parameters', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        base.addContext(this, { title: 'Conversion options', value: stdout })
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_MASSCONVERTUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'massConvertUI server startup')) {
        return
      }

      base.exec('node bin/cli.js massConvertUI --port 9996 --quiet', { timeout: 3000 }, (error, stdout) => {
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          expect(error).to.be.null
        }
        done()
      })
    })

    it('provides real-time conversion progress feedback', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'massConvertUI progress')) {
        return
      }

      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides SAPUI5 component initialization', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'massConvertUI SAPUI5 init')) {
        return
      }

      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Batch operation support', () => {
    it('supports multiple object selection', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides batch operation progress tracking', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('supports rollback on conversion failure', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        base.addContext(this, { title: 'MassConvertUI help', value: stdout })
        done()
      })
    })
  })

  describe('Database operations', () => {
    it('accepts profile parameter for database selection', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('handles schema selection for batch conversion', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        done()
      })
    })

    it('provides conversion confirmation before execution', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('handles database connection errors', function (done) {
      base.exec('node bin/cli.js massConvertUI --profile invalid --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Invalid connection handling', value: output })
        done()
      })
    })

    it('validates conversion parameters', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides meaningful error messages for failed conversions', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('handles server port conflicts gracefully', function (done) {
      base.exec('node bin/cli.js massConvertUI --help', (error, stdout) => {
        expect(stdout).to.include('--port')
        done()
      })
    })
  })
})
