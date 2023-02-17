// @ts-check
import * as base from '../utils/base.js'

export const command = 'objects [schema] [object]'
export const aliases = ['o', 'listObjects', 'listobjects']
export const describe = base.bundle.getText("objects")

export const builder = base.getBuilder({
  object: {
    alias: ['o', 'Object'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("object")
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
  base.promptHandler(argv, getObjects, {
    object: {
      description: base.bundle.getText("object"),
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

export async function getObjects(prompts) {
  base.debug('getObjects')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("object")}: ${prompts.object}`)

    let results = await getObjectsInt(schema, prompts.object, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}

async function getObjectsInt(schema, object, client, limit) {
  base.debug(`getObjectsInt ${schema} ${object} ${limit}`)
  object = base.dbClass.objectName(object)

  var query =
    `SELECT OBJECT_CATEGORY, SCHEMA_NAME, OBJECT_NAME, OBJECT_TYPE, TO_NVARCHAR(OBJECT_OID) AS OBJECT_OID  from OBJECTS 
  WHERE SCHEMA_NAME LIKE ? 
    AND OBJECT_NAME LIKE ? 
  ORDER BY OBJECT_TYPE, OBJECT_NAME `
  if (limit | base.sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, object])
}