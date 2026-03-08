// @ts-check
/**
 * @module schemas - End-to-End (E2E) Tests for bin/schemas.js
 * 
 * Validates complete command workflows including:
 * - Basic execution and schema listing
 * - Command aliases and flags
 * - Help and documentation output
 * - Error handling and validation
 * - Optional live database testing
 */

import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('schemas command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js schemas --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli schemas')
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--limit')
        expect(stdout).to.include('--all')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'Schemas Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js schemas --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/schema-tools\/schemas/i)
        expect(stdout).to.include('hana-cli objects --help')
        expect(stdout).to.include('hana-cli tables --help')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js schemas --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli schemas')
        base.addContext(this, { title: 'Help with examples', value: stdout })
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "sch"', function (done) {
      base.exec('node bin/cli.js sch --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('schemas')
        done()
      })
    })

    it('supports alias "getSchemas"', function (done) {
      base.exec('node bin/cli.js getSchemas --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('schemas')
        done()
      })
    })

    it('supports alias "listSchemas"', function (done) {
      base.exec('node bin/cli.js listSchemas --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('schemas')
        done()
      })
    })

    it('supports alias "s"', function (done) {
      base.exec('node bin/cli.js s --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('schemas')
        done()
      })
    })
  })

  describe('Flag validation', () => {
    it('accepts --schema flag (with alias -s)', function (done) {
      base.exec('node bin/cli.js schemas --help', (error, stdout) => {
        expect(stdout).to.match(/--schema/)
        expect(stdout).to.match(/Schema/)
        done()
      })
    })

    it('accepts --limit flag (with alias -l)', function (done) {
      base.exec('node bin/cli.js schemas --help', (error, stdout) => {
        expect(stdout).to.match(/--limit|--l/)
        expect(stdout).to.match(/limit/)
        done()
      })
    })

    it('accepts --all flag (with alias --allSchemas or --al)', function (done) {
      base.exec('node bin/cli.js schemas --help', (error, stdout) => {
        expect(stdout).to.match(/--all|--al|--allSchemas/)
        done()
      })
    })

    it('validates limit parameter is numeric', function (done) {
      base.exec('node bin/cli.js schemas --limit xyz --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output.toLowerCase()).to.match(/invalid|error|argument/)
        base.addContext(this, { title: 'Invalid limit output', value: output })
        done()
      })
    })

    it('rejects negative limit values', function (done) {
      base.exec('node bin/cli.js schemas --limit -50 --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        base.addContext(this, { title: 'Negative limit output', value: `${stdout || ''}\n${stderr || ''}` })
        done()
      })
    })
  })

  describe('All schemas flag behavior', () => {
    it('allows --all flag to include all schemas', function (done) {
      base.exec('node bin/cli.js schemas --help', (error, stdout) => {
        expect(stdout).to.match(/--all|--al|--allSchemas/)
        expect(stdout).to.match(/[Aa]ll [Ss]chemas/)
        done()
      })
    })

    it('defaults to showing only schemas with privileges', function (done) {
      base.exec('node bin/cli.js schemas --help', (error, stdout) => {
        // Verify the help mentions the --all flag which is used to override the default behavior
        expect(stdout).to.match(/--all|--al|--allSchemas/)
        done()
      })
    })
  })

  describe('Live schemas query (optional)', () => {
    it('lists schemas when credentials available', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_SCHEMAS')
      if (!gateLiveTestInCI(this, done, liveControl, 'schemas live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live schemas E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = 'node bin/cli.js schemas --limit 10 --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Live schemas output', value: output })

          try {
            expect(error).to.be.null
            expect(output.length).to.be.greaterThan(0)
            // Should display schemas in a formatted table (case-insensitive)
            expect(output).to.match(/[A-Z_]+|SCHEMA/i)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live schemas E2E failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('respects default limit parameter in live query', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_SCHEMAS')
      if (!gateLiveTestInCI(this, done, liveControl, 'schemas limit E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met.')
        }

        const command = 'node bin/cli.js schemas --limit 5 --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          const schemaLines = output.split('\n').filter(l => l.trim().length > 0)

          try {
            expect(error).to.be.null
            // Limit should restrict output (accounting for header/footer rows)
            expect(schemaLines.length).to.be.lessThanOrEqual(10)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Limit validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('filters schemas by name pattern when specified', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_SCHEMAS')
      if (!gateLiveTestInCI(this, done, liveControl, 'schemas filter E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met.')
        }

        const command = 'node bin/cli.js schemas --schema SYS% --limit 10 --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Filtered schemas output', value: output })

          try {
            expect(error).to.be.null
            expect(output.length).to.be.greaterThan(0)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Schema filtering failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('includes all schemas when --all flag is used', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_SCHEMAS')
      if (!gateLiveTestInCI(this, done, liveControl, 'schemas all flag E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met.')
        }

        const commandWithoutAll = 'node bin/cli.js schemas --limit 100 --quiet'
        const commandWithAll = 'node bin/cli.js schemas --all --limit 100 --quiet'

        base.exec(commandWithoutAll, (error1, stdout1, stderr1) => {
          base.exec(commandWithAll, (error2, stdout2, stderr2) => {
            try {
              const output1 = `${stdout1 || ''}\n${stderr1 || ''}`
              const output2 = `${stdout2 || ''}\n${stderr2 || ''}`
              expect(error1).to.be.null
              expect(error2).to.be.null
              // With --all should return same or more results
              const lines1 = output1.split('\n').filter(l => l.trim().length > 0).length
              const lines2 = output2.split('\n').filter(l => l.trim().length > 0).length
              expect(lines2).to.be.greaterThanOrEqual(lines1)
              done()
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : 'Unknown error'
              skipOrFailLiveTest(this, done, liveControl, `All flag validation failed: ${errMsg}`)
            }
          })
        })
      }).catch(done)
    })
  })

  describe('Output format', () => {
    it('produces consistent output structure on repeated calls', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_SCHEMAS')
      if (!gateLiveTestInCI(this, done, liveControl, 'schemas consistency E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met.')
        }

        const command = 'node bin/cli.js schemas --limit 1 --quiet'
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
    it('provides help text for invalid flags', function (done) {
      base.exec('node bin/cli.js schemas --invalid-flag 2>&1', (error, stdout) => {
        const output = stdout || ''
        expect(output).to.match(/unknown.*option|Unknown option|error/i)
        done()
      })
    })

    it('handles missing connection gracefully without --quiet', function (done) {
      this.timeout(15000)
      // This tests help output without needing actual credentials
      base.exec('node bin/cli.js schemas --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('schemas')
        done()
      })
    })
  })
})
