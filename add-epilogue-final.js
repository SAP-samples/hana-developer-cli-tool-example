#!/usr/bin/env node
// @ts-check
/**
 * Final carefully tested script to add doc epilogue to all commands
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { commandMetadata } from './bin/commandMetadata.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const binDir = path.join(__dirname, 'bin')

/**
 * Update a command file to add the doc epilogue
 */
function updateCommandFile(filePath, commandName) {
    const metadata = commandMetadata[commandName]
    
    if (!metadata) {
        console.log(`⚠️  No metadata found for ${commandName}`)
        return false
    }

    let content = fs.readFileSync(filePath, 'utf-8')

    // Check if already has epilogue
    if (content.includes('.epilog(buildDocEpilogue')) {
        console.log(`✓ Already updated: ${commandName}`)
        return false
    }

    const { category, relatedCommands = [] } = metadata
    const epilogueCall = `.epilog(buildDocEpilogue('${commandName}', '${category}', [${relatedCommands.map(cmd => `'${cmd}'`).join(', ')}]))`

    // Add import if not present
    if (!content.includes('buildDocEpilogue')) {
        // Find the last import statement (by looking for 'from' or 'import')
        const lastImportMatch = content.match(/^import\s+.*from\s+['"][^'"]*['"]\s*\n/gm)
        if (lastImportMatch && lastImportMatch.length > 0) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1]
            const insertPos = content.indexOf(lastImport) + lastImport.length
            content = content.slice(0, insertPos) +
                     `import { buildDocEpilogue } from '../utils/doc-linker.js'\n` +
                     content.slice(insertPos)
        }
    }

    // Find and update the builder export with epilogue
    const builderMatch = content.match(/export\s+const\s+builder\s*=/)
    if (!builderMatch) {
        return false
    }
    
    // Find the first .example( after the builder export
    const exampleIdx = content.indexOf('.example(', builderMatch.index)
    if (exampleIdx === -1) {
        console.log(`⚠️  No .example() found in ${commandName}`)
        return false
    }
    
    // Count parentheses carefully from the opening paren of .example(
    let parenCount = 0
    let foundStart = false
    let idx = exampleIdx + '.example'.length
    
    while (idx < content.length) {
        const char = content[idx]
        if (char === '(') {
            parenCount++
            foundStart = true
        } else if (char === ')') {
            if (foundStart) {
                parenCount--
                if (parenCount === 0) {
                    // Found the closing paren
                    content = content.slice(0, idx + 1) + epilogueCall + content.slice(idx + 1)
                    break
                }
            }
        }
        idx++
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

console.log(`Found ${files.length} command files to process...`)
let updated = 0
for (const file of files) {
    const commandName = path.basename(file, '.js')
    const filePath = path.join(binDir, file)
    try {
        if (updateCommandFile(filePath, commandName)) {
            updated++
       }
    } catch (err) {
        console.log(`❌ Error processing ${commandName}: ${err.message}`)
    }
}

console.log(`\n📊 Summary: Successfully updated ${updated} files`)
