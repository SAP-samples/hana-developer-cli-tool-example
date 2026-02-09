// @ts-check
/**
 * @module base - Central functionality shared by all the various commands
 */

import { fileURLToPath } from 'url'
import { URL } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
import upath from 'upath'
import { createRequire } from 'module'
// @ts-ignore
export const require = createRequire(import.meta.url)

import * as path from 'path'

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

/** @type typeof import("prompt") */
import prompt from 'prompt'

/** @type typeof import("glob") */
import { glob } from 'glob'

// @ts-ignore
import open from 'open'

/** @type {typeof import("debug") } */
import debugModule from 'debug'
export const debug = new debugModule('hana-cli')
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
import ora from 'ora'

/** @typeof Ora.Options - Terminal spinner options */
let oraOptions = { type: 'clock', text: '\n' }
/** @typeof Ora.spinner | Void - elgant termianl spinner instance*/
let spinner = null
/**
 * Start the Terminal Spinner
 */
export function startSpinnerInt() {
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

import terminalkit from 'terminal-kit'
export const { terminal } = terminalkit
import jsonToTable from 'json-to-table'
export const json2Table = jsonToTable
export let tableOptions = {
    hasBorder: true,
    contentHasMarkup: false,
    borderChars: 'lightRounded' ,
    borderAttr: { color: 'blue' } ,
    textAttr: { bgColor: 'default' } ,
    firstRowTextAttr: { bgColor: 'blue' } ,
    fit: false   // Disable auto-sizing to prevent buffer allocation errors
}

export function blankLine(){
    console.log(`                                                                                        `)
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

export async function clearConnection() {
    dbConnection = null
}

/**
 * @param {object} [options] - override the already set parameters with new connection options
 * @returns {Promise<hdbextPromiseInstance>} - hdbext instanced promisfied
 */
export async function createDBConnection(options) {
    if (!dbConnection) {
        if (options) {
            dbConnection = await conn.createConnection(options, true)
        } else {
            dbConnection = await conn.createConnection(prompts, false)
        }
    }
    dbClassInstance = new dbClass(dbConnection)
    return dbClassInstance
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
 * @returns {typeof import("prompt")} - prompts output
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
 * Get Prompts from the yargs current values and adjust
 * @param {import("yargs").CommandBuilder} argv - parameters for the command
 * @returns {typeof import("prompt")} - prompts output
 */
export function getPrompt(argv) {
    prompt.override = argv
    prompt.message = colors.green(bundle.getText("input"))
    prompt.start()
    return prompt
}

/**
 * Fill the prompts schema
 * @param {typeof import("prompt")} input - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 * @returns {any} prompts schema as json
 */
export function getPromptSchema(input, iConn = true, iDebug = true) {

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
            ...input,
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
 * Prompts handler function
 * @param {import("yargs").CommandBuilder} argv - parameters for the command
 * @param {function} processingFunction - Function to call after prompts to continue command processing
 * @param {typeof import("prompt")} input - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 */
export function promptHandler(argv, processingFunction, input, iConn = true, iDebug = true) {
    const prompt = getPrompt(argv)
    let schema = getPromptSchema(input, iConn, iDebug)

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message)
        }

        if (isDebug(result)) {
            setDebug.enable('hana-cli, *')
            process.env['NO_TELEMETRY'] = 'false'
        }else {
            process.env['NO_TELEMETRY'] = 'true'
        }

        debug(bundle.getText("yargs"))
        debug(argv)
        debug(bundle.getText("prompts"))
        debug(result)

        //startSpinner(result)
        processingFunction(result)
    })
}

/**
 * Handle Errors cleanup connections and decide how to alter the user
 * @param {*} error - Error Object
 */
export function error(error) {
    debug(`Error`)
    if (dbConnection && dbConnection.client && dbConnection.client._settings) {
        debug(`HANA Disconnect Started`)
        try {
            dbConnection.disconnect((err) => {
                if (err) {
                    debug(`Disconnect Error: ${err}`)
                }
                debug(`HANA Disconnect Completed`)
            })
        } catch (disconnectErr) {
            debug(`Disconnect Exception: ${disconnectErr}`)
        }
    }
    if (spinner) {
        spinner.stop()
    }
    if (inDebug || inGui) {
        throw error
    } else {
        return console.error(`${error}`)
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
            dbConnection.disconnect((err) => {
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
 * Output JSON content either as a table or as formatted JSON to console
 * @param {*} content - json content often a HANA result set
 * @returns {void}
 */
export function outputTableFancy(content) {
    if (content.length < 1) {
        console.log(bundle.getText('noData'))
    } else {
        if (verboseOutput(prompts)) {
            try {
                return terminal.table(json2Table(content), tableOptions)
            } catch (error) {
                // Fallback to console.table if terminal.table fails (e.g., buffer allocation errors)
                console.error('Warning: terminal.table failed, falling back to console.table:', error.message)
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
export function globalErrorHandler(err, req, res, next) {
    error(`Unhandled error: ${err.message}`)
    // @ts-ignore
    const statusCode = err.statusCode || err.status || 500
    const message = process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Internal Server Error'
    
    // Don't call next() after sending response (Express 5 requirement)
    res.status(statusCode).json({
        error: {
            message: message,
            status: statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
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
    let routesDir = path.join(__dirname, '..', '/routes/**/*.js')
    let files = await glob(upath.normalize(routesDir))
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
    server.listen(port, function () {
        // @ts-ignore
        let serverAddr = `http://localhost:${server.address().port}${urlPath}`
        debug(serverAddr)
        console.info(`HTTP Server: ${serverAddr}`)
        startSpinnerInt()
        open(serverAddr)
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
export function getUserName() {
    let userName = ''

    if (dbConnection) {
        userName = dbConnection.get('user')
        debug('Username of db connection: ' + userName)
    }

    return userName
}
