// @ts-check
import * as base from '../base.js'
import { expect } from 'chai'
import { execFile } from 'child_process'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

describe('status command - E2E Tests', function () {
  this.timeout(30000)

  describe('Help output', () => {
    it('shows help via cli command', function (done) {
      base.exec('node bin/cli.js status --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli status')
        expect(stdout).to.include('Options:')
        expect(stdout).to.include('--priv')
        base.addContext(this, { title: 'Status Help', value: stdout })
        done()
      })
    })

    it('supports aliases in help mode', function (done) {
      base.exec('node bin/cli.js whoami --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli status')
        done()
      })
    })
  })

  describe('System health check and output formatting (optional live)', () => {
    it('returns session and role context with readable table-like output', function (done) {
      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_STATUS')
      if (!gateLiveTestInCI(this, done, liveControl, 'status live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana' || !creds.connection || !creds.user || !creds.password) {
          return skipOrFailLiveTest(this, done, liveControl, 'Live status E2E prerequisites not met: missing usable HANA connection/user/password credentials.')
        }

        const args = [
          'bin/cli.js',
          'status',
          '--connection',
          creds.connection,
          '--user',
          creds.user,
          '--password',
          creds.password,
          '--quiet'
        ]

        execFile('node', args, { cwd: process.cwd() }, (error, stdout, stderr) => {
          base.addContext(this, { title: 'Status stdout', value: stdout })
          if (stderr) {
            base.addContext(this, { title: 'Status stderr', value: stderr })
          }

          expect(error).to.be.null
          expect(stdout).to.match(/Current User|Current Schema/i)
          expect(stdout).to.match(/ROLE_NAME|ROLE_SCHEMA_NAME|IS_GRANTABLE/i)

          const nonEmptyLines = stdout.split('\n').filter(line => line.trim().length > 0)
          expect(nonEmptyLines.length).to.be.greaterThan(3)
          done()
        })
      }).catch(done)
    })

    it('includes granted privileges when --priv is enabled', function (done) {
      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_STATUS')
      if (!gateLiveTestInCI(this, done, liveControl, 'status --priv live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana' || !creds.connection || !creds.user || !creds.password) {
          return skipOrFailLiveTest(this, done, liveControl, 'Live status --priv E2E prerequisites not met: missing usable HANA credentials.')
        }

        const args = [
          'bin/cli.js',
          'status',
          '--connection',
          creds.connection,
          '--user',
          creds.user,
          '--password',
          creds.password,
          '--priv',
          '--quiet'
        ]

        execFile('node', args, { cwd: process.cwd() }, (error, stdout, stderr) => {
          base.addContext(this, { title: 'Status --priv stdout', value: stdout })
          if (stderr) {
            base.addContext(this, { title: 'Status --priv stderr', value: stderr })
          }

          expect(error).to.be.null
          expect(stdout).to.match(/PRIVILEGE|OBJECT_TYPE|IS_GRANTABLE/i)
          done()
        })
      }).catch(done)
    })
  })

  describe('Connection validation', () => {
    it('accepts explicit connection credentials and returns session context', function (done) {
      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_STATUS')
      if (!gateLiveTestInCI(this, done, liveControl, 'status connection validation live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana' || !creds.connection || !creds.user || !creds.password) {
          return skipOrFailLiveTest(this, done, liveControl, 'Connection validation prerequisites not met: missing usable HANA connection/user/password credentials.')
        }

        const args = [
          'bin/cli.js',
          'status',
          '--connection',
          creds.connection,
          '--user',
          creds.user,
          '--password',
          creds.password,
          '--quiet'
        ]

        execFile('node', args, { cwd: process.cwd() }, (error, stdout, stderr) => {
          base.addContext(this, { title: 'Connection validation stdout', value: stdout })
          if (stderr) {
            base.addContext(this, { title: 'Connection validation stderr', value: stderr })
          }

          expect(error).to.be.null
          expect(stdout).to.match(/Current User|Current Schema|M_SESSION_CONTEXT/i)
          done()
        })
      }).catch(done)
    })
  })
})
