// @ts-check
import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'


describe('dataProfile command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js dataProfile --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataProfile')
        expect(stdout).to.include('--table')
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--columns')
        expect(stdout).to.include('--format')
        expect(stdout).to.include('choices: "json", "csv", "summary"')
        base.addContext(this, { title: 'Data Profile Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js dataProfile --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/data-tools\/data-profile/i)
        expect(stdout).to.include('hana-cli dataValidator --help')
        expect(stdout).to.include('hana-cli duplicateDetection --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "prof"', function (done) {
      base.exec('node bin/cli.js prof --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataProfile')
        done()
      })
    })

    it('supports alias "profileData"', function (done) {
      base.exec('node bin/cli.js profileData --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataProfile')
        done()
      })
    })

    it('supports alias "dataStats"', function (done) {
      base.exec('node bin/cli.js dataStats --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dataProfile')
        done()
      })
    })
  })

  describe('Validation', () => {
    it('rejects unsupported format values', function (done) {
      base.exec('node bin/cli.js dataProfile --table DUMMY --format xml --quiet', (error, stdout, stderr) => {
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

  describe('Live profiling (optional)', () => {
    it('returns metrics output for SYS.DUMMY in summary format', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_DATAPROFILE')
      if (!gateLiveTestInCI(this, done, liveControl, 'dataProfile live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live dataProfile E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = 'node bin/cli.js dataProfile --schema SYS --table DUMMY --format summary --quiet'

        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Live dataProfile output', value: output })

          expect(error).to.be.null
          expect(output).to.match(/Starting data profile analysis for table:\s*DUMMY/i)
          expect(output).to.match(/Table Data Profile/i)
          expect(output).to.match(/Rows:\s*\d+/i)
          expect(output).to.match(/Columns:\s*\d+/i)
          expect(output).to.match(/Null Count:\s*\d+/i)
          expect(output).to.match(/Distinct:\s*\d+/i)
          expect(output).to.match(/Data profile complete for table\s+DUMMY\.\s+Rows:\s*\d+,\s+Columns:\s*\d+/i)
          done()
        })
      }).catch(done)
    })
  })
})
