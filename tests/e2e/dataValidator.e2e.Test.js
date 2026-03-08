// @ts-check
import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'


describe('dataValidator command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js dataValidator --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataValidator')
        expect(stdout).to.include('--table')
        expect(stdout).to.include('--rules')
        expect(stdout).to.include('--rulesFile')
        expect(stdout).to.include('--format')
        expect(stdout).to.include('choices: "json", "csv", "summary", "detailed"')
        base.addContext(this, { title: 'Data Validator Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js dataValidator --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/data-tools\/data-validator/i)
        expect(stdout).to.include('hana-cli import --help')
        expect(stdout).to.include('hana-cli dataProfile --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "dval"', function (done) {
      base.exec('node bin/cli.js dval --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataValidator')
        done()
      })
    })

    it('supports alias "validateData"', function (done) {
      base.exec('node bin/cli.js validateData --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataValidator')
        done()
      })
    })
  })

  describe('Validation', () => {
    it('rejects unsupported format values', function (done) {
      base.exec('node bin/cli.js dataValidator --table DUMMY --format xml --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output).to.include('Invalid values:')
        expect(output).to.include('Argument: format')
        expect(output).to.include('Choices: "json", "csv", "summary", "detailed"')
        base.addContext(this, { title: 'Invalid format output', value: output })
        done()
      })
    })
  })

  describe('Live validation (optional)', () => {
    it('validates one row from SYS.DUMMY using default rules', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_DATAVALIDATOR')
      if (!gateLiveTestInCI(this, done, liveControl, 'dataValidator live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live dataValidator E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = `node bin/cli.js dataValidator --schema SYS --table DUMMY --limit 1 --format json --quiet`

        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Live dataValidator output', value: output })

          expect(error).to.be.null
          expect(output).to.match(/Starting data validation for table:\s*DUMMY/i)
          expect(output).to.match(/"totalRows"\s*:\s*1/i)
          expect(output).to.match(/Data validation complete\.\s+Total rows:\s*1/i)
          done()
        })
      }).catch(done)
    })
  })
})
