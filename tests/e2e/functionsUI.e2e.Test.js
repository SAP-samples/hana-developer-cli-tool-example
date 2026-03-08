// @ts-check
/**
 * @module functionsUI - End-to-End (E2E) Tests for bin/functionsUI.js
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLiveTestControl, gateLiveTestInCI } from './helpers.js'

describe('functionsUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js functionsUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli functionsUI')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'FunctionsUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation links', function (done) {
      base.exec('node bin/cli.js functionsUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js functionsUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        done()
      })
    })

    it('indicates this is a UI command', function (done) {
      base.exec('node bin/cli.js functionsUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.toLowerCase()).to.include('ui')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports case-insensitive alias', function (done) {
      base.exec('node bin/cli.js functionsui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('functionsUI')
        done()
      })
    })

    it('supports related base command', function (done) {
      base.exec('node bin/cli.js functions --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('functions')
        done()
      })
    })
  })

  describe('Function browsing options', () => {
    it('inherits options from base functions command', function (done) {
      base.exec('node bin/cli.js functionsUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('supports schema filtering', function (done) {
      base.exec('node bin/cli.js functionsUI --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_FUNCTIONSUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'functionsUI server startup')) {
        return
      }

      base.exec('node bin/cli.js functionsUI --port 9992 --quiet', { timeout: 3000 }, (error, stdout) => {
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          expect(error).to.be.null
        }
        done()
      })
    })
  })

  describe('Database operations', () => {
    it('accepts profile parameter for database selection', function (done) {
      base.exec('node bin/cli.js functionsUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('handles schema filtering for functions', function (done) {
      base.exec('node bin/cli.js functionsUI --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('handles database connection errors gracefully', function (done) {
      base.exec('node bin/cli.js functionsUI --profile invalid --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Connection error handling', value: output })
        done()
      })
    })
  })
})
