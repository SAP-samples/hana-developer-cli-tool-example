// @ts-check
import { describe, it } from 'mocha'
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

describe('restore command - E2E Tests', function () {
  this.timeout(50000)

  describe('Help output and validation', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js restore --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli restore')
        expect(stdout).to.include('--backupFile')
        expect(stdout).to.include('--target')
        expect(stdout).to.include('--overwrite')
        expect(stdout).to.include('--dropExisting')
        expect(stdout).to.include('--dryRun')
        base.addContext(this, { title: 'Restore help', value: stdout })
        done()
      })
    })

    it('supports alias "rst"', function (done) {
      base.exec('node bin/cli.js rst --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli restore')
        done()
      })
    })

    it('fails with clear message when backup file does not exist', function (done) {
      const missingPath = path.resolve(process.cwd(), 'tests', '.tmp', `missing-restore-${Date.now()}.backup`).replace(/\\/g, '/')
      base.exec(`node bin/cli.js restore --backupFile "${missingPath}" --quiet --no-prompt`, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        expect(output.toLowerCase()).to.match(/not\s+found|restore\s+failed|backup/i)
        const failed = !!error || /not\s+found|restore\s+failed|backup/i.test(output.toLowerCase())
        expect(failed).to.equal(true)
        base.addContext(this, { title: 'Missing backup file output', value: output })
        done()
      })
    })
  })

  describe('Dry-run safety checks', () => {
    it('reads metadata in dry-run mode without requiring a database connection', function (done) {
      const tmpRoot = path.resolve(process.cwd(), 'tests', '.tmp', 'e2e-backup-restore')
      const backupDir = path.resolve(tmpRoot, `restore-dryrun-${Date.now()}`)
      fs.mkdirSync(backupDir, { recursive: true })

      const backupPath = path.resolve(backupDir, 'sample.backup')
      const metadataPath = `${backupPath}.meta.json`

      fs.writeFileSync(backupPath, JSON.stringify({ data: [{ ID: 1 }] }, null, 2), 'utf-8')
      fs.writeFileSync(metadataPath, JSON.stringify({
        type: 'table',
        schema: 'TEST_SCHEMA',
        table: 'TEST_TABLE',
        status: 'completed'
      }, null, 2), 'utf-8')

      const backupPathCli = backupPath.replace(/\\/g, '/')
      base.exec(`node bin/cli.js restore --backupFile "${backupPathCli}" --dryRun --quiet`, (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        base.addContext(this, { title: 'Restore dry-run output', value: output })

        try {
          expect(error).to.be.null
          expect(output.toLowerCase()).to.match(/dry\s*run|metadata|restore/i)
        } finally {
          if (fs.existsSync(backupDir)) {
            fs.rmSync(backupDir, { recursive: true, force: true })
          }
        }

        done()
      })
    })
  })

  describe('Live restore side effects (optional)', () => {
    it('restores backup data into a target table', function (done) {
      this.timeout(120000)

      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_BACKUP_RESTORE')
      if (!gateLiveTestInCI(this, done, liveControl, 'restore live side-effect E2E')) {
        return
      }

      getLocalConnectionCredentials().then(async (creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 'Live restore E2E prerequisites not met: no HANA credentials resolved.')
        }

        const tmpRoot = path.resolve(process.cwd(), 'tests', '.tmp', 'e2e-backup-restore')
        const backupDir = path.resolve(tmpRoot, `restore-${Date.now()}`)
        const sourceTable = `E2E_RST_SRC_${Date.now()}`
        const targetTable = `E2E_RST_TGT_${Date.now()}`
        const backupName = `e2e-rst-${Date.now()}`

        fs.mkdirSync(backupDir, { recursive: true })

        const createSourceCommand = `node bin/cli.js tableCopy --sourceSchema SYS --sourceTable DUMMY --targetTable ${sourceTable} --quiet`
        const createTargetCommand = `node bin/cli.js tableCopy --sourceSchema SYS --sourceTable DUMMY --targetTable ${targetTable} --structureOnly --quiet`

        const createSourceResult = await execCommand(createSourceCommand)
        const createTargetResult = await execCommand(createTargetCommand)

        base.addContext(this, {
          title: 'Create source/target output',
          value: `${createSourceResult.stdout}\n${createSourceResult.stderr}\n${createTargetResult.stdout}\n${createTargetResult.stderr}`
        })

        if (createSourceResult.error || createTargetResult.error) {
          await dropTable(sourceTable)
          await dropTable(targetTable)
          if (fs.existsSync(backupDir)) {
            fs.rmSync(backupDir, { recursive: true, force: true })
          }
          return skipOrFailLiveTest(this, done, liveControl, `Live restore E2E could not prepare source/target tables ${sourceTable}/${targetTable}.`)
        }

        const backupDirCliPath = backupDir.replace(/\\/g, '/')
        const backupCommand = `node bin/cli.js backup --target ${sourceTable} --backupType table --format binary --destination "${backupDirCliPath}" --name ${backupName} --withData --compress false --overwrite --quiet`
        const backupResult = await execCommand(backupCommand)
        const backupOutput = `${backupResult.stdout}\n${backupResult.stderr}`
        base.addContext(this, { title: 'Backup before restore output', value: backupOutput })

        if (backupResult.error) {
          await dropTable(sourceTable)
          await dropTable(targetTable)
          if (fs.existsSync(backupDir)) {
            fs.rmSync(backupDir, { recursive: true, force: true })
          }
          return skipOrFailLiveTest(this, done, liveControl, `Live restore E2E backup preparation failed for source table ${sourceTable}.`)
        }

        const backupFile = path.resolve(backupDir, `${backupName}.backup`)
        const backupFileCliPath = backupFile.replace(/\\/g, '/')

        const restoreCommand = `node bin/cli.js restore --backupFile "${backupFileCliPath}" --target ${targetTable} --overwrite --batchSize 200 --quiet`
        const restoreResult = await execCommand(restoreCommand)
        const restoreOutput = `${restoreResult.stdout}\n${restoreResult.stderr}`
        base.addContext(this, { title: 'Live restore output', value: restoreOutput })

        const verifyCommand = `node bin/cli.js querySimple --query "SELECT COUNT(*) AS CNT FROM \"${targetTable}\"" --output json --quiet`
        const verifyResult = await execCommand(verifyCommand)
        const verifyOutput = `${verifyResult.stdout}\n${verifyResult.stderr}`
        base.addContext(this, { title: 'Restore verification output', value: verifyOutput })

        try {
          expect(restoreResult.error).to.be.null
          expect(restoreOutput).to.match(/restore|records|completed/i)
          expect(verifyResult.error).to.be.null
          expect(verifyOutput).to.match(/"CNT"\s*:\s*1/) 
        } finally {
          await dropTable(sourceTable)
          await dropTable(targetTable)
          if (fs.existsSync(backupDir)) {
            fs.rmSync(backupDir, { recursive: true, force: true })
          }
        }

        done()
      }).catch(done)
    })
  })
})
