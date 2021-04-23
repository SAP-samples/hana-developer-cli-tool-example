const bundle = global.__bundle
module.exports.bundle = bundle
const colors = require("colors/safe")
let debug = require('debug')('hana-cli')
module.exports.debug = debug

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
    if (global.__spinner) {
        global.__spinner.stop()
    }
    console.error(`${bundle.getText("errConn")} ${error}`)
}
module.exports.error = error

function end() {
    if (global.__spinner) {
        global.__spinner.stop()
    }
}
module.exports.end = end

function startSpinner(prompts) {
    if (verboseOutput(prompts)) { global.startSpinner() }
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
        return true
    }
    else { return false }
}
module.exports.isDebug = isDebug