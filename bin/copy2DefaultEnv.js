// @ts-check
import * as base from '../utils/base.js'
import 'dotenv/config'
import * as fs from 'fs'

export const command = 'copy2DefaultEnv'
export const aliases = ['copyDefaultEnv', 'copyDefault-Env', 'copy2defaultenv', 'copydefaultenv', 'copydefault-env']
export const describe = base.bundle.getText("copy2DefaultEnv")

export const builder = base.getBuilder({}, false)

export function handler (argv) {
    base.promptHandler(argv, copy, {}, false)
}

export async function copy() {
    base.debug('copy')
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
    fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), async (err) => {
        if (err) {
            return base.error(err)
        }
        console.log(base.bundle.getText("saved"))
        return base.end() 
    })

   return base.end()
}