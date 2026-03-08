// @ts-check
/**
 * @module querySimple - End-to-End (E2E) Tests for bin/querySimple.js
 *
 * Validates complete command workflows including:
 * - Help and option exposure
 * - Optional live query execution
 * - Result formatting for table/json/csv outputs
 * - Error handling for invalid/missing inputs
 */

import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('querySimple command - E2E Tests', function () {
  this.timeout(25000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js querySimple --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli querySimple')
        expect(stdout).to.include('--query')
        expect(stdout).to.include('--output')
        expect(stdout).to.include('--folder')
        expect(stdout).to.include('--filename')
        expect(stdout).to.include('--profile')
        base.addContext(this, { title: 'querySimple help', value: stdout })
        done()
      })
    })

    it('supports alias "qs"', function (done) {
      base.exec('node bin/cli.js qs --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('querySimple')
        done()
      })
    })
  })

  describe('Live query execution and result formatting (optional)', () => {
    it('executes query with table output when HANA credentials are available', function (done) {
      this.timeout(40000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_QUERY_SIMPLE')
      if (!gateLiveTestInCI(this, done, liveControl, 'querySimple table output E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live querySimple E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = `node bin/cli.js querySimple --query "SELECT 'ALPHA' AS LABEL, 42 AS CNT FROM DUMMY" --output table --quiet`
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Table output', value: output })

          try {
            expect(error).to.be.null
            expect(output.length).to.be.greaterThan(0)
            expect(output).to.match(/LABEL/i)
            expect(output).to.match(/CNT/i)
            expect(output).to.match(/ALPHA/i)
            expect(output).to.match(/42/)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live querySimple table format validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('formats output as JSON for live query', function (done) {
      this.timeout(40000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_QUERY_SIMPLE')
      if (!gateLiveTestInCI(this, done, liveControl, 'querySimple json output E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met for live JSON output validation.')
        }

        const command = `node bin/cli.js querySimple --query "SELECT 'ALPHA' AS LABEL, 42 AS CNT FROM DUMMY" --output json --quiet`
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'JSON output', value: output })

          try {
            expect(error).to.be.null
            expect(output).to.match(/\[\s*\{/)
            expect(output).to.match(/"LABEL"\s*:/)
            expect(output).to.match(/"CNT"\s*:/)
            expect(output).to.match(/ALPHA/)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live querySimple JSON format validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('formats output as CSV with semicolon delimiter for live query', function (done) {
      this.timeout(40000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_QUERY_SIMPLE')
      if (!gateLiveTestInCI(this, done, liveControl, 'querySimple csv output E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met for live CSV output validation.')
        }

        const command = `node bin/cli.js querySimple --query "SELECT 'ALPHA' AS LABEL, 42 AS CNT FROM DUMMY" --output csv --quiet`
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'CSV output', value: output })

          try {
            expect(error).to.be.null
            expect(output).to.match(/LABEL;CNT/i)
            expect(output).to.match(/ALPHA;42/)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live querySimple CSV format validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })
  })

  describe('Error handling', () => {
    it('rejects invalid output format value', function (done) {
      base.exec('node bin/cli.js querySimple --query "SELECT * FROM DUMMY" --output xml --quiet', (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(error).to.exist
        expect(output).to.match(/Invalid values:|choices:|output/i)
        base.addContext(this, { title: 'Invalid output format', value: output })
        done()
      })
    })

    it('rejects missing required query when --quiet is used', function (done) {
      base.exec('node bin/cli.js querySimple --quiet', (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(error).to.exist
        expect(output).to.match(/Missing required|query|required/i)
        base.addContext(this, { title: 'Missing query output', value: output })
        done()
      })
    })

    it('handles invalid SQL syntax gracefully in live mode', function (done) {
      this.timeout(40000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_QUERY_SIMPLE')
      if (!gateLiveTestInCI(this, done, liveControl, 'querySimple invalid SQL E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met for invalid SQL error handling validation.')
        }

        const command = 'node bin/cli.js querySimple --query "SELECT FROM" --output table --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Invalid SQL output', value: output })

          try {
            expect(error).to.exist
            expect(output).to.match(/error|sql|syntax|invalid/i)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live querySimple invalid SQL validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })
  })
})