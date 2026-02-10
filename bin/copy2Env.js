// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as conn from "../utils/connections.js"
import * as fs from 'fs'
import * as xsenv from '@sap/xsenv'

export const command = 'copy2Env'
export const aliases = ['copyEnv', 'copyenv', 'copy2env']
export const describe = baseLite.bundle.getText("copy2Env")

export const builder = baseLite.getBuilder({})

export async function handler(argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, copy, {})
}

export async function copy(prompts) {
  const base = await import('../utils/base.js')
    base.debug('copy')
    let envFile = conn.resolveEnv(prompts)
    xsenv.loadEnv(envFile)
    base.debug(process.env.VCAP_SERVICES)
    fs.writeFile(".env", `VCAP_SERVICES=${process.env.VCAP_SERVICES}`, async (err) => {
        if (err) {
            base.error(err)
        }
        console.log(baseLite.bundle.getText("saved2"))
        return base.end()
    })
    return base.end()
}