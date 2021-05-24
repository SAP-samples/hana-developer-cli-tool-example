// @ts-check

/**
 * @module base
 */
/** @typedef {typeof import("sap-hdbext-promisfied").default} hdbextPromise - sap-hdbext-promisified module */

const dbClass = require("sap-hdbext-promisfied")
const conn = require("../utils/connections")

/** @type Object - HANA Client DB Connection */
let dbConnection = null
/** @type hdbextPromise */
let dbClassInstance = null

/** @type {typeof import("colors/safe")} */
const colors = require("colors/safe")
module.exports.colors = colors


/** @type {typeof import("debug") } */
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
 * @param {object} [options] - override the already set parameters with new connection options
 * @returns {Promise<hdbextPromise>} - hdbext instanced promisfied
 */
async function createDBConnection(options) {
    if (!dbConnection) {
        if (options) {
            dbConnection = await conn.createConnection(options)
        } else {
            dbConnection = await conn.createConnection(prompts)
        }
    }

    // @ts-ignore
    dbClassInstance = new dbClass(dbConnection)
    return dbClassInstance
}
module.exports.createDBConnection = createDBConnection

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

function getPrompt(argv) {
    const prompt = require('prompt')
    prompt.override = argv
    prompt.message = colors.green(bundle.getText("input"))
    prompt.start()
    return prompt
}
module.exports.getPrompt = getPrompt

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

function askFalse() {
    return false
}
module.exports.askFalse = askFalse

function promptHandler(argv, processingFunction, input, iConn = true, iDebug = true) {
    const prompt = getPrompt(argv)
    let schema = getPromptSchema(input, iConn, iDebug)

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message)
        }

        if (isDebug(result)) {
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

function startSpinner(prompts) {
    if (verboseOutput(prompts)) { startSpinnerInt() }
}
module.exports.startSpinner = startSpinner

function verboseOutput(prompts) {
    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'disableVerbose') && prompts.disableVerbose) {
        return false
    }
    else { return true }
}
module.exports.verboseOutput = verboseOutput

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

function output(content) {
    if (verboseOutput(prompts)) {
        return console.log(content)
    } else {
        return
    }
}
module.exports.output = output