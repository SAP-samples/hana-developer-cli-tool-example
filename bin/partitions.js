// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'partitions [schema] [table]'
export const aliases = ['parts', 'partition', 'partitioning', 'tablePartitions']
export const describe = baseLite.bundle.getText("partitions")

export const builder = baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("partitionTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  type: {
    alias: ['pt'],
    type: 'string',
    desc: baseLite.bundle.getText("partitionType")
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
  table: {
    description: baseLite.bundle.getText("partitionTable"),
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
  base.promptHandler(argv, getPartitions, inputPrompts)
}

/**
 * Get table partitioning information from database
 * @param {object} prompts - Input prompts with schema, table, and type
 * @returns {Promise<Array>} - Array of partition objects
 */
export async function getPartitions(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getPartitions')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.output(base.bundle.getText("log.schemaIndex", [schema, prompts.table]))

    let results = await getPartitionsInt(schema, prompts.table, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get partition information with filters
 * @param {string} schema - Schema name
 * @param {string} table - Table name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of partition objects
 */
async function getPartitionsInt(schema, table, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug(`getPartitionsInt ${schema} ${table} ${limit}`)
  table = base.dbClass.objectName(table)

  let query = `
    SELECT 
      t.SCHEMA_NAME,
      t.TABLE_NAME,
      CASE WHEN t.IS_PARTITIONED = 'TRUE' THEN 'Yes' ELSE 'No' END AS IS_PARTITIONED,
      t.TABLE_TYPE
    FROM SYS.TABLES t
    WHERE t.SCHEMA_NAME LIKE ? 
      AND t.TABLE_NAME LIKE ? `

  const params = [schema, table]

  // Try to get partition details if M_TABLE_PARTITIONS exists
  try {
    base.debug('Attempting to query M_TABLE_PARTITIONS for detailed partition info')
    let detailQuery = `
      SELECT 
        t.SCHEMA_NAME,
        t.TABLE_NAME,
        tp.*
      FROM SYS.TABLES t
      INNER JOIN M_TABLE_PARTITIONS tp 
        ON t.SCHEMA_NAME = tp.SCHEMA_NAME 
        AND t.TABLE_NAME = tp.TABLE_NAME
      WHERE t.SCHEMA_NAME LIKE ? 
        AND t.TABLE_NAME LIKE ?
        AND t.IS_PARTITIONED = 'TRUE'
      ORDER BY t.SCHEMA_NAME, t.TABLE_NAME, tp.PART_ID `
    
    if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
      detailQuery += `LIMIT ${limit.toString()}`
    }

    const detailResults = await client.statementExecPromisified(
      await client.preparePromisified(detailQuery), 
      params
    )
    
    if (detailResults && detailResults.length > 0) {
      return detailResults
    }
  } catch (error) {
    base.debug(`M_TABLE_PARTITIONS query failed, falling back to basic info: ${error.message}`)
  }

  // Fallback to basic table info
  query += `ORDER BY t.SCHEMA_NAME, t.TABLE_NAME `
  
  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }

  return await client.statementExecPromisified(await client.preparePromisified(query), params)
}