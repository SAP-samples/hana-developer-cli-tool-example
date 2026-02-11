// @ts-check
/**
 * @module base - Central functionality shared by all the various commands
 */

import { fileURLToPath } from 'url'
import { URL } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
import { createRequire } from 'module'
// @ts-ignore
export const require = createRequire(import.meta.url)

import * as path from 'path'

// Database class is kept as eager load since it's only used in actual DB operations
import dbClassDef from "sap-hdb-promisfied"
/** @typedef {dbClassDef} dbClass - instance of sap-hdb-promisified module */
export const dbClass = dbClassDef

import * as conn from "../utils/connections.js"

import * as sqlInjectionDef from "../utils/sqlInjection.js"
export const sqlInjection = sqlInjectionDef
export const sqlInjectionUtils = sqlInjectionDef  //alias for backwards compatibility with @sap/hdbext

/** @type Object - HANA Client DB Connection */
let dbConnection = null
/** @typedef {dbClass} hdbextPromiseInstance - instance of sap-hdbext-promisified module */
let dbClassInstance = null

/** @type {typeof import("chalk")} */
import chalk from 'chalk'
export const colors = chalk

// Lazy-load inquirer prompts (only needed for interactive prompts)
let inquirerPrompts = null
const getInquirer = async () => {
    if (!inquirerPrompts) {
        inquirerPrompts = await import('@inquirer/prompts')
    }
    return inquirerPrompts
}

/** @type typeof import("glob") */
import { glob } from 'glob'

// @ts-ignore
import open from 'open'

/** @type {typeof import("debug") } */
// @ts-ignore
import debugModule from 'debug'
export const debug = new debugModule('hana-cli')
// @ts-ignore
import setDebug from 'debug'

import { inspect } from 'util'

/** @type string */
export let hanaBin = __dirname

/** @type boolean */
let inDebug = false
/** @type boolean */
let inGui = false

/** @type any */
let lastResults

import * as locale from "../utils/locale.js"
const TextBundle = require('@sap/textbundle').TextBundle
/** @typeof TextBundle - instance of sap/textbundle */
export const bundle = new TextBundle(path.join(__dirname, '..', '/_i18n/messages'), locale.getLocale())


/** @typedef {typeof import("ora")} Ora*/
/** @type Ora - Elegant terminal spinner */
let oraModule = null
const getOra = async () => {
    if (!oraModule) {
        // @ts-ignore
        oraModule = (await import('ora')).default
    }
    return oraModule
}

/** @typeof Ora.Options - Terminal spinner options */
let oraOptions = { type: 'clock', text: '\n' }
/** @typeof Ora.spinner | Void - elgant termianl spinner instance*/
let spinner = null
/**
 * Start the Terminal Spinner
 */
export async function startSpinnerInt() {
    const ora = await getOra()
    // @ts-ignore
    spinner = ora(oraOptions).start()
}
/**
 * Stop the Terminal Spinner
 */
export function stopSpinnerInt() {
    if (spinner) {
        spinner.stop()
    }
}

// Lazy-load terminal-kit (only needed for fancy table output)
let terminalkitModule = null
const getTerminalKit = async () => {
    if (!terminalkitModule) {
        // @ts-ignore
        const module = await import('terminal-kit')
        terminalkitModule = module.default
    }
    return terminalkitModule
}

export const getTerminal = async () => {
    const tk = await getTerminalKit()
    return tk.terminal
}

// Import terminal-kit synchronously for backward compatibility with existing code
// @ts-ignore
import terminalKit from 'terminal-kit'

// Wrap terminal access to handle test environments where terminal may not be available
let _terminal = null
try {
	if (process.env.NODE_ENV !== 'test') {
		_terminal = terminalKit.terminal
	} else {
		// Provide stub terminal for test environment that outputs to console
		_terminal = {
			table: (data) => {
				// In test mode, use console.table to ensure output is captured
				if (data && Array.isArray(data) && data.length > 0) {
					console.table(data)
				}
			},
			progressBar: () => ({
				startItem: () => {},
				itemDone: () => {},
				stop: () => {}
			})
		}
	}
} catch (error) {
	console.warn('Failed to initialize terminal-kit:', error.message)
	// Provide stub terminal that outputs to console
	_terminal = {
		table: (data) => {
			// Fallback: use console.table to ensure output
			if (data && Array.isArray(data) && data.length > 0) {
				console.table(data)
			}
		},
		progressBar: () => ({
			startItem: () => {},
			itemDone: () => {},
			stop: () => {}
		})
	}
}
export const terminal = _terminal

export let tableOptions = {
    hasBorder: true,
    contentHasMarkup: false,
    borderChars: 'lightRounded' ,
    borderAttr: { color: 'blue' } ,
    textAttr: { bgColor: 'default' } ,
    firstRowTextAttr: { bgColor: 'blue' } ,
    width: 150,  // Max table width to prevent overly wide output
    fit: true    // Auto-fit columns within max width
}

/** Maximum rows to display in terminal output before truncating */
export const MAX_DISPLAY_ROWS = 100

/**
 * Output a blank line to the console
 * @returns {void}
 */
export function blankLine(){
    console.log(`                                                                                        `)
}

/**
 * Validate that a limit parameter is a valid positive number
 * @param {any} limit - The limit value to validate
 * @param {string} [paramName='limit'] - Parameter name for error messages
 * @throws {Error} If limit is not a valid positive number
 * @returns {number} The validated limit as a number
 */
export function validateLimit(limit, paramName = 'limit') {
    // Check if limit is undefined or null
    if (limit === undefined || limit === null) {
        throw new Error(`${paramName} parameter is required`)
    }
    
    // Convert to number if it's a string
    const numLimit = typeof limit === 'string' ? Number(limit) : limit
    
    // Check if it's NaN or not a number
    if (typeof numLimit !== 'number' || isNaN(numLimit)) {
        throw new Error(`${paramName} parameter must be a valid number, received: ${limit}`)
    }
    
    // Check if it's a positive integer
    if (numLimit <= 0 || !Number.isInteger(numLimit)) {
        throw new Error(`${paramName} parameter must be a positive integer, received: ${limit}`)
    }
    
    return numLimit
}

/** type {object} - processed input prompts*/
let prompts = {}
/**
 *
 * @param {object} newPrompts - processed input prompts
 */
export function setPrompts(newPrompts) {
    debug('Set Prompts')
    prompts = newPrompts
    isDebug(prompts)
    isGui(prompts)
}

/**
 *
 * @returns {object} newPrompts - processed input prompts
 */
export function getPrompts() {
    debug('Get Prompts')

    // @ts-ignore
    if (!prompts.schema) { prompts.schema = "**CURRENT_SCHEMA**" }
    // @ts-ignore
    if (!prompts.table) { prompts.table = "*" }
    // @ts-ignore
    if (!prompts.view) { prompts.view = "*" }
    // @ts-ignore
    if (!prompts.limit) { prompts.limit = 200 }
    // @ts-ignore
    if (!prompts.folder) { prompts.folder = "./" }
    // @ts-ignore
    if (!prompts.admin || prompts.admin === "") { prompts.admin = false }
    // @ts-ignore
    if (!prompts.container) { prompts.container = "*" }
    // @ts-ignore
    if (!prompts.containerGroup) { prompts.containerGroup = "*" }
    // @ts-ignore
    if (!prompts.function) { prompts.function = "*" }
    // @ts-ignore
    if (!prompts.indexes) { prompts.indexes = "*" }
    // @ts-ignore
    if (!prompts.output) { prompts.output = "tbl" }
    // @ts-ignore
    if (typeof prompts.cf === 'undefined') { prompts.cf = true }
    // @ts-ignore
    if (typeof prompts.useExists === 'undefined') { prompts.useExists = true }
    // @ts-ignore
    if (typeof prompts.useQuoted === 'undefined') { prompts.useQuoted = false }
    // @ts-ignore
    if (typeof prompts.log === 'undefined') { prompts.log = false }
    // @ts-ignore
    if (typeof prompts.profile === 'undefined') { prompts.profile = "" }

    return prompts
}

/**
 * Clear the database connection
 * @returns {Promise<void>}
 */
export async function clearConnection() {
    dbConnection = null
}

/**
 * @param {object} [options] - override the already set parameters with new connection options
 * @returns {Promise<hdbextPromiseInstance>} - hdbext instanced promisfied
 */
export async function createDBConnection(options) {
    if (!dbConnection) {
        let rawClient
        if (options) {
            rawClient = await conn.createConnection(options, true)
        } else {
            rawClient = await conn.createConnection(prompts, false)
        }
        dbClassInstance = new dbClass(rawClient)
        dbConnection = dbClassInstance  // Store the wrapped instance
    }
    return dbConnection
}

/**
 * Initialize Yargs builder
 * @param {import("yargs").CommandBuilder} input - parameters for the command
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 * @returns {import("yargs").CommandBuilder} parameters for the command
 */
export function getBuilder(input, iConn = true, iDebug = true) {

    let grpConn = {}
    let grpDebug = {}

    if (iConn) {
        grpConn = {
            admin: {
                alias: ['a', 'Admin'],
                type: 'boolean',
                default: false,
                group: bundle.getText("grpConn"),
                desc: bundle.getText("admin")
            },
            conn: {
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
                default: false,
                desc: bundle.getText("disableVerbose")
            },
            debug: {
                alias: ['Debug'],
                group: bundle.getText("grpDebug"),
                type: 'boolean',
                default: false,
                desc: bundle.getText("debug")
            }
        }
    }
    let builder = {
        ...input,
        ...grpConn,
        ...grpDebug
    }
    return builder
}

/**
 * Initialize Yargs builder for massConvert Command
 * @param {boolean} [ui=false] - Mass Convert via Browser-based UI
 * @returns {import("yargs").CommandBuilder} parameters for the command
 */
export function getMassConvertBuilder(ui = false) {
    /** @type any */
    let parameters = {
        table: {
            alias: ['t', 'Table'],
            type: 'string',
            default: "*",
            desc: bundle.getText("table")
        },
        view: {
            alias: ['v', 'View'],
            type: 'string',
            desc: bundle.getText("view")
        },
        schema: {
            alias: ['s', 'Schema'],
            type: 'string',
            default: '**CURRENT_SCHEMA**',
            desc: bundle.getText("schema")
        },
        limit: {
            alias: ['l'],
            type: 'number',
            default: 200,
            desc: bundle.getText("limit")
        },
        folder: {
            alias: ['f', 'Folder'],
            type: 'string',
            default: './',
            desc: bundle.getText("folder")
        },
        filename: {
            alias: ['n', 'Filename'],
            type: 'string',
            desc: bundle.getText("filename")
        },
        log: {
            type: 'boolean',
            default: false,
            desc: bundle.getText("mass.log")
        },
        output: {
            alias: ['o', 'Output'],
            choices: ["hdbtable", "cds", "hdbmigrationtable"],
            default: "cds",
            type: 'string',
            desc: bundle.getText("outputType")
        },
        useHanaTypes: {
            alias: ['hana'],
            type: 'boolean',
            default: false,
            desc: bundle.getText("useHanaTypes")
        },
        useCatalogPure: {
            alias: ['catalog', 'pure'],
            type: 'boolean',
            default: false,
            desc: bundle.getText("useCatalogPure")
        },
        useExists: {
            alias: ['exists', 'persistence'],
            desc: bundle.getText("gui.useExists"),
            type: 'boolean',
            default: true
        },
        useQuoted: {
            alias: ['q', 'quoted', 'quotedIdentifiers'],
            desc: bundle.getText("gui.useQuoted"),
            type: 'boolean',
            default: false
        },
        namespace: {
            alias: ['ns'],
            type: 'string',
            desc: bundle.getText("namespace"),
            default: ''
        },
        synonyms: {
            type: 'string',
            desc: bundle.getText("synonyms"),
            default: ''
        },
        keepPath: {
            type: 'boolean',
            default: false,
            desc: bundle.getText("keepPath")
        },
        noColons: {
            type: 'boolean',
            default: false,
            desc: bundle.getText("noColons")
        }
    }
    if (ui) {
        parameters.port = {
            alias: ['p'],
            type: 'integer',
            default: false,
            desc: bundle.getText("port")
        }
    }

    return getBuilder(parameters, true, true)

}

/**
 * Initialize Yargs builder for massConvert Command
 * @param {boolean} [ui=false] - Mass Convert via Browser-based UI
 * @returns {object} - prompts schema object
 */
export function getMassConvertPrompts(ui = false) {
    let parameters = {
        table: {
            description: bundle.getText("table"),
            type: 'string',
            required: true
        },
        view: {
            description: bundle.getText("view"),
            type: 'string',
            required: false
        },
        schema: {
            description: bundle.getText("schema"),
            type: 'string',
            required: true
        },
        limit: {
            description: bundle.getText("limit"),
            type: 'number',
            required: true
        },
        folder: {
            description: bundle.getText("folder"),
            type: 'string',
            required: true
        },
        filename: {
            description: bundle.getText("filename"),
            type: 'string',
            required: true,
            ask: () => {
                return false
            }
        },
        output: {
            description: bundle.getText("outputType"),
            type: 'string',
            //       validator: /t[bl]*|s[ql]*|c[ds]?/,
            required: true
        },
        log: {
            description: bundle.getText("mass.log"),
            type: 'boolean'
        },
        useHanaTypes: {
            description: bundle.getText("useHanaTypes"),
            type: 'boolean'
        },
        useCatalogPure: {
            description: bundle.getText("useCatalogPure"),
            type: 'boolean'
        },
        useExists: {
            description: bundle.getText("gui.useExists"),
            type: 'boolean'
        },
        useQuoted: {
            description: bundle.getText("gui.useQuoted"),
            type: 'boolean'
        },
        namespace: {
            description: bundle.getText("namespace"),
            type: 'string',
            required: false
        },
        synonyms: {
            description: bundle.getText("synonyms"),
            type: 'string',
            required: false
        },
        keepPath: {
            type: 'boolean',
            description: bundle.getText("keepPath")
        },
        noColons: {
            type: 'boolean',
            description: bundle.getText("noColons")
        }
    }

    if (ui) {
        parameters.port = {
            description: bundle.getText("port"),
            required: false,
            ask: () => {
                return false
            }
        }
    }

    return parameters

}

/**
 * Transform prompt schema from old prompt format to inquirer format
 * @param {string} name - prompt name/key
 * @param {object} config - prompt configuration
 * @param {import("yargs").CommandBuilder} argv - command line arguments for default values
 * @returns {object|null} - inquirer prompt config or null if should be skipped
 */
function transformPromptConfig(name, config, argv) {
    // Check if prompt should be asked
    if (config.ask && typeof config.ask === 'function' && !config.ask()) {
        return null
    }

    let promptConfig = {
        name: name,
        message: colors.green(bundle.getText("input")) + ' ' + (config.description || name)
    }

    // Set default value from argv override or config default
    if (argv && argv[name] !== undefined) {
        promptConfig.default = argv[name]
    } else if (config.default !== undefined) {
        promptConfig.default = config.default
    }

    // Determine prompt type
    if (config.type === 'boolean') {
        promptConfig.type = 'confirm'
    } else if (config.hidden) {
        promptConfig.type = 'password'
        promptConfig.mask = config.replace || '*'
    } else {
        promptConfig.type = 'input'
    }

    // Add validation
    if (config.required || config.pattern) {
        promptConfig.validate = (value) => {
            if (config.required && (!value || value === '')) {
                return config.message || `${name} is required`
            }
            if (config.pattern && !config.pattern.test(value)) {
                return config.message || `${name} does not match required pattern`
            }
            return true
        }
    }

    return promptConfig
}

/**
 * Fill the prompts schema
 * @param {object} inputSchema - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 * @returns {any} prompts schema as json
 */
export function getPromptSchema(inputSchema, iConn = true, iDebug = true) {

    let grpConn = {}
    let grpDebug = {}

    if (iConn) {
        grpConn = {
            admin: {
                description: bundle.getText("admin"),
                type: 'boolean',
                required: true,
                ask: askFalse
            },
            conn: {
                description: bundle.getText("connFile"),
                type: 'string',
                required: false,
                ask: askFalse
            },
        }
    }

    if (iDebug) {
        grpDebug = {
            disableVerbose: {
                description: bundle.getText("disableVerbose"),
                type: 'boolean',
                required: true,
                ask: askFalse
            },
            debug: {
                description: bundle.getText("debug"),
                type: 'boolean',
                required: true,
                ask: askFalse
            }
        }
    }

    let schema = {
        properties: {
            ...inputSchema,
            ...grpConn,
            ...grpDebug
        }
    }
    return schema
}

/**
 * Function that always retruns false
 * @returns {boolean}
 */
export function askFalse() {
    return false
}

/**
 * Check for unknown command-line options and warn the user
 * @param {object} argv - Command line arguments from yargs
 * @param {object} inputSchema - Command's input schema
 * @param {boolean} iConn - Whether connection options are included
 * @param {boolean} iDebug - Whether debug options are included
 */
function checkUnknownOptions(argv, inputSchema, iConn, iDebug) {
    if (!argv || typeof argv !== 'object') {
        return
    }

    /**
     * Convert camelCase to kebab-case
     * @param {string} str 
     * @returns {string}
     */
    const toKebabCase = (str) => {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    }

    // Build set of known options
    const knownOptions = new Set()
    
    /**
     * Add an option and its kebab-case variant
     * @param {string} opt 
     */
    const addOption = (opt) => {
        knownOptions.add(opt)
        const kebab = toKebabCase(opt)
        if (kebab !== opt) {
            knownOptions.add(kebab)
        }
    }
    
    // Standard yargs options that should always be allowed
    const standardYargsOptions = ['$0', '_', 'help', 'h', 'version', 'V']
    standardYargsOptions.forEach(opt => addOption(opt))
    
    // Add options from inputSchema
    if (inputSchema && typeof inputSchema === 'object') {
        Object.keys(inputSchema).forEach(key => {
            addOption(key)
        })
    }
    
    // Add connection options if included
    if (iConn) {
        addOption('admin')
        addOption('a')
        addOption('Admin')
        addOption('conn')
    }
    
    // Add debug options if included
    if (iDebug) {
        addOption('disableVerbose')
        addOption('quiet')
        addOption('debug')
        addOption('Debug')
    }
    
    // Build a map of values to option names to detect aliases
    // Aliases will have the same value as the primary option
    const valueToOptions = new Map()
    for (const key in argv) {
        const value = argv[key]
        // Create a unique key for the value (handle objects/arrays)
        const valueKey = typeof value === 'object' ? JSON.stringify(value) : String(value)
        if (!valueToOptions.has(valueKey)) {
            valueToOptions.set(valueKey, [])
        }
        valueToOptions.get(valueKey).push(key)
    }
    
    // An option is likely an alias if it shares a value with a known option
    const likelyAliases = new Set()
    for (const options of valueToOptions.values()) {
        if (options.length > 1) {
            // Multiple options with same value - some might be aliases
            const hasKnownOption = options.some(opt => knownOptions.has(opt))
            if (hasKnownOption) {
                // If at least one is known, consider all others as aliases
                options.forEach(opt => likelyAliases.add(opt))
            }
        }
    }
    
    // Check argv for unknown options
    const unknownOptions = []
    const unknownSet = new Set()
    
    for (const key in argv) {
        if (!knownOptions.has(key) && !likelyAliases.has(key)) {
            // Check if we already added the camelCase/kebab-case equivalent
            const kebab = toKebabCase(key)
            const hasDuplicate = unknownSet.has(key) || unknownSet.has(kebab)
            
            if (!hasDuplicate) {
                unknownOptions.push(key)
                unknownSet.add(key)
                if (kebab !== key) {
                    unknownSet.add(kebab)
                }
            }
        }
    }
    
    // Warn about unknown options
    if (unknownOptions.length > 0) {
        unknownOptions.forEach(opt => {
            console.warn(colors.yellow(`Warning: Unknown option '--${opt}'`))
        })
    }
}

/**
 * Prompts handler function
 * @param {import("yargs").CommandBuilder} argv - parameters for the command
 * @param {function} processingFunction - Function to call after prompts to continue command processing
 * @param {object} inputSchema - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 */
export async function promptHandler(argv, processingFunction, inputSchema, iConn = true, iDebug = true) {
    try {
        // Check for unknown options and warn user
        checkUnknownOptions(argv, inputSchema, iConn, iDebug)
        
        let schema = getPromptSchema(inputSchema, iConn, iDebug)
        let result = {}

        // Check if we're in quiet mode (disableVerbose)
        // @ts-ignore
        const isQuietMode = argv && (argv.disableVerbose || argv.quiet)

        // First, copy all values from argv that are defined in schema
        if (schema.properties) {
            for (const [name, config] of Object.entries(schema.properties)) {
                if (argv && argv[name] !== undefined && argv[name] !== null && argv[name] !== '') {
                    result[name] = argv[name]
                } else if (isQuietMode && config.default !== undefined) {
                    // In quiet mode, use defaults for empty/missing values
                    result[name] = config.default
                }
            }
        }

        // Transform schema and collect prompts
        const prompts = []
        if (schema.properties && !isQuietMode) {
            for (const [name, config] of Object.entries(schema.properties)) {
                const promptConfig = transformPromptConfig(name, config, argv)
                if (promptConfig) {
                    prompts.push({ name, config: promptConfig })
                }
            }
        }

        // Execute prompts based on type (skip if in quiet mode)
        for (const { name, config: promptConfig } of prompts) {
            // Skip if already provided in argv
            if (argv && argv[name] !== undefined && argv[name] !== null && argv[name] !== '') {
                continue
            }

            // Lazy-load inquirer prompts only when needed
            const { input, password, confirm } = await getInquirer()
            
            let answer
            if (promptConfig.type === 'confirm') {
                answer = await confirm({
                    message: promptConfig.message,
                    default: promptConfig.default
                })
            } else if (promptConfig.type === 'password') {
                answer = await password({
                    message: promptConfig.message,
                    mask: promptConfig.mask,
                    validate: promptConfig.validate
                })
            } else {
                answer = await input({
                    message: promptConfig.message,
                    default: promptConfig.default,
                    validate: promptConfig.validate
                })
            }
            result[name] = answer
        }

        if (isDebug(result)) {
            setDebug.enable('hana-cli, *')
            process.env['NO_TELEMETRY'] = 'false'
        } else {
            process.env['NO_TELEMETRY'] = 'true'
        }

        debug(bundle.getText("yargs"))
        debug(argv)
        debug(bundle.getText("prompts"))
        debug(result)

        //startSpinner(result)
        await processingFunction(result)
    } catch (err) {
        if (err && err.message) {
            console.log(err.message)
        } else {
            console.log('Prompt cancelled')
        }
    }
}

/**
 * Handle Errors cleanup connections and decide how to alter the user
 * @param {*} error - Error Object
 */
export async function error(error) {
    debug(`Error`)
    if (dbConnection && dbConnection.client && dbConnection.client._settings) {
        debug(`HANA Disconnect Started`)
        try {
            await new Promise((resolve) => {
                dbConnection.client.disconnect((err) => {
                    if (err) {
                        debug(`Disconnect Error: ${err}`)
                    }
                    debug(`HANA Disconnect Completed`)
                    dbConnection = null
                    resolve()
                })
            })
        } catch (disconnectErr) {
            debug(`Disconnect Exception: ${disconnectErr}`)
            dbConnection = null
        }
    }
    if (spinner) {
        spinner.stop()
    }
    if (inDebug || inGui) {
        throw error
    } else {
        console.error(colors.red(`${error}`))
        // Exit process after error in CLI mode
        if (!inGui) {
            process.exit(1)
        }
    }
}

/**
 * Disconnect database connection without exiting process
 * @returns {Promise<void>}
 */
export async function disconnectOnly() {
    debug(`Disconnect Only`)
    if (dbConnection && dbConnection.client && dbConnection.client._settings) {
        debug(`HANA Disconnect Started`)
        return new Promise((resolve, reject) => {
            try {
                dbConnection.client.disconnect((err) => {
                    if (err) {
                        debug(`Disconnect Error: ${err}`)
                        dbConnection = null
                        reject(err)
                    } else {
                        debug(`HANA Disconnect Completed`)
                        dbConnection = null
                        if (spinner) {
                            spinner.stop()
                        }
                        resolve()
                    }
                })
            } catch (disconnectErr) {
                debug(`Disconnect Exception: ${disconnectErr}`)
                if (spinner) {
                    spinner.stop()
                }
                dbConnection = null
                reject(disconnectErr)
            }
        })
    } else {
        debug(`No connection to disconnect`)
        if (spinner) {
            spinner.stop()
        }
        return Promise.resolve()
    }
}

/**
 * Normal processing end and cleanup for single command
 */
export async function end() {
    debug(`Natural End`)
    if (dbConnection && dbConnection.client && dbConnection.client._settings) {
        debug(`HANA Disconnect Started`)
        try {
            dbConnection.client.disconnect((err) => {
                if (err) {
                    dbConnection = null
                    debug(`Disconnect Error: ${err}`)
                }
                debug(`HANA Disconnect Completed`)
                dbConnection = null
                if (spinner) {
                    spinner.stop()
                }
                // Only exit the process when running from CLI (not from MCP/programmatic contexts)
                if (!inGui) {
                    process.exit(0)
                }
            })
        } catch (disconnectErr) {
            debug(`Disconnect Exception: ${disconnectErr}`)
            if (spinner) {
                spinner.stop()
            }
            // Only exit the process when running from CLI
            if (!inGui) {
                process.exit(1)
            }
        }
    } else {
        // No connection to clean up, just stop spinner and exit if needed
        if (spinner) {
            spinner.stop()
        }
        // Only exit the process when running from CLI
        if (!inGui) {
            process.exit(0)
        }
    }
}

/**
 * Start Console UI spinner
 * @param {*} prompts - input parameters and values
 */
export function startSpinner(prompts) {
    if (verboseOutput(prompts)) { startSpinnerInt() }
}

/**
 * Check for Verbose output
 * @param {*} prompts - input parameters and values
 * @returns {boolean}
 */
export function verboseOutput(prompts) {
    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'disableVerbose') && prompts.disableVerbose) {
        return false
    }
    else { return true }
}

/**
 * Check if we are in debug mode
 * @param {*} prompts - input parameters and values
 * @returns {boolean}
 */
export function isDebug(prompts) {
    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'debug') && prompts.debug) {
        inDebug = true
        return true
    }
    else {
        inDebug = false
        return false
    }
}

/**
 * Check if we are in GUI mode
 * @param {*} prompts - input parameters and values
 * @returns {boolean}
 */
export function isGui(prompts) {
    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'isGui') && prompts.isGui) {
        inGui = true
        return true
    }
    else {
        inGui = false
        return false
    }
}

/**
 * Output JSON content either as a table or as formatted JSON to console
 * @param {*} content - json content often a HANA result set
 * @returns void
 */
export function outputTable(content) {
    if (content.length < 1) {
        console.log(bundle.getText('noData'))
    } else {
        if (verboseOutput(prompts)) {
            return console.table(content)
        } else {
            return console.log(inspect(content, { maxArrayLength: null }))
        }
    }
}

/**
 * Convert JSON array to 2D array format for terminal-kit table
 * @param {Array<Object>} jsonArray - Array of objects
 * @returns {Array<Array>} 2D array with headers in first row
 */
function convertJsonToTableArray(jsonArray) {
    if (!jsonArray || jsonArray.length === 0) return []
    
    // Get all unique keys from all objects
    const keys = [...new Set(jsonArray.flatMap(obj => Object.keys(obj)))]
    
    // Create header row
    const result = [keys]
    
    // Create data rows
    for (const obj of jsonArray) {
        result.push(keys.map(key => obj[key] ?? ''))
    }
    
    return result
}

/**
 * Output JSON content either as a table or as formatted JSON to console
 * @param {*} content - json content often a HANA result set
 * @returns {Promise<void>}
 */
export async function outputTableFancy(content) {
    if (content.length < 1) {
        console.log(bundle.getText('noData'))
    } else {
        if (verboseOutput(prompts)) {
            try {
                const terminal = await getTerminal()
                // Handle large datasets with pagination
                if (content.length > MAX_DISPLAY_ROWS) {
                    console.log(colors.yellow(`\nShowing first ${MAX_DISPLAY_ROWS} of ${content.length} rows (use --output json with --filename to save all results)\n`))
                    return terminal.table(convertJsonToTableArray(content.slice(0, MAX_DISPLAY_ROWS)), tableOptions)
                } else {
                    return terminal.table(convertJsonToTableArray(content), tableOptions)
                }
            } catch (error) {
                // Fallback to console.table if terminal.table fails (e.g., buffer allocation errors)
                console.error(colors.yellow('Warning: terminal.table failed, falling back to console.table:'), error.message)
                if (content.length > MAX_DISPLAY_ROWS) {
                    console.log(colors.yellow(`Showing first ${MAX_DISPLAY_ROWS} of ${content.length} rows`))
                    return console.table(content.slice(0, MAX_DISPLAY_ROWS))
                }
                return console.table(content)
            }
        } else {
            return console.log(inspect(content, { maxArrayLength: null }))
        }
    }
}


/**
 * Only output this content to console if in verbose mode
 * @param {*} content - json content often a HANA result set
 * @returns void
 */
export function output(content) {
    if (verboseOutput(prompts)) {
        return console.log(content)
    } else {
        return
    }
}

/**
 * Global error handling middleware for Express
 * Compatible with Express 4.x and prepared for 5.x
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
// @ts-ignore
export function globalErrorHandler(err, req, res, next) {
    // Log error without calling base.error() which would exit the process in CLI mode
    console.error(colors.red(`Unhandled error: ${err.message}`))
    debug(`Unhandled error: ${err.message}`)
    debug(err.stack)
    
    // @ts-ignore
    const statusCode = err.statusCode || err.status || 500
    // Always send the actual error message to help users diagnose issues
    const message = err.message || 'Internal Server Error'
    
    // Don't call next() after sending response (Express 5 requirement)
    res.status(statusCode).json({
        message: message,
        status: statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}

/**
 * 404 Not Found handler
 * Must be placed after all other route definitions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        error: {
            message: 'Route not found',
            status: 404,
            path: req.path
        }
    })
}

/**
 * Setup Express and Launch Browser
 * @param {string} urlPath - URL Path to Launch
 * @returns void
 */
export async function webServerSetup(urlPath) {
    const path = await import('path')
    // @ts-ignore
    const expressModule = await import('express')
    const express = expressModule.default
    const http = await import('http')
    
    debug('serverSetup')
    // @ts-ignore
    const port = process.env.PORT || prompts.port || 3010

    if (!(/^[1-9]\d*$/.test(port) && 1 <= 1 * port && 1 * port <= 65535)) {
        return error(`${port} ${bundle.getText("errPort")}`)
    }
    
    const server = http.createServer()
    const app = express()
    
    // Configure Express settings for compatibility
    app.set('x-powered-by', false) // Disable x-powered-by header for security
    app.disable('etag') // Keep existing etag setting
    
    // Load routes
    let routesDir = path.posix.join(__dirname.split(path.sep).join(path.posix.sep), '..', 'routes', '**', '*.js')
    let files = await glob(routesDir)
    if (files.length !== 0) {
        for (let file of files) {
            debug(file)
            const Route = await import(`file://${file}`)
            Route.route(app, server)
        }
    }

    // Add 404 handler (must be after all routes but before error handler)
    app.use(notFoundHandler)
    
    // Add error handling middleware (must be last, after all routes and 404 handler)
    app.use(globalErrorHandler)

    // Start the Server
    server.on("request", app)
    server.listen(port, async function () {
        // @ts-ignore
        let serverAddr = `http://localhost:${server.address().port}${urlPath}`
        debug(serverAddr)
        console.info(`HTTP Server: ${serverAddr}`)
        startSpinnerInt()
        await open(serverAddr, {wait: true})
    })

    return
}

/**
 * Store and send results JSON
 * @param {any} res - Express Response object
 * @param {any} results - JSON content
 * @returns void
 */
export function sendResults(res, results) {
    lastResults = results
    res.type("application/json").status(200).send(results)
}

/**
 * Return the last results JSON
 * @returns lastResults
 */
export function getLastResults() {
    return lastResults
}

/**
 * Get the username of the active database connection
 * @returns userName
 */
export async function getUserName() {
    let userName = ''

    try {
        const options = await conn.getConnOptions(prompts)
        if (options && options.hana && options.hana.user) {
            userName = options.hana.user
            debug('Username of db connection: ' + userName)
        }
    } catch (error) {
        debug('Could not retrieve username: ' + error.message)
    }

    return userName
}
