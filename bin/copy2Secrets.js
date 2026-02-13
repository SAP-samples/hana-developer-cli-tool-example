// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as fs from 'fs'
import * as path from 'path'
import * as xsenv from '@sap/xsenv'

export const command = 'copy2Secrets'
export const aliases = ['secrets', 'make:secrets']
export const describe = baseLite.bundle.getText("copy2Secrets")

export const builder = baseLite.getBuilder({
    envJson: {
        alias: ['from-file'],
        type: 'string',
        default: "default-env.json",
        desc: baseLite.bundle.getText("envJson")
    },
    secretsFolder: {
        alias: ['to-folder'],
        type: 'string',
        default: "secrets",
        desc: baseLite.bundle.getText("secretsFolder")
    },
    filter: {
        type: 'string',
        desc: baseLite.bundle.getText("secretsFilter")
    }
}, false)


export async function handler (argv) {
  const base = await import('../utils/base.js')
    makeSecrets(argv)
}

export async function makeSecrets({ envFile, secretsFolder, filter }) {
  const base = await import('../utils/base.js')

        base.debug(base.bundle.getText("debug.copy2Secrets.makeSecrets", [envFile, secretsFolder, filter]))
    xsenv.loadEnv(envFile)

    const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES)
    base.debug(VCAP_SERVICES)

    for (const service in VCAP_SERVICES) {
        const instances = VCAP_SERVICES[service]
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i]
            const instanceName = instance.name
            if (filter && filter.length && !filter.includes(instanceName.toLowerCase())) {
                continue
            }
            const credsPath = path.join(secretsFolder, service, instanceName)
            fs.mkdirSync(credsPath, { recursive: true })
            for (const key in instance.credentials) {
                if (key === "encrypt") {
                    continue
                }
                const value = instance.credentials[key]
                const keyPath = path.join(secretsFolder, service, instanceName, key)
                fs.writeFileSync(
                    keyPath,
                    typeof value === 'string' ? value : JSON.stringify(value)
                )
                console.log(baseLite.bundle.getText("created") + ": " + keyPath)
            }
        }
    }
    return base.end() 
}