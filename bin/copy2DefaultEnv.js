const colors = require("colors/safe")
const bundle = global.__bundle

exports.command = 'copy2DefaultEnv'
exports.aliases = ['copyDefaultEnv', 'copyDefault-Env', 'copy2defaultenv', 'copydefaultenv', 'copydefault-env']
exports.describe = bundle.getText("copy2DefaultEnv")


exports.builder = {
}

exports.handler = function (argv) {
    const prompt = require('prompt')
    prompt.override = argv
    prompt.message = colors.green(bundle.getText("input"))
    prompt.start()

    var schema = {
        properties: {
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


async function copy() {
    require('dotenv').config()

    let defaultEnv = {}
    if (process.env.VCAP_SERVICES == null){
        throw new Error(`No .env content found`)
    }
    defaultEnv.VCAP_SERVICES = process.env.VCAP_SERVICES
    let temp = JSON.parse(process.env.VCAP_SERVICES)
    defaultEnv.VCAP_SERVICES = temp

    defaultEnv.VCAP_SERVICES.hana[0].credentials.encrypt = true
    defaultEnv.VCAP_SERVICES.hana[0].credentials.sslValidateCertificate = false
    defaultEnv.VCAP_SERVICES.hana[0].credentials.pooling = true
    
    const fs = require('fs')
    fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), async (err) => {
        if (err) {
            throw new Error(`Connection Problem ${JSON.stringify(err)}`)
        }
        console.log(bundle.getText("saved"))
        global.__spinner.stop()
    })

    global.__spinner.stop()
    return
}