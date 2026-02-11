// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'containers [containerGroup] [container]'
export const aliases = ['cont', 'listContainers', 'listcontainers']
export const describe = baseLite.bundle.getText("containers")

export const builder = baseLite.getBuilder({
  container: {
    alias: ['c', 'Container'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("container")
  },
  containerGroup: {
    alias: ['g', 'Group', 'group', 'containergroup'],
    type: 'string',
    default: '*',
    desc: baseLite.bundle.getText("containerGroup")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})

export let inputPrompts = {
  container: {
    description: baseLite.bundle.getText("container"),
    type: 'string',
    required: true
  },
  containerGroup: {
    description: baseLite.bundle.getText("containerGroup"),
    type: 'string',
    required: true
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getContainers, inputPrompts)
}

/**
 * Get list of HDI containers from database
 * @param {object} prompts - Input prompts with container group, container name, and limit
 * @returns {Promise<Array>} - Array of container objects
 */
export async function getContainers(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getContainers')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    base.debug(`${baseLite.bundle.getText("containerGroup")}: ${prompts.containerGroup}, ${baseLite.bundle.getText("container")}: ${prompts.container}`)

    let results = await getContainersInt(prompts.containerGroup, prompts.container, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

export async function getContainersInt(containerGroup, container, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug('getContainersInt')

  let query =
    `SELECT A.CONTAINER_NAME, A.CONTAINER_GROUP_NAME, B.SCHEMA_NAME, A.CREATE_USER_NAME, A.CREATE_TIMESTAMP_UTC
        FROM ( _SYS_DI.M_ALL_CONTAINERS AS A
               INNER JOIN _SYS_DI.M_ALL_CONTAINER_SCHEMAS AS B
               ON ( A.CONTAINER_NAME = B.CONTAINER_NAME 
               AND  B.SCHEMA_TYPE = 'com.sap.hana.runtime.db.target/*' ) )
         WHERE A.CONTAINER_NAME LIKE ? 
           AND A.CONTAINER_GROUP_NAME LIKE ?
         ORDER BY A.CONTAINER_NAME `
         
  if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(
    await client.preparePromisified(query),
    [
      base.dbClass.objectName(container),
      base.dbClass.objectName(containerGroup)
    ]
  )
}

