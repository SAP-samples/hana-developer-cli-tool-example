// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'spatialData [schema] [table]'
export const aliases = ['spatial', 'geoData', 'geographic', 'geo']
export const describe = baseLite.bundle.getText("spatialData")

export const builder = baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("spatialTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  column: {
    alias: ['c'],
    type: 'string',
    desc: baseLite.bundle.getText("spatialColumn")
  },
  bounds: {
    alias: ['b'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("spatialBounds")
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
    description: baseLite.bundle.getText("spatialTable"),
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
  base.promptHandler(argv, getSpatialData, inputPrompts)
}

/**
 * Get spatial data information from database
 * @param {object} prompts - Input prompts with schema, table, column, and bounds
 * @returns {Promise<Array>} - Array of spatial data objects
 */
export async function getSpatialData(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getSpatialData')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.output(base.bundle.getText("log.schemaIndex", [schema, prompts.table]))

    let results = await getSpatialDataInt(schema, prompts.table, prompts.column, prompts.bounds, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get spatial data information with filters
 * @param {string} schema - Schema name
 * @param {string} table - Table name pattern
 * @param {string} column - Spatial column name (optional)
 * @param {boolean} bounds - Include spatial bounds
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of spatial data objects
 */
async function getSpatialDataInt(schema, table, column, bounds, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug(`getSpatialDataInt ${schema} ${table} ${column} ${limit}`)
  table = base.dbClass.objectName(table)

  let query =
    `SELECT SCHEMA_NAME, TABLE_NAME, COLUMN_NAME, DATA_TYPE_NAME, POSITION
    FROM SYS.TABLE_COLUMNS 
    WHERE SCHEMA_NAME LIKE ? 
      AND TABLE_NAME LIKE ? 
      AND (DATA_TYPE_NAME LIKE 'ST_%' OR DATA_TYPE_NAME IN ('GEOMETRY', 'POINT', 'LINESTRING', 'POLYGON'))`
  
  const params = [schema, table]

  if (column && column !== "*") {
    column = base.dbClass.objectName(column)
    query += ` AND COLUMN_NAME LIKE ? `
    params.push(column)
  }

  query += `ORDER BY SCHEMA_NAME, TABLE_NAME, POSITION `
  
  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }

  return await client.statementExecPromisified(await client.preparePromisified(query), params)
}
