// @ts-check
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'
import * as conn from '../utils/connections.js'
const colors = base.colors

const OUTPUTS = {
  BASIC: "basic",
  ENV: "env",
  DBX: "dbx"
}
export const command = 'systemInfo'
export const aliases = ['sys', 'sysinfo', 'sysInfo', 'systeminfo']
export const describe = base.bundle.getText("systemInfo")
export const builder = base.getBuilder({
  output: {
    alias: ['o', 'Output'],
    choices: [OUTPUTS.BASIC, OUTPUTS.ENV, OUTPUTS.DBX],
    default: "basic",
    type: 'string',
    desc: base.bundle.getText("outputType")
  }
})

export let inputPrompts = {
  output: {
    description: base.bundle.getText("outputType"),
    type: 'string',
    required: true
  }
}
/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler(argv) {
  base.promptHandler(argv, sysInfo, inputPrompts)
}


/**
 * Display system information in various formats
 * @param {object} prompts - Input prompts with output format selection
 * @returns {Promise<void>}
 */
export async function sysInfo(prompts) {
  base.debug('sysInfo')
  try {
    base.setPrompts(prompts)
    switch (prompts.output) {
      case OUTPUTS.BASIC: {
        await basicOutput()
        break
      }

      case OUTPUTS.ENV: {
        await environmentOutput(prompts)
        break
      }
      case OUTPUTS.DBX: {
        await dbxOutput(prompts)
        break
      }
      default: {
        throw base.bundle.getText("unsupportedFormat")
      }
    }

    return base.end()
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Output basic system information including HANA version and system overview
 * @returns {Promise<void>}
 */
export async function basicOutput() {
  const dbStatus = await base.createDBConnection()
  console.log(`${colors.green(base.bundle.getText("dbx.user"))}: ${await base.getUserName()}`)
  base.outputTableFancy(await dbInspect.getHANAVersion(dbStatus))
  

  let results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SYSTEM_OVERVIEW"`)
  base.outputTableFancy(results)

  results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SERVICES"`)
  base.outputTableFancy(results)
}

/**
 * Output environment connection configuration
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function environmentOutput(prompts) {
  prompts.disableVerbose = true
  console.log(await conn.getConnOptions(prompts))
}

/**
 * Output connection details in DBX-compatible format
 * @param {object} prompts - Input prompts
 * @returns {Promise<void>}
 */
export async function dbxOutput(prompts) {
  prompts.disableVerbose = true
  let connDetails = await conn.getConnOptions(prompts)
  const dbStatus = await base.createDBConnection()
  const dbVersion = await dbInspect.getHANAVersion(dbStatus)
  const unknown = base.bundle.getText("hc.unknown")

  if (dbVersion.versionMajor > 2) {
    console.log(`${base.bundle.getText("dbx.dbType")}:${colors.red('*')} ${colors.red(`SAP HANA Cloud`)}`)
  } else {
    console.log(`${base.bundle.getText("dbx.dbType")}:${colors.red('*')} ${colors.red(`SAP HANA`)}`)
  }
  console.log(`  ${base.bundle.getText("dbx.hostPort")}:${colors.red('*')} ${colors.red(connDetails.hana?.host ?? unknown)} - ${colors.red(connDetails.hana?.port ?? unknown)}`)
  console.log(`         ${base.bundle.getText("dbx.user")}:${colors.red('*')} ${colors.red(connDetails.hana?.user ?? unknown)}`)
  console.log(`     ${base.bundle.getText("dbx.password")}:${colors.red('*')} ${colors.red(connDetails.hana?.password ?? unknown)}`)

  if (connDetails.hana?.hdi_user) {
    console.log(``)
    console.log(`     ${base.bundle.getText("dbx.hdiUser")}:  ${colors.green(connDetails.hana?.hdi_user ?? unknown)}`)
    console.log(` ${base.bundle.getText("dbx.hdiPassword")}:  ${colors.green(connDetails.hana?.hdi_password ?? unknown)}`)
    console.log(``)
  }

  if (connDetails.hana?.encrypt) {
    console.log(`                ${colors.green(`✅`)} ${base.bundle.getText("dbx.secure")}`)
  }else {
    console.log(`                ${colors.green(`🔳`)} ${base.bundle.getText("dbx.secure")}`)
  }

  if (connDetails.hana?.sslValidateCertificate) {
    console.log(`                ${colors.green(`✅`)} ${base.bundle.getText("dbx.cert")}`)
  }else {
    console.log(`                ${colors.green(`🔳`)} ${base.bundle.getText("dbx.cert")}`)
  }

  if (connDetails.hana?.certificate){
    console.log(`${base.bundle.getText("dbx.cert2")}:`)
    let cert = connDetails.hana?.certificate.replace(`-----BEGIN CERTIFICATE-----\n`, '')
    cert = cert.replace(`-----END CERTIFICATE-----`, '')    
    console.log(colors.blue(cert))
  }
  return null

}