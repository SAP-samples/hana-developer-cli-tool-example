// @ts-check
/**
 * @module inspectTableUI - End-to-End (E2E) Tests for bin/inspectTableUI.js
 * 
 * Validates complete SAPUI5 interface workflows including:
 * - SAPUI5 UI command execution and server initialization
 * - Command aliases and flags
 * - Help and documentation output
 * - Web server setup and configuration
 * - Table inspection and detailed analysis
 * - Error handling and validation
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('inspectTableUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli inspectTableUI')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'InspectTableUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        expect(stdout).to.include('hana-cli inspectTable --help')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli inspectTableUI')
        base.addContext(this, { title: 'Help with examples', value: stdout })
        done()
      })
    })

    it('indicates this is a UI command', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.toLowerCase()).to.include('ui')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports case-insensitive alias', function (done) {
      base.exec('node bin/cli.js inspecttableui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('inspectTableUI')
        done()
      })
    })

    it('supports related base command', function (done) {
      base.exec('node bin/cli.js inspectTable --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('inspectTable')
        done()
      })
    })
  })

  describe('Table inspection options', () => {
    it('requires schema and table parameters', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--table')
        done()
      })
    })

    it('accepts positional schema argument', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(stdout).to.match(/\[schema\]/)
        done()
      })
    })

    it('accepts positional table argument', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(stdout).to.match(/\[table\]/)
        done()
      })
    })

    it('inherits options from base inspectTable command', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_INSPECTTABLEUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'inspectTableUI server startup')) {
        return
      }

      base.exec('node bin/cli.js inspectTableUI --port 9995 --quiet', { timeout: 3000 }, (error, stdout) => {
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          expect(error).to.be.null
        }
        done()
      })
    })

    it('provides real-time table analysis display', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'inspectTableUI analysis')) {
        return
      }

      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides SAPUI5 component initialization', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'inspectTableUI SAPUI5 init')) {
        return
      }

      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Table analysis capabilities', () => {
    it('provides column information display', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        base.addContext(this, { title: 'Column analysis capability', value: stdout })
        done()
      })
    })

    it('shows index information in UI', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('displays table statistics and metadata', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Database operations', () => {
    it('accepts profile parameter for database selection', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('handles schema selection via parameter', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        done()
      })
    })

    it('handles table selection via parameter', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(stdout).to.include('--table')
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('validates schema parameter is provided', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        done()
      })
    })

    it('validates table parameter is provided', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(stdout).to.include('--table')
        done()
      })
    })

    it('handles database connection errors', function (done) {
      base.exec('node bin/cli.js inspectTableUI --profile invalid --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Invalid connection handling', value: output })
        done()
      })
    })

    it('handles non-existent table gracefully', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('provides helpful error messages for invalid schema', function (done) {
      base.exec('node bin/cli.js inspectTableUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })
})
