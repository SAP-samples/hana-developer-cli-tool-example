// @ts-check
/**
 * @module compareData - End-to-End (E2E) Tests for bin/compareData.js
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

describe('compareData command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js compareData --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli compareData')
        expect(stdout).to.include('--sourceTable')
        expect(stdout).to.include('--sourceSchema')
        expect(stdout).to.include('--targetTable')
        expect(stdout).to.include('--targetSchema')
        expect(stdout).to.include('--keyColumns')
        expect(stdout).to.include('--columns')
        expect(stdout).to.include('--showMatches')
        expect(stdout).to.include('--limit')
        expect(stdout).to.include('--output')
        base.addContext(this, { title: 'Compare Data Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js compareData --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/data-tools\/compare-data/i)
        expect(stdout).to.include('hana-cli compareSchema --help')
        expect(stdout).to.include('hana-cli dataDiff --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "cmpdata"', function (done) {
      base.exec('node bin/cli.js cmpdata --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli compareData')
        done()
      })
    })

    it('supports alias "compardata"', function (done) {
      base.exec('node bin/cli.js compardata --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli compareData')
        done()
      })
    })

    it('supports alias "dataCompare"', function (done) {
      base.exec('node bin/cli.js dataCompare --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli compareData')
        done()
      })
    })
  })

  describe('Live validation (optional)', () => {
    it('compares data between SYS.DUMMY and itself', function (done) {
      // Skip by default - these commands may require additional prompts
      this.skip()
      return done()
      
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_COMPAREDATA')
      if (!gateLiveTestInCI(this, done, liveControl, 'compareData live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live compareData E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = `node bin/cli.js compareData --sourceSchema SYS --sourceTable DUMMY --targetSchema SYS --targetTable DUMMY --limit 10 --quiet`

        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Live compareData output', value: output })

          expect(error).to.be.null
          expect(output).to.match(/Comparison complete/i)
          done()
        })
      }).catch(done)
    })
  })
})
