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

describe('massExport command - E2E Tests', function () {
  this.timeout(20000)

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js massExport --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli massExport [schema] [object]')
        expect(stdout).to.include('--objectType')
        expect(stdout).to.include('--folder')
        expect(stdout).to.include('--includeData')
        base.addContext(this, { title: 'massExport Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js massExport --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/mass-operations\/mass-export/i)
        expect(stdout).to.include('hana-cli export --help')
        expect(stdout).to.include('hana-cli massDelete --help')
        done()
      })
    })
  })

  describe('Aliases', () => {
    const aliases = ['me', 'mexport', 'massExp', 'massexp']

    aliases.forEach(alias => {
      it(`supports alias "${alias}"`, function (done) {
        base.exec(`node bin/cli.js ${alias} --help`, (error, stdout) => {
          expect(error).to.be.null
          expect(stdout).to.include('hana-cli massExport [schema] [object]')
          done()
        })
      })
    })
  })

  describe('Live smoke run (optional)', () => {
    it('executes with explicit arguments and returns a non-crashing result', function (done) {
      this.timeout(30000)

      const forceLiveInCI = process.env.HANA_CLI_E2E_LIVE_MASSEXPORT === 'true'
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

      const outputFolder = path.resolve(process.cwd(), 'tests', '.tmp', 'mass-export-e2e')
      fs.mkdirSync(outputFolder, { recursive: true })
      const outputFolderCliPath = outputFolder.replace(/\\/g, '/')

      base.exec(`node bin/cli.js massExport --schema SYS --object DUMMY --format csv --directory ${outputFolderCliPath} --quiet`, (error, stdout, stderr) => {
        expect(error).to.be.null

        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'massExport live output', value: output })

        expect(output).to.match(/No objects found matching the specified criteria|Export complete|objects exported/i)
        done()
      })
    })
  })
})