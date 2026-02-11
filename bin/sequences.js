// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'sequences [schema] [sequence]'
export const aliases = ['seq', 'listSeqs', 'ListSeqs', 'listseqs', 'Listseq', "listSequences"]
export const describe = baseLite.bundle.getText("sequences")

export const builder = baseLite.getBuilder({
  sequence: {
    alias: ['seq', 'Sequence'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("sequence")
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
 * @returns {Promise<void>}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
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

/**
 * Get list of database sequences
 * @param {object} prompts - Input prompts with schema, sequence pattern, and limit
 * @returns {Promise<Array>} - Array of sequence objects
 */
export async function getSequences(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getSequences')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("sequence")}: ${prompts.sequence}`)

    let results = await getSequencesInt(schema, prompts.sequence, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get sequences with filters
 * @param {string} schema - Schema name
 * @param {string} sequence - Sequence name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of sequence objects
 */
async function getSequencesInt(schema, sequence, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug(`getSequencesInt ${schema} ${sequence} ${limit}`)
  sequence = base.dbClass.objectName(sequence)
  let query =
    `SELECT SCHEMA_NAME, SEQUENCE_NAME, CACHE_SIZE, START_VALUE, END_VALUE, CURRENT_VALUE from M_SEQUENCES 
  WHERE SCHEMA_NAME LIKE ? 
    AND SEQUENCE_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, SEQUENCE_NAME `
  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, sequence])
}