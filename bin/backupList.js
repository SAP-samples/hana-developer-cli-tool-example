// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as fs from 'fs'
import * as path from 'path'
import { homedir } from 'os'

export const command = 'backupList [directory]'
export const aliases = ['blist', 'listBackups', 'backups']
export const describe = baseLite.bundle.getText("backupList")

export const builder = baseLite.getBuilder({
  directory: {
    alias: ['dir', 'Directory'],
    type: 'string',
    desc: baseLite.bundle.getText("backupListDirectory")
  },
  backupType: {
    alias: ['type', 'Type'],
    choices: ["table", "schema", "database", "all"],
    default: "all",
    type: 'string',
    desc: baseLite.bundle.getText("backupType")
  },
  sortBy: {
    alias: ['sort', 'Sort'],
    choices: ["name", "date", "size", "type"],
    default: "date",
    type: 'string',
    desc: baseLite.bundle.getText("backupListSortBy")
  },
  order: {
    alias: ['o', 'Order'],
    choices: ["asc", "desc"],
    default: "desc",
    type: 'string',
    desc: baseLite.bundle.getText("backupListOrder")
  },
  limit: {
    alias: ['l', 'Limit'],
    type: 'number',
    default: 50,
    desc: baseLite.bundle.getText("limit")
  },
  showDetails: {
    alias: ['details', 'Details'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("backupListShowDetails")
  }
})

export let inputPrompts = {
  directory: {
    description: baseLite.bundle.getText("backupListDirectory"),
    type: 'string',
    required: false
  },
  backupType: {
    description: baseLite.bundle.getText("backupType"),
    type: 'string',
    required: false
  },
  sortBy: {
    description: baseLite.bundle.getText("backupListSortBy"),
    type: 'string',
    required: false
  },
  order: {
    description: baseLite.bundle.getText("backupListOrder"),
    type: 'string',
    required: false
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: false
  },
  showDetails: {
    description: baseLite.bundle.getText("backupListShowDetails"),
    type: 'boolean',
    required: false
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, listBackups, inputPrompts)
}

/**
 * List available backups
 * @param {object} prompts - Input prompts with list configuration
 * @returns {Promise<Array>} - Array of backup information
 */
export async function listBackups(prompts) {
  const base = await import('../utils/base.js')

  try {
    base.debug('listBackups')
    
    // Determine backup directory
    const defaultBackupDir = path.join(homedir(), '.hana-cli', 'backups')
    const backupDir = prompts.directory || defaultBackupDir

    // Check if directory exists
    if (!fs.existsSync(backupDir)) {
      console.log(base.bundle.getText("backupListNoDirectory", [backupDir]))
      return []
    }

    console.log(base.bundle.getText("backupListScanning", [backupDir]))

    // Scan for backup files
    const files = fs.readdirSync(backupDir)
    const backupFiles = files.filter(file => 
      file.endsWith('.backup') || 
      file.endsWith('.backup.meta.json') ||
      file.endsWith('.manifest.json')
    )

    // Extract unique backup names
    const backupNames = new Set()
    backupFiles.forEach(file => {
      const baseName = file
        .replace('.meta.json', '')
        .replace('.manifest.json', '')
        .replace('.backup', '')
      backupNames.add(baseName)
    })

    // Collect backup information
    const backups = []
    for (const backupName of backupNames) {
      const backupPath = path.join(backupDir, `${backupName}.backup`)
      const metadataPath = `${backupPath}.meta.json`
      const manifestPath = `${backupPath}.manifest.json`

      let backupInfo = {
        name: backupName,
        path: backupPath,
        exists: fs.existsSync(backupPath)
      }

      // Load metadata if available
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
          backupInfo = { ...backupInfo, ...metadata }
        } catch (error) {
          backupInfo.metadataError = error.message
        }
      }

      // Check for manifest (schema or database backup)
      if (fs.existsSync(manifestPath)) {
        backupInfo.hasManifest = true
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
          if (manifest.tables) {
            backupInfo.tableCount = manifest.tables.length
          }
          if (manifest.schemas) {
            backupInfo.schemaCount = manifest.schemas.length
          }
        } catch (error) {
          backupInfo.manifestError = error.message
        }
      }

      // Get file size
      if (backupInfo.exists) {
        const stats = fs.statSync(backupPath)
        backupInfo.size = stats.size
        backupInfo.sizeFormatted = formatBytes(stats.size)
        backupInfo.created = stats.birthtime
        backupInfo.modified = stats.mtime
      }

      // Check for CSV files
      const csvPath = backupPath.replace('.backup', '.csv')
      const csvGzPath = `${csvPath}.gz`
      if (fs.existsSync(csvGzPath)) {
        backupInfo.dataFile = csvGzPath
        backupInfo.dataSize = fs.statSync(csvGzPath).size
        backupInfo.dataSizeFormatted = formatBytes(backupInfo.dataSize)
      } else if (fs.existsSync(csvPath)) {
        backupInfo.dataFile = csvPath
        backupInfo.dataSize = fs.statSync(csvPath).size
        backupInfo.dataSizeFormatted = formatBytes(backupInfo.dataSize)
      }

      backups.push(backupInfo)
    }

    // Filter by type if specified
    let filteredBackups = backups
    if (prompts.backupType && prompts.backupType !== 'all') {
      filteredBackups = backups.filter(b => b.type === prompts.backupType)
    }

    // Sort backups
    filteredBackups.sort((a, b) => {
      let comparison = 0
      switch (prompts.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(a.timestamp || a.created || 0).getTime() - new Date(b.timestamp || b.created || 0).getTime()
          break
        case 'size':
          comparison = (a.size || 0) - (b.size || 0)
          break
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '')
          break
      }
      return prompts.order === 'asc' ? comparison : -comparison
    })

    // Limit results
    const limitedBackups = filteredBackups.slice(0, prompts.limit)

    // Display results
    console.log(`\n${base.bundle.getText("backupListFound", [limitedBackups.length, backups.length])}`)
    
    if (prompts.showDetails) {
      // Show detailed view
      limitedBackups.forEach(backup => {
        console.log('\n' + '='.repeat(80))
        console.log(`${base.bundle.getText("backupName")}: ${backup.name}`)
        console.log(`${base.bundle.getText("backupType")}: ${backup.type || 'Unknown'}`)
        console.log(`${base.bundle.getText("backupTarget")}: ${backup.target || 'N/A'}`)
        console.log(`${base.bundle.getText("backupSchema")}: ${backup.schema || 'N/A'}`)
        console.log(`${base.bundle.getText("backupTimestamp")}: ${backup.timestamp || backup.created || 'Unknown'}`)
        console.log(`${base.bundle.getText("backupStatus")}: ${backup.status || 'Unknown'}`)
        console.log(`${base.bundle.getText("backupSize")}: ${backup.sizeFormatted || 'N/A'}`)
        if (backup.dataSizeFormatted) {
          console.log(`${base.bundle.getText("backupDataSize")}: ${backup.dataSizeFormatted}`)
        }
        if (backup.tableCount) {
          console.log(`${base.bundle.getText("backupTableCount")}: ${backup.tableCount}`)
        }
        if (backup.schemaCount) {
          console.log(`${base.bundle.getText("backupSchemaCount")}: ${backup.schemaCount}`)
        }
        console.log(`${base.bundle.getText("backupPath")}: ${backup.path}`)
      })
      console.log('\n' + '='.repeat(80))
    } else {
      // Show summary table
      const summaryBackups = limitedBackups.map(b => ({
        NAME: b.name,
        TYPE: b.type || 'Unknown',
        TARGET: b.target || 'N/A',
        TIMESTAMP: b.timestamp ? new Date(b.timestamp).toLocaleString() : 'Unknown',
        STATUS: b.status || 'Unknown',
        SIZE: b.sizeFormatted || 'N/A',
        TABLES: b.tableCount || '-',
        SCHEMAS: b.schemaCount || '-'
      }))
      base.outputTableFancy(summaryBackups)
    }

    return limitedBackups

  } catch (error) {
    console.error(base.bundle.getText("backupListFailed", [error.message]))
    throw error
  }
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
