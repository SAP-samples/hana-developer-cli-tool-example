// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as  conn from '../utils/connections.js'
import * as xsenv from '@sap/xsenv'
import { spawn } from 'child_process'

export const command = 'hdbsql'
export const describe = baseLite.bundle.getText("hdbsql")
export const builder = baseLite.getBuilder({})
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, launchHdbsql, {})
}

export async function launchHdbsql(prompts) {
  const base = await import('../utils/base.js')
  base.debug('launchHdbsql')
  try {
    let envFile = conn.resolveEnv(prompts)
    xsenv.loadEnv(envFile)

    let options = await xsenv.getServices({ hana: { tag: 'hana' }, })
    let encrypt = ''
    if (options.hana.encrypt == true) {
      if (options.hana.sslValidateCertificate == true) {
        if (options.hana.sslTrustStore) {
          encrypt = `-e -ssltruststore ${options.hana.sslTrustStore} `
          if (options.hana.sslCryptoProvider) {
            encrypt += `-sslprovider ${options.hana.sslCryptoProvider}`
          }
        } else {
          let str = options.hana.certificate.replace(/\r?\n|\r/g, " ")
          encrypt = `-e -ssltruststore "${str}" `
        }
      }
    }
    base.debug(options)
    let cmd = `hdbsql -u ${options.hana.user} -n ${options.hana.host + ":" + options.hana.port} -p ${options.hana.password} ${encrypt} -A -m -j`
    await spawn(cmd, [], { shell: true, stdio: 'inherit' })
    return base.end()
  } catch (error) {
    await base.error(error)
  }

}