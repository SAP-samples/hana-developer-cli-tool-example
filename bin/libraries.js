// @ts-check
import * as baseLite from '../utils/base-lite.js'
export const command = 'libraries [schema] [library]'
export const aliases = ['l', 'listLibs', 'ListLibs', 'listlibs', 'ListLib', "listLibraries", "listlibraries"]
export const describe = baseLite.bundle.getText("libraries")

export const builder = baseLite.getBuilder({
  library: {
    alias: ['lib', 'Library'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("library")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
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
 * @returns {void}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getLibraries, {
    library: {
      description: base.bundle.getText("library"),
      type: 'string',
      required: true
    },
    schema: {
      description: base.bundle.getText("schema"),
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
 * Get list of libraries from database
 * @param {object} prompts - Input prompts with schema, library pattern, and limit
 * @returns {Promise<Array>} - Array of library objects
 */
export async function getLibraries(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getLibraries')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
 
    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("library")}: ${prompts.library}`)

    let results = await getLibrariesInt(schema, prompts.library, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get libraries with filters
 * @param {string} schema - Schema name
 * @param {string} library - Library name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of library objects
 */
async function getLibrariesInt(schema, library, client, limit) {
  const base = await import('../utils/base.js')
  base.debug(`getLibrariesInt ${schema} ${library} ${limit}`)
  library = base.dbClass.objectName(library)
  let query =
    `SELECT SCHEMA_NAME, LIBRARY_NAME, OWNER_NAME, LIBRARY_TYPE, IS_VALID, CREATE_TIME from LIBRARIES 
  WHERE SCHEMA_NAME LIKE ? 
    AND LIBRARY_NAME LIKE ? 
  ORDER BY LIBRARY_NAME `
  if (limit || base.sqlInjection.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, library])
}