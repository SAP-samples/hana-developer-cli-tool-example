// @ts-check
import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'

describe('version command - E2E Tests', function () {
  this.timeout(15000)

  describe('Basic execution', () => {
    it('displays version information', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout).to.include('hana-cli:')
        expect(stdout).to.match(/Node\.js(?:\s+version)?\s*:/i)
        expect(stdout).to.include('CHANGELOG.md')
        base.addContext(this, { title: 'Output', value: stdout })
        done()
      })
    })

    it('works with alias "ver"', function (done) {
      base.exec('node bin/cli.js ver', (error, stdout) => {
        expect(stdout).to.include('hana-cli:')
        done()
      })
    })

    it('runs without errors', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Help outputs', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js version --help', (error, stdout) => {
        expect(stdout).to.include('version')
        expect(stdout).to.include('Options:')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js version --help', (error, stdout) => {
        expect(stdout).to.include('hana-cli version')
        base.addContext(this, { title: 'Help', value: stdout })
        done()
      })
    })
  })

  describe('Version components', () => {
    it('shows hana-cli version in semver format', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        const versionMatch = stdout.match(/hana-cli:\s+(\d+\.\d+\.\d+)/)
        expect(versionMatch).to.exist
        base.addContext(this, { title: 'CLI Version', value: versionMatch ? versionMatch[1] : 'not found' })
        done()
      })
    })

    it('displays Node.js version', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout).to.match(/Node\.js(?:\s+version)?\s*:\s*v\d+\.\d+\.\d+/i)
        done()
      })
    })

    it('includes changelog URL', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout).to.match(/https:\/\/github\.com\/SAP-samples\/hana-developer-cli-tool-example\/blob\s*\/\s*main\/CHANGELOG\.md/i)
        done()
      })
    })
  })

  describe('Version checking', () => {
    it('checks latest available version', function (done) {
      this.timeout(20000)
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout).to.match(/Latest\s+hana-cli\s+version\s+available\s+on\s+npmjs\.com:\s*\d+\.\d+\.\d+/i)
        done()
      })
    })

    it('returns version information regardless of network', function (done) {
      this.timeout(20000)
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout.length).to.be.greaterThan(100)
        done()
      })
    })
  })

  describe('Dependencies', () => {
    it('shows cf-cli version or missing status', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout).to.match(/cf-cli/i)
        done()
      })
    })

    it('shows btp-cli version or missing status', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout).to.match(/btp-cli/i)
        done()
      })
    })

    it('displays SAP package versions', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout).to.match(/@sap\//i)
        done()
      })
    })

    it('includes database driver info', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout).to.match(/hdb|database/i)
        done()
      })
    })
  })

  describe('Output format', () => {
    it('outputs multiple lines', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        const lines = stdout.split('\n').filter(l => l.trim())
        expect(lines.length).to.be.greaterThan(3)
        base.addContext(this, { title: 'Line count', value: `${lines.length} lines` })
        done()
      })
    })

    it('uses consistent name: value format', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        const lines = stdout.split('\n').filter(l => l.includes(':'))
        expect(lines.length).to.be.greaterThan(1)

        const allFormatted = lines.every(line => /:\s+/.test(line))
        expect(allFormatted).to.be.true
        done()
      })
    })
  })

  describe('Integration', () => {
    it('works in command sequence', function (done) {
      base.exec('node bin/cli.js version', (error1, stdout1) => {
        base.exec('node bin/cli.js version', (error2, stdout2) => {
          expect(stdout1).to.include('hana-cli:')
          expect(stdout2).to.include('hana-cli:')
          done(error1 || error2)
        })
      })
    })

    it('returns consistent version on repeated calls', function (done) {
      base.exec('node bin/cli.js version', (error1, stdout1) => {
        base.exec('node bin/cli.js version', (error2, stdout2) => {
          const v1 = stdout1.match(/hana-cli:\s+(\d+\.\d+\.\d+)/)?.[1]
          const v2 = stdout2.match(/hana-cli:\s+(\d+\.\d+\.\d+)/)?.[1]
          expect(v1).to.equal(v2)
          done()
        })
      })
    })

    it('does not require database connection', function (done) {
      base.exec('node bin/cli.js version', (error, stdout) => {
        expect(stdout).to.include('hana-cli:')
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('completes without errors', function (done) {
      const localTest = base.myTest.bind(this)
      localTest('node bin/cli.js version', done)
    })

    it('handles global flags gracefully', function (done) {
      base.exec('node bin/cli.js version --debug', (error, stdout) => {
        expect(stdout).to.include('hana-cli:')
        done()
      })
    })

    it('alias works with options', function (done) {
      base.exec('node bin/cli.js ver --help', (error, stdout) => {
        expect(stdout.length).to.be.greaterThan(0)
        done()
      })
    })
  })
})
