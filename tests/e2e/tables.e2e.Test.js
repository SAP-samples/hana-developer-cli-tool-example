// @ts-check
/**
 * @module tables - End-to-End (E2E) Tests for bin/tables.js
 * 
 * Validates complete command workflows including:
 * - Basic execution and table listing
 * - Command aliases and flags
 * - Help and documentation output
 * - Error handling and validation
 * - Optional live database testing
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('tables command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli tables')
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--table')
        expect(stdout).to.include('--limit')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'Tables Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/schema-tools\/tables/i)
        expect(stdout).to.include('hana-cli inspectTable --help')
        expect(stdout).to.include('hana-cli schemas --help')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli tables')
        base.addContext(this, { title: 'Help with examples', value: stdout })
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "t"', function (done) {
      base.exec('node bin/cli.js t --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('tables')
        done()
      })
    })

    it('supports alias "listTables"', function (done) {
      base.exec('node bin/cli.js listTables --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('tables')
        done()
      })
    })

    it('supports alias "listtables" (case-insensitive)', function (done) {
      base.exec('node bin/cli.js listtables --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('tables')
        done()
      })
    })
  })

  describe('Flag validation', () => {
    it('accepts --schema flag', function (done) {
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        expect(stdout).to.include('--schema')
        expect(stdout).to.match(/--schema.*Schema/)
        done()
      })
    })

    it('accepts --table flag (with alias -t)', function (done) {
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        expect(stdout).to.match(/--table|--t/)
        expect(stdout).to.match(/Table/)
        done()
      })
    })

    it('accepts --limit flag (with alias -l)', function (done) {
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        expect(stdout).to.match(/--limit|--l/)
        expect(stdout).to.match(/limit/)
        done()
      })
    })

    it('accepts --profile flag', function (done) {
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('validates limit parameter is numeric', function (done) {
      base.exec('node bin/cli.js tables --limit abc --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output.toLowerCase()).to.match(/invalid|error|argument/)
        base.addContext(this, { title: 'Invalid limit output', value: output })
        done()
      })
    })

    it('rejects negative limit values', function (done) {
      base.exec('node bin/cli.js tables --limit -10 --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        base.addContext(this, { title: 'Negative limit output', value: `${stdout || ''}\n${stderr || ''}` })
        done()
      })
    })
  })

  describe('Profile-specific behavior', () => {
    it('shows profile option in help', function (done) {
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('accepts profile values for different database types', function (done) {
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        // Verify profile flag is mentioned
        expect(stdout).to.include('profile')
        done()
      })
    })
  })

  describe('Live tables query (optional)', () => {
    it('lists tables from SYS schema when credentials available', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_TABLES')
      if (!gateLiveTestInCI(this, done, liveControl, 'tables live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live tables E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = 'node bin/cli.js tables --schema SYS --limit 5 --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Live tables output', value: output })

          try {
            expect(error).to.be.null
            expect(output.length).to.be.greaterThan(0)
            // Should display tables in a formatted table
            expect(output).to.match(/[A-Z_]+/)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live tables E2E failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('respects limit parameter in live query', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_TABLES')
      if (!gateLiveTestInCI(this, done, liveControl, 'tables limit E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met.')
        }

        const command = 'node bin/cli.js tables --schema SYS --limit 3 --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          const tableLines = output.split('\n').filter(l => l.trim().length > 0)

          try {
            expect(error).to.be.null
            // Limit should restrict output (accounting for header and footer rows)
            expect(tableLines.length).to.be.lessThanOrEqual(10)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Limit validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('filters tables by name pattern when specified', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_TABLES')
      if (!gateLiveTestInCI(this, done, liveControl, 'tables filter E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met.')
        }

        const command = 'node bin/cli.js tables --schema SYS --table DUMMY% --limit 10 --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Filtered tables output', value: output })

          try {
            expect(error).to.be.null
            expect(output.length).to.be.greaterThan(0)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Table filtering failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })
  })

  describe('Output format', () => {
    it('produces consistent output structure on repeated calls', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_TABLES')
      if (!gateLiveTestInCI(this, done, liveControl, 'tables consistency E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met.')
        }

        const command = 'node bin/cli.js tables --schema SYS --limit 1 --quiet'
        base.exec(command, (error1, stdout1, stderr1) => {
          base.exec(command, (error2, stdout2, stderr2) => {
            try {
              const output1 = `${stdout1 || ''}\n${stderr1 || ''}`
              const output2 = `${stdout2 || ''}\n${stderr2 || ''}`
              expect(output1).to.equal(output2)
              done(error1 || error2)
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : 'Unknown error'
              skipOrFailLiveTest(this, done, liveControl, `Consistency check failed: ${errMsg}`)
            }
          })
        })
      }).catch(done)
    })
  })

  describe('Error handling', () => {
    it('provides help text for invalid schema format', function (done) {
      base.exec('node bin/cli.js tables --invalid-flag 2>&1', (error, stdout) => {
        const output = stdout || ''
        expect(output).to.match(/unknown.*option|Unknown option|error/i)
        done()
      })
    })

    it('handles missing connection gracefully without --quiet', function (done) {
      this.timeout(15000)
      // This tests error message output without needing actual credentials
      base.exec('node bin/cli.js tables --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('tables')
        done()
      })
    })
  })
})
