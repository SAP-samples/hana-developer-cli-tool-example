// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as  conn from '../utils/connections.js'
import * as xsenv from '@sap/xsenv'
import { spawn, spawnSync } from 'child_process'

import { buildDocEpilogue } from '../utils/doc-linker.js'
function isCommandAvailable(command) {
  const checkCommand = process.platform === 'win32' ? 'where' : 'which'
  const result = spawnSync(checkCommand, [command], { stdio: 'ignore' })
  return result.status === 0
}

export const command = 'hdbsql'
export const describe = baseLite.bundle.getText("hdbsql")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).wrap(160).example('hana-cli hdbsql', baseLite.bundle.getText("hdbsqlExample")).wrap(160).epilog(buildDocEpilogue('hdbsql', 'developer-tools', ['querySimple', 'callProcedure']))
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
    if (!isCommandAvailable('hdbsql')) {
      throw new Error(`hdbsql not found in PATH. ${baseLite.bundle.getText("hdbsql")}`)
    }
    let cmd = `hdbsql -u ${options.hana.user} -n ${options.hana.host + ":" + options.hana.port} -p ${options.hana.password} ${encrypt} -A -m -j`
    spawnSync(cmd, [], { shell: true, stdio: 'inherit' })
    return base.end()
  } catch (error) {
    await base.error(error)
  }

}