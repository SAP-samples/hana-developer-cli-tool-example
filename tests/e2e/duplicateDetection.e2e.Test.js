// @ts-check
/**
 * @module duplicateDetection - End-to-End (E2E) Tests for bin/duplicateDetection.js
 *
 * Validates complete command workflows including:
 * - Help and documentation output
 * - Alias support
 * - Flag validation behavior
 * - Optional live end-to-end workflow for data quality duplicate analysis
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('duplicateDetection command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js duplicateDetection --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli duplicateDetection')
        expect(stdout).to.include('--table')
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--keyColumns')
        expect(stdout).to.include('--checkColumns')
        expect(stdout).to.include('--excludeColumns')
        expect(stdout).to.include('--mode')
        expect(stdout).to.include('choices: "exact", "fuzzy", "partial"')
        expect(stdout).to.include('--threshold')
        expect(stdout).to.include('--format')
        expect(stdout).to.include('choices: "json", "csv", "summary"')
        expect(stdout).to.include('--output')
        expect(stdout).to.include('--limit')
        expect(stdout).to.include('--timeout')
        base.addContext(this, { title: 'Duplicate Detection Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js duplicateDetection --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/data-tools\/duplicate-detection/i)
        expect(stdout).to.include('hana-cli dataProfile --help')
        expect(stdout).to.include('hana-cli dataValidator --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "dupdetect"', function (done) {
      base.exec('node bin/cli.js dupdetect --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli duplicateDetection')
        done()
      })
    })

    it('supports alias "findDuplicates"', function (done) {
      base.exec('node bin/cli.js findDuplicates --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli duplicateDetection')
        done()
      })
    })

    it('supports alias "duplicates"', function (done) {
      base.exec('node bin/cli.js duplicates --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli duplicateDetection')
        done()
      })
    })
  })

  describe('Validation', () => {
    it('rejects unsupported format values', function (done) {
      base.exec('node bin/cli.js duplicateDetection --table DUMMY --format xml --quiet', (error, stdout, stderr) => {
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

  describe('Live data quality workflow (optional)', () => {
    it('runs exact, fuzzy, and partial duplicate analysis workflow on SYS.DUMMY', function (done) {
      this.timeout(60000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_DUPLICATEDETECTION')
      if (!gateLiveTestInCI(this, done, liveControl, 'duplicateDetection live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live duplicateDetection E2E prerequisites not met: no HANA credentials resolved.')
        }

        const workflowSteps = [
          {
            title: 'Exact mode summary output',
            command: 'node bin/cli.js duplicateDetection --schema SYS --table DUMMY --mode exact --format summary --limit 1 --quiet',
            checks: [/Duplicate Detection Report/i, /Total Rows:\s*1/i, /duplicate detection complete/i]
          },
          {
            title: 'Fuzzy mode output',
            command: 'node bin/cli.js duplicateDetection --schema SYS --table DUMMY --mode fuzzy --threshold 0.8 --format json --limit 1 --quiet',
            checks: [/Duplicate Detection Report/i, /Total Rows:\s*1/i, /duplicate detection complete/i]
          },
          {
            title: 'Partial mode output',
            command: 'node bin/cli.js duplicateDetection --schema SYS --table DUMMY --mode partial --format csv --limit 1 --quiet',
            checks: [/Duplicate Detection Report/i, /Total Rows:\s*1/i, /duplicate detection complete/i]
          }
        ]

        const runStep = (index) => {
          if (index >= workflowSteps.length) {
            done()
            return
          }

          const step = workflowSteps[index]
          base.exec(step.command, (error, stdout, stderr) => {
            const output = `${stdout || ''}\n${stderr || ''}`
            base.addContext(this, { title: step.title, value: output })

            expect(error).to.be.null
            for (const check of step.checks) {
              expect(output).to.match(check)
            }

            runStep(index + 1)
          })
        }

        runStep(0)
      }).catch(done)
    })
  })
})