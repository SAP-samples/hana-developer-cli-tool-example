// @ts-check
import * as base from '../utils/base.js'

export const command = 'synonyms [schema] [synonym] [target]'
export const aliases = ['syn', 'listSynonyms', 'listsynonyms']
export const describe = base.bundle.getText("synonyms")

export const builder = base.getBuilder({
  synonym: {
    alias: ['syn', 'Synonym'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("synonym")
  },
  target: {
    alias: ['t', 'Target'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("target")
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
  base.promptHandler(argv, getSynonyms, {
    synonym: {
      description: base.bundle.getText("synonym"),
      type: 'string',
      required: true
    },
    target: {
      description: base.bundle.getText("target"),
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

export async function getSynonyms(prompts) {
  base.debug('getSynonyms')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("synonym")}: ${prompts.synonym}, ${base.bundle.getText("target")}: ${prompts.target}`)

    let results = await getSynonymsInt(schema, prompts.synonym, prompts.target, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

async function getSynonymsInt(schema, synonym, target, client, limit) {
  base.debug(`getSynonymsInt ${schema} ${synonym} ${target} ${limit}`)
  synonym = base.dbClass.objectName(synonym)
  target = base.dbClass.objectName(target)
  let query =
    `SELECT SCHEMA_NAME, SYNONYM_NAME, OBJECT_SCHEMA, OBJECT_NAME, OBJECT_TYPE, CREATE_TIME  from SYNONYMS 
    WHERE SCHEMA_NAME LIKE ? 
      AND SYNONYM_NAME LIKE ? 
      AND OBJECT_NAME LIKE ?
    ORDER BY SCHEMA_NAME, SYNONYM_NAME `

  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, synonym, target])
}