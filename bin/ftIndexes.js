// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'ftIndexes [schema] [index]'
export const aliases = ['fti', 'ftIndex', 'fulltext', 'fulltextIndexes']
export const describe = baseLite.bundle.getText("ftIndexes")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  index: {
    alias: ['i'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("ftIndexName")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("ftTable")
  },
  details: {
    alias: ['d'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("details")
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
})).example('hana-cli ftIndexes --index myIndex --schema MYSCHEMA', baseLite.bundle.getText("ftIndexesExample"))

export let inputPrompts = {
  index: {
    description: baseLite.bundle.getText("ftIndexName"),
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
  },
  details: {
    description: baseLite.bundle.getText("details"),
    type: 'boolean',
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
  base.promptHandler(argv, getFullTextIndexes, inputPrompts)
}

/**
 * Get full-text indexes from database
 * @param {object} prompts - Input prompts with schema, index, and table
 * @returns {Promise<Array>} - Array of full-text index objects
 */
export async function getFullTextIndexes(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getFullTextIndexes')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    const showDetails = prompts.details || false

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.output(base.bundle.getText("log.schemaIndex", [schema, prompts.index]))

    let results = await getFullTextIndexesInt(schema, prompts.index, prompts.table, db, prompts.limit)

    const displayResults = results.map(row => ({
      'Schema': row.SCHEMA_NAME,
      'Table': row.TABLE_NAME,
      'Index': row.INDEX_NAME,
      'Column': row.COLUMN_NAME,
      'Search Mode': row.FUZZY_SEARCH_MODE || row.TABLE_COLUMN_FUZZY_MODE,
      'Memory (bytes)': row.MEMORY_SIZE_IN_TOTAL,
      'Loaded': row.LOADED,
      'Index Type': row.INDEX_TYPE,
      'Constraint': row.CONSTRAINT_NAME
    }))

    if (base.verboseOutput(prompts)) {
      await base.outputTableFancy(displayResults)
      if (showDetails && results.length > 0) {
        base.output('')
        base.output(base.colors.bold(base.bundle.getText("details") + ':'))
        console.log(JSON.stringify(results, null, 2))
      }
    } else {
      if (showDetails && results.length > 0) {
        console.log(JSON.stringify(results, null, 2))
      } else {
        await base.outputTableFancy(displayResults)
      }
    }

    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get full-text indexes with filters
 * @param {string} schema - Schema name
 * @param {string} index - Index name pattern
 * @param {string} table - Table name (optional)
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of full-text index objects
 */
async function getFullTextIndexesInt(schema, index, table, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug(`getFullTextIndexesInt ${schema} ${index} ${table} ${limit}`)
  index = base.dbClass.objectName(index)

  let query =
    `SELECT DISTINCT
      I.SCHEMA_NAME,
      I.TABLE_NAME,
      I.INDEX_NAME,
      I.INDEX_TYPE,
      I.CONSTRAINT AS CONSTRAINT_NAME,
      COALESCE(F.COLUMN_NAME, IC.COLUMN_NAME) AS COLUMN_NAME,
      F.FUZZY_SEARCH_MODE,
      F.MEMORY_SIZE_IN_TOTAL,
      F.LOADED,
      TC.FUZZY_SEARCH_INDEX AS TABLE_COLUMN_FUZZY_INDEX,
      TC.FUZZY_SEARCH_MODE AS TABLE_COLUMN_FUZZY_MODE
    FROM SYS.INDEXES I
    LEFT JOIN SYS.M_FUZZY_SEARCH_INDEXES F
      ON I.SCHEMA_NAME = F.SCHEMA_NAME
     AND I.TABLE_NAME = F.TABLE_NAME
     AND I.INDEX_NAME = F.INDEX_NAME
    LEFT JOIN SYS.INDEX_COLUMNS IC
      ON I.SCHEMA_NAME = IC.SCHEMA_NAME
     AND I.TABLE_NAME = IC.TABLE_NAME
     AND I.INDEX_NAME = IC.INDEX_NAME
    LEFT JOIN SYS.TABLE_COLUMNS TC
      ON I.SCHEMA_NAME = TC.SCHEMA_NAME
     AND I.TABLE_NAME = TC.TABLE_NAME
     AND (TC.COLUMN_NAME = F.COLUMN_NAME OR TC.COLUMN_NAME = IC.COLUMN_NAME)
    WHERE I.SCHEMA_NAME LIKE ?
      AND I.INDEX_NAME LIKE ?
      AND I.INDEX_TYPE = 'FUZZY SEARCH' `

  const params = [schema, index]

  if (table && table !== "*") {
    table = base.dbClass.objectName(table)
    query += `AND I.TABLE_NAME LIKE ? `
    params.push(table)
  }

  query += `ORDER BY I.SCHEMA_NAME, I.TABLE_NAME, I.INDEX_NAME `
  
  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }

  return await client.statementExecPromisified(await client.preparePromisified(query), params)
}
