// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'privilegeError [guid]'
export const aliases = ['pe', 'privilegeerror', 'privilegerror', 'getInsuffficientPrivilegeErrorDetails']
export const describe = baseLite.bundle.getText("privilegeError")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  guid: {
    alias: ['g', 'error'],
    type: 'string',
    desc: baseLite.bundle.getText("errorGuid")
  }
})).wrap(160).example(
  'hana-cli privilegeError --guid <error-guid>',
  baseLite.bundle.getText("privilegeErrorExample")
).epilog(buildDocEpilogue('privilegeError', 'security', ['grantChains', 'privilegeAnalysis']))

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dbCall, {
    guid: {
      description: base.bundle.getText("errorGuid"),
      type: 'string',
      required: true
    }
  })
}

export async function dbCall(prompts) {
  const base = await import('../utils/base.js')
  base.debug('dbCall')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let inputParams = {
      GUID: prompts.guid
    }
    base.debug(inputParams)
    let sp = await db.loadProcedurePromisified("SYS", "GET_INSUFFICIENT_PRIVILEGE_ERROR_DETAILS")
    let object = await db.callProcedurePromisified(sp, inputParams)
    if (object.results < 1) {
      throw new Error(baseLite.bundle.getText("errGUID"))
    }
    base.outputTableFancy(object.results[0])
    base.end()
    return object.results[0]
  } catch (error) {
    await base.error(error)
  }
}
