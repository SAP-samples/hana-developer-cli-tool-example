const bundle = global.__bundle
module.exports.bundle = bundle
const colors = require("colors/safe")

function getBuilder(input) {
    let builder = {
        admin: {
            alias: ['a', 'Admin'],
            type: 'boolean',
            default: false,
            desc: bundle.getText("admin")
        },
        conn: {
            alias: ['connFile', 'connectionFile', 'connfile'],
            desc: bundle.getText("connFile")
        },
        ...input

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
            ...input
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
        global.startSpinner()
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