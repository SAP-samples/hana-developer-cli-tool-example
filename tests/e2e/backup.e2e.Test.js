// @ts-check
import * as base from '../base.js'
import { expect } from 'chai'
import fs from 'fs'
import path from 'path'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

/**
 * @param {string} command
 * @returns {Promise<{ error: Error | null, stdout: string, stderr: string }>}
 */
function execCommand(command) {
  return new Promise((resolve) => {
    base.exec(command, (error, stdout, stderr) => {
      resolve({
        error: /** @type {Error | null} */ (error),
        stdout: stdout || '',
        stderr: stderr || ''
      })
    })
  })
}

/**
 * @param {string} tableName
 * @returns {Promise<void>}
 */
async function dropTable(tableName) {
  const dropCommand = `node bin/cli.js massDelete --schema **CURRENT_SCHEMA** --object ${tableName} --objectType TABLE --force --quiet`
  await execCommand(dropCommand)
}

describe('backup command - E2E Tests', function () {
  this.timeout(45000)

  describe('Help output and validation', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js backup --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli backup')
        expect(stdout).to.include('--target')
        expect(stdout).to.include('--backupType')
        expect(stdout).to.include('--destination')
        expect(stdout).to.include('--overwrite')
        expect(stdout).to.include('choices: "table", "schema", "database"')
        base.addContext(this, { title: 'Backup help', value: stdout })
        done()
      })
    })

    it('supports alias "bkp"', function (done) {
      base.exec('node bin/cli.js bkp --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli backup')
        done()
      })
    })

    it('rejects invalid backupType values', function (done) {
      base.exec('node bin/cli.js backup --target DUMMY --backupType invalid --quiet --no-prompt', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output).to.include('Invalid values:')
        expect(output).to.include('Argument: backupType')
        expect(output).to.include('Choices: "table", "schema", "database"')
        base.addContext(this, { title: 'Invalid backupType output', value: output })
        done()
      })
    })
  })

  describe('Live backup side effects (optional)', () => {
    it('creates backup artifacts for a live table backup', function (done) {
      this.timeout(90000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_BACKUP_RESTORE')
      if (!gateLiveTestInCI(this, done, liveControl, 'backup live side-effect E2E')) {
        return
      }

      getLocalConnectionCredentials().then(async (creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live backup E2E prerequisites not met: no HANA credentials resolved.')
        }

        const tmpRoot = path.resolve(process.cwd(), 'tests', '.tmp', 'e2e-backup-restore')
        const backupDir = path.resolve(tmpRoot, `backup-${Date.now()}`)
        const sourceTable = `E2E_BKP_SRC_${Date.now()}`
        const backupName = `e2e-bkp-${Date.now()}`

        fs.mkdirSync(backupDir, { recursive: true })

        const createTableCommand = `node bin/cli.js tableCopy --sourceSchema SYS --sourceTable DUMMY --targetTable ${sourceTable} --quiet`
        const createResult = await execCommand(createTableCommand)
        const createOutput = `${createResult.stdout}\n${createResult.stderr}`
        base.addContext(this, { title: 'Create source table output', value: createOutput })

        if (createResult.error) {
          return skipOrFailLiveTest(this, done, liveControl, `Live backup E2E could not create source table ${sourceTable}.`)
        }

        const backupDirCliPath = backupDir.replace(/\\/g, '/')
        const backupCommand = `node bin/cli.js backup --target ${sourceTable} --backupType table --format binary --destination "${backupDirCliPath}" --name ${backupName} --withData --compress false --overwrite --quiet`

        const backupResult = await execCommand(backupCommand)
        const backupOutput = `${backupResult.stdout}\n${backupResult.stderr}`
        base.addContext(this, { title: 'Live backup output', value: backupOutput })

        const backupFile = path.resolve(backupDir, `${backupName}.backup`)
        const metadataFile = `${backupFile}.meta.json`

        try {
          expect(backupResult.error).to.be.null
          expect(fs.existsSync(backupFile)).to.equal(true)
          expect(fs.existsSync(metadataFile)).to.equal(true)

          const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'))
          expect(metadata).to.have.property('status', 'completed')
          expect(metadata).to.have.property('type', 'table')
          expect(metadata).to.have.property('target', sourceTable)
        } finally {
          await dropTable(sourceTable)
          if (fs.existsSync(backupDir)) {
            fs.rmSync(backupDir, { recursive: true, force: true })
          }
        }

        done()
      }).catch(done)
    })
  })
})
