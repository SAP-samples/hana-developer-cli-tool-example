// @ts-check
/**
 * @module indexes - End-to-End (E2E) Tests for bin/indexes.js
 * 
 * Validates complete command workflows including:
 * - Help and documentation output
 * - Command aliases and flags
 * - Error handling and validation
 * - Optional live database testing
 */

import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('indexes command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js indexes --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli indexes')
        expect(stdout).to.include('--indexes')
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--limit')
        expect(stdout).to.include('--profile')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'Indexes Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js indexes --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/schema-tools\/indexes/i)
        expect(stdout).to.include('hana-cli inspectIndex --help')
        expect(stdout).to.include('hana-cli tables --help')
        expect(stdout).to.include('hana-cli tableHotspots --help')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js indexes --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli indexes')
        base.addContext(this, { title: 'Help with examples', value: stdout })
        done()
      })
    })
  })

  describe('Aliases', () => {
    const aliases = ['ind', 'listIndexes', 'ListInd', 'listind', 'Listind', 'listfindexes']

    aliases.forEach((alias) => {
      it(`supports alias "${alias}"`, function (done) {
        base.exec(`node bin/cli.js ${alias} --help`, (error, stdout) => {
          expect(error).to.be.null
          expect(stdout).to.include('indexes')
          done()
        })
      })
    })
  })

  describe('Flag validation', () => {
    it('accepts --indexes flag (with alias -i)', function (done) {
      base.exec('node bin/cli.js indexes --help', (error, stdout) => {
        expect(stdout).to.match(/--indexes|--i/)
        done()
      })
    })

    it('accepts --schema flag (with alias -s)', function (done) {
      base.exec('node bin/cli.js indexes --help', (error, stdout) => {
        expect(stdout).to.match(/--schema|--s/)
        done()
      })
    })

    it('accepts --limit flag (with alias -l)', function (done) {
      base.exec('node bin/cli.js indexes --help', (error, stdout) => {
        expect(stdout).to.match(/--limit|--l/)
        done()
      })
    })

    it('accepts --profile flag', function (done) {
      base.exec('node bin/cli.js indexes --help', (error, stdout) => {
        expect(stdout).to.include('--profile')
        done()
      })
    })

    it('validates limit parameter is numeric', function (done) {
      base.exec('node bin/cli.js indexes --limit abc --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output.toLowerCase()).to.match(/invalid|error|argument/)
        base.addContext(this, { title: 'Invalid limit output', value: output })
        done()
      })
    })

    it('rejects negative limit values', function (done) {
      base.exec('node bin/cli.js indexes --limit -10 --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        base.addContext(this, { title: 'Negative limit output', value: `${stdout || ''}\n${stderr || ''}` })
        done()
      })
    })
  })

  describe('Live index query (optional)', () => {
    it('lists indexes from SYS schema when credentials available', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_INDEXES')
      if (!gateLiveTestInCI(this, done, liveControl, 'indexes live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live indexes E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = 'node bin/cli.js indexes --schema SYS --limit 5 --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Live indexes output', value: output })

          try {
            expect(error).to.be.null
            expect(output.length).to.be.greaterThan(0)
            expect(output).to.match(/[A-Z_]+/)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live indexes E2E failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('respects limit parameter in live query', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_INDEXES')
      if (!gateLiveTestInCI(this, done, liveControl, 'indexes limit E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met.')
        }

        const command = 'node bin/cli.js indexes --schema SYS --limit 3 --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          const lines = output.split('\n').filter(l => l.trim().length > 0)

          try {
            expect(error).to.be.null
            expect(lines.length).to.be.lessThanOrEqual(10)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Limit validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })
  })

  describe('Output format', () => {
    it('produces consistent output structure on repeated calls', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_INDEXES')
      if (!gateLiveTestInCI(this, done, liveControl, 'indexes consistency E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met.')
        }

        const command = 'node bin/cli.js indexes --schema SYS --limit 1 --quiet'
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
      base.exec('node bin/cli.js indexes --invalid-flag 2>&1', (error, stdout) => {
        const output = stdout || ''
        expect(output).to.match(/unknown.*option|Unknown option|error/i)
        done()
      })
    })
  })
})
