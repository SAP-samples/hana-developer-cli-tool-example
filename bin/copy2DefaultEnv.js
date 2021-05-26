const base = require("../utils/base")

exports.command = 'copy2DefaultEnv'
exports.aliases = ['copyDefaultEnv', 'copyDefault-Env', 'copy2defaultenv', 'copydefaultenv', 'copydefault-env']
exports.describe = base.bundle.getText("copy2DefaultEnv")

exports.builder = base.getBuilder({}, false)

exports.handler = (argv) => {
    base.promptHandler(argv, copy, {}, false)
}

async function copy() {
    base.debug('copy')
    require('dotenv').config()

    let defaultEnv = {}
    if (process.env.VCAP_SERVICES == null) {
        return base.error(base.bundle.getText("errNoEnv"))
    }
    defaultEnv.VCAP_SERVICES = process.env.VCAP_SERVICES
    let temp = JSON.parse(process.env.VCAP_SERVICES)
    defaultEnv.VCAP_SERVICES = temp

    if(Object.prototype.hasOwnProperty.call(defaultEnv.VCAP_SERVICES, "hana")){
        defaultEnv.VCAP_SERVICES.hana[0].credentials.encrypt = true
        defaultEnv.VCAP_SERVICES.hana[0].credentials.sslValidateCertificate = false
        defaultEnv.VCAP_SERVICES.hana[0].credentials.pooling = true
    }else if (Object.prototype.hasOwnProperty.call(defaultEnv.VCAP_SERVICES, "hanatrial")){
        console.log(base.bundle.getText("warningHAAS")+"\n")
        
        defaultEnv.VCAP_SERVICES.hanatrial[0].credentials.encrypt = true
        defaultEnv.VCAP_SERVICES.hanatrial[0].credentials.sslValidateCertificate = false
        defaultEnv.VCAP_SERVICES.hanatrial[0].credentials.pooling = true
    }else {
        return base.error(base.bundle.getText("errNoHANAConfig"))
    }
    
    base.debug(defaultEnv)
    const fs = require('fs')
    fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), async (err) => {
        if (err) {
            return base.error(err)
        }
        console.log(base.bundle.getText("saved"))
        return base.end() 
    })

   return base.end()
}