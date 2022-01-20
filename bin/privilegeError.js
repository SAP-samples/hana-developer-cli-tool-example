// @ts-check
import * as base from '../utils/base.js'

export const command = 'privilegeError [guid]'
export const aliases = ['pe', 'privilegeerror', 'privilegerror', 'getInsuffficientPrivilegeErrorDetails']
export const describe = base.bundle.getText("privilegeError")

export const builder = base.getBuilder({
  guid: {
    alias: ['g', 'error'],
    type: 'string',
    desc: base.bundle.getText("errorGuid")
  }
})

export function handler (argv) {
  base.promptHandler(argv, dbCall, {
    guid: {
      description: base.bundle.getText("errorGuid"),
      type: 'string',
      required: true
    }
  })
}

export async function dbCall(prompts) {
  base.debug('dbCall')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let inputParams = {
      GUID: prompts.guid
    }
 
    let sp = await db.loadProcedurePromisified("SYS", "GET_INSUFFICIENT_PRIVILEGE_ERROR_DETAILS")
    let object = await db.callProcedurePromisified(sp, inputParams)
    if (object.results < 1) {
      throw new Error(base.bundle.getText("errGUID"))
    }
    base.outputTable(object.results[0])
    base.end()
    return object.results[0]
  } catch (error) {
    base.error(error)
  }
}
