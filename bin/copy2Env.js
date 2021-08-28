// @ts-check
import * as base from '../utils/base.js'
import * as conn from "../utils/connections.js"
import * as fs from 'fs'
import * as xsenv from '@sap/xsenv'

export const command = 'copy2Env'
export const aliases = ['copyEnv', 'copyenv', 'copy2env']
export const describe = base.bundle.getText("copy2Env")

export const builder = base.getBuilder({})

export function handler(argv) {
    base.promptHandler(argv, copy, {})
}

export async function copy(prompts) {
    base.debug('copy')
    let envFile = conn.resolveEnv(prompts)
    xsenv.loadEnv(envFile)
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