const colors = require("colors/safe")
const bundle = global.__bundle
const dbClass = require("sap-hdbext-promisfied")

exports.command = 'copy2Env'
exports.aliases = ['copyEnv', 'copyenv', 'copy2env']
exports.describe = bundle.getText("copy2Env")


exports.builder = {
    admin: {
        alias: ['a', 'Admin'],
        type: 'boolean',
        default: false,
        desc: bundle.getText("admin")
    }
}

exports.handler = function (argv) {
    const prompt = require('prompt')
    prompt.override = argv
    prompt.message = colors.green(bundle.getText("input"))
    prompt.start()

    var schema = {
        properties: {
            admin: {
                description: bundle.getText("admin"),
                type: 'boolean',
                required: true,
                ask: () => {
                    return false
                }
            }
        }
    };

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message)
        }
        global.startSpinner()
        copy(result)
    })
}


async function copy(result) {

    let envFile = dbClass.resolveEnv(result)
    const xsenv = require("@sap/xsenv")
    xsenv.loadEnv(envFile)
    const fs = require('fs')
    fs.writeFile(".env", `VCAP_SERVICES=${process.env.VCAP_SERVICES}`, async (err) => {
        if (err) {
            throw new Error(`Connection Problem ${JSON.stringify(err)}`)
        }
        console.log(bundle.getText("saved2"))
        global.__spinner.stop()
    })

    global.__spinner.stop()
    return
}