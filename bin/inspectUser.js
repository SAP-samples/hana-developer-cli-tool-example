// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'inspectUser [user]'
export const aliases = ['iu', 'user', 'insUser', 'inspectuser']
export const describe = baseLite.bundle.getText("inspectUser")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  user: {
    alias: ['u'],
    type: 'string',
    desc: baseLite.bundle.getText("user")
  }
})).wrap(160).example('hana-cli inspectUser --user SYSTEM', baseLite.bundle.getText("inspectUserExample")).wrap(160).epilog(buildDocEpilogue('inspectUser', 'security', ['users', 'roles', 'pwdPolicy']))

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

    base.output(`\n${baseLite.bundle.getText("user")}: ${prompts.user}`)

    let query =
      `SELECT *  
  FROM USERS 
  WHERE USER_NAME = ? `;
    let userDetails = (await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user]))
    
    // Format user details as key-value pairs for better readability
    if (userDetails && userDetails.length > 0) {
      const user = userDetails[0]
      Object.entries(user).forEach(([key, value]) => {
        const displayValue = value === null || value === undefined ? '(empty)' : value
        base.output(`  ${key}: ${displayValue}`)
      })
    } else {
      base.output(baseLite.bundle.getText('noData'))
    }

    base.output(`\n📋 ${baseLite.bundle.getText("userParams")}`)
    base.output('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    query =
      `SELECT *
  FROM  USER_PARAMETERS
  WHERE USER_NAME = ?`
    let resultsParams = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user])
   base.outputTableFancy(resultsParams)

    base.output(`\n🔐 ${baseLite.bundle.getText("grantedRoles")}`)
    base.output('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    query =
      `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, GRANTOR, IS_GRANTABLE
  FROM  GRANTED_ROLES
  WHERE GRANTEE = ?`
    let resultsRoles = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.user])
    base.outputTableFancy(resultsRoles)

    base.output(`\n⚡ ${baseLite.bundle.getText("grantedPrivs")}`)
    base.output('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
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