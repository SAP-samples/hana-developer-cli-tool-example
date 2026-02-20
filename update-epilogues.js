#!/usr/bin/env node
// @ts-check
/**
 * Script to automatically add doc epilogue to all commands
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { commandMetadata } from './bin/commandMetadata.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const binDir = path.join(__dirname, 'bin')

/**
 * Get the primary command name (avoid aliases)
 */
function getPrimaryCommandName(commandName) {
    // Map of common aliases to primary commands
    const aliasMappings = {
        'imp': 'import',
        'exp': 'export',
        'uploadData': 'import',
        'uploaddata': 'import',
        'downloadData': 'export',
        'downloaddata': 'export',
    }
    return aliasMappings[commandName] || commandName
}

/**
 * Get metadata for a command by looking through commandMetadata
 */
function getCommandMetadata(commandName) {
    // Try the command name directly
    if (commandMetadata[commandName]) {
        return commandMetadata[commandName]
    }
    // Try common filename variations
    const variations = [
        commandName,
        commandName.charAt(0).toUpperCase() + commandName.slice(1),
    ]
    for (const variant of variations) {
        if (commandMetadata[variant]) {
            return commandMetadata[variant]
        }
    }
    return null
}

/**
 * Update a command file to add the doc epilogue
 */
function updateCommandFile(filePath, commandName) {
    const metadata = getCommandMetadata(commandName)
    
    if (!metadata) {
        console.log(`⚠️  No metadata found for ${commandName}`)
        return false
    }

    let content = fs.readFileSync(filePath, 'utf-8')

    // Check if already has epilogue
    if (content.includes('buildDocEpilogue')) {
        console.log(`✓ Already updated: ${commandName}`)
        return false
    }

    const { category, relatedCommands = [] } = metadata

    // Add import if not present
    if (!content.includes('import { buildDocEpilogue }')) {
        // Find the import section and add our import
        const importRegex = /^import\s+\*\s+as\s+baseLite/m
        if (importRegex.test(content)) {
            content = content.replace(
                importRegex,
                `import { buildDocEpilogue } from '../utils/doc-linker.js'\nimport * as baseLite`
            )
        } else {
            // Add after the first import
            const firstImportEnd = content.indexOf('\n') + 1
            content = content.slice(0, firstImportEnd) +
                      `import { buildDocEpilogue } from '../utils/doc-linker.js'\n` +
                      content.slice(firstImportEnd)
        }
    }

    // Find the builder export and add epilogue
    const builderPattern = /(export\s+const\s+builder\s*=\s*.*?)\n(export\s+let\s+inputPrompts|export\s+const\s+handler)/s
    const epilogueCall = `.epilog(buildDocEpilogue('${commandName}', '${category}', [${relatedCommands.map(cmd => `'${cmd}'`).join(', ')}]))`

    if (builderPattern.test(content)) {
        // Find the example() call and add epilog after it
        const exampleOrBuilderEnd = content.lastIndexOf(')')
        if (exampleOrBuilderEnd !== -1) {
            // Check if epilog already exists
            const section = content.slice(Math.max(0, exampleOrBuilderEnd - 200), exampleOrBuilderEnd + 100)
            if (!section.includes('epilog')) {
                // Add before the next export statement
                const nextExportIdx = content.indexOf('export ', exampleOrBuilderEnd)
                if (nextExportIdx !== -1) {
                    // Find the closing parenthesis of the builder chain
                    let parenCount = 0
                    let foundStart = false
                    for (let i = exampleOrBuilderEnd - 1; i >= 0; i--) {
                        if (content[i] === ')') parenCount++
                        if (content[i] === '(') {
                            parenCount--
                            if (!foundStart && parenCount === 0) {
                                // This is our builder start
                                foundStart = true
                                break
                            }
                        }
                    }
                    
                    // Find the actual end of the builder chain (the final closing paren)
                    const builderEndIdx = content.lastIndexOf(')', nextExportIdx)
                    content = content.slice(0, builderEndIdx) + epilogueCall + content.slice(builderEndIdx)
                }
            }
        }
    }

    fs.writeFileSync(filePath, content)
    console.log(`✅ Updated: ${commandName}`)
    return true
}

// Main execution
const files = fs.readdirSync(binDir)
    .filter(f => f.endsWith('.js') && 
            f !== 'index.js' && 
            f !== 'cli.js' && 
            f !== 'commandMap.js' &&
            f !== 'commandMetadata.js')

let updated = 0
for (const file of files) {
    const commandName = path.basename(file, '.js')
    const filePath = path.join(binDir, file)
    if (updateCommandFile(filePath, commandName)) {
        updated++
    }
}

console.log(`\n📊 Summary: Updated ${updated} files`)
