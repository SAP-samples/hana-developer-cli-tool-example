const base = require("../utils/base")

exports.command = 'inspectUser [user]'
exports.aliases = ['iu', 'user', 'insUser', 'inspectuser']
exports.describe = base.bundle.getText("inspectUser")

exports.builder = base.getBuilder({
  user: {
    alias: ['u', 'User'],
    type: 'string',
    desc: base.bundle.getText("user")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, userInspect, {
    user: {
      description: base.bundle.getText("user"),
      type: 'string',
      required: true
    }
  })
}

async function userInspect(prompts) {
  base.debug('userInspect')
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    base.output(`${base.bundle.getText("user")}: ${prompts.user}`)

    let query =
      `SELECT *  
  FROM USERS 
  WHERE USER_NAME = ? `;
    let userDetails = (await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user]))
    base.outputTable(userDetails)

    base.output(base.bundle.getText("userParams"))
    query =
      `SELECT *
  FROM  USER_PARAMETERS
  WHERE USER_NAME = ?`
    let resultsParams = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user])
   base.outputTable(resultsParams)

    base.output(base.bundle.getText("grantedRoles"))
    query =
      `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, GRANTOR, IS_GRANTABLE
  FROM  GRANTED_ROLES
  WHERE GRANTEE = ?`
    let resultsRoles = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user])
    base.outputTable(resultsRoles)

    base.output(base.bundle.getText("grantedPrivs"))
    query =
      `SELECT PRIVILEGE, OBJECT_TYPE, GRANTOR, IS_GRANTABLE
  FROM  GRANTED_PRIVILEGES
  WHERE GRANTEE = ?`
    let resultsPrivs = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user])
    base.outputTable(resultsPrivs)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}