// @ts-check
/**
 * @module base-lite - Lightweight utilities for CLI initialization (no heavy dependencies)
 */

import { fileURLToPath } from 'url'
import { URL } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
import { createRequire } from 'module'
export const require = createRequire(import.meta.url)

import * as path from 'path'
import fs from 'fs'

/** @type {typeof import("chalk")} */
import chalk from 'chalk'
export const colors = chalk

// Global configuration storage
let _config = {}

/**
 * Set global configuration (called from cli.js at startup)
 * @param {Object} config Configuration object
 */
export function setConfig(config) {
    _config = config || {}
}

/**
 * Get global configuration
 * @returns {Object} Configuration object
 */
export function getConfig() {
    return _config
}

/**
 * Get a specific configuration value with dot notation support
 * @param {string} key Configuration key (supports dot notation for nested access)
 * @param {*} defaultValue Default value if key not found
 * @returns {*} Configuration value or default
 */
export function getConfigValue(key, defaultValue = undefined) {
    const keys = key.split('.')
    let value = _config
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k]
        } else {
            return defaultValue
        }
    }
    
    return value
}

/** @type {typeof import("debug") } */
// Lazy-load debug module only if DEBUG env var is set (saves ~8ms on startup)
let _debug = null
export const debug = (...args) => {
    if (!_debug) {
        // Only load debug module if DEBUG is enabled
        if (process.env.DEBUG) {
            const debugModule = require('debug')
            _debug = debugModule('hana-cli')
        } else {
            // No-op function when debug is disabled
            _debug = () => {}
        }
    }
    return _debug(...args)
}

import * as locale from "./locale.js"
const TextBundle = require('@sap/textbundle').TextBundle

/**
 * Parse .properties file content into a key-value map.
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseProperties(content) {
    /** @type {Record<string, string>} */
    const entries = {}
    const lines = content.split(/\r?\n/)
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) {
            continue
        }

        const separatorIndex = trimmed.search(/[:=]/)
        if (separatorIndex === -1) {
            continue
        }

        const key = trimmed.slice(0, separatorIndex).trim()
        const value = trimmed.slice(separatorIndex + 1).trim()
        if (key) {
            entries[key] = value
        }
    }

    return entries
}

/**
 * Load .properties file content if present.
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
function loadPropertiesFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return {}
        }
        const content = fs.readFileSync(filePath, 'utf-8')
        return parseProperties(content)
    } catch {
        return {}
    }
}

/**
 * Load additional text resources for a given base name and locale.
 * @param {string} baseName
 * @param {string} localeTag
 * @returns {Record<string, string>}
 */
function loadAdditionalTexts(baseName, localeTag) {
    const basePath = path.join(__dirname, '..', '/_i18n', `${baseName}.properties`)
    let texts = loadPropertiesFile(basePath)

    const candidates = []
    if (localeTag) {
        candidates.push(localeTag)
        const languageOnly = localeTag.split(/[_-]/)[0]
        if (languageOnly && languageOnly !== localeTag) {
            candidates.push(languageOnly)
        }
    }

    for (const candidate of candidates) {
        const localizedPath = path.join(__dirname, '..', '/_i18n', `${baseName}_${candidate}.properties`)
        texts = { ...texts, ...loadPropertiesFile(localizedPath) }
    }

    return texts
}

/**
 * Format text with {n} placeholders.
 * @param {string} value
 * @param {Array<any>} args
 * @returns {string}
 */
function formatText(value, args) {
    if (!args || args.length === 0) {
        return value
    }
    return value.replace(/\{(\d+)\}/g, (match, index) => {
        const replacement = args[Number(index)]
        return replacement !== undefined ? String(replacement) : match
    })
}

const normalizedLocale = locale.normalizeLocale(locale.getLocale())
const baseBundle = new TextBundle(path.join(__dirname, '..', '/_i18n/messages'), normalizedLocale)
const additionalBundles = [
    'duplicateDetection',
    'compareData',
    'dataDiff',
    'dataLineage',
    'dataProfile',
    'dataValidator',
    'export',
    'referentialCheck'
]
const additionalTexts = additionalBundles.reduce((acc, bundleName) => {
    return { ...acc, ...loadAdditionalTexts(bundleName, normalizedLocale) }
}, {})

/** @typeof TextBundle - instance of sap/textbundle */
export const bundle = new Proxy(baseBundle, {
    get(target, prop) {
        if (prop === 'getText') {
            return (key, args) => {
                if (Object.prototype.hasOwnProperty.call(additionalTexts, key)) {
                    return formatText(additionalTexts[key], args)
                }
                return baseBundle.getText(key, args)
            }
        }
        return target[prop]
    }
})

/**
 * Output an error to the console
 * @param {Error} err - Error object or error message
 * @returns {Promise<void>}
 */
export async function error(err) {
    console.error(colors.red(`${bundle.getText("error")} ${err.toString()}`))
    if (err.stack) {
        console.error(colors.red(err.stack))
    }
}

/**
 * Build yargs options with common connection and debug parameters
 * Applies configuration defaults from .hana-cli-config or hana-cli.config.js
 * @param {object} input - Command-specific options
 * @param {boolean} [iConn=true] - Include connection parameters
 * @param {boolean} [iDebug=true] - Include debug parameters
 * @returns {object} Combined options object
 */
export function getBuilder(input, iConn = true, iDebug = true) {

    let grpConn = {}
    let grpDebug = {}

    if (iConn) {
        grpConn = {
            admin: {
                alias: ['a'],
                type: 'boolean',
                default: getConfigValue('admin', false),
                group: bundle.getText("grpConn"),
                desc: bundle.getText("admin")
            },
            conn: {
                default: getConfigValue('conn'),
                group: bundle.getText("grpConn"),
                desc: bundle.getText("connFile")
            },
        }
    }

    if (iDebug) {
        grpDebug = {
            disableVerbose: {
                alias: ['quiet'],
                group: bundle.getText("grpDebug"),
                type: 'boolean',
                default: getConfigValue('disableVerbose', false),
                desc: bundle.getText("disableVerbose")
            },
            debug: {
                alias: ['d'],
                group: bundle.getText("grpDebug"),
                type: 'boolean',
                default: getConfigValue('debug', false),
                desc: bundle.getText("debug")
            }
        }
    }
    
    // Merge input options and apply config defaults to input options as well
    let builder = {
        ...input,
        ...grpConn,
        ...grpDebug
    }
    
    // Apply config defaults to input options - only if not already set in input
    for (const [key, option] of Object.entries(builder)) {
        if (option && typeof option === 'object' && !('default' in option)) {
            const configValue = getConfigValue(key)
            if (configValue !== undefined) {
                option.default = configValue
            }
        }
    }
    
    // Apply global config defaults
    if (getConfigValue('defaultSchema')) {
        if (builder.schema && !builder.schema.default) {
            builder.schema.default = getConfigValue('defaultSchema')
        }
    }
    
    if (getConfigValue('outputFormat')) {
        if (builder.outputFormat && !builder.outputFormat.default) {
            builder.outputFormat.default = getConfigValue('outputFormat')
        }
    }
    
    if (getConfigValue('language')) {
        // Language is typically handled globally, not per-command
    }
    
    return builder
}
