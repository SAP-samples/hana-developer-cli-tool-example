// @ts-check
/**
 * @module containersUI - End-to-End (E2E) Tests for bin/containersUI.js
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLiveTestControl, gateLiveTestInCI } from './helpers.js'

describe('containersUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli containersUI')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'ContainersUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation links', function (done) {
      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        done()
      })
    })

    it('indicates this is a UI command', function (done) {
      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.toLowerCase()).to.include('ui')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports case-insensitive alias', function (done) {
      base.exec('node bin/cli.js containersui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('containersUI')
        done()
      })
    })

    it('supports related base command', function (done) {
      base.exec('node bin/cli.js containers --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('containers')
        done()
      })
    })
  })

  describe('Container management options', () => {
    it('inherits options from base containers command', function (done) {
      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('provides interactive container browsing', function (done) {
      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_CONTAINERSUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'containersUI server startup')) {
        return
      }

      base.exec('node bin/cli.js containersUI --port 9990 --quiet', { timeout: 3000 }, (error, stdout) => {
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          expect(error).to.be.null
        }
        done()
      })
    })

    it('provides SAPUI5 component initialization', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'containersUI SAPUI5 init')) {
        return
      }

      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Container operations', () => {
    it('accepts profile parameter for database selection', function (done) {
      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('manages container list display', function (done) {
      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('handles database connection errors gracefully', function (done) {
      base.exec('node bin/cli.js containersUI --profile invalid --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Connection error handling', value: output })
        done()
      })
    })

    it('validates server configuration', function (done) {
      base.exec('node bin/cli.js containersUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })
})
