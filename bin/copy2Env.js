const base = require("../utils/base")

exports.command = 'copy2Env'
exports.aliases = ['copyEnv', 'copyenv', 'copy2env']
exports.describe = base.bundle.getText("copy2Env")

exports.builder = base.getBuilder({})

exports.handler = (argv) => {
    base.promptHandler(argv, copy, {})
}

async function copy(prompts) {
    const conn = require("../utils/connections")
    let envFile = conn.resolveEnv(prompts)
    const xsenv = require("@sap/xsenv")
    xsenv.loadEnv(envFile)
    const fs = require('fs')
    base.debug(process.env.VCAP_SERVICES)
    fs.writeFile(".env", `VCAP_SERVICES=${process.env.VCAP_SERVICES}`, async (err) => {
        if (err) {
            base.error(err)
        }
        console.log(base.bundle.getText("saved2"))
        return base.end()
    })
    return base.end()
}