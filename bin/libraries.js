// @ts-check
import * as base from '../utils/base.js'
export const command = 'libraries [schema] [library]'
export const aliases = ['l', 'listLibs', 'ListLibs', 'listlibs', 'ListLib', "listLibraries", "listlibraries"]
export const describe = base.bundle.getText("libraries")

export const builder = base.getBuilder({
  library: {
    alias: ['lib', 'Library'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("library")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  }
})

export function handler (argv) {
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

export async function getLibraries(prompts) {
  base.debug('getLibraries')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
 
    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("library")}: ${prompts.library}`)

    let results = await getLibrariesInt(schema, prompts.library, db, prompts.limit)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}

async function getLibrariesInt(schema, library, client, limit) {
  base.debug(`getLibrariesInt ${schema} ${library} ${limit}`)
  library = base.dbClass.objectName(library)
  let query =
    `SELECT SCHEMA_NAME, LIBRARY_NAME, OWNER_NAME, LIBRARY_TYPE, IS_VALID, CREATE_TIME from LIBRARIES 
  WHERE SCHEMA_NAME LIKE ? 
    AND LIBRARY_NAME LIKE ? 
  ORDER BY LIBRARY_NAME `
  if (limit | base.sqlInjection.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, library])
}