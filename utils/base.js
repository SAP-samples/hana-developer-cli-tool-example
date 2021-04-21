const bundle = global.__bundle
module.exports.bundle = bundle
const colors = require("colors/safe")
let debug = require('debug')('hana-cli')
module.exports.debug = debug

function getBuilder(input) {
    let builder = {
        ...input,
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
        },

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

function getPromptSchema(input) {
    let schema = {
        properties: {
            ...input,
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
    return schema
}
module.exports.getPromptSchema = getPromptSchema

function askFalse() {
    return false
}
module.exports.askFalse = askFalse

function promptHandler(argv, processingFunction, input) {
    const prompt = getPrompt(argv)
    let schema = getPromptSchema(input)

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message)
        }

        if (isDebug(result)) {
            const setDebug = require('debug')
            setDebug.enable('hana-cli, *')
        }

        debug(`Yargs values`)
        debug(argv)
        debug(`Prompt values`)
        debug(result)

        startSpinner(result)
        processingFunction(result)
    })
}
module.exports.promptHandler = promptHandler

function error(error) {
    if (global.__spinner) {
        global.__spinner.stop()
    }
    console.error(`Connection Problem ${error}`)
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