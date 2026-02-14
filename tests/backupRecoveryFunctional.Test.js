// @ts-nocheck
import chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { describe, it, beforeEach, afterEach } from 'mocha'
import sinon from 'sinon'
import * as fs from 'fs'
import * as path from 'path'
import { tmpdir } from 'os'

chai.use(chaiAsPromised.default)
const expect = chai.expect

/**
 * @test Backup and Recovery Functional Tests
 * Test suite for backup/restore/list/status functionality with mocks
 */
describe('@all @backup @restore', () => {
  let sandbox
  let tempDir
  let backupCmd
  let restoreCmd
  let backupListCmd
  let backupStatusCmd
  let dbClientClass

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    tempDir = fs.mkdtempSync(path.join(tmpdir(), 'hana-cli-test-'))
    backupCmd = await import('../bin/backup.js')
    restoreCmd = await import('../bin/restore.js')
    backupListCmd = await import('../bin/backupList.js')
    backupStatusCmd = await import('../bin/backupStatus.js')
    dbClientClass = (await import('../utils/database/index.js')).default
  })

  afterEach(() => {
    sandbox.restore()
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  it('creates a table backup (binary format)', async () => {
    const db = makeDbStub({
      tableColumns: [
        {
          COLUMN_NAME: 'ID',
          DATA_TYPE_NAME: 'INTEGER',
          LENGTH: 10,
          SCALE: 0,
          IS_NULLABLE: 'FALSE',
          DEFAULT_VALUE: null
        }
      ],
      tableData: [{ ID: 1 }]
    })

    const dbClient = makeDbClient(db)
    sandbox.stub(dbClientClass, 'getNewClient').resolves(dbClient)

    const result = await backupCmd.createBackup({
      target: 'TEST_TABLE',
      backupType: 'table',
      format: 'binary',
      destination: tempDir,
      compress: false,
      withData: true,
      schema: 'TEST_SCHEMA'
    })

    const files = fs.readdirSync(tempDir)
    const backupFile = files.find(file => file.endsWith('.backup'))

    expect(result.status).to.equal('completed')
    expect(backupFile).to.exist
    expect(fs.existsSync(path.join(tempDir, `${backupFile}.meta.json`))).to.be.true
  })

  it('lists backups from a directory', async () => {
    const backupPath = path.join(tempDir, 'sample.backup')
    fs.writeFileSync(backupPath, JSON.stringify({ data: [{ ID: 1 }] }, null, 2))
    fs.writeFileSync(`${backupPath}.meta.json`, JSON.stringify({
      name: 'sample',
      type: 'table',
      target: 'TEST_TABLE',
      schema: 'TEST_SCHEMA',
      status: 'completed'
    }, null, 2))

    const result = await backupListCmd.listBackups({
      directory: tempDir,
      backupType: 'all',
      sortBy: 'name',
      order: 'asc',
      limit: 10,
      showDetails: false
    })

    expect(result.length).to.equal(1)
    expect(result[0].type).to.equal('table')
    expect(result[0].target).to.equal('TEST_TABLE')
  })

  it('restores a table backup with inserts', async () => {
    const backupPath = path.join(tempDir, 'restoreTest.backup')
    const metadata = {
      type: 'table',
      schema: 'TEST_SCHEMA',
      table: 'RESTORE_TABLE',
      columns: [
        {
          COLUMN_NAME: 'ID',
          DATA_TYPE_NAME: 'INTEGER',
          LENGTH: 10,
          SCALE: 0,
          IS_NULLABLE: 'FALSE',
          DEFAULT_VALUE: null
        }
      ]
    }

    fs.writeFileSync(backupPath, JSON.stringify({ data: [{ ID: 1 }] }, null, 2))
    fs.writeFileSync(`${backupPath}.meta.json`, JSON.stringify(metadata, null, 2))

    const db = makeDbStub({
      tableExistsCount: 0
    })

    const dbClient = makeDbClient(db)
    sandbox.stub(dbClientClass, 'getNewClient').resolves(dbClient)

    const result = await restoreCmd.restoreBackup({
      backupFile: backupPath,
      batchSize: 1000,
      overwrite: false,
      dropExisting: false,
      continueOnError: false,
      dryRun: false
    })

    expect(result.status).to.equal('completed')
    expect(result.recordsInserted).to.equal(1)
  })

  it('returns backup status summary from catalog', async () => {
    const db = makeDbStub({
      backupCatalog: [
        {
          BACKUP_ID: 1,
          ENTRY_TYPE_NAME: 'complete data backup',
          SYS_START_TIME: new Date().toISOString(),
          SYS_END_TIME: new Date().toISOString(),
          STATE_NAME: 'successful',
          COMMENT: null,
          MESSAGE: 'OK',
          BACKUP_SIZE: 1024,
          BACKUP_SIZE_COMPRESSED: 512,
          DESTINATION_TYPE_NAME: 'file'
        }
      ],
      backupProgress: [],
      backupConfig: [
        { KEY: 'basepath', VALUE: '/backups', LAYER_NAME: 'SYSTEM', SECTION: 'backup' }
      ],
      lastSuccessful: [
        { ENTRY_TYPE_NAME: 'complete data backup', LAST_SUCCESSFUL_BACKUP: new Date().toISOString() }
      ]
    })

    const dbClient = makeDbClient(db)
    sandbox.stub(dbClientClass, 'getNewClient').resolves(dbClient)

    const summary = await backupStatusCmd.getBackupStatus({
      catalogOnly: true,
      limit: 5,
      backupType: 'all',
      status: 'all',
      days: 7
    })

    expect(summary.recentBackups).to.equal(1)
    expect(summary.successfulBackups).to.equal(1)
  })
})

function makeDbClient(db) {
  return {
    connect: async () => {},
    disconnect: async () => {},
    getDB: () => db
  }
}

function makeDbStub({
  tableColumns = [],
  tableData = [],
  tableExistsCount = 0,
  backupCatalog = [],
  backupProgress = [],
  backupConfig = [],
  lastSuccessful = []
} = {}) {
  const statementExecPromisified = sinon.stub()
  statementExecPromisified.callsFake(async (statement) => {
    if (statement.includes('FROM TABLE_COLUMNS')) {
      return tableColumns
    }
    if (statement.includes('SELECT * FROM')) {
      return tableData
    }
    if (statement.includes('FROM TABLES') && statement.includes('COUNT')) {
      return [{ COUNT: tableExistsCount }]
    }
    if (statement.includes('FROM M_BACKUP_CATALOG') && statement.includes('MAX')) {
      return lastSuccessful
    }
    if (statement.includes('FROM M_BACKUP_CATALOG')) {
      return backupCatalog
    }
    if (statement.includes('FROM M_BACKUP_PROGRESS')) {
      return backupProgress
    }
    if (statement.includes("FROM M_INIFILE_CONTENTS")) {
      return backupConfig
    }
    return []
  })

  return {
    preparePromisified: async (query) => query,
    statementExecPromisified
  }
}
