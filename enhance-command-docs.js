#!/usr/bin/env node
/**
 * Enhance command documentation with actual details extracted from source files
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import vm from 'vm'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BIN_DIR = path.join(__dirname, 'bin')
const DOCS_DIR = path.join(__dirname, 'docs', '02-commands')

// Common parameter descriptions
const COMMON_PARAMS = {
  help: { alias: 'h', desc: 'Display help information', type: 'boolean' },
  verbose: { alias: 'v', desc: 'Enable verbose output', type: 'boolean' },
  connection: { alias: 'n', desc: 'Connection details (host:port)', type: 'string' },
  user: { alias: 'u', desc: 'Database user name', type: 'string' },
  password: { alias: 'p', desc: 'Database password', type: 'string' },
  schema: { alias: 's', desc: 'Schema name', type: 'string' },
  table: { alias: 't', desc: 'Table name', type: 'string' },
  container: { alias: 'c', desc: 'HDI container name', type: 'string' },
}

function extractCommandMetadata(filePath, commandName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // Extract command, aliases, describe, builder
    const commandMatch = content.match(/export\s+const\s+command\s*=\s*['"`](.*?)['"`]/s)
    const aliasMatch = content.match(/export\s+const\s+aliases\s*=\s*\[?(.*?)\]?(?=\s*$|;|\n)/m)
    const descMatch = content.match(/export\s+const\s+describe\s*=\s*(.*?)(?=\n|;)/s)

    // Extract yargs options from builder
    const builderMatch = content.match(/\.options\((.*?)\)\)/s)
    const exampleMatch = content.match(/\.example\(['"`](.*?)['"`]\s*,\s*['"`](.*?)['"`]\)/s)

    return {
      command: commandMatch ? commandMatch[1].trim() : commandName,
      aliases: aliasMatch ? aliasMatch[1].split(',').map(s => s.trim().replace(/['"`]/g, '')) : [],
      description: descMatch ? descMatch[1].trim() : 'No description available',
      example: exampleMatch ? exampleMatch[1].trim() : null,
      exampleDesc: exampleMatch ? exampleMatch[2].trim() : null,
    }
  } catch (error) {
    return {
      command: commandName,
      aliases: [],
      description: 'No description available',
      example: null,
      exampleDesc: null,
    }
  }
}

function getCommandFileName(commandName) {
  return commandName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '.md'
}

function getCategory(filePath) {
  return path.basename(path.dirname(filePath)).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function enhanceCommandDoc(filePath, metadata) {
  const category = getCategory(filePath)
  const categoryPath = path.basename(path.dirname(filePath))

  let content = fs.readFileSync(filePath, 'utf8')

  // Replace command name
  content = content.replace(
    /^# (.+)$/m,
    `# ${metadata.command.split(' ')[0]}`
  )

  // Replace description section
  content = content.replace(
    /The \`\w+\` command \[Add description based on command purpose\]\./,
    `The **${metadata.command}** command ${metadata.description}.`
  )

  // Replace syntax section
  content = content.replace(
    /\`\`\`bash\nhana-cli \w+ \[options\]\n\`\`\`/,
    `\`\`\`bash\nhana-cli ${metadata.command}\n\`\`\``
  )

  // Add aliases if available
  if (metadata.aliases && metadata.aliases.length > 0) {
    content = content.replace(
      /## Aliases\n\n- \`hana-cli\` \[aliases would be extracted from source\]/,
      `## Aliases\n\n${metadata.aliases.map(a => `- \`${a}\``).join('\n')}`
    )
  }

  // Add example if available
  if (metadata.example) {
    content = content.replace(
      /### Basic Usage\n\n\`\`\`bash\nhana-cli \w+\n\`\`\`/,
      `### Basic Usage\n\n\`\`\`bash\nhana-cli ${metadata.example}\n\`\`\`\n\n${metadata.exampleDesc || 'Example usage'}`
    )
  }

  // Add related commands reference
  content = content.replace(
    /- \[\`\`\]\(\) - \n- \[\`\`\]\(\) - /,
    `See [All Commands](../all-commands.md) for related commands in this category.`
  )

  return content
}

async function main() {
  try {
    console.log('Enhancing command documentation with metadata...\n')

    let enhanced = 0

    // Walk through all generated docs
    for (const category of fs.readdirSync(DOCS_DIR)) {
      const categoryPath = path.join(DOCS_DIR, category)
      if (!fs.statSync(categoryPath).isDirectory()) continue

      const docFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'))

      for (const docFile of docFiles) {
        const docPath = path.join(categoryPath, docFile)
        const commandName = docFile.replace('.md', '')

        // Find corresponding source file (convert kebab-case back to camelCase)
        const sourceFile = commandName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        const sourcePath = path.join(BIN_DIR, `${sourceFile}.js`)

        if (!fs.existsSync(sourcePath)) continue

        // Extract metadata
        const metadata = extractCommandMetadata(sourcePath, sourceFile)

        // Enhance documentation
        const enhancedContent = enhanceCommandDoc(docPath, metadata)
        fs.writeFileSync(docPath, enhancedContent, 'utf8')

        enhanced++
        if (enhanced % 30 === 0) {
          console.log(`Enhanced ${enhanced} docs...`)
        }
      }
    }

    console.log(`\n✅ Enhancement complete! Enhanced ${enhanced} command docs`)

  } catch (error) {
    console.error('Error enhancing docs:', error)
    process.exit(1)
  }
}

main()
