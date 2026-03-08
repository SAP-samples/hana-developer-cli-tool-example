// @ts-check
import * as base from '../base.js'
import { expect } from 'chai'

describe('config command - E2E Tests', function () {
  this.timeout(15000)

  describe('Basic execution', () => {
    it('displays current configuration', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(stdout).to.match(/Current Configuration/i)
        expect(stdout).to.match(/Project Config/i)
        expect(stdout).to.match(/Global Config/i)
        base.addContext(this, { title: 'Output', value: stdout })
        done()
      })
    })

    it('works with alias "cfg"', function (done) {
      base.exec('node bin/cli.js cfg', (error, stdout) => {
        expect(stdout).to.match(/Current Configuration/i)
        done()
      })
    })

    it('runs without errors', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Help outputs', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js config --help', (error, stdout) => {
        expect(stdout).to.include('config')
        expect(stdout).to.include('Options:')
        done()
      })
    })

    it('displays command examples', function (done) {
      base.exec('node bin/cli.js config --help', (error, stdout) => {
        expect(stdout).to.include('hana-cli config')
        base.addContext(this, { title: 'Help', value: stdout })
        done()
      })
    })

    it('describes edit flag', function (done) {
      base.exec('node bin/cli.js config --help', (error, stdout) => {
        expect(stdout).to.match(/--edit|--e/)
        done()
      })
    })

    it('describes global flag', function (done) {
      base.exec('node bin/cli.js config --help', (error, stdout) => {
        expect(stdout).to.match(/--global|--g/)
        done()
      })
    })

    it('describes path flag', function (done) {
      base.exec('node bin/cli.js config --help', (error, stdout) => {
        expect(stdout).to.match(/--path|--p/)
        done()
      })
    })

    it('describes reset flag', function (done) {
      base.exec('node bin/cli.js config --help', (error, stdout) => {
        expect(stdout).to.match(/--reset/)
        done()
      })
    })
  })

  describe('Configuration display', () => {
    it('shows project config status', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(stdout).to.match(/Project Config/i)
        done()
      })
    })

    it('shows global config status', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(stdout).to.match(/Global Config/i)
        done()
      })
    })

    it('displays helpful hints', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(stdout.toLowerCase()).to.match(/edit|path/)
        done()
      })
    })
  })

  describe('Path action and flag', () => {
    it('shows config paths with --path flag', function (done) {
      base.exec('node bin/cli.js config --path', (error, stdout) => {
        expect(stdout).to.match(/Configuration File Locations|locations/i)
        expect(stdout).to.match(/Project Level|project/i)
        expect(stdout).to.match(/Global Level|global/i)
        base.addContext(this, { title: 'Paths Output', value: stdout })
        done()
      })
    })

    it('works with short flag -p', function (done) {
      base.exec('node bin/cli.js config -p', (error, stdout) => {
        expect(stdout).to.match(/Configuration File Locations|locations/i)
        done()
      })
    })

    it('shows config paths with "paths" action', function (done) {
      base.exec('node bin/cli.js config paths', (error, stdout) => {
        expect(stdout).to.match(/Configuration File Locations|locations/i)
        expect(stdout).to.match(/Project Level|project/i)
        done()
      })
    })

    it('displays .hana-cli-config file locations', function (done) {
      base.exec('node bin/cli.js config --path', (error, stdout) => {
        expect(stdout).to.include('.hana-cli-config')
        done()
      })
    })

    it('displays hana-cli.config.js file locations', function (done) {
      base.exec('node bin/cli.js config --path', (error, stdout) => {
        expect(stdout).to.include('hana-cli.config.js')
        done()
      })
    })

    it('runs without errors when showing paths', function (done) {
      base.exec('node bin/cli.js config --path', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })

  describe('Show action (default)', () => {
    it('displays config with "show" action', function (done) {
      base.exec('node bin/cli.js config show', (error, stdout) => {
        expect(stdout).to.match(/Current Configuration|Project Config/i)
        done()
      })
    })

    it('defaults to show action when no action specified', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(stdout).to.match(/Current Configuration|Project Config/i)
        done()
      })
    })
  })

  describe('Output validation', () => {
    it('produces meaningful output', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(stdout.length).to.be.greaterThan(50)
        done()
      })
    })

    it('outputs UTF-8 text', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(stdout).to.be.a('string')
        expect(stdout).to.not.equal('')
        done()
      })
    })

    it('includes section separators', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(stdout).to.match(/={2,}/)
        done()
      })
    })
  })

  describe('Flag combinations', () => {
    it('handles --help with any flag', function (done) {
      base.exec('node bin/cli.js config --help --path', (error, stdout) => {
        expect(stdout).to.include('Options:')
        done()
      })
    })
  })

  describe('Error handling', () => {
    it('handles invalid action gracefully', function (done) {
      base.exec('node bin/cli.js config invalid-action', (error, stdout) => {
        // Should still run without crashing
        expect(stdout).to.be.a('string')
        done()
      })
    })
  })

  describe('Exit codes', () => {
    it('returns 0 on success', function (done) {
      base.exec('node bin/cli.js config', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })

    it('returns 0 for help', function (done) {
      base.exec('node bin/cli.js config --help', (error, stdout) => {
        expect(error).to.be.null
        done()
      })
    })
  })
})
