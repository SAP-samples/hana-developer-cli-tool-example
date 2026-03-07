// @ts-check
import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'

describe('systemInfo command - E2E Tests', function () {
  this.timeout(30000) // Longer timeout for database operations

  describe('Basic execution', () => {
    it('displays system information', function (done) {
      base.exec('node bin/cli.js systemInfo', (error, stdout) => {
        expect(stdout).to.include('Connection Configuration')
        base.addContext(this, { title: 'Output', value: stdout })
        done()
      })
    })

    it('works with alias "sys"', function (done) {
      base.exec('node bin/cli.js sys', (error, stdout) => {
        expect(stdout).to.include('Connection Configuration')
        done()
      })
    })

    it('works with alias "sysinfo"', function (done) {
      base.exec('node bin/cli.js sysinfo', (error, stdout) => {
        expect(stdout).to.include('Connection Configuration')
        done()
      })
    })

    it('runs without errors', function (done) {
      base.exec('node bin/cli.js systemInfo', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Output format options', () => {
    it('displays basic output (default)', function (done) {
      base.exec('node bin/cli.js systemInfo --output basic', (error, stdout) => {
        expect(stdout).to.include('Connection Configuration')
        base.addContext(this, { title: 'Basic Output', value: stdout })
        done()
      })
    })

    it('displays environment output', function (done) {
      base.exec('node bin/cli.js systemInfo --output env', (error, stdout) => {
        // Environment output should contain connection details
        expect(error).to.be.null
        base.addContext(this, { title: 'Environment Output', value: stdout })
        done()
      })
    })

    it('displays dbx output', function (done) {
      base.exec('node bin/cli.js systemInfo --output dbx', (error, stdout) => {
        // DBX output should contain database context info
        expect(error).to.be.null
        base.addContext(this, { title: 'DBX Output', value: stdout })
        done()
      })
    })

    it('accepts output alias "-o"', function (done) {
      base.exec('node bin/cli.js systemInfo -o basic', (error, stdout) => {
        expect(stdout).to.include('Connection Configuration')
        done()
      })
    })
  })

  describe('Help outputs', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js systemInfo --help', (error, stdout) => {
        expect(stdout).to.include('systemInfo')
        expect(stdout).to.include('Options:')
        expect(stdout).to.include('output')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js systemInfo --help', (error, stdout) => {
        expect(stdout).to.include('hana-cli systemInfo')
        base.addContext(this, { title: 'Help', value: stdout })
        done()
      })
    })

    it('displays available output choices', function (done) {
      base.exec('node bin/cli.js systemInfo --help', (error, stdout) => {
        expect(stdout).to.match(/basic|env|dbx/)
        done()
      })
    })
  })

  describe('Aliases', () => {
    const aliases = ['sys', 'sysinfo', 'sysInfo', 'systeminfo', 'system-information', 'dbInfo', 'dbinfo']
    
    aliases.forEach(alias => {
      it(`works with alias "${alias}"`, function (done) {
        base.exec(`node bin/cli.js ${alias}`, (error, stdout) => {
          expect(error).to.be.null
          expect(stdout).to.include('Connection Configuration')
          done()
        })
      })
    })
  })
})
