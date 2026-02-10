// @ts-check
import * as baseLite from '../utils/base-lite.js'
export const command = 'inspectUser [user]'
export const aliases = ['iu', 'user', 'insUser', 'inspectuser']
export const describe = baseLite.bundle.getText("inspectUser")

export const builder = baseLite.getBuilder({
  user: {
    alias: ['u', 'User'],
    type: 'string',
    desc: baseLite.bundle.getText("user")
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, userInspect, {
    user: {
      description: base.bundle.getText("user"),
      type: 'string',
      required: true
    }
  })
}

export async function userInspect(prompts) {
  const base = await import('../utils/base.js')
  base.debug('userInspect')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    base.output(`${baseLite.bundle.getText("user")}: ${prompts.user}`)

    let query =
      `SELECT *  
  FROM USERS 
  WHERE USER_NAME = ? `;
    let userDetails = (await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user]))
    base.outputTableFancy(userDetails)

    base.output(baseLite.bundle.getText("userParams"))
    query =
      `SELECT *
  FROM  USER_PARAMETERS
  WHERE USER_NAME = ?`
    let resultsParams = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user])
   base.outputTableFancy(resultsParams)

    base.output(baseLite.bundle.getText("grantedRoles"))
    query =
      `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, GRANTOR, IS_GRANTABLE
  FROM  GRANTED_ROLES
  WHERE GRANTEE = ?`
    let resultsRoles = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user])
    base.outputTableFancy(resultsRoles)

    base.output(baseLite.bundle.getText("grantedPrivs"))
    query =
      `SELECT PRIVILEGE, OBJECT_TYPE, GRANTOR, IS_GRANTABLE
  FROM  GRANTED_PRIVILEGES
  WHERE GRANTEE = ?`
    let resultsPrivs = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user])
    base.outputTableFancy(resultsPrivs)
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}