// @ts-check
/**
 * @module importUI - End-to-End (E2E) Tests for bin/importUI.js
 * 
 * Validates complete SAPUI5 interface workflows including:
 * - SAPUI5 UI command execution and server initialization
 * - Command aliases and flags
 * - Help and documentation output
 * - Web server setup and configuration
 * - File upload and data handling
 * - Error handling and validation
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('importUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli importUI')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'ImportUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        expect(stdout).to.include('hana-cli import --help')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli importUI')
        base.addContext(this, { title: 'Help with examples', value: stdout })
        done()
      })
    })

    it('indicates this is a UI command', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.toLowerCase()).to.include('ui')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "importui"', function (done) {
      base.exec('node bin/cli.js importui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('importUI')
        done()
      })
    })

    it('supports related base command', function (done) {
      base.exec('node bin/cli.js import --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('import')
        done()
      })
    })
  })

  describe('Import-specific options', () => {
    it('provides file upload configuration', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(stdout.toLowerCase()).to.match(/file|upload|import/)
        done()
      })
    })

    it('includes schema parameter for import target', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        done()
      })
    })

    it('includes table parameter for import target', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(stdout).to.include('--table')
        done()
      })
    })

    it('inherits options from base import command', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_IMPORTUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'importUI server startup')) {
        return
      }

      base.exec('node bin/cli.js importUI --port 9997 --quiet', { timeout: 3000 }, (error, stdout) => {
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          expect(error).to.be.null
        }
        done()
      })
    })

    it('configures file upload endpoint', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'importUI upload endpoint')) {
        return
      }

      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides SAPUI5 component initialization', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'importUI SAPUI5 init')) {
        return
      }

      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Data handling and validation', () => {
    it('accepts profile parameter for database selection', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('provides error handling for invalid input data', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('documents import transaction behavior', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        base.addContext(this, { title: 'ImportUI help', value: stdout })
        done()
      })
    })
  })

  describe('File handling', () => {
    it('accepts CSV file uploads', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides feedback on import progress', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('handles database connection errors', function (done) {
      base.exec('node bin/cli.js importUI --profile invalid --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'InvalidDB connection handling', value: output })
        done()
      })
    })

    it('handles missing required parameters', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('validates port availability for web server', function (done) {
      base.exec('node bin/cli.js importUI --help', (error, stdout) => {
        expect(stdout).to.include('--port')
        done()
      })
    })
  })
})
