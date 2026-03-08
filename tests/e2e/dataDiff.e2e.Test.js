// @ts-check
/**
 * @module dataDiff - End-to-End (E2E) Tests for bin/dataDiff.js
 * 
 * Validates complete command workflows including:
 * - Basic execution and output format
 * - Command flags and options
 * - Help and documentation
 * - Error handling
 * - Alias support
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('dataDiff command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js dataDiff --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataDiff')
        expect(stdout).to.include('--table1')
        expect(stdout).to.include('--table2')
        expect(stdout).to.include('--schema1')
        expect(stdout).to.include('--schema2')
        expect(stdout).to.include('--keyColumns')
        expect(stdout).to.include('--compareColumns')
        expect(stdout).to.include('--format')
        expect(stdout).to.include('choices: "json", "csv", "summary"')
        expect(stdout).to.include('--limit')
        expect(stdout).to.include('--showValues')
        expect(stdout).to.include('--dryRun')
        base.addContext(this, { title: 'Data Diff Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js dataDiff --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/data-tools\/data-diff/i)
        expect(stdout).to.include('hana-cli compareData --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "ddiff"', function (done) {
      base.exec('node bin/cli.js ddiff --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataDiff')
        done()
      })
    })

    it('supports alias "diffData"', function (done) {
      base.exec('node bin/cli.js diffData --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataDiff')
        done()
      })
    })

    it('supports alias "dataCompare"', function (done) {
      base.exec('node bin/cli.js dataCompare --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataDiff')
        done()
      })
    })
  })

  describe('Validation', () => {
    it('rejects unsupported format values', function (done) {
      base.exec('node bin/cli.js dataDiff --table1 T1 --table2 T2 --format xml --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output).to.include('Invalid values:')
        expect(output).to.include('Argument: format')
        expect(output).to.include('Choices: "json", "csv", "summary"')
        base.addContext(this, { title: 'Invalid format output', value: output })
        done()
      })
    })
  })

  describe('Live validation (optional)', () => {
    it('compares data between SYS.DUMMY and itself with dry-run', function (done) {
      // Skip by default - these commands may require additional prompts
      this.skip()
      return done()
      
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_DATADIFF')
      if (!gateLiveTestInCI(this, done, liveControl, 'dataDiff live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live dataDiff E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = `node bin/cli.js dataDiff --schema1 SYS --table1 DUMMY --schema2 SYS --table2 DUMMY --dryRun --format summary --quiet`

        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Live dataDiff output', value: output })

          expect(error).to.be.null
          expect(output).to.match(/Data comparison complete/i)
          done()
        })
      }).catch(done)
    })
  })
})
