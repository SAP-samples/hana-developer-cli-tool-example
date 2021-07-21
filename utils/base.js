// @ts-check

/**
 * @module base - Central functionality shared by all the various commands
 */
/** @typedef {typeof import("sap-hdbext-promisfied")} hdbextPromise - sap-hdbext-promisified module */
const dbClass = require("sap-hdbext-promisfied")
const conn = require("../utils/connections")

/** @type Object - HANA Client DB Connection */
let dbConnection = null
/** @typedef {import("sap-hdbext-promisfied")} hdbextPromiseInstance - instance of sap-hdbext-promisified module */
/** @type {import("sap-hdbext-promisfied")} */
let dbClassInstance = null

/** @type {typeof import("colors/safe")} */
const colors = require("colors/safe")
module.exports.colors = colors


/** @type {typeof import("debug") } */
// @ts-ignore
let debug = require('debug')('hana-cli')
module.exports.debug = debug

/** @type string */
let hanaBin = __dirname
module.exports.hanaBin = hanaBin

/** @type boolean */
let inDebug = false


/** @typedef {typeof import("@sap/textbundle").TextBundle} TextBundle - sap/textbundle */
/** @type TextBundle */
const TextBundle = require("@sap/textbundle").TextBundle
/** @typeof TextBundle - instance of sap/textbundle */
const bundle = new TextBundle("../_i18n/messages", require("../utils/locale").getLocale())
/** @type {typeof import("../utils/base")} */
module.exports.bundle = bundle

/** @typedef {typeof import("ora")} Ora*/
/** @type Ora - Elegant terminal spinner */
const ora = require('ora')
/** @typeof Ora.Options - Terminal spinner options */
let oraOptions = { type: 'clock', text: '\n' }
/** @typeof Ora.spinner | Void - elgant termianl spinner instance*/
let spinner = null
/**
 * Start the Terminal Spinner
 */
function startSpinnerInt() {
    spinner = ora(oraOptions).start()
}

/** type {object} - processed input prompts*/
let prompts = []
/**
 * 
 * @param {object} newPrompts - processed input prompts
 */
function setPrompts(newPrompts) {
    debug('Set Prompts')
    prompts = newPrompts
}
module.exports.setPrompts = setPrompts

/**
 * 
 * @returns {object} newPrompts - processed input prompts
 */
function getPrompts() {
    debug('Get Prompts')

    // @ts-ignore
    if (!prompts.schema) { prompts.schema = "**CURRENT_SCHEMA**" }
    // @ts-ignore
    if (!prompts.table) { prompts.table = "*" }
    // @ts-ignore
    if (!prompts.limit) { prompts.limit = 200 }
    // @ts-ignore
    if (!prompts.folder) { prompts.folder = "./" }
    // @ts-ignore
    if (!prompts.admin || prompts.admin === "") { prompts.admin = false }
    return prompts
}
module.exports.getPrompts = getPrompts

async function clearConnection() {
    dbConnection = null
}
module.exports.clearConnection = clearConnection
/**
 * @param {object} [options] - override the already set parameters with new connection options
 * @returns {Promise<hdbextPromiseInstance>} - hdbext instanced promisfied
 */
async function createDBConnection(options) {
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
module.exports.createDBConnection = createDBConnection

/**
 * Initialize Yargs builder 
 * @param {import("yargs").CommandBuilder} input - parameters for the command
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 * @returns {import("yargs").CommandBuilder} parameters for the command
 */
function getBuilder(input, iConn = true, iDebug = true) {

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
module.exports.getBuilder = getBuilder

/**
 * Initialize Yargs builder for massConvert Command
 * @param {boolean} [ui=false] - Mass Convert via Browser-based UI
 * @returns {import("yargs").CommandBuilder} parameters for the command
 */
function getMassConvertBuilder(ui = false) {
    /** @type any */
    let parameters = {
        table: {
            alias: ['t', 'Table'],
            type: 'string',
            default: "*",
            desc: bundle.getText("table")
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
module.exports.getMassConvertBuilder = getMassConvertBuilder

/**
 * Initialize Yargs builder for massConvert Command
 * @param {boolean} [ui=false] - Mass Convert via Browser-based UI
 * @returns {typeof import("prompt")} - prompts output
 */
function getMassConvertPrompts(ui = false) {
    let parameters = {
        table: {
            description: bundle.getText("table"),
            type: 'string',
            required: true
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
        useHanaTypes: {
            description: bundle.getText("useHanaTypes"),
            type: 'boolean'
        },
        useCatalogPure: {
            description: bundle.getText("useCatalogPure"),
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
module.exports.getMassConvertPrompts = getMassConvertPrompts

/**
 * Get Prompts from the yargs current values and adjust
 * @param {import("yargs").CommandBuilder} argv - parameters for the command
 * @returns {typeof import("prompt")} - prompts output
 */
function getPrompt(argv) {
    /** @type typeof import("prompt") */
    // @ts-ignore
    const prompt = require('prompt')
    prompt.override = argv
    prompt.message = colors.green(bundle.getText("input"))
    prompt.start()
    return prompt
}
module.exports.getPrompt = getPrompt

/**
 * Fill the prompts schema 
 * @param {typeof import("prompt")} input - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group 
 * @returns {any} prompts schema as json
 */
function getPromptSchema(input, iConn = true, iDebug = true) {

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
module.exports.getPromptSchema = getPromptSchema

/**
 * Function that always retruns false
 * @returns {boolean}
 */
function askFalse() {
    return false
}
module.exports.askFalse = askFalse

/**
 * Prompts handler function
 * @param {import("yargs").CommandBuilder} argv - parameters for the command
 * @param {function} processingFunction - Function to call after prompts to continue command processing
 * @param {typeof import("prompt")} input - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group 
 */
function promptHandler(argv, processingFunction, input, iConn = true, iDebug = true) {
    const prompt = getPrompt(argv)
    let schema = getPromptSchema(input, iConn, iDebug)

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message)
        }

        if (isDebug(result)) {
            // @ts-ignore
            const setDebug = require('debug')
            setDebug.enable('hana-cli, *')
        }

        debug(bundle.getText("yargs"))
        debug(argv)
        debug(bundle.getText("prompts"))
        debug(result)

        //startSpinner(result)
        processingFunction(result)
    })
}
module.exports.promptHandler = promptHandler

/**
 * Handle Errors cleanup connections and decide how to alter the user
 * @param {*} error - Error Object
 */
function error(error) {
    debug(`Error`)
    if (dbConnection) {
        debug(`HANA Disconnect Started`)
        dbConnection.disconnect((err) => {
            if (err) {
                debug(`Disconnect Error: ${err}`)
            }
            debug(`HANA Disconnect Completed`)
        })
    }
    if (spinner) {
        spinner.stop()
    }
    if (inDebug) {
        throw error
    } else {
        return console.error(`${error}`)
    }
}
module.exports.error = error

/**
 * Normal processing end and cleanup for single comand
 */
async function end() {
    debug(`Natural End`)
    if (dbConnection) {
        debug(`HANA Disconnect Started`)
        dbConnection.disconnect((err) => {
            if (err) {
                dbConnection = null
                throw err
            }
            debug(`HANA Disconnect Completed`)
        })
    }
    if (spinner) {
        spinner.stop()
    }
}
module.exports.end = end

/**
 * Start Console UI spinner 
 * @param {*} prompts - input parameters and values
 */
function startSpinner(prompts) {
    if (verboseOutput(prompts)) { startSpinnerInt() }
}
module.exports.startSpinner = startSpinner

/**
 * Check for Verbose output
 * @param {*} prompts - input parameters and values
 * @returns {boolean}
 */
function verboseOutput(prompts) {
    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'disableVerbose') && prompts.disableVerbose) {
        return false
    }
    else { return true }
}
module.exports.verboseOutput = verboseOutput

/**
 * Check if we are in debug mode
 * @param {*} prompts - input parameters and values
 * @returns {boolean}
 */
function isDebug(prompts) {
    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'debug') && prompts.debug) {
        inDebug = true
        return true
    }
    else {
        inDebug = false
        return false
    }
}
module.exports.isDebug = isDebug

/**
 * Output JSON content either as a table or as formatted JSON to console
 * @param {*} content - json content often a HANA result set
 * @returns void 
 */
function outputTable(content) {
    if (content.length < 1) {
        console.log(bundle.getText('noData'))
    } else {
        if (verboseOutput(prompts)) {
            return console.table(content)
        } else {
            const util = require('util')
            return console.log(util.inspect(content, { maxArrayLength: null }))
        }
    }
}
module.exports.outputTable = outputTable

/**
 * Only output this content to console if in verbose mode
 * @param {*} content - json content often a HANA result set
 * @returns void
 */
function output(content) {
    if (verboseOutput(prompts)) {
        return console.log(content)
    } else {
        return
    }
}
module.exports.output = output

/**
 * Setup Express and Launch Browser
 * @param {string} urlPath - URL Path to Launch
 * @returns void
 */
async function webServerSetup(urlPath) {
    const path = require("path")
    // @ts-ignore
    const glob = require('glob')
    debug('serverSetup')
    // @ts-ignore
    const port = process.env.PORT || prompts.port || 3010

    if (!(/^[1-9]\d*$/.test(port) && 1 <= 1 * port && 1 * port <= 65535)) {
        return error(`${port} ${bundle.getText("errPort")}`)
    }
    const server = require("http").createServer()
    // @ts-ignore
    const express = require("express")
    var app = express()
    app.disable('etag')
    //Load routes
    let routesDir = path.join(__dirname, '..', '/routes/**/*.js')
    let files = glob.sync(routesDir)
    if (files.length !== 0) {
        for (let file of files) {
            await require(file)(app, server)
        }
    }

    //Start the Server 
    server.on("request", app)
    server.listen(port, function () {
        // @ts-ignore
        let serverAddr = `http://localhost:${server.address().port}${urlPath}`
        console.info(`HTTP Server: ${serverAddr}`)
        const open = require('open')
        open(serverAddr)
    })

    return
}
module.exports.webServerSetup = webServerSetup