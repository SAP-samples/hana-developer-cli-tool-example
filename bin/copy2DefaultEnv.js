// @ts-check
import * as baseLite from '../utils/base-lite.js'
import 'dotenv/config'
import * as fs from 'fs'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'copy2DefaultEnv'
export const aliases = ['copyDefaultEnv', 'copyDefault-Env', 'copy2defaultenv', 'copydefaultenv', 'copydefault-env']
export const describe = baseLite.bundle.getText("copy2DefaultEnv")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({}, false)).wrap(160).example('hana-cli copy2DefaultEnv', baseLite.bundle.getText("copy2DefaultEnvExample")).wrap(160).epilog(buildDocEpilogue('copy2DefaultEnv', 'connection-auth', ['connect', 'config', 'copy2Env']))

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
    try {
        await fs.promises.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'))
        console.log(baseLite.bundle.getText("saved"))
        return base.end()
    } catch (err) {
        return base.error(err)
    }
}