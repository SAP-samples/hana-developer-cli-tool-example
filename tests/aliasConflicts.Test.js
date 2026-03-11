// @ts-check

import yargs from 'yargs/yargs'
import path from 'path'
import { pathToFileURL } from 'url'
import * as assert from 'assert'
import { commandMap } from '../bin/commandMap.js'

/**
 * Build unique command module file list from command map values.
 * @returns {string[]}
 */
function getUniqueCommandFiles() {
  return [...new Set(Object.values(commandMap))]
}

/**
 * Extract command name token from yargs command export.
 * @param {string} commandSignature
 * @returns {string}
 */
function getCommandToken(commandSignature) {
  return String(commandSignature || '').trim().split(/\s+/)[0]
}

describe('@all alias conflict guardrails', function () {
  this.timeout(20000)

  const knownCommandAliasConflicts = new Set([
    'changes -> ./openChangeLog.js and ./changeLog.js',
    'changeLog -> ./openChangeLog.js and ./changeLog.js',
    'changelog -> ./openChangeLog.js and ./changeLog.js',
    'c -> ./connect.js and ./connections.js',
    'dataCompare -> ./compareData.js and ./dataDiff.js',
    'docs -> ./generateDocs.js and ./viewDocs.js',
    'documentation -> ./helpDocu.js and ./viewDocs.js',
    'iniFiles -> ./iniContents.js and ./iniFiles.js',
    'if -> ./iniContents.js and ./iniFiles.js',
    'inifiles -> ./iniContents.js and ./iniFiles.js',
    'ini -> ./iniContents.js and ./iniFiles.js',
    'if -> ./iniContents.js and ./inspectFunction.js',
    'mu -> ./massUpdate.js and ./massUsers.js',
    'readme -> ./readMe.js and ./openReadMe.js',
    'listschemas -> ./schemas.js and ./hanaCloudSchemaInstances.js',
    'listschemasui -> ./schemasUI.js and ./hanaCloudSchemaInstancesUI.js',
    's -> ./schemas.js and ./status.js'
  ])

  const knownOptionAliasConflicts = new Set([
    './auditLog.js: -a used by both admin and action',
    './auditLog.js: -d used by both debug and days',
    './adminHDI.js: -p used by both profile and password',
    './blocking.js: -d used by both debug and details',
    './callProcedure.js: -p used by both procedure and profile',
    './connections.js: -a used by both admin and application',
    './createXSAAdmin.js: -p used by both profile and password',
    './crashDumps.js: -d used by both debug and days',
    './encryptionStatus.js: -d used by both debug and details',
    './export.js: -d used by both debug and delimiter',
    './ftIndexes.js: -d used by both debug and details',
    './grantChains.js: -d used by both debug and depth',
    './inspectProcedure.js: -p used by both profile and procedure',
    './longRunning.js: -d used by both debug and duration',
    './massRename.js: -p used by both profile and prefix',
    './massUsers.js: -p used by both profile and password',
    './procedures.js: -p used by both procedure and profile',
    './pwdPolicy.js: -p used by both profile and policy',
    './pwdPolicy.js: -d used by both debug and details',
    './replicationStatus.js: -d used by both debug and detailed',
    './securityScan.js: -d used by both debug and detailed',
    './sdiTasks.js: -a used by both admin and action',
    './status.js: -p used by both profile and priv',
    './tableHotspots.js: -p used by both includePartitions and profile',
    './tableGroups.js: -a used by both admin and action',
    './xsaServices.js: -a used by both admin and action',
    './xsaServices.js: -d used by both debug and details',
    './workloadManagement.js: -p used by both profile and priority',
    './workloadManagement.js: -a used by both admin and activeOnly',
    './kafkaConnect.js: -a used by both admin and action',
    './timeSeriesTools.js: -a used by both admin and action'
  ])

  it('does not introduce new duplicate command aliases across command modules', async function () {
    const files = getUniqueCommandFiles()
    /** @type {Map<string, string>} */
    const ownerByAlias = new Map()
    /** @type {Array<string>} */
    const conflicts = []

    for (const relFile of files) {
      const absFile = path.resolve('bin', relFile.replace(/^\.\//, ''))
      const mod = await import(pathToFileURL(absFile).href)

      const commandToken = getCommandToken(mod.command)
      const aliases = Array.isArray(mod.aliases) ? mod.aliases : []
      const allNames = [commandToken, ...aliases].filter(Boolean)

      for (const name of allNames) {
        const key = String(name).toLowerCase()
        const owner = ownerByAlias.get(key)
        if (owner && owner !== relFile) {
          conflicts.push(`${name} -> ${owner} and ${relFile}`)
        } else if (!owner) {
          ownerByAlias.set(key, relFile)
        }
      }
    }

    const unexpected = conflicts.filter((c) => !knownCommandAliasConflicts.has(c))

    assert.strictEqual(
      unexpected.length,
      0,
      `New duplicate command aliases introduced:\n${unexpected.join('\n')}`
    )
  })

  it('does not introduce new option alias collisions within command builders', async function () {
    const files = getUniqueCommandFiles()
    /** @type {Array<string>} */
    const conflicts = []

    for (const relFile of files) {
      const absFile = path.resolve('bin', relFile.replace(/^\.\//, ''))
      const mod = await import(pathToFileURL(absFile).href)

      if (typeof mod.builder !== 'function') {
        continue
      }

      const parser = mod.builder(
        yargs([])
          .help(false)
          .version(false)
          .exitProcess(false)
      )

      const aliasMap = parser.getOptions().alias || {}
      /** @type {Map<string, string>} */
      const aliasOwner = new Map()

      for (const [optionName, aliasValues] of Object.entries(aliasMap)) {
        const aliases = Array.isArray(aliasValues) ? aliasValues : [aliasValues]

        for (const alias of aliases) {
          const aliasText = String(alias)
          if (!aliasText || aliasText === optionName) {
            continue
          }

          const owner = aliasOwner.get(aliasText)
          if (owner && owner !== optionName) {
            conflicts.push(`${relFile}: -${aliasText} used by both ${owner} and ${optionName}`)
          } else if (!owner) {
            aliasOwner.set(aliasText, String(optionName))
          }
        }
      }
    }

    const unexpected = conflicts.filter((c) => !knownOptionAliasConflicts.has(c))

    assert.strictEqual(
      unexpected.length,
      0,
      `New option alias collisions introduced:\n${unexpected.join('\n')}`
    )
  })
})
