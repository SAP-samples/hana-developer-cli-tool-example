// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'synonyms [schema] [synonym] [target]'
export const aliases = ['syn', 'listSynonyms', 'listsynonyms']
export const describe = baseLite.bundle.getText("synonyms")

export const builder = baseLite.getBuilder({
  synonym: {
    alias: ['syn', 'Synonym'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("synonym")
  },
  target: {
    alias: ['t', 'Target'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("target")
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

export async function handler (argv) {
  const base = await import('../utils/base.js')
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
  const base = await import('../utils/base.js')
  base.debug('getSynonyms')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("synonym")}: ${prompts.synonym}, ${baseLite.bundle.getText("target")}: ${prompts.target}`)

    let results = await getSynonymsInt(schema, prompts.synonym, prompts.target, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

async function getSynonymsInt(schema, synonym, target, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
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