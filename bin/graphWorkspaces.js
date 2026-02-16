// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'graphWorkspaces [schema] [workspace]'
export const aliases = ['gws', 'graphs', 'graphWorkspace', 'graphws']
export const describe = baseLite.bundle.getText("graphWorkspaces")

export const builder = baseLite.getBuilder({
  workspace: {
    alias: ['w'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("graphWorkspaceName")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})

export let inputPrompts = {
  workspace: {
    description: baseLite.bundle.getText("graphWorkspaceName"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
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
  base.promptHandler(argv, getGraphWorkspaces, inputPrompts)
}

/**
 * Get list of graph workspaces from database
 * @param {object} prompts - Input prompts with schema, workspace, and limit
 * @returns {Promise<Array>} - Array of graph workspace objects
 */
export async function getGraphWorkspaces(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getGraphWorkspaces')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.output(base.bundle.getText("log.schemaIndex", [schema, prompts.workspace]))

    let results = await getGraphWorkspacesInt(schema, prompts.workspace, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get graph workspaces with filters
 * @param {string} schema - Schema name
 * @param {string} workspace - Workspace name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of graph workspace objects
 */
async function getGraphWorkspacesInt(schema, workspace, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug(`getGraphWorkspacesInt ${schema} ${workspace} ${limit}`)
  workspace = base.dbClass.objectName(workspace)

  // Query for graph workspace metadata from SYS.OBJECTS
  // Graph workspaces in HANA Cloud are stored with OBJECT_TYPE = 'GRAPHWORKSPACE'
  let query = `
    SELECT 
      SCHEMA_NAME,
      OBJECT_NAME as WORKSPACE_NAME,
      OBJECT_TYPE,
      COMMENTS
    FROM SYS.OBJECTS
    WHERE SCHEMA_NAME LIKE ? 
      AND OBJECT_NAME LIKE ? 
      AND OBJECT_TYPE = 'GRAPHWORKSPACE'
    ORDER BY SCHEMA_NAME, OBJECT_NAME
  `
  
  const params = [schema, workspace]

  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += ` LIMIT ${limit.toString()}`
  }

  try {
    const results = await client.statementExecPromisified(await client.preparePromisified(query), params)
    if (results && results.length > 0) {
      return results
    }
    // If no results with GRAPHWORKSPACE type, try finding them through metadata tables
    return await getGraphWorkspacesFromMetadata(schema, workspace, client, limit, params)
  } catch (error) {
    base.debug(`Graph workspace query error: ${error.message}`)
    return await getGraphWorkspacesFromMetadata(schema, workspace, client, limit, params)
  }
}

/**
 * Get graph workspaces from HDI metadata
 * @param {string} schema - Schema name
 * @param {string} workspace - Workspace name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} - Array of graph workspace objects
 */
async function getGraphWorkspacesFromMetadata(schema, workspace, client, limit, params) {
  const base = await import('../utils/base.js')
  
  // Query SYS.PSE_CONTAINER_GRANTS or SYS.CONTAINERS to find graph-related objects
  // This is an alternative approach for HANA Cloud environments
  let query = `
    SELECT DISTINCT
      SCHEMA_NAME,
      OBJECT_NAME as WORKSPACE_NAME,
      OBJECT_TYPE,
      COMMENTS
    FROM SYS.OBJECTS
    WHERE SCHEMA_NAME LIKE ? 
      AND OBJECT_NAME LIKE ? 
      AND (OBJECT_TYPE IN ('TABLE', 'VIEW', 'GRAPHWORKSPACE') OR OBJECT_TYPE LIKE '%GRAPH%')
    ORDER BY SCHEMA_NAME, OBJECT_NAME
  `
  
  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += ` LIMIT ${limit.toString()}`
  }

  try {
    return await client.statementExecPromisified(await client.preparePromisified(query), params)
  } catch (error) {
    base.debug(`Fallback graph workspace query failed: ${error.message}`)
    return []
  }
}