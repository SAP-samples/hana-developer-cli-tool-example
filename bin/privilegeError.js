const base = require("../utils/base")

exports.command = 'privilegeError [guid]'
exports.aliases = ['pe', 'privilegeerror', 'privilegerror', 'getInsuffficientPrivilegeErrorDetails']
exports.describe = base.bundle.getText("privilegeError")

exports.builder = base.getBuilder({
  guid: {
    alias: ['g', 'error'],
    type: 'string',
    desc: base.bundle.getText("errorGuid")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, dbCall, {
    guid: {
      description: base.bundle.getText("errorGuid"),
      type: 'string',
      required: true
    }
  })
}

async function dbCall(prompts) {
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))
    let inputParams = {
      GUID: prompts.guid
    }
    let hdbext = require("@sap/hdbext")
    let sp = await db.loadProcedurePromisified(hdbext, "SYS", "GET_INSUFFICIENT_PRIVILEGE_ERROR_DETAILS")
    let object = await db.callProcedurePromisified(sp, inputParams)
    if (object.results < 1) {
      throw new Error(base.bundle.getText("errGUID"))
    }
    base.outputTable(object.results[0])
    return base.end()
  } catch (error) {
    base.error(error)
  }
}