#!/usr/bin/env node
/**
 * Populate command documentation with real descriptions and examples from source files
 * Reads i18n bundles and command implementations to fill in placeholder content
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BIN_DIR = path.join(__dirname, 'bin')
const DOCS_DIR = path.join(__dirname, 'docs', '02-commands')
const I18N_DIR = path.join(__dirname, '_i18n')

// Load i18n messages
function loadI18nMessages() {
  const messagesFile = path.join(I18N_DIR, 'messages.properties')
  const content = fs.readFileSync(messagesFile, 'utf8')
  const messages = {}

  content.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim()
      messages[key.trim()] = value
    }
  })

  return messages
}

// Extract command metadata from source file
function extractCommandInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    const commandMatch = content.match(/export\s+const\s+command\s*=\s*['"`](.*?)['"`]/s)
    const aliasMatch = content.match(/export\s+const\s+aliases\s*=\s*\[([\s\S]*?)\]/)
    const describeMatch = content.match(/export\s+const\s+describe\s*=\s*baseLite\.bundle\.getText\(['"`]([^'"`]+)['"`]\)/)
    const exampleMatch = content.match(/\.example\(['"`](.*?)['"`]\s*,\s*baseLite\.bundle\.getText\(['"`]([^'"`]+)['"`]\)/)

    return {
      command: commandMatch ? commandMatch[1].trim() : null,
      aliases: aliasMatch ? aliasMatch[1].split(',').map(a => a.trim().replace(/^['"`]|['"`]$/g, '')) : [],
      describeKey: describeMatch ? describeMatch[1] : null,
      exampleCommand: exampleMatch ? exampleMatch[1] : null,
      exampleKey: exampleMatch ? exampleMatch[2] : null,
    }
  } catch (error) {
    return { command: null, aliases: [], describeKey: null, exampleCommand: null, exampleKey: null }
  }
}

// Generate improved documentation
function generateImprovedDoc(commandName, info, messages) {
  let description = messages[info.describeKey] || `Execute ${commandName} command`
  
  // Escape HTML entities that might cause parsing issues
  // Replace < and > with HTML entities to prevent Vue template parsing
  description = description.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  
  const exampleDesc = messages[info.exampleKey] || 'Execute the command'

  const aliases = info.aliases && info.aliases.length > 0 
    ? info.aliases.map(a => `- \`${a}\``).join('\n')
    : '- No aliases'

  const exampleCmd = info.exampleCommand || commandName

  const doc = `# ${commandName}

> Command: \`${commandName}\`  
> Category: **${getCategoryForCommand(commandName)}**  
> Status: Production Ready

## Description

${description}

## Syntax

\`\`\`bash
hana-cli ${info.command || commandName} [options]
\`\`\`

## Aliases

${aliases}

## Parameters

For a complete list of parameters and options, use:

\`\`\`bash
hana-cli ${commandName} --help
\`\`\`

## Examples

### Basic Usage

\`\`\`bash
hana-cli ${exampleCmd}
\`\`\`

${exampleDesc}

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: ${getCategoryForCommand(commandName)}](..)
- [All Commands A-Z](../all-commands.md)
`

  return doc
}

function getCategoryForCommand(commandName) {
  // Map command to category based on naming and known patterns
  const categoryMap = {
    'btp': 'BTP Integration',
    'activate': 'HDI Management',
    'admin': 'HDI Management',
    'container': 'HDI Management',
    'backup': 'Backup & Recovery',
    'restore': 'Backup & Recovery',
    'connect': 'Connection & Auth',
    'user': 'Connection & Auth',
    'import': 'Data Tools',
    'export': 'Data Tools',
    'sync': 'Data Tools',
    'hana': 'HANA Cloud',
    'mass': 'Mass Operations',
    'alert': 'Performance Monitoring',
    'block': 'Performance Monitoring',
    'table': 'Object Inspection',
    'view': 'Object Inspection',
    'function': 'Object Inspection',
    'procedure': 'Object Inspection',
  }

  for (const [key, category] of Object.entries(categoryMap)) {
    if (commandName.toLowerCase().includes(key)) {
      return category
    }
  }

  return 'System Tools'
}

async function main() {
  try {
    console.log('Loading i18n messages...')
    const messages = loadI18nMessages()
    console.log(`Loaded ${Object.keys(messages).length} message keys\n`)

    let updated = 0
    let errors = 0

    // Walk through all command docs
    for (const category of fs.readdirSync(DOCS_DIR)) {
      const categoryPath = path.join(DOCS_DIR, category)
      if (!fs.statSync(categoryPath).isDirectory()) continue

      const docFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'))

      for (const docFile of docFiles) {
        const docPath = path.join(categoryPath, docFile)
        const commandName = docFile.replace('.md', '')

        // Find corresponding source file
        const sourceFile = commandName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        const sourcePath = path.join(BIN_DIR, `${sourceFile}.js`)

        if (!fs.existsSync(sourcePath)) {
          errors++
          continue
        }

        try {
          // Extract metadata
          const info = extractCommandInfo(sourcePath)
          
          // Generate improved documentation
          const improvedDoc = generateImprovedDoc(sourceFile, info, messages)
          
          // Write updated documentation
          fs.writeFileSync(docPath, improvedDoc, 'utf8')
          updated++

          if (updated % 30 === 0) {
            console.log(`Updated ${updated} command docs...`)
          }
        } catch (error) {
          console.error(`Error processing ${commandName}:`, error.message)
          errors++
        }
      }
    }

    console.log(`\n✅ Documentation Population Complete!`)
    console.log(`   Updated: ${updated} command docs`)
    console.log(`   Errors: ${errors}`)

  } catch (error) {
    console.error('Error populating docs:', error)
    process.exit(1)
  }
}

main()
