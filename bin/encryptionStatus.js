// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'encryptionStatus'
export const aliases = ['encryption', 'encrypt']
export const describe = baseLite.bundle.getText("encryptionStatus")

const encryptionStatusOptions = {
  scope: {
    alias: ['s'],
    type: 'string',
    choices: ['all', 'data', 'log', 'backup', 'network'],
    default: 'all',
    desc: baseLite.bundle.getText("encryptionScope")
  },
  details: {
    alias: ['d'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("showDetails")
  }
}

export const builder = (yargs) => yargs.options(baseLite.getBuilder(encryptionStatusOptions)).wrap(160).example('hana-cli encryptionStatus --scope backup --details', baseLite.bundle.getText("encryptionStatusExample")).wrap(160).epilog(buildDocEpilogue('encryptionStatus', 'security', ['certificates', 'healthCheck']))

export const encryptionStatusBuilderOptions = baseLite.getBuilder(encryptionStatusOptions)

export let inputPrompts = {
  scope: {
    description: baseLite.bundle.getText("encryptionScope"),
    type: 'string',
    required: true
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, checkEncryptionStatus, inputPrompts, true, true, encryptionStatusBuilderOptions)
}

/**
 * Check encryption status of tables and backups
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function checkEncryptionStatus(prompts) {
  const base = await import('../utils/base.js')
  base.debug('checkEncryptionStatus')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    try {
      const scope = prompts.scope || 'all'
      const showDetails = prompts.details || false

      base.output('')
      base.output(base.colors.bold(base.bundle.getText('encryptionStatusHeader')))
      base.output('')

      // Check different encryption scopes
      if (scope === 'all' || scope === 'data') {
        await checkDataEncryption(db, showDetails, base)
      }

      if (scope === 'all' || scope === 'log') {
        await checkLogEncryption(db, showDetails, base)
      }

      if (scope === 'all' || scope === 'backup') {
        await checkBackupEncryption(db, showDetails, base)
      }

      if (scope === 'all' || scope === 'network') {
        await checkNetworkEncryption(db, showDetails, base)
      }

      // Overall encryption summary
      await showEncryptionSummary(db, base)

      await base.end()
    } catch (error) {
      await base.error(error)
    }
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Check data volume encryption status
 */
async function checkDataEncryption(db, showDetails, base) {
  base.output(base.colors.bold(base.bundle.getText('dataEncryptionStatus')))

  // Check persistence encryption configuration
  const persistenceEncQuery = `
    SELECT KEY, VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'persistence'
      AND KEY IN ('encryption', 'encryption_algorithm', 'encryption_key_type')
    ORDER BY KEY
  `

  const persistenceConfig = await db.execSQL(persistenceEncQuery)

  if (persistenceConfig && persistenceConfig.length > 0) {
    base.outputTableFancy(persistenceConfig.map(r => ({
      'Parameter': r.KEY,
      'Value': r.VALUE
    })))
  } else {
    base.output(base.colors.yellow('  ' + base.bundle.getText('dataEncryptionNotConfigured')))
  }

  base.output('')

  // Check encrypted data volumes
  if (showDetails) {
    const volumeEncQuery = `
      SELECT 
        VOLUME_ID,
        SERVICE_NAME,
        PATH,
        TOTAL_SIZE,
        USED_SIZE
      FROM SYS.M_VOLUMES
      WHERE TYPE = 'DATA'
      ORDER BY VOLUME_ID
    `

    const volumes = await db.execSQL(volumeEncQuery)

    if (volumes && volumes.length > 0) {
      base.output(base.bundle.getText('dataVolumes') + ':')
      const displayVolumes = volumes.map(row => ({
        'Volume ID': row.VOLUME_ID,
        'Service': row.SERVICE_NAME,
        'Total Size (GB)': (row.TOTAL_SIZE / (1024 * 1024 * 1024)).toFixed(2),
        'Used Size (GB)': (row.USED_SIZE / (1024 * 1024 * 1024)).toFixed(2)
      }))
      base.outputTableFancy(displayVolumes)
      base.output('')
    }
  }
}

/**
 * Check log volume encryption status
 */
async function checkLogEncryption(db, showDetails, base) {
  base.output(base.colors.bold(base.bundle.getText('logEncryptionStatus')))

  // Check log encryption configuration
  const logEncQuery = `
    SELECT KEY, VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'persistence'
      AND KEY LIKE '%log%'
      AND KEY LIKE '%encrypt%'
    ORDER BY KEY
  `

  const logConfig = await db.execSQL(logEncQuery)

  if (logConfig && logConfig.length > 0) {
    base.outputTableFancy(logConfig.map(r => ({
      'Parameter': r.KEY,
      'Value': r.VALUE
    })))
  } else {
    base.output(base.colors.yellow('  ' + base.bundle.getText('logEncryptionNotConfigured')))
  }

  base.output('')

  // Check log volumes
  if (showDetails) {
    const logVolumesQuery = `
      SELECT 
        VOLUME_ID,
        SERVICE_NAME,
        PATH,
        TOTAL_SIZE,
        USED_SIZE
      FROM SYS.M_VOLUMES
      WHERE TYPE = 'LOG'
      ORDER BY VOLUME_ID
    `

    const logVolumes = await db.execSQL(logVolumesQuery)

    if (logVolumes && logVolumes.length > 0) {
      base.output(base.bundle.getText('logVolumes') + ':')
      const displayVolumes = logVolumes.map(row => ({
        'Volume ID': row.VOLUME_ID,
        'Service': row.SERVICE_NAME,
        'Total Size (GB)': (row.TOTAL_SIZE / (1024 * 1024 * 1024)).toFixed(2),
        'Used Size (GB)': (row.USED_SIZE / (1024 * 1024 * 1024)).toFixed(2)
      }))
      base.outputTableFancy(displayVolumes)
      base.output('')
    }
  }
}

/**
 * Check backup encryption status
 */
async function checkBackupEncryption(db, showDetails, base) {
  base.output(base.colors.bold(base.bundle.getText('backupEncryptionStatus')))

  // Check backup encryption configuration
  const backupEncQuery = `
    SELECT KEY, VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'backup'
      AND KEY LIKE '%encrypt%'
    ORDER BY KEY
  `

  const backupConfig = await db.execSQL(backupEncQuery)

  if (backupConfig && backupConfig.length > 0) {
    base.outputTableFancy(backupConfig.map(r => ({
      'Parameter': r.KEY,
      'Value': r.VALUE
    })))
  } else {
    base.output(base.colors.yellow('  ' + base.bundle.getText('backupEncryptionNotConfigured')))
  }

  base.output('')

  // Check recent backups encryption status
  if (showDetails) {
    const backupsQuery = `
      SELECT 
        BACKUP_ID,
        ENTRY_TYPE_NAME,
        STATE_NAME,
        SYS_START_TIME
      FROM SYS.M_BACKUP_CATALOG
      WHERE ENTRY_TYPE_NAME = 'complete data backup'
      ORDER BY SYS_START_TIME DESC
      LIMIT 5
    `

    const backups = await db.execSQL(backupsQuery)

    if (backups && backups.length > 0) {
      base.output(base.bundle.getText('recentBackups') + ':')
      const displayBackups = backups.map(row => ({
        'Backup ID': row.BACKUP_ID,
        'Type': row.ENTRY_TYPE_NAME,
        'State': row.STATE_NAME,
        'Start Time': row.SYS_START_TIME
      }))
      base.outputTableFancy(displayBackups)
      base.output('')
    }
  }
}

/**
 * Check network encryption status
 */
async function checkNetworkEncryption(db, showDetails, base) {
  base.output(base.colors.bold(base.bundle.getText('networkEncryptionStatus')))

  // Check SSL/TLS configuration
  const sslQuery = `
    SELECT KEY, VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'communication'
      AND KEY IN ('ssl', 'sslenforce', 'sslcipher', 'sslprotocol')
    ORDER BY KEY
  `

  const sslConfig = await db.execSQL(sslQuery)

  if (sslConfig && sslConfig.length > 0) {
    base.outputTableFancy(sslConfig.map(r => ({
      'Parameter': r.KEY,
      'Value': r.VALUE
    })))
  } else {
    base.output(base.colors.yellow('  ' + base.bundle.getText('sslNotConfigured')))
  }

  base.output('')

  // Check internal network encryption
  if (showDetails) {
    const internalEncQuery = `
      SELECT KEY, VALUE
      FROM SYS.M_INIFILE_CONTENTS
      WHERE FILE_NAME = 'global.ini'
        AND SECTION = 'communication'
        AND KEY LIKE '%internal%'
      ORDER BY KEY
    `

    const internalConfig = await db.execSQL(internalEncQuery)

    if (internalConfig && internalConfig.length > 0) {
      base.output(base.bundle.getText('internalNetworkEncryption') + ':')
      base.outputTableFancy(internalConfig.map(r => ({
        'Parameter': r.KEY,
        'Value': r.VALUE
      })))
      base.output('')
    }
  }
}

/**
 * Show overall encryption summary
 */
async function showEncryptionSummary(db, base) {
  base.output(base.colors.bold(base.bundle.getText('encryptionSummary')))

  const summary = []

  // Check data encryption
  const dataEncQuery = `
    SELECT VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'persistence'
      AND KEY = 'encryption'
  `
  const dataEnc = await db.execSQL(dataEncQuery)
  const dataEncEnabled = dataEnc && dataEnc.length > 0 && dataEnc[0].VALUE === 'on'

  summary.push({
    'Component': base.bundle.getText('dataVolumes'),
    'Status': dataEncEnabled ? base.colors.green('✓ Enabled') : base.colors.red('✗ Disabled'),
    'Recommendation': dataEncEnabled ? base.bundle.getText('good') : base.bundle.getText('enableEncryption')
  })

  // Check SSL
  const sslQuery = `
    SELECT VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'communication'
      AND KEY = 'ssl'
  `
  const ssl = await db.execSQL(sslQuery)
  const sslEnabled = ssl && ssl.length > 0 && ssl[0].VALUE === 'on'

  summary.push({
    'Component': base.bundle.getText('networkCommunication'),
    'Status': sslEnabled ? base.colors.green('✓ Enabled') : base.colors.red('✗ Disabled'),
    'Recommendation': sslEnabled ? base.bundle.getText('good') : base.bundle.getText('enableSSL')
  })

  // Check backup encryption
  const backupQuery = `
    SELECT VALUE
    FROM SYS.M_INIFILE_CONTENTS
    WHERE FILE_NAME = 'global.ini'
      AND SECTION = 'backup'
      AND KEY LIKE '%encrypt%'
  `
  const backup = await db.execSQL(backupQuery)
  const backupEncEnabled = backup && backup.length > 0

  summary.push({
    'Component': base.bundle.getText('backups'),
    'Status': backupEncEnabled ? base.colors.green('✓ Configured') : base.colors.yellow('⚠ Check Config'),
    'Recommendation': backupEncEnabled ? base.bundle.getText('good') : base.bundle.getText('reviewBackupEncryption')
  })

  base.outputTableFancy(summary)
  base.output('')

  // Overall assessment
  const allEnabled = dataEncEnabled && sslEnabled && backupEncEnabled
  if (allEnabled) {
    base.output(base.colors.green('✅ ' + base.bundle.getText('encryptionFullyEnabled')))
  } else {
    base.output(base.colors.yellow('⚠️  ' + base.bundle.getText('encryptionPartiallyEnabled')))
    base.output('   ' + base.bundle.getText('reviewEncryptionSettings'))
  }

  base.output('')
}
