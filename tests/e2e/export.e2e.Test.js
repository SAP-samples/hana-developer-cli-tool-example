// @ts-check
import { describe, it } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'
import fs from 'fs'
import path from 'path'

/**
 * @returns {{connection: string, user: string, password: string} | null}
 */
function getLocalConnectionCredentials() {
  const candidateFiles = ['default-env-admin.json', 'default-env.json']

  for (const fileName of candidateFiles) {
    const filePath = path.resolve(process.cwd(), fileName)
    if (!fs.existsSync(filePath)) {
      continue
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(content)
      const credentials = parsed?.VCAP_SERVICES?.hana?.[0]?.credentials
      const host = credentials?.host
      const port = credentials?.port
      const user = credentials?.user
      const password = credentials?.password

      if (host && port && user && password) {
        return {
          connection: `${host}:${port}`,
          user,
          password
        }
      }
    } catch {
      // Ignore invalid files and continue to next candidate
    }
  }

  return null
}

describe('export command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js export --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli export')
        expect(stdout).to.include('--table')
        expect(stdout).to.include('--output')
        expect(stdout).to.include('--format')
        expect(stdout).to.include('choices: "csv", "excel", "json"')
        base.addContext(this, { title: 'Export Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js export --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/data-tools\/export/i)
        expect(stdout).to.include('hana-cli import --help')
        expect(stdout).to.include('hana-cli massExport --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "exp"', function (done) {
      base.exec('node bin/cli.js exp --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli export')
        done()
      })
    })

    it('supports alias "downloadData"', function (done) {
      base.exec('node bin/cli.js downloadData --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli export')
        done()
      })
    })
  })

  describe('Validation', () => {
    it('rejects unsupported format values', function (done) {
      base.exec('node bin/cli.js export --table DUMMY --output out.tmp --format xml --quiet', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output).to.include('Invalid values:')
        expect(output).to.include('Argument: format')
        expect(output).to.include('Choices: "csv", "excel", "json"')
        base.addContext(this, { title: 'Invalid format output', value: output })
        done()
      })
    })
  })

  describe('Live export (optional)', () => {
    it('exports one row from SYS.DUMMY to JSON file', function (done) {
      this.timeout(30000)

      const forceLiveInCI = process.env.HANA_CLI_E2E_LIVE_EXPORT === 'true'
      const isCI = process.env.CI === 'true'
      if (isCI && !forceLiveInCI) {
        this.skip()
        return done()
      }

      const creds = getLocalConnectionCredentials()
      if (!creds) {
        this.skip()
        return done()
      }

      const tmpDir = path.resolve(process.cwd(), 'tests', '.tmp')
      fs.mkdirSync(tmpDir, { recursive: true })

      const outputFile = path.resolve(tmpDir, `e2e-export-${Date.now()}.json`)
      const outputFileCliPath = outputFile.replace(/\\/g, '/')

      const command = `node bin/cli.js export --schema SYS --table DUMMY --output "${outputFileCliPath}" --format json --limit 1 --quiet`

      base.exec(command, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Live export output', value: output })

        try {
          expect(error).to.be.null
          expect(output).to.match(/Starting export for table:\s+DUMMY/i)
          expect(output).to.match(/Export complete:\s+1\s+rows exported/i)
          expect(fs.existsSync(outputFile)).to.equal(true)

          const content = fs.readFileSync(outputFile, 'utf-8')
          const parsed = JSON.parse(content)
          expect(parsed).to.be.an('array').that.is.not.empty
          expect(parsed[0]).to.have.property('DUMMY')
        } finally {
          if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile)
          }
        }

        done()
      })
    })
  })
})