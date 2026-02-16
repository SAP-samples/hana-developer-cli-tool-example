#!/usr/bin/env node
import * as fs from 'fs'
import * as path from 'path'

const binPath = 'd:\\projects\\hana-developer-cli-tool-example\\bin'

const commandFiles = [
  'adminHDIGroup.js', 'auditLog.js', 'backupList.js', 'backupStatus.js', 'btpInfo.js', 'btpInfoUI.js',
  'btpSubs.js', 'btpTarget.js', 'calcViewAnalyzer.js', 'callProcedure.js', 'cds.js', 'certificates.js',
  'certificatesUI.js', 'codeTemplate.js', 'columnStats.js', 'compareData.js', 'compareSchema.js',
  'connections.js', 'connectViaServiceKey.js', 'containers.js', 'containersUI.js', 'copy2DefaultEnv.js',
  'copy2Env.js', 'copy2Secrets.js', 'crashDumps.js', 'createContainer.js', 'createContainerUsers.js',
  'createGroup.js', 'createJWT.js', 'createModule.js', 'createXSAAdmin.js', 'dataDiff.js', 'dataLineage.js',
  'dataMask.js', 'dataProfile.js', 'dataSync.js', 'dataTypes.js', 'dataTypesUI.js', 'dataValidator.js',
  'dataVolumes.js', 'deadlocks.js', 'dependencies.js', 'diagnose.js', 'disks.js', 'dropContainer.js',
  'dropGroup.js', 'duplicateDetection.js', 'encryptionStatus.js', 'erdDiagram.js', 'expensiveStatements.js',
  'features.js', 'featuresUI.js', 'featureUsage.js', 'featureUsageUI.js', 'fragmentationCheck.js',
  'ftIndexes.js', 'functions.js', 'functionsUI.js', 'generateDocs.js', 'generateTestData.js',
  'grantChains.js', 'graphWorkspaces.js', 'hanaCloudHDIInstances.js', 'hanaCloudHDIInstancesUI.js',
  'hanaCloudInstances.js', 'hanaCloudSBSSInstances.js', 'hanaCloudSBSSInstancesUI.js',
  'hanaCloudSchemaInstances.js', 'hanaCloudSchemaInstancesUI.js', 'hanaCloudSecureStoreInstances.js',
  'hanaCloudSecureStoreInstancesUI.js', 'hanaCloudStart.js', 'hanaCloudStop.js', 'hanaCloudUPSInstances.js',
  'hanaCloudUPSInstancesUI.js', 'hdbsql.js', 'healthCheck.js', 'hostInformation.js', 'importUI.js',
  'indexes.js', 'indexesUI.js', 'iniContents.js', 'iniFiles.js', 'inspectFunction.js', 'inspectIndex.js',
  'inspectJWT.js', 'inspectLibMember.js', 'inspectLibrary.js', 'inspectProcedure.js', 'inspectTable.js',
  'inspectTableUI.js', 'inspectTrigger.js', 'inspectUser.js', 'inspectView.js', 'issue.js', 'kafkaConnect.js',
  'libraries.js', 'longRunning.js', 'massConvert.js', 'massConvertUI.js', 'massDelete.js', 'massExport.js',
  'massGrant.js', 'massRename.js', 'massUpdate.js', 'massUsers.js', 'memoryAnalysis.js', 'memoryLeaks.js',
  'objects.js', 'openBAS.js', 'openChangeLog.js', 'openDBExplorer.js', 'openReadMe.js', 'partitions.js',
  'ports.js', 'privilegeAnalysis.js', 'privilegeError.js', 'pwdPolicy.js', 'queryPlan.js', 'querySimple.js',
  'querySimpleUI.js', 'readMe.js', 'readMeUI.js', 'reclaim.js', 'recommendations.js', 'referentialCheck.js',
  'replicationStatus.js', 'restore.js', 'roles.js', 'schemaClone.js', 'schemasUI.js',
  'sdiTasks.js', 'securityScan.js', 'sequences.js', 'spatialData.js', 'status.js', 'synonyms.js',
  'systemInfo.js', 'systemInfoUI.js', 'tableCopy.js', 'tableGroups.js', 'tableHotspots.js', 'tablesPG.js',
  'tablesSQLite.js', 'tablesUI.js', 'test.js', 'timeSeriesTools.js', 'traceContents.js', 'traces.js',
  'triggers.js', 'users.js', 'version.js', 'views.js', 'xsaServices.js'
]

function extractCommand(content) {
  const match = content.match(/export const command = ['"`]([^'"`]+)['"`]/)
  return match ? match[1] : null
}

function processFile(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const command = extractCommand(content)
    
    if (!command) {
      return null
    }

    // Skip certain builder types
    if (content.includes('export const builder = ') && !content.includes('export const builder = baseLite.getBuilder({')) {
      return null // Skip non-standard builders
    }

    const lines = content.split('\n')
    let builderLineIdx = -1
    let builderEndIdx = -1

    // Find builder start
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export const builder = baseLite.getBuilder({')) {
        builderLineIdx = i
        break
      }
    }

    if (builderLineIdx === -1) {
      if (fileName === 'adminHDIGroup.js') console.error(`${fileName}: builder not found`)
      return null
    }

    // Find the closing }) - look for line that ends with })
    for (let j = builderLineIdx; j < lines.length; j++) {
      const line = lines[j].trimEnd()
      if (line.endsWith('})')) {
        builderEndIdx = j
        if (fileName === 'adminHDIGroup.js') console.error(`${fileName}: found closing at line ${j}`)
        break
      }
      // Also check for }) with parameters like }, false)
      if (line.match(/\}\)[,;]?\s*$/)) {
        builderEndIdx = j
        if (fileName === 'adminHDIGroup.js') console.error(`${fileName}: found closing (regex) at line ${j}`)
        break
      }
    }

    if (builderEndIdx === -1) {
      if (fileName === 'adminHDIGroup.js') console.error(`${fileName}: closing not found`)
      return null
    }

    // Get context (from builder line to end line)
    const oldStringLines = lines.slice(builderLineIdx, builderEndIdx + 1).map(l => l.trimEnd())
    const oldString = oldStringLines.join('\n')

    // Create new version
    const newStringLines = [...oldStringLines]
    let lastLine = newStringLines[newStringLines.length - 1]
    const firstWord = command.split(' ')[0].toLowerCase()
  
    // Replace }) at end of line with }).example(...)
    const modifiedLastLine = lastLine.replace(
      /\}\)(.*)$/,
      `}).example(\n  'hana-cli ${command}',\n  baseLite.bundle.getText("${firstWord}")\n)$1`
    )
    newStringLines[newStringLines.length - 1] = modifiedLastLine
    const newString = newStringLines.join('\n')

    // Only return if we actually made a change
    if (newString !== oldString) {
      return {
        filePath: path.join(binPath, fileName),
        oldString,
        newString
      }
    }

    return null
  } catch (error) {
    console.error(`Error in ${fileName}:`, error.message)
    return null
  }
}

// Process all files
const replacements = []
let processed = 0
for (const fileName of commandFiles) {
  const filePath = path.join(binPath, fileName)
  if (fs.existsSync(filePath)) {
    processed++
    const result = processFile(filePath, fileName)
    if (result) {
      replacements.push(result)
    }
  }
}

console.error(`Processed ${processed} files, found ${replacements.length} replacements`)

// Output JSON
console.log(JSON.stringify(replacements, null, 2))
