// @ts-check
import * as baseLite from '../utils/base-lite.js'
import 'dotenv/config'
import * as fs from 'fs'

export const command = 'copy2DefaultEnv'
export const aliases = ['copyDefaultEnv', 'copyDefault-Env', 'copy2defaultenv', 'copydefaultenv', 'copydefault-env']
export const describe = baseLite.bundle.getText("copy2DefaultEnv")

export const builder = baseLite.getBuilder({}, false)

export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, copy, {}, false)
}

export async function copy() {
  const base = await import('../utils/base.js')
    base.debug('copy')
    let defaultEnv = {}
    if (process.env.VCAP_SERVICES == null) {
        return base.error(baseLite.bundle.getText("errNoEnv"))
    }
    defaultEnv.VCAP_SERVICES = process.env.VCAP_SERVICES
    let temp = JSON.parse(process.env.VCAP_SERVICES)
    defaultEnv.VCAP_SERVICES = temp

    if(Object.prototype.hasOwnProperty.call(defaultEnv.VCAP_SERVICES, "hana")){
        defaultEnv.VCAP_SERVICES.hana[0].credentials.encrypt = true
        defaultEnv.VCAP_SERVICES.hana[0].credentials.sslValidateCertificate = false
        defaultEnv.VCAP_SERVICES.hana[0].credentials.pooling = true
    }else if (Object.prototype.hasOwnProperty.call(defaultEnv.VCAP_SERVICES, "hanatrial")){
        console.log(baseLite.bundle.getText("warningHAAS")+"\n")
        
        defaultEnv.VCAP_SERVICES.hanatrial[0].credentials.encrypt = true
        defaultEnv.VCAP_SERVICES.hanatrial[0].credentials.sslValidateCertificate = false
        defaultEnv.VCAP_SERVICES.hanatrial[0].credentials.pooling = true
    }else {
        return base.error(baseLite.bundle.getText("errNoHANAConfig"))
    }
    
    base.debug(defaultEnv)
    fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), async (err) => {
        if (err) {
            return base.error(err)
        }
        console.log(baseLite.bundle.getText("saved"))
        return base.end()
    })

   return base.end()
}