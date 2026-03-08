// @ts-check
import * as base from '../base.js'
import { expect } from 'chai'
import { execFile } from 'child_process'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'


describe('connect command - E2E Tests', function () {
  this.timeout(15000)

  describe('Help output', () => {
    it('shows help via cli command', function (done) {
      base.exec('node bin/cli.js connect --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli connect [user] [password]')
        expect(stdout).to.include('Options:')
        expect(stdout).to.include('--connection')
        expect(stdout).to.include('--user')
        expect(stdout).to.include('--password')
        base.addContext(this, { title: 'Connect Help', value: stdout })
        done()
      })
    })

    it('lists connect-specific options in help', function (done) {
      base.exec('node bin/cli.js connect --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('--save')
        expect(stdout).to.include('--encrypt')
        expect(stdout).to.include('--trustStore')
        expect(stdout).to.include('--userstorekey')
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js connect --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/connection-auth\/connect/i)
        expect(stdout).to.include('hana-cli connections --help')
        expect(stdout).to.include('hana-cli connectViaServiceKey --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "c"', function (done) {
      base.exec('node bin/cli.js c --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli connect [user] [password]')
        done()
      })
    })

    it('supports alias "login"', function (done) {
      base.exec('node bin/cli.js login --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli connect [user] [password]')
        done()
      })
    })
  })

  describe('Live connection (optional)', () => {
    it('performs an actual DB connection using local credentials', function (done) {
      this.timeout(30000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_CONNECT')
      if (!gateLiveTestInCI(this, done, liveControl, 'connect live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana' || !creds.connection || !creds.user || !creds.password) {
          return skipOrFailLiveTest(this, done, liveControl, 'Live connect E2E prerequisites not met: missing usable HANA connection/user/password credentials.')
        }

        const args = [
          'bin/cli.js',
          'connect',
          '--connection',
          creds.connection,
          '--user',
          creds.user,
          '--password',
          creds.password,
          '--save',
          'false',
          '--encrypt',
          'true',
          '--quiet'
        ]

        execFile('node', args, { cwd: process.cwd() }, (error, stdout, stderr) => {
          base.addContext(this, { title: 'Live connect stdout', value: stdout })
          if (stderr) {
            base.addContext(this, { title: 'Live connect stderr', value: stderr })
          }

          expect(error).to.be.null
          expect(stdout).to.match(/Current User|Current Schema|M_SESSION_CONTEXT/i)
          done()
        })
      }).catch(done)
    })
  })

})