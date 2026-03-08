// @ts-check
/**
 * @module dependencies - End-to-End (E2E) Tests for bin/dependencies.js
 * 
 * Validates complete command workflows including:
 * - Help and documentation output
 * - Aliases and flag exposure
 * - Format options and validation
 * - Optional live dependency graphing
 */

import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('dependencies command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js dependencies --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli dependencies')
        expect(stdout).to.include('--object')
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--direction')
        expect(stdout).to.include('--depth')
        expect(stdout).to.include('--format')
        expect(stdout).to.include('Options:')
        base.addContext(this, { title: 'Dependencies Help', value: stdout })
        done()
      })
    })

    it('includes documentation links and examples', function (done) {
      base.exec('node bin/cli.js dependencies --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/analysis-tools\/dependencies/i)
        expect(stdout).to.match(/Examples:|EXAMPLES/i)
        expect(stdout).to.include('hana-cli dependencies')
        done()
      })
    })

    it('shows available format choices', function (done) {
      base.exec('node bin/cli.js dependencies --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/tree|json|graphviz|mermaid/)
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "deps"', function (done) {
      base.exec('node bin/cli.js deps --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('dependencies')
        done()
      })
    })

    it('supports alias "dependency-graph"', function (done) {
      base.exec('node bin/cli.js dependency-graph --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('dependencies')
        done()
      })
    })
  })

  describe('Flag validation', () => {
    it('accepts --direction flag with choices', function (done) {
      base.exec('node bin/cli.js dependencies --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/--direction|--dir/)
        expect(stdout).to.match(/incoming|outgoing|both/)
        done()
      })
    })

    it('accepts --depth flag', function (done) {
      base.exec('node bin/cli.js dependencies --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/--depth|--lvl/)
        done()
      })
    })

    it('accepts --includeViews and --includeProcedures flags', function (done) {
      base.exec('node bin/cli.js dependencies --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/--includeViews|--iv/)
        expect(stdout).to.match(/--includeProcedures|--ip/)
        done()
      })
    })

    it('rejects invalid format values', function (done) {
      base.exec('node bin/cli.js dependencies --object DUMMY --format nope --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output).to.match(/Invalid|choice|choices|allowed|unknown/i)
        base.addContext(this, { title: 'Invalid format output', value: output })
        done()
      })
    })
  })

  describe('Live dependency graphing (optional)', () => {
    it('generates tree output for SYS.DUMMY when credentials available', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_DEPENDENCIES')
      if (!gateLiveTestInCI(this, done, liveControl, 'dependencies live tree E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live dependencies E2E prerequisites not met: no HANA credentials resolved.')
        }

        const command = 'node bin/cli.js dependencies --schema SYS --object DUMMY --direction both --depth 1 --format tree --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Tree output', value: output })

          try {
            expect(error).to.be.null
            expect(output).to.match(/Dependency Graph for:/i)
            expect(output).to.match(/No incoming dependencies found|Dependencies from:/i)
            expect(output).to.match(/No outgoing dependencies found|Dependencies to:/i)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live dependency tree E2E failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('emits JSON format with root and arrays', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_DEPENDENCIES')
      if (!gateLiveTestInCI(this, done, liveControl, 'dependencies live JSON E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met for JSON output validation.')
        }

        const command = 'node bin/cli.js dependencies --schema SYS --object DUMMY --direction both --depth 1 --format json --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'JSON output', value: output })

          try {
            expect(error).to.be.null
            const parsed = JSON.parse(stdout || '{}')
            expect(parsed).to.have.property('root')
            expect(parsed).to.have.property('children')
            expect(parsed).to.have.property('parents')
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live JSON output validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('emits mermaid output', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_DEPENDENCIES')
      if (!gateLiveTestInCI(this, done, liveControl, 'dependencies live mermaid E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met for Mermaid output validation.')
        }

        const command = 'node bin/cli.js dependencies --schema SYS --object DUMMY --direction both --depth 1 --format mermaid --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Mermaid output', value: output })

          try {
            expect(error).to.be.null
            expect(output).to.match(/graph\s+TD/i)
            expect(output).to.match(/DUMMY/i)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live Mermaid output validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })

    it('emits graphviz output', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_DEPENDENCIES')
      if (!gateLiveTestInCI(this, done, liveControl, 'dependencies live graphviz E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Prerequisites not met for Graphviz output validation.')
        }

        const command = 'node bin/cli.js dependencies --schema SYS --object DUMMY --direction both --depth 1 --format graphviz --quiet'
        base.exec(command, (error, stdout, stderr) => {
          const output = `${stdout || ''}\n${stderr || ''}`
          base.addContext(this, { title: 'Graphviz output', value: output })

          try {
            expect(error).to.be.null
            expect(output).to.match(/digraph\s+dependencies/i)
            expect(output).to.match(/DUMMY/i)
            done()
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            skipOrFailLiveTest(this, done, liveControl, `Live Graphviz output validation failed: ${errMsg}`)
          }
        })
      }).catch(done)
    })
  })
})
