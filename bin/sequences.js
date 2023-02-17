// @ts-check
import * as base from '../utils/base.js'

export const command = 'sequences [schema] [sequence]'
export const aliases = ['seq', 'listSeqs', 'ListSeqs', 'listseqs', 'Listseq', "listSequences"]
export const describe = base.bundle.getText("sequences")

export const builder = base.getBuilder({
  sequence: {
    alias: ['seq', 'Sequence'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("sequence")
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
  base.promptHandler(argv, getSequences, {
    sequence: {
      description: base.bundle.getText("sequence"),
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

export async function getSequences(prompts) {
  base.debug('getSequences')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("sequence")}: ${prompts.sequence}`)

    let results = await getSequencesInt(schema, prompts.sequence, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}

async function getSequencesInt(schema, sequence, client, limit) {
  base.debug(`getSequencesInt ${schema} ${sequence} ${limit}`)
  sequence = base.dbClass.objectName(sequence)
  let query =
    `SELECT SCHEMA_NAME, SEQUENCE_NAME, CACHE_SIZE, START_VALUE, END_VALUE, CURRENT_VALUE from M_SEQUENCES 
  WHERE SCHEMA_NAME LIKE ? 
    AND SEQUENCE_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, SEQUENCE_NAME `
  if (limit | base.sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, sequence])
}