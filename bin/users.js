// @ts-check
import * as base from '../utils/base.js'

export const command = 'users [user]'
export const aliases = ['u', 'listUsers', 'listusers']
export const describe = base.bundle.getText("users")

export const builder = base.getBuilder({
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

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export function handler (argv) {
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
  base.debug('getUsers')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    base.debug(`${base.bundle.getText("user")}: ${prompts.user}`)

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