// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'users [user]'
export const aliases = ['u', 'listUsers', 'listusers']
export const describe = baseLite.bundle.getText("users")

export const builder = baseLite.getBuilder({
  user: {
    alias: ['u', 'User'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("user")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
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

/**
 * Get list of database users
 * @param {object} prompts - Input prompts with user pattern and limit
 * @returns {Promise<Array>} - Array of user objects
 */
export async function getUsers(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getUsers')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    base.debug(`${baseLite.bundle.getText("user")}: ${prompts.user}`)

    let results = await getUsersInt(prompts.user, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get users with filters
 * @param {string} user - User name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of user objects
 */
async function getUsersInt(user, client, limit) {
  const base = await import('../utils/base.js')
  base.debug(`getUsersInt ${user} ${limit}`)
  user = base.dbClass.objectName(user)
  let query =
    `SELECT USER_NAME, USERGROUP_NAME, CREATOR, CREATE_TIME  
  FROM USERS 
  WHERE USER_NAME LIKE ? 
  ORDER BY USER_NAME `
  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [user])
}