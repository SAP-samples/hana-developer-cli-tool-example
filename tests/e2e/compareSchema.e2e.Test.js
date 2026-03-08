// @ts-check
/**
 * @module compareSchema - End-to-End (E2E) Tests for bin/compareSchema.js
 * 
 * Validates complete command workflows including:
 * - Basic execution and output format
 * - Command flags and options
 * - Help and documentation
 * - Error handling
 * - Alias support
 */

import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('compareSchema command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js compareSchema --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli compareSchema')
        expect(stdout).to.include('--sourceSchema')
        expect(stdout).to.include('--targetSchema')
        expect(stdout).to.include('--tables')
        expect(stdout).to.include('--compareIndexes')
        expect(stdout).to.include('--compareTriggers')
        expect(stdout).to.include('--compareConstraints')
        expect(stdout).to.include('--output')
        expect(stdout).to.include('--timeout')
        base.addContext(this, { title: 'Compare Schema Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js compareSchema --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/data-tools\/compare-schema/i)
        expect(stdout).to.include('hana-cli compareData --help')
        expect(stdout).to.include('hana-cli schemaClone --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "cmpschema"', function (done) {
      base.exec('node bin/cli.js cmpschema --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli compareSchema')
        done()
      })
    })

    it('supports alias "schemaCompare"', function (done) {
      base.exec('node bin/cli.js schemaCompare --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli compareSchema')
        done()
      })
    })

    it('supports alias "compareschema"', function (done) {
      base.exec('node bin/cli.js compareschema --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli compareSchema')
        done()
      })
    })
  })

  describe('Live validation (optional)', () => {
    it('compares SYS schema with itself', function (done) {
      this.timeout(60000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_COMPARESCHEMA')
      if (!gateLiveTestInCI(this, done, liveControl, 'compareSchema live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live compareSchema E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = `node bin/cli.js compareSchema --sourceSchema SYS --targetSchema SYS --tables DUMMY --quiet`

        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Live compareSchema output', value: output })

          expect(error).to.be.null
          expect(output).to.match(/Schema comparison/i)
          done()
        })
      }).catch(done)
    })
  })
})
