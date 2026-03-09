---
description: "Use when creating or updating maintenance scripts in scripts/. Enforces patterns for validation, postinstall hooks, build utilities, CLI argument parsing, exit code conventions, CI/CD integration, and internationalized user feedback. Ensures scripts are robust, testable, and follow established conventions."
applyTo: "scripts/**/*.js"
---

# Scripts Directory Development Guidelines

Use this guide when creating or modifying scripts in the `scripts/` directory.

## Scope and Purpose

This guide applies to maintenance and utility scripts in the `scripts/` directory that support development, testing, and build processes:

**Script Types:**
- **Postinstall scripts**: Run after npm install (`postinstall.js`)
- **Validation scripts**: Check project integrity (`validate-i18n.js`)
- **Build utilities**: Generate documentation indices (`build-docs-index.js`)
- **Test utilities**: Process test output (`run-test-output.js`)

## Critical Principles

1. **Shebang**: Start with `#!/usr/bin/env node` for npm script execution
2. **Exit Codes**: Use 0 (success), 1 (validation failure), 2 (error)
3. **CI-Friendly**: Detect and adapt to CI/CD environments
4. **Quiet Mode**: Support --quiet flag for minimal output
5. **Internationalization**: Use text bundles for user messages
6. **Error Aggregation**: Collect all errors before failing
7. **Idempotent**: Safe to run multiple times
8. **Self-Contained**: Don't require external setup

## File Structure Template

```javascript
#!/usr/bin/env node

/**
 * Script purpose and description
 * 
 * This script [what it does].
 * 
 * Usage: node scripts/script-name.js [--flag] [--option value]
 * 
 * Exit codes:
 *   0 = Success
 *   1 = Validation failures or warnings
 *   2 = Fatal error (file system, parsing, etc.)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
    rootDir: path.join(__dirname, '..'),
    targetDir: path.join(__dirname, '..', 'target'),
    // ... other config
}

// Parse arguments
const args = process.argv.slice(2)
const options = {
    quiet: args.includes('--quiet'),
    fix: args.includes('--fix'),
    help: args.includes('--help') || args.includes('-h')
}

// State tracking
let errorCount = 0
let warningCount = 0
const errors = []
const warnings = []

/**
 * Log error and track it
 * @param {string} message - Error message
 */
function logError(message) {
    errorCount++
    errors.push(message)
    if (!options.quiet) console.error(`❌ ERROR: ${message}`)
}

/**
 * Log warning and track it
 * @param {string} message - Warning message
 */
function logWarning(message) {
    warningCount++
    warnings.push(message)
    if (!options.quiet) console.warn(`⚠️  WARNING: ${message}`)
}

/**
 * Log info message
 * @param {string} message - Info message
 */
function logInfo(message) {
    if (!options.quiet) console.log(`ℹ️  ${message}`)
}

/**
 * Main execution function
 */
async function main() {
    try {
        if (options.help) {
            printHelp()
            process.exit(0)
        }

        logInfo('Starting script...')
        
        // Script logic here
        
        // Report results
        if (errorCount > 0 || warningCount > 0) {
            console.log(`\n📊 Summary: ${errorCount} errors, ${warningCount} warnings`)
            process.exit(errorCount > 0 ? 1 : 0)
        }
        
        if (!options.quiet) console.log('✅ All checks passed')
        process.exit(0)
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message)
        console.error(error.stack)
        process.exit(2)
    }
}

/**
 * Print help message
 */
function printHelp() {
    console.log(`
Usage: node scripts/script-name.js [options]

Options:
  --quiet     Minimal output, only errors
  --fix       Automatically fix issues if possible
  --help, -h  Show this help message

Exit Codes:
  0 = Success
  1 = Validation failures found
  2 = Fatal error occurred
    `)
}

main()
```

## Exit Code Conventions

### Standard Exit Codes

```javascript
// Exit code constants
const EXIT_SUCCESS = 0      // All checks passed
const EXIT_VALIDATION = 1    // Validation failures (fixable issues)
const EXIT_ERROR = 2         // Fatal error (file not found, parse error, etc.)

// Usage patterns
if (validationErrors.length > 0) {
    console.error(`Found ${validationErrors.length} validation errors`)
    process.exit(EXIT_VALIDATION)
}

if (criticalError) {
    console.error('Fatal error:', criticalError.message)
    process.exit(EXIT_ERROR)
}

console.log('✅ Success')
process.exit(EXIT_SUCCESS)
```

## CI/CD Environment Detection

### Pattern: Skip in CI Environments

```javascript
/**
 * Check if running in CI environment
 * @returns {boolean}
 */
function isCI() {
    return (
        process.env.CI === 'true' ||
        process.env.GITHUB_ACTIONS === 'true' ||
        process.env.TRAVIS === 'true' ||
        process.env.CIRCLECI === 'true' ||
        process.env.JENKINS_HOME !== undefined
    )
}

// Example: Skip postinstall in CI
if (isCI()) {
    console.log('CI environment detected, skipping postinstall tasks')
    process.exit(0)
}
```

### Pattern: CI-Specific Behavior

```javascript
/**
 * Adjust behavior based on environment
 */
function getScriptOptions() {
    if (isCI()) {
        return {
            verbose: false,
            colors: false,
            failFast: true,
            timeout: 30000
        }
    }
    
    return {
        verbose: true,
        colors: true,
        failFast: false,
        timeout: 0
    }
}
```

## Argument Parsing Patterns

### Pattern: Comprehensive Argument Parser

```javascript
/**
 * Parse command line arguments
 * @returns {Object} Parsed options
 */
function parseArguments() {
    const args = process.argv.slice(2)
    const options = {
        quiet: false,
        fix: false,
        verbose: false,
        filter: null,
        dryRun: false
    }
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        switch (arg) {
            case '--quiet':
            case '-q':
                options.quiet = true
                break
                
            case '--fix':
            case '-f':
                options.fix = true
                break
                
            case '--verbose':
            case '-v':
                options.verbose = true
                break
                
            case '--dry-run':
                options.dryRun = true
                break
                
            case '--filter':
                options.filter = args[++i]
                break
                
            case '--help':
            case '-h':
                return { help: true }
                
            default:
                console.error(`Unknown argument: ${arg}`)
                console.error('Use --help for usage information')
                process.exit(2)
        }
    }
    
    // Validate combinations
    if (options.quiet && options.verbose) {
        console.error('Cannot use --quiet and --verbose together')
        process.exit(2)
    }
    
    return options
}
```

## Internationalization with Text Bundles

### Pattern: Load and Use Text Bundles

```javascript
import { TextBundle } from '@sap/textbundle'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load text bundle
const bundle = new TextBundle(join(__dirname, '..', '_i18n', 'messages.properties'))

// Use in script
console.log(bundle.getText('scripts.postinstall.skippingCI'))
console.log(bundle.getText('scripts.validate.checkingFiles', [fileCount]))

// With error handling
function getText(key, params = []) {
    try {
        return bundle.getText(key, params)
    } catch (error) {
        // Fallback if key not found
        return `[${key}]`
    }
}
```

## Validation Script Pattern

### Example: i18n Validation Script

```javascript
#!/usr/bin/env node

/**
 * Validates i18n translation files for completeness and consistency.
 * 
 * This script checks that:
 * 1. All translation features have complete language file sets (EN + 4 languages)
 * 2. All keys are present in all 5 files for a feature
 * 3. Key naming is consistent with the descriptive pattern
 * 4. No orphaned or incomplete language files exist
 * 
 * Usage: node scripts/validate-i18n.js [--fix] [--quiet]
 * 
 * Exit codes:
 *   0 = All validations passed
 *   1 = Validation failures found
 *   2 = Invalid arguments or file system error
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const I18N_DIR = path.join(__dirname, '../_i18n')
const LANGUAGES = ['', '_de', '_es', '_fr', '_pt']
const LANGUAGE_NAMES = { 
    '': 'English', 
    '_de': 'German', 
    '_es': 'Spanish', 
    '_fr': 'French', 
    '_pt': 'Portuguese' 
}

// Parse arguments
const args = process.argv.slice(2)
const shouldFix = args.includes('--fix')
const isQuiet = args.includes('--quiet')

// State tracking
let errorCount = 0
let warningCount = 0
const errors = []
const warnings = []

/**
 * Log an error and track it
 */
function logError(message) {
    errorCount++
    errors.push(message)
    if (!isQuiet) console.error(`❌ ERROR: ${message}`)
}

/**
 * Log a warning and track it
 */
function logWarning(message) {
    warningCount++
    warnings.push(message)
    if (!isQuiet) console.warn(`⚠️  WARNING: ${message}`)
}

/**
 * Parse .properties file
 * @param {string} filePath - Path to properties file
 * @returns {Map<string, string>} Key-value pairs
 */
function parsePropertiesFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const entries = new Map()
    
    const lines = content.split(/\r?\n/)
    for (const line of lines) {
        const trimmed = line.trim()
        
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) {
            continue
        }
        
        // Parse key=value
        const separatorIndex = trimmed.search(/[:=]/)
        if (separatorIndex === -1) {
            continue
        }
        
        const key = trimmed.slice(0, separatorIndex).trim()
        const value = trimmed.slice(separatorIndex + 1).trim()
        
        if (key) {
            entries.set(key, value)
        }
    }
    
    return entries
}

/**
 * Get base name from filename
 * @param {string} filename - Filename like 'feature_de.properties'
 * @returns {string} Base name like 'feature'
 */
function getBaseName(filename) {
    return filename.replace(/(_de|_es|_fr|_pt)?\.properties$/, '')
}

/**
 * Validate that all language variants exist for a feature
 * @param {string} baseName - Feature base name
 */
function validateLanguageCompleteness(baseName) {
    const missingLanguages = []
    
    for (const lang of LANGUAGES) {
        const filename = `${baseName}${lang}.properties`
        const filePath = path.join(I18N_DIR, filename)
        
        if (!fs.existsSync(filePath)) {
            missingLanguages.push(LANGUAGE_NAMES[lang])
        }
    }
    
    if (missingLanguages.length > 0) {
        logError(`Feature "${baseName}" is missing translations: ${missingLanguages.join(', ')}`)
    }
}

/**
 * Validate that all files for a feature have the same keys
 * @param {string} baseName - Feature base name
 */
function validateKeyConsistency(baseName) {
    const fileKeys = new Map()
    
    // Load keys from all language files
    for (const lang of LANGUAGES) {
        const filename = `${baseName}${lang}.properties`
        const filePath = path.join(I18N_DIR, filename)
        
        if (!fs.existsSync(filePath)) {
            continue
        }
        
        const keys = parsePropertiesFile(filePath)
        fileKeys.set(lang, keys)
    }
    
    if (fileKeys.size === 0) {
        return
    }
    
    // Get base (English) keys as reference
    const baseKeys = fileKeys.get('') || new Map()
    const baseKeySet = new Set(baseKeys.keys())
    
    // Check each language file
    for (const [lang, keys] of fileKeys) {
        if (lang === '') continue // Skip base file
        
        const langKeySet = new Set(keys.keys())
        
        // Keys in lang file but not in base
        for (const key of langKeySet) {
            if (!baseKeySet.has(key)) {
                logWarning(`${baseName}${lang}.properties has extra key: ${key}`)
            }
        }
        
        // Keys in base but not in lang file
        for (const key of baseKeySet) {
            if (!langKeySet.has(key)) {
                logError(`${baseName}${lang}.properties is missing key: ${key}`)
            }
        }
    }
}

/**
 * Main validation function
 */
async function main() {
    try {
        if (!fs.existsSync(I18N_DIR)) {
            console.error(`❌ i18n directory not found: ${I18N_DIR}`)
            process.exit(2)
        }
        
        if (!isQuiet) {
            console.log('🔍 Validating i18n translation files...\n')
        }
        
        // Get all base feature names
        const files = fs.readdirSync(I18N_DIR)
            .filter(f => f.endsWith('.properties'))
        
        const baseNames = new Set()
        for (const file of files) {
            baseNames.add(getBaseName(file))
        }
        
        if (!isQuiet) {
            console.log(`Found ${baseNames.size} translation features\n`)
        }
        
        // Validate each feature
        for (const baseName of baseNames) {
            validateLanguageCompleteness(baseName)
            validateKeyConsistency(baseName)
        }
        
        // Report results
        console.log(`\n📊 Validation Summary:`)
        console.log(`   Errors: ${errorCount}`)
        console.log(`   Warnings: ${warningCount}`)
        
        if (errorCount > 0) {
            console.log('\n❌ Validation failed')
            process.exit(1)
        } else if (warningCount > 0) {
            console.log('\n⚠️  Validation passed with warnings')
            process.exit(0)
        } else {
            console.log('\n✅ All validations passed')
            process.exit(0)
        }
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message)
        console.error(error.stack)
        process.exit(2)
    }
}

main()
```

## Postinstall Script Pattern

### Example: Postinstall Hook

```javascript
#!/usr/bin/env node

import pkg from '@sap/textbundle'
const { TextBundle } = pkg
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load text bundle for messages
const bundle = new TextBundle(join(__dirname, '..', '_i18n', 'messages.properties'))

// Skip postinstall in CI environments
if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    console.log(bundle.getText('scripts.postinstall.skippingCI'))
    process.exit(0)
}

// Perform postinstall tasks
import { exec } from 'node:child_process'

exec('npm link @sap/cds-dk --local', (error, stdout, stderr) => {
    if (error) {
        console.log(bundle.getText('scripts.postinstall.linkFailed'))
        // Don't fail the install - it's optional
        process.exit(0)
    } else {
        console.log(bundle.getText('scripts.postinstall.linkSuccess'))
        if (stdout) console.log(stdout)
        process.exit(0)
    }
})
```

## Build Utility Pattern

### Example: Documentation Index Builder

```javascript
#!/usr/bin/env node

/**
 * Build documentation search index
 * 
 * Scans all markdown files and creates a searchable index
 * for the documentation site.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = path.join(__dirname, '..', 'docs')
const OUTPUT_FILE = path.join(__dirname, '..', 'docs-index.json')

/**
 * Recursively scan directory for markdown files
 * @param {string} dir - Directory to scan
 * @param {string} baseDir - Base directory for relative paths
 * @returns {Array<Object>} Array of document entries
 */
function scanDirectory(dir, baseDir = dir) {
    const entries = []
    
    const files = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const file of files) {
        const fullPath = path.join(dir, file.name)
        
        if (file.isDirectory()) {
            // Skip certain directories
            if (file.name === 'node_modules' || file.name === '.vitepress') {
                continue
            }
            entries.push(...scanDirectory(fullPath, baseDir))
        } else if (file.name.endsWith('.md')) {
            entries.push(processMarkdownFile(fullPath, baseDir))
        }
    }
    
    return entries
}

/**
 * Extract metadata from markdown file
 * @param {string} filePath - Path to markdown file
 * @param {string} baseDir - Base directory for relative paths
 * @returns {Object} Document entry
 */
function processMarkdownFile(filePath, baseDir) {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.relative(baseDir, filePath)
    
    // Extract title (first # heading)
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md')
    
    // Extract description (first paragraph after title)
    const descMatch = content.match(/^#\s+.+\n\n(.+)$/m)
    const description = descMatch ? descMatch[1].trim().slice(0, 200) : ''
    
    // Extract all headings for better search
    const headings = []
    const headingRegex = /^#{1,6}\s+(.+)$/gm
    let match
    while ((match = headingRegex.exec(content)) !== null) {
        headings.push(match[1].trim())
    }
    
    return {
        path: relativePath.replace(/\\/g, '/'),
        title,
        description,
        headings,
        // Create searchable text
        searchText: `${title} ${description} ${headings.join(' ')}`.toLowerCase()
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🔍 Scanning documentation files...')
        
        const documents = scanDirectory(DOCS_DIR)
        
        console.log(`📄 Found ${documents.length} documents`)
        
        // Create index
        const index = {
            version: '1.0.0',
            buildDate: new Date().toISOString(),
            documentCount: documents.length,
            documents
        }
        
        // Write index file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf8')
        
        console.log(`✅ Index written to ${OUTPUT_FILE}`)
        process.exit(0)
        
    } catch (error) {
        console.error('❌ Failed to build index:', error.message)
        process.exit(2)
    }
}

main()
```

## Error Aggregation Pattern

### Pattern: Collect All Errors Before Failing

```javascript
/**
 * Error collector for validation scripts
 */
class ValidationErrorCollector {
    constructor() {
        this.errors = []
        this.warnings = []
    }
    
    /**
     * Add error
     * @param {string} category - Error category
     * @param {string} message - Error message
     * @param {string} [file] - Related file
     */
    addError(category, message, file = null) {
        this.errors.push({ category, message, file })
    }
    
    /**
     * Add warning
     * @param {string} category - Warning category
     * @param {string} message - Warning message
     * @param {string} [file] - Related file
     */
    addWarning(category, message, file = null) {
        this.warnings.push({ category, message, file })
    }
    
    /**
     * Get error count
     * @returns {number}
     */
    getErrorCount() {
        return this.errors.length
    }
    
    /**
     * Get warning count
     * @returns {number}
     */
    getWarningCount() {
        return this.warnings.length
    }
    
    /**
     * Print report
     * @param {boolean} quiet - Quiet mode
     */
    printReport(quiet = false) {
        if (quiet && this.errors.length === 0) {
            return
        }
        
        console.log('\n📊 Validation Report\n')
        
        // Group errors by category
        const errorsByCategory = this.#groupBy(this.errors, 'category')
        
        for (const [category, items] of Object.entries(errorsByCategory)) {
            console.error(`❌ ${category} (${items.length})`)
            for (const item of items) {
                const fileInfo = item.file ? ` [${item.file}]` : ''
                console.error(`   • ${item.message}${fileInfo}`)
            }
            console.error()
        }
        
        // Group warnings by category
        if (!quiet && this.warnings.length > 0) {
            const warningsByCategory = this.#groupBy(this.warnings, 'category')
            
            for (const [category, items] of Object.entries(warningsByCategory)) {
                console.warn(`⚠️  ${category} (${items.length})`)
                for (const item of items) {
                    const fileInfo = item.file ? ` [${item.file}]` : ''
                    console.warn(`   • ${item.message}${fileInfo}`)
                }
                console.warn()
            }
        }
        
        console.log(`Summary: ${this.errors.length} errors, ${this.warnings.length} warnings\n`)
    }
    
    /**
     * Group items by property
     * @param {Array} items - Items to group
     * @param {string} property - Property to group by
     * @returns {Object} Grouped items
     */
    #groupBy(items, property) {
        return items.reduce((groups, item) => {
            const key = item[property] || 'Other'
            if (!groups[key]) {
                groups[key] = []
            }
            groups[key].push(item)
            return groups
        }, {})
    }
    
    /**
     * Exit with appropriate code
     * @param {boolean} allowWarnings - Whether warnings are acceptable
     */
    exitWithCode(allowWarnings = true) {
        if (this.errors.length > 0) {
            process.exit(1)
        } else if (!allowWarnings && this.warnings.length > 0) {
            process.exit(1)
        } else {
            process.exit(0)
        }
    }
}

// Usage
const collector = new ValidationErrorCollector()

// Collect errors
for (const file of files) {
    if (!validateFile(file)) {
        collector.addError('File Validation', `Invalid file: ${file}`, file)
    }
}

// Report and exit
collector.printReport(options.quiet)
collector.exitWithCode()
```

## Common Mistakes to Avoid

❌ **Missing shebang** → npm scripts can't execute directly

❌ **Wrong exit codes** → CI/CD can't distinguish failure types

❌ **Not detecting CI** → Unnecessary operations in build pipelines

❌ **Failing on warnings** → Too strict for development

❌ **No quiet mode** → Verbose output clutters CI logs

❌ **Poor error messages** → Hard to diagnose issues

❌ **Not using text bundles** → Inconsistent with project i18n

❌ **Synchronous I/O in loops** → Performance issues

❌ **Not aggregating errors** → Script fails on first issue

## NPM Script Integration

Scripts should be callable from package.json:

```json
{
  "scripts": {
    "postinstall": "node scripts/postinstall.js",
    "validate:i18n": "node scripts/validate-i18n.js",
    "validate:i18n:quiet": "node scripts/validate-i18n.js --quiet",
    "build:docs-index": "node scripts/build-docs-index.js",
    "test:output": "node scripts/run-test-output.js"
  }
}
```

## Documentation Requirements

Every script in `scripts/` should have:
- JSDoc header with purpose, usage, and exit codes
- Help message accessible via --help flag
- Clear error messages with actionable advice
- Examples of common usage patterns
- Description of what it validates/generates/processes

## Reference Examples in This Repository

- `scripts/postinstall.js` - Postinstall hook with CI detection
- `scripts/validate-i18n.js` - Comprehensive validation script
- `scripts/build-docs-index.js` - Documentation indexing utility
- `scripts/run-test-output.js` - Test output processing
