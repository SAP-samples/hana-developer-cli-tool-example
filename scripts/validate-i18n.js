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
const LANGUAGE_NAMES = { '': 'English', '_de': 'German', '_es': 'Spanish', '_fr': 'French', '_pt': 'Portuguese' }

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
 * Log info (only if not quiet mode)
 */
function logInfo(message) {
  if (!isQuiet) console.log(`ℹ️  ${message}`)
}

/**
 * Log success (only if not quiet mode)
 */
function logSuccess(message) {
  if (!isQuiet) console.log(`✅ ${message}`)
}

/**
 * Parse a properties file and return key-value pairs and key order
 */
function parsePropertiesFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const keys = new Set()
    const keyOrder = []
    const pairs = {}

    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue

      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue

      const key = trimmed.substring(0, eqIndex).trim()
      const value = trimmed.substring(eqIndex + 1).trim()

      if (key && !keys.has(key)) {
        keys.add(key)
        keyOrder.push(key)
        pairs[key] = value
      }
    }

    return { keys, keyOrder, pairs }
  } catch (error) {
    logError(`Failed to read file ${filePath}: ${error.message}`)
    return { keys: new Set(), keyOrder: [], pairs: {} }
  }
}

/**
 * Validate key naming follows the descriptive pattern
 */
function isValidKeyName(key) {
  // Pattern: camelCase starting with feature name
  // Examples: backupCommand, importError, syncWarning, examplesSearch
  // Must start with lowercase letter, followed by alphanumerics and camelCase
  return /^[a-z][a-zA-Z0-9]*$/.test(key)
}

/**
 * Get feature name from filename (e.g., "backup" from "backup_de.properties")
 */
function getFeatureName(filename) {
  return filename.replace(/(_[a-z]{2})?\.properties$/, '')
}

/**
 * Main validation function
 */
function validateI18n() {
  if (!fs.existsSync(I18N_DIR)) {
    logError(`i18n directory not found: ${I18N_DIR}`)
    return false
  }

  // Get all property files
  const files = fs.readdirSync(I18N_DIR).filter(f => f.endsWith('.properties'))
  if (files.length === 0) {
    logError('No .properties files found in _i18n directory')
    return false
  }

  // Group files by feature name
  const featureMap = new Map()
  for (const file of files) {
    const featureName = getFeatureName(file)
    const langCode = file.substring(featureName.length).replace('.properties', '')

    if (!featureMap.has(featureName)) {
      featureMap.set(featureName, {})
    }
    featureMap.get(featureName)[langCode] = file
  }

  logInfo(`Found ${featureMap.size} features with translatable content`)
  logInfo(`Processing: ${Array.from(featureMap.keys()).join(', ')}`)
  console.log('')

  // Validate each feature
  for (const [featureName, filesMap] of featureMap) {
    validateFeature(featureName, filesMap)
  }

  console.log('')
  console.log('═══════════════════════════════════════')
  console.log(`Validation completed:`)
  console.log(`  Errors: ${errorCount}`)
  console.log(`  Warnings: ${warningCount}`)
  console.log('═══════════════════════════════════════')

  if (errorCount > 0) {
    console.log('\nErrors:')
    errors.forEach(err => console.log(`  • ${err}`))
  }

  if (warningCount > 0) {
    console.log('\nWarnings:')
    warnings.forEach(warn => console.log(`  • ${warn}`))
  }

  return errorCount === 0
}

/**
 * Validate a single feature's language files
 */
function validateFeature(featureName, filesMap) {
  logInfo(`Validating feature: ${featureName}`)

  // Check all required language files exist
  const missingLangs = []
  for (const langCode of LANGUAGES) {
    if (!filesMap[langCode]) {
      missingLangs.push(LANGUAGE_NAMES[langCode])
    }
  }

  if (missingLangs.length > 0) {
    logError(`Feature '${featureName}' missing language files: ${missingLangs.join(', ')}`)
    return
  }

  // Parse all files
  const fileParsed = {}
  for (const langCode of LANGUAGES) {
    const filePath = path.join(I18N_DIR, filesMap[langCode])
    fileParsed[langCode] = parsePropertiesFile(filePath)
  }

  // Get keys from English base file
  const baseKeys = fileParsed[''].keys
  if (baseKeys.size === 0) {
    logWarning(`Feature '${featureName}' has no keys in English file`)
    return
  }

  logInfo(`  Keys found in ${featureName}: ${baseKeys.size}`)

  // Check key consistency across all languages
  let allKeysMatch = true
  const keyMismatches = {}

  for (const langCode of LANGUAGES) {
    if (langCode === '') continue // Skip English (it's the base)

    const langKeys = fileParsed[langCode].keys
    const langName = LANGUAGE_NAMES[langCode]

    // Check for missing keys in language file
    const missingInLang = [...baseKeys].filter(k => !langKeys.has(k))
    if (missingInLang.length > 0) {
      allKeysMatch = false
      logError(`Feature '${featureName}' missing keys in ${langName}: ${missingInLang.join(', ')}`)
      keyMismatches[langCode] = missingInLang
    }

    // Check for extra keys in language file
    const extraInLang = [...langKeys].filter(k => !baseKeys.has(k))
    if (extraInLang.length > 0) {
      allKeysMatch = false
      logError(`Feature '${featureName}' has extra keys in ${langName}: ${extraInLang.join(', ')}`)
    }
  }

  // Validate key naming convention
  for (const key of baseKeys) {
    if (!isValidKeyName(key)) {
      logWarning(`Feature '${featureName}' has non-standard key name: '${key}' (should be camelCase like 'featureCommand')`)
    }
  }

  // Check for empty values
  for (const langCode of LANGUAGES) {
    const langName = LANGUAGE_NAMES[langCode]
    const pairs = fileParsed[langCode].pairs

    for (const [key, value] of Object.entries(pairs)) {
      if (!value || value.trim() === '') {
        logError(`Feature '${featureName}' has empty value for key '${key}' in ${langName}`)
      }
    }
  }

  if (allKeysMatch && missingLangs.length === 0) {
    logSuccess(`Feature '${featureName}' is valid and complete`)
  }
}

// Run validation
const isValid = validateI18n()

if (!isValid) {
  process.exit(1)
}

logSuccess('All i18n validations passed!')
process.exit(0)
