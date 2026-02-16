#!/usr/bin/env node
/**
 * Generate comprehensive documentation for all CLI commands
 * Extracts command metadata from bin/*.js files and creates structured docs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BIN_DIR = path.join(__dirname, 'bin')
const DOCS_DIR = path.join(__dirname, 'docs', '02-commands')

// Command category mappings
const COMMAND_CATEGORIES = {
  // Connection & Authentication
  'connect': 'connection-auth',
  'connectViaServiceKey': 'connection-auth',
  'createJWT': 'connection-auth',
  'inspectJWT': 'connection-auth',
  'inspectUser': 'connection-auth',
  'users': 'connection-auth',
  'connections': 'connection-auth',
  'certificates': 'security',
  'certificatesUI': 'security',
  'pwdPolicy': 'security',

  // HDI Management
  'activateHDI': 'hdi-management',
  'adminHDI': 'hdi-management',
  'adminHDIGroup': 'hdi-management',
  'createContainer': 'hdi-management',
  'createContainerUsers': 'hdi-management',
  'createGroup': 'hdi-management',
  'dropContainer': 'hdi-management',
  'dropGroup': 'hdi-management',
  'containers': 'hdi-management',
  'containersUI': 'hdi-management',

  // HANA Cloud
  'hanaCloudInstances': 'hana-cloud',
  'hanaCloudStart': 'hana-cloud',
  'hanaCloudStop': 'hana-cloud',
  'hanaCloudHDIInstances': 'hdi-management',
  'hanaCloudSBSSInstances': 'hana-cloud',
  'hanaCloudSchemaInstances': 'hana-cloud',
  'hanaCloudSecureStoreInstances': 'hana-cloud',
  'hanaCloudUPSInstances': 'hana-cloud',
  'hanaCloudHDIInstancesUI': 'hdi-management',
  'hanaCloudSBSSInstancesUI': 'hana-cloud',
  'hanaCloudSchemaInstancesUI': 'hana-cloud',
  'hanaCloudSecureStoreInstancesUI': 'hana-cloud',
  'hanaCloudUPSInstancesUI': 'hana-cloud',

  // Data Operations (extend from existing)
  'dataSync': 'data-tools',
  'compareData': 'data-tools',
  'dataValidator': 'data-tools',
  'tableCopy': 'schema-tools',

  // Performance & Monitoring
  'alerts': 'performance-monitoring',
  'blocking': 'performance-monitoring',
  'cacheStats': 'performance-monitoring',
  'deadlocks': 'performance-monitoring',
  'expensiveStatements': 'performance-monitoring',
  'longRunning': 'performance-monitoring',
  'memoryAnalysis': 'performance-monitoring',
  'memoryLeaks': 'performance-monitoring',
  'queryPlan': 'performance-monitoring',
  'traceContents': 'performance-monitoring',
  'traces': 'performance-monitoring',
  'workloadManagement': 'performance-monitoring',

  // Schema & Object Inspection
  'inspectTable': 'object-inspection',
  'inspectTableUI': 'object-inspection',
  'inspectView': 'object-inspection',
  'inspectFunction': 'object-inspection',
  'inspectProcedure': 'object-inspection',
  'inspectTrigger': 'object-inspection',
  'inspectLibrary': 'object-inspection',
  'inspectLibMember': 'object-inspection',
  'tables': 'object-inspection',
  'tablesUI': 'object-inspection',
  'tablesPG': 'object-inspection',
  'tablesSQLite': 'object-inspection',
  'views': 'object-inspection',
  'viewsPG': 'object-inspection',
  'viewsSQLite': 'object-inspection',
  'functions': 'object-inspection',
  'functionsUI': 'object-inspection',
  'functionsPG': 'object-inspection',
  'functionsSQLite': 'object-inspection',
  'procedures': 'object-inspection',
  'proceduresUI': 'object-inspection',
  'proceduresPG': 'object-inspection',
  'proceduresSQLite': 'object-inspection',
  'schemas': 'object-inspection',
  'schemasUI': 'object-inspection',
  'objects': 'object-inspection',
  'indexes': 'object-inspection',
  'indexesUI': 'object-inspection',
  'sequences': 'object-inspection',
  'triggers': 'object-inspection',
  'libraries': 'object-inspection',
  'partitions': 'object-inspection',

  // Security
  'encryptionStatus': 'security',
  'privilegeAnalysis': 'security',
  'privilegeError': 'security',
  'securityScan': 'security',
  'grantChains': 'security',
  'roles': 'security',
  'createXSAAdmin': 'security',
  'massUsers': 'mass-operations',
  'auditLog': 'security',

  // Backup & Recovery
  'backup': 'backup-recovery',
  'backupList': 'backup-recovery',
  'backupStatus': 'backup-recovery',
  'restore': 'backup-recovery',
  'reclaim': 'backup-recovery',

  // Mass Operations
  'massConvert': 'mass-operations',
  'massConvertUI': 'mass-operations',
  'massDelete': 'mass-operations',
  'massExport': 'mass-operations',
  'massGrant': 'mass-operations',
  'massRename': 'mass-operations',
  'massUpdate': 'mass-operations',

  // BTP Integration
  'btp': 'btp-integration',
  'btpInfo': 'btp-integration',
  'btpInfoUI': 'btp-integration',
  'btpSubs': 'btp-integration',
  'btpTarget': 'btp-integration',
  'openBAS': 'btp-integration',
  'openDBExplorer': 'btp-integration',

  // System Admin
  'diagnose': 'system-admin',
  'healthCheck': 'system-admin',
  'hostInformation': 'system-admin',
  'status': 'system-admin',
  'systemInfo': 'system-admin',
  'systemInfoUI': 'system-admin',
  'recommendations': 'system-admin',
  'iniContents': 'system-admin',
  'iniFiles': 'system-admin',
  'features': 'system-admin',
  'featuresUI': 'system-admin',
  'featureUsage': 'system-admin',
  'featureUsageUI': 'system-admin',
  'dataTypes': 'system-admin',
  'dataTypesUI': 'system-admin',
  'dependencies': 'system-admin',
  'disks': 'system-admin',
  'ports': 'system-admin',
  'crashDumps': 'system-admin',

  // Developer Tools
  'cds': 'developer-tools',
  'createModule': 'developer-tools',
  'generateDocs': 'developer-tools',
  'issue': 'developer-tools',
  'openChangeLog': 'developer-tools',
  'openReadMe': 'developer-tools',
  'readMe': 'developer-tools',
  'readMeUI': 'developer-tools',
  'changeLog': 'developer-tools',
  'changeLogUI': 'developer-tools',
  'hdbsql': 'developer-tools',
  'querySimple': 'developer-tools',
  'querySimpleUI': 'developer-tools',
  'codeTemplate': 'developer-tools',
  'callProcedure': 'developer-tools',

  // Analysis Tools (extend from existing)
  'dataProfile': 'analysis-tools',
  'dataDiff': 'analysis-tools',
  'dataLineage': 'analysis-tools',
  'duplicateDetection': 'analysis-tools',
  'referentialCheck': 'analysis-tools',
  'calcViewAnalyzer': 'analysis-tools',
  'columnStats': 'analysis-tools',
  'erdDiagram': 'analysis-tools',
  'fragmentationCheck': 'analysis-tools',
  'tableHotspots': 'analysis-tools',
}

function getCategory(commandName) {
  return COMMAND_CATEGORIES[commandName] || 'system-tools'
}

function generateCommandDoc(commandName, category) {
  const docTemplate = `# ${commandName}

> Command: \`${commandName}\`  
> Category: **${category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}**  
> Status: Production Ready

## Description

The \`${commandName}\` command performs operations related to ${category.split('-').join(' ').toLowerCase()}.

## Syntax

\`\`\`bash
hana-cli ${commandName} [options]
\`\`\`

## Aliases

See command help for available aliases.

## Parameters

### Required Parameters

| Parameter | Description |
|-----------|-------------|
| - | *See 'hana-cli ${commandName} --help' for required parameters* |

### Optional Parameters

| Parameter | Alias | Description | Default |
|-----------|-------|-------------|---------|
| \`--help\` | \`-h\` | Display help information | false |
| \`--verbose\` | \`-v\` | Enable verbose output | false |

## Examples

### Basic Usage

\`\`\`bash
hana-cli ${commandName}
\`\`\`

For more examples, run:

\`\`\`bash
hana-cli ${commandName} --help
\`\`\`

## Documentation

For detailed command documentation, parameters, and examples, use:

\`\`\`bash
hana-cli ${commandName} --help
\`\`\`

## Related Commands

- [All Commands A-Z](../all-commands.md)
- [Commands Overview](..)

## See Also

- [Category: ${category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}](..)
- [Command Reference](../all-commands.md)
`
  return docTemplate
}

async function main() {
  try {
    // Get all command files
    const commandFiles = fs.readdirSync(BIN_DIR)
      .filter(f => f.endsWith('.js') && f !== 'index.js')
      .map(f => f.replace('.js', ''))
      .sort()

    console.log(`Found ${commandFiles.length} command files`)

    let generated = 0
    let skipped = 0

    // Generate docs for each command
    for (const commandName of commandFiles) {
      const category = getCategory(commandName)
      const categoryDir = path.join(DOCS_DIR, category)

      // Create category dir if needed
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true })
      }

      // Use kebab-case for filenames
      const fileName = commandName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '.md'
      const filePath = path.join(categoryDir, fileName)

      // Skip if file already exists (don't overwrite existing docs)
      if (fs.existsSync(filePath)) {
        skipped++
        continue
      }

      const docContent = generateCommandDoc(commandName, category)
      fs.writeFileSync(filePath, docContent, 'utf8')
      generated++

      if (generated % 20 === 0) {
        console.log(`Generated ${generated} command docs...`)
      }
    }

    console.log(`\n✅ Generation complete!`)
    console.log(`   Generated: ${generated} new docs`)
    console.log(`   Skipped: ${skipped} existing docs`)
    console.log(`   Total commands: ${commandFiles.length}`)

  } catch (error) {
    console.error('Error generating docs:', error)
    process.exit(1)
  }
}

main()
