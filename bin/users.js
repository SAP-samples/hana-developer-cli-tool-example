const base = require("../utils/base")

exports.command = 'users [user]'
exports.aliases = ['u', 'listUsers', 'listusers']
exports.describe = base.bundle.getText("users")

exports.builder = base.getBuilder({
  user: {
    alias: ['u', 'User'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("user")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, getUsers, {
    user: {
      description: base.bundle.getText("user"),
      type: 'string',
      required: true
    },
    limit: {
      description: base.bundle.getText("limit"),
      type: 'number',
      required: true
    }
  })
}

async function getUsers(prompts) {
  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    base.debug(`${base.bundle.getText("user")}: ${prompts.user}`)

    let results = await getUsersInt(prompts.user, db, prompts.limit)
    console.table(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}

async function getUsersInt(user, client, limit) {
  const dbClass = require("sap-hdbext-promisfied")  
  user = dbClass.objectName(user)
  let query =
    `SELECT USER_NAME, USERGROUP_NAME, CREATOR, CREATE_TIME  
  FROM USERS 
  WHERE USER_NAME LIKE ? 
  ORDER BY USER_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [user])
}