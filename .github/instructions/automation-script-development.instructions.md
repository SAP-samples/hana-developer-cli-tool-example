---
description: "Use when creating or updating automation scripts in the project root (generate-*, enhance-*, update-*, populate-* files). Enforces consistent patterns for file I/O, metadata extraction, documentation generation, template processing, error handling, and integration with npm scripts."
applyTo: "generate-*.js,enhance-*.js,update-*.js,populate-*.js,CHANGELOG.js"
---

# Automation Script Development Guidelines

Use this guide when creating or modifying automation scripts in the project root directory.

## Scope and Purpose

This guide applies to automation and code generation scripts in the project root:

**Script Categories:**
- `generate-*.js` - Generate new files (docs, config, examples)
- `enhance-*.js` - Enhance existing files with extracted metadata
- `update-*.js` - Update existing files with new content
- `populate-*.js` - Populate templates with data
- `CHANGELOG.js` - Generate changelog from JSON

**Common Scripts:**
- `generate-command-docs.js` - Generate command documentation
- `generate-sidebar-config.js` - Generate VitePress sidebar config
- `generate-examples.js` - Generate example files
- `enhance-command-docs.js` - Enhance docs with metadata from source
- `update-epilogues.js` - Update command epilogues
- `populate-command-docs.js` - Populate doc templates
- `CHANGELOG.js` - Convert CHANGELOG.json to markdown

## Critical Principles

1. **Shebang**: Start with `#!/usr/bin/env node` for direct execution
2. **ESM Modules**: Use ES module syntax (`import/export`)
3. **Type Safety**: Add `@ts-check` for basic type checking
4. **Safe File I/O**: Check existence before reading, backup before overwriting
5. **Clear Logging**: Provide progress updates and success/failure messages
6. **Exit Codes**: Use proper exit codes (0=success, 1=failure)
7. **Idempotency**: Scripts should be safe to run multiple times
8. **Documentation**: Include JSDoc header explaining purpose

## File Structure Template

```javascript
#!/usr/bin/env node
/**
 * Brief description of what this script does
 * 
 * Usage: node script-name.js [options]
 * 
 * Examples:
 *   node script-name.js
 *   node script-name.js --force
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Constants
const SOURCE_DIR = path.join(__dirname, 'source')
const OUTPUT_DIR = path.join(__dirname, 'output')

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('Starting script...')
        
        // Script logic here
        
        console.log('✅ Script completed successfully')
        process.exit(0)
    } catch (error) {
        console.error('❌ Script failed:', error.message)
        console.error(error.stack)
        process.exit(1)
    }
}

main()
```

## ESM Module Patterns

### Pattern: Get __dirname in ESM

```javascript
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Use with path operations
const BIN_DIR = join(__dirname, 'bin')
const DOCS_DIR = join(__dirname, 'docs', '02-commands')
```

### Pattern: Dynamic Imports

```javascript
// Import JSON files
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

// Or use import assertions (Node 17.1+)
import pkg from './package.json' assert { type: 'json' }

// Dynamic module imports
const { default: stringify } = await import('stringify-changelog')
```

## Command Metadata Extraction

### Pattern: Extract Metadata from Command Files

```javascript
/**
 * Extract command metadata from source file
 * @param {string} filePath - Path to command file
 * @param {string} commandName - Command name
 * @returns {Object} Extracted metadata
 */
function extractCommandMetadata(filePath, commandName) {
    try {
        const content = fs.readFileSync(filePath, 'utf8')

        // Extract command signature
        const commandMatch = content.match(/export\s+const\s+command\s*=\s*['"`](.*?)['"`]/s)
        
        // Extract aliases
        const aliasMatch = content.match(/export\s+const\s+aliases\s*=\s*\[(.*?)\]/s)
        
        // Extract description
        const descMatch = content.match(/export\s+const\s+describe\s*=\s*(.*?)(?=\n|;)/s)

        // Extract builder options
        const builderMatch = content.match(/\.options\((.*?)\)\)/s)
        
        // Extract examples
        const exampleMatch = content.match(/\.example\(['"`](.*?)['"`]\s*,\s*['"`](.*?)['"`]\)/s)

        return {
            command: commandMatch ? commandMatch[1].trim() : commandName,
            aliases: aliasMatch ? parseAliases(aliasMatch[1]) : [],
            description: descMatch ? descMatch[1].trim() : 'No description available',
            options: builderMatch ? parseOptions(builderMatch[1]) : {},
            example: exampleMatch ? exampleMatch[1].trim() : null,
            exampleDesc: exampleMatch ? exampleMatch[2].trim() : null,
        }
    } catch (error) {
        console.error(`Failed to extract metadata from ${filePath}:`, error.message)
        return {
            command: commandName,
            aliases: [],
            description: 'No description available',
            options: {},
            example: null,
            exampleDesc: null,
        }
    }
}

/**
 * Parse aliases from string
 * @param {string} aliasStr - Alias string from source
 * @returns {string[]} Array of aliases
 */
function parseAliases(aliasStr) {
    return aliasStr
        .split(',')
        .map(s => s.trim().replace(/['"`]/g, ''))
        .filter(s => s.length > 0)
}
```

## File I/O Safety Patterns

### Pattern: Safe File Reading

```javascript
/**
 * Read file with error handling
 * @param {string} filePath - File path
 * @returns {string|null} File content or null
 */
function safeReadFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  File not found: ${filePath}`)
            return null
        }
        return fs.readFileSync(filePath, 'utf8')
    } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error.message)
        return null
    }
}
```

### Pattern: Safe File Writing with Backup

```javascript
/**
 * Write file with backup of existing content
 * @param {string} filePath - Target file path
 * @param {string} content - Content to write
 * @param {boolean} createBackup - Whether to backup existing file
 */
function safeWriteFile(filePath, content, createBackup = true) {
    try {
        // Create backup if file exists
        if (createBackup && fs.existsSync(filePath)) {
            const backupPath = `${filePath}.backup`
            fs.copyFileSync(filePath, backupPath)
            console.log(`📋 Backup created: ${backupPath}`)
        }
        
        // Ensure directory exists
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        // Write file
        fs.writeFileSync(filePath, content, 'utf8')
        console.log(`✅ Written: ${filePath}`)
    } catch (error) {
        console.error(`❌ Error writing ${filePath}:`, error.message)
        throw error
    }
}
```

### Pattern: Atomic File Updates

```javascript
/**
 * Update file atomically (write to temp, then rename)
 * @param {string} filePath - Target file path
 * @param {string} content - New content
 */
function atomicWriteFile(filePath, content) {
    const tempPath = `${filePath}.tmp`
    
    try {
        // Write to temp file
        fs.writeFileSync(tempPath, content, 'utf8')
        
        // Atomic rename
        fs.renameSync(tempPath, filePath)
        console.log(`✅ Updated: ${filePath}`)
    } catch (error) {
        // Cleanup temp file on error
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath)
        }
        throw error
    }
}
```

## Directory Traversal Patterns

### Pattern: Process All Files in Directory

```javascript
/**
 * Process all matching files in directory
 * @param {string} dirPath - Directory path
 * @param {RegExp} pattern - File pattern to match
 * @param {Function} processor - Processing function
 */
function processDirectory(dirPath, pattern, processor) {
    if (!fs.existsSync(dirPath)) {
        console.error(`❌ Directory not found: ${dirPath}`)
        return
    }
    
    const files = fs.readdirSync(dirPath)
        .filter(file => pattern.test(file))
        .sort()
    
    console.log(`Found ${files.length} matching files in ${dirPath}`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const file of files) {
        const filePath = path.join(dirPath, file)
        try {
            processor(filePath, file)
            successCount++
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message)
            errorCount++
        }
    }
    
    console.log(`\n✅ Processed: ${successCount}, ❌ Errors: ${errorCount}`)
    return { successCount, errorCount }
}
```

### Pattern: Recursive Directory Scan

```javascript
/**
 * Recursively scan directory for files
 * @param {string} dirPath - Directory to scan
 * @param {RegExp} pattern - File pattern
 * @returns {string[]} Array of matching file paths
 */
function scanDirectory(dirPath, pattern) {
    const results = []
    
    function scan(currentPath) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true })
        
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name)
            
            if (entry.isDirectory()) {
                scan(fullPath)
            } else if (pattern.test(entry.name)) {
                results.push(fullPath)
            }
        }
    }
    
    scan(dirPath)
    return results
}
```

## Template Generation Patterns

### Pattern: Replace Placeholders in Template

```javascript
/**
 * Replace placeholders in template string
 * @param {string} template - Template string with {{placeholders}}
 * @param {Object} data - Data object with values
 * @returns {string} Processed template
 */
function processTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        if (key in data) {
            return String(data[key])
        }
        console.warn(`⚠️  Placeholder {{${key}}} not found in data`)
        return match
    })
}

// Usage
const template = `# {{title}}

Description: {{description}}

Author: {{author}}`

const output = processTemplate(template, {
    title: 'My Document',
    description: 'A generated document',
    author: 'Auto-generated'
})
```

### Pattern: Multi-Section Template

```javascript
/**
 * Build document from multiple sections
 * @param {Object} sections - Section data
 * @returns {string} Complete document
 */
function buildDocument(sections) {
    const parts = []
    
    // Header
    parts.push(`# ${sections.title}\n`)
    
    // Description
    if (sections.description) {
        parts.push(`${sections.description}\n`)
    }
    
    // Sections
    for (const section of sections.content) {
        parts.push(`## ${section.heading}\n`)
        parts.push(`${section.body}\n`)
    }
    
    // Footer
    if (sections.footer) {
        parts.push(`---\n${sections.footer}`)
    }
    
    return parts.join('\n')
}
```

## Command Category Mapping

### Pattern: Categorize Commands

```javascript
/**
 * Map commands to categories
 */
const COMMAND_CATEGORIES = {
    // Connection & Authentication
    'connect': 'connection-auth',
    'connectViaServiceKey': 'connection-auth',
    'connections': 'connection-auth',
    
    // HDI Management
    'activateHDI': 'hdi-management',
    'adminHDI': 'hdi-management',
    'containers': 'hdi-management',
    
    // Data Tools
    'dataSync': 'data-tools',
    'compareData': 'data-tools',
    'export': 'data-tools',
    'import': 'data-tools',
    
    // Add more mappings...
}

/**
 * Get category for command
 * @param {string} commandName - Command name
 * @returns {string} Category name
 */
function getCommandCategory(commandName) {
    return COMMAND_CATEGORIES[commandName] || 'uncategorized'
}

/**
 * Get commands by category
 * @returns {Map<string, string[]>} Category to commands map
 */
function groupCommandsByCategory() {
    const groups = new Map()
    
    for (const [command, category] of Object.entries(COMMAND_CATEGORIES)) {
        if (!groups.has(category)) {
            groups.set(category, [])
        }
        groups.get(category).push(command)
    }
    
    return groups
}
```

## VitePress Configuration Generation

### Pattern: Generate Sidebar Config

```javascript
/**
 * Generate VitePress sidebar configuration
 * @param {string} docsDir - Documentation directory
 * @returns {string} Sidebar config JavaScript
 */
function generateSidebarConfig(docsDir) {
    const config = []
    
    // Get all category directories
    const categories = fs.readdirSync(docsDir)
        .filter(name => {
            const stat = fs.statSync(path.join(docsDir, name))
            return stat.isDirectory()
        })
        .sort()
    
    // Generate config for each category
    for (const category of categories) {
        const categoryPath = path.join(docsDir, category)
        const docFiles = fs.readdirSync(categoryPath)
            .filter(f => f.endsWith('.md'))
            .sort()
        
        if (docFiles.length === 0) continue
        
        const categoryTitle = toTitleCase(category)
        const items = docFiles
            .map(file => {
                const link = `/02-commands/${category}/${file.replace('.md', '')}`
                const label = getFileLabel(file)
                return `            { text: '${label}', link: '${link}' }`
            })
            .join(',\n')
        
        config.push(`        {
          text: '${categoryTitle}',
          collapsed: true,
          items: [
${items}
          ]
        }`)
    }
    
    return config.join(',\n')
}

/**
 * Convert kebab-case to Title Case
 * @param {string} str - Kebab-case string
 * @returns {string} Title Case string
 */
function toTitleCase(str) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
```

## Changelog Generation

### Pattern: Convert CHANGELOG.json to Markdown

```javascript
/**
 * Generate changelog markdown from JSON
 */
import changelog from 'stringify-changelog'

async function generateChangelog() {
    try {
        // Read JSON changelog
        const jsonPath = './CHANGELOG.json'
        if (!fs.existsSync(jsonPath)) {
            throw new Error('CHANGELOG.json not found')
        }
        
        // Convert to markdown
        let markdown = changelog(jsonPath)
        
        // Add header
        markdown = `# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

${markdown}`
        
        // Write markdown file
        fs.writeFileSync('./CHANGELOG.md', markdown, 'utf8')
        console.log('✅ CHANGELOG.md generated successfully')
        
    } catch (error) {
        console.error('❌ Failed to generate changelog:', error.message)
        process.exit(1)
    }
}

generateChangelog()
```

## Progress Reporting

### Pattern: Progress Indicators

```javascript
/**
 * Process items with progress reporting
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 */
async function processWithProgress(items, processor) {
    const total = items.length
    let completed = 0
    let failed = 0
    
    console.log(`Processing ${total} items...\n`)
    
    for (const item of items) {
        try {
            await processor(item)
            completed++
            
            // Show progress
            const percent = Math.round((completed / total) * 100)
            process.stdout.write(`\r✅ Progress: ${completed}/${total} (${percent}%)`)
        } catch (error) {
            failed++
            console.error(`\n❌ Error processing ${item}:`, error.message)
        }
    }
    
    console.log(`\n\n📊 Summary: ${completed} succeeded, ${failed} failed`)
    return { completed, failed }
}
```

## Error Aggregation

### Pattern: Collect and Report Errors

```javascript
/**
 * Error collector for batch operations
 */
class ErrorCollector {
    constructor() {
        this.errors = []
    }
    
    /**
     * Add error to collection
     * @param {string} context - Error context
     * @param {Error} error - Error object
     */
    add(context, error) {
        this.errors.push({
            context,
            message: error.message,
            stack: error.stack
        })
    }
    
    /**
     * Check if any errors occurred
     * @returns {boolean}
     */
    hasErrors() {
        return this.errors.length > 0
    }
    
    /**
     * Print error report
     */
    report() {
        if (!this.hasErrors()) {
            return
        }
        
        console.error(`\n❌ ${this.errors.length} errors occurred:\n`)
        
        for (const { context, message } of this.errors) {
            console.error(`  • ${context}: ${message}`)
        }
    }
    
    /**
     * Exit with error code if errors exist
     */
    exitIfErrors() {
        if (this.hasErrors()) {
            this.report()
            process.exit(1)
        }
    }
}

// Usage
const errors = new ErrorCollector()

for (const file of files) {
    try {
        processFile(file)
    } catch (error) {
        errors.add(file, error)
    }
}

errors.exitIfErrors()
```

## Command Line Arguments

### Pattern: Simple Argument Parsing

```javascript
/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
    const args = process.argv.slice(2)
    const options = {
        force: false,
        verbose: false,
        output: null
    }
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '--force' || arg === '-f') {
            options.force = true
        } else if (arg === '--verbose' || arg === '-v') {
            options.verbose = true
        } else if (arg === '--output' || arg === '-o') {
            options.output = args[++i]
        } else if (arg === '--help' || arg === '-h') {
            printHelp()
            process.exit(0)
        } else {
            console.error(`Unknown argument: ${arg}`)
            process.exit(1)
        }
    }
    
    return options
}

function printHelp() {
    console.log(`
Usage: node script-name.js [options]

Options:
  -f, --force       Force overwrite existing files
  -v, --verbose     Enable verbose output
  -o, --output      Specify output directory
  -h, --help        Show this help message
    `)
}
```

## Common Mistakes to Avoid

❌ **Missing shebang** → Script not directly executable

❌ **Using CommonJS instead of ESM** → Inconsistent with project

❌ **Not checking file existence** → Crashes on missing files

❌ **Overwriting without backup** → Data loss risk

❌ **Poor error handling** → Unclear failure reasons

❌ **No progress feedback** → User doesn't know what's happening

❌ **Hardcoded paths** → Breaks in different environments

❌ **Not cleaning up temp files** → Leaves artifacts

❌ **Wrong exit codes** → CI/CD can't detect failures

## NPM Script Integration

Scripts should integrate with package.json:

```json
{
  "scripts": {
    "generate:docs": "node generate-command-docs.js",
    "generate:sidebar": "node generate-sidebar-config.js",
    "update:changelog": "node CHANGELOG.js",
    "enhance:docs": "node enhance-command-docs.js"
  }
}
```

## Documentation Requirements

Every automation script should have:
- JSDoc header explaining purpose and usage
- Examples of how to run the script
- Description of what files it creates/modifies
- Any prerequisites or dependencies
- Expected output format

## Reference Examples in This Repository

- `CHANGELOG.js` - Simple changelog generation
- `generate-command-docs.js` - Complex metadata extraction and doc generation
- `generate-sidebar-config.js` - VitePress configuration generation
- `enhance-command-docs.js` - File enhancement with metadata
- `update-epilogues.js` - Batch file updates
