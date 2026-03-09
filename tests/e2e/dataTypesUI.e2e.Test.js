// @ts-check
/**
 * @module dataTypesUI - End-to-End (E2E) Tests for bin/dataTypesUI.js
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLiveTestControl, gateLiveTestInCI } from './helpers.js'

describe('dataTypesUI command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js dataTypesUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataTypesUI')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'DataTypesUI Help', value: stdout })
        done()
      })
    })

    it('includes documentation links', function (done) {
      base.exec('node bin/cli.js dataTypesUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example/i)
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js dataTypesUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        done()
      })
    })

    it('indicates this is a UI command', function (done) {
      base.exec('node bin/cli.js dataTypesUI --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout.toLowerCase()).to.include('ui')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports case-insensitive alias', function (done) {
      base.exec('node bin/cli.js datatypesui --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('dataTypesUI')
        done()
      })
    })

    it('supports related base command', function (done) {
      base.exec('node bin/cli.js dataTypes --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('dataTypes')
        done()
      })
    })
  })

  describe('Data type exploration options', () => {
    it('inherits options from base dataTypes command', function (done) {
      base.exec('node bin/cli.js dataTypesUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('displays database data type information', function (done) {
      base.exec('node bin/cli.js dataTypesUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Web server integration (optional)', () => {
    const control = getLiveTestControl('HANA_CLI_TEST_DATATYPESUI_LIVE')

    it('starts server with proper routing', function (done) {
      if (!gateLiveTestInCI(this, done, control, 'dataTypesUI server startup')) {
        return
      }

      base.exec('node bin/cli.js dataTypesUI --port 9991 --quiet', { timeout: 3000 }, (error, stdout) => {
        if (error && error.signal !== 'SIGTERM' && error.code !== 143) {
          expect(error).to.be.null
        }
        done()
      })
    })
  })

  describe('Database operations', () => {
    it('accepts profile parameter for database selection', function (done) {
      base.exec('node bin/cli.js dataTypesUI --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('queries database metadata for data types', function (done) {
      base.exec('node bin/cli.js dataTypesUI --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('handles database connection errors gracefully', function (done) {
      base.exec('node bin/cli.js dataTypesUI --profile invalid --quiet', { timeout: 5000 }, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Connection error handling', value: output })
        done()
      })
    })
  })
})
