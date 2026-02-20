// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'dataMask'
export const aliases = ['mask', 'dataprivacy', 'anonymize', 'pii']
export const describe = baseLite.bundle.getText("dataMask")

const dataMaskOptions = {
  schema: {
    alias: ['s'],
    type: 'string',
    desc: baseLite.bundle.getText("dataMaskSchema")
  },
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("dataMaskTable")
  },
  rules: {
    alias: ['r'],
    type: 'string',
    desc: baseLite.bundle.getText("dataMaskRules")
  },
  rulesFile: {
    alias: ['rf'],
    type: 'string',
    desc: baseLite.bundle.getText("dataMaskRulesFile")
  },
  columns: {
    alias: ['c'],
    type: 'string',
    desc: baseLite.bundle.getText("dataMaskColumns")
  },
  maskType: {
    alias: ['mt'],
    type: 'string',
    choices: ["redact", "hash", "shuffle", "replace", "truncate", "pattern", "random"],
    default: "redact",
    desc: baseLite.bundle.getText("dataMaskMaskType")
  },
  dryRun: {
    alias: ['dr'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("dataMaskDryRun")
  },
  whereClause: {
    alias: ['w'],
    type: 'string',
    desc: baseLite.bundle.getText("dataMaskWhereClause")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("dataMaskOutput")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
}

export const builder = (yargs) => yargs.options(baseLite.getBuilder(dataMaskOptions)).wrap(160).example('hana-cli dataMask --table CUSTOMERS --maskType hash --columns EMAIL', baseLite.bundle.getText('dataMaskExample')).wrap(160).epilog(buildDocEpilogue('dataMask', 'data-tools', ['dataValidator', 'import']))

export const dataMaskBuilderOptions = baseLite.getBuilder(dataMaskOptions)

export const inputPrompts = {
  schema: {
    description: baseLite.bundle.getText("dataMaskSchema"),
    type: 'string',
    required: false,
    ask: () => false
  },
  table: {
    description: baseLite.bundle.getText("dataMaskTable"),
    type: 'string',
    required: true
  },
  columns: {
    description: baseLite.bundle.getText("dataMaskColumns"),
    type: 'string',
    required: false,
    ask: () => false
  },
  maskType: {
    description: baseLite.bundle.getText("dataMaskMaskType"),
    type: 'string',
    required: false,
    ask: () => false
  },
  dryRun: {
    description: baseLite.bundle.getText("dataMaskDryRun"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  whereClause: {
    description: baseLite.bundle.getText("dataMaskWhereClause"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("dataMaskOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  profile: {
    description: baseLite.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => { }
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dataMaskMain, inputPrompts, true, true, dataMaskBuilderOptions)
}

/**
 * Apply masking rules for sensitive data
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function dataMaskMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('dataMaskMain')

  try {
    base.setPrompts(prompts)

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get schema if not provided
    let schema = prompts.schema
    if (!schema && dbKind !== 'sqlite') {
      schema = await getCurrentSchema(dbClient, dbKind)
    }

    const table = prompts.table
    if (!table) {
      throw new Error(baseLite.bundle.getText("errTableNotFound", [table]))
    }



    // Get table structure
    const tableColumns = await getTableStructure(dbClient, schema, table, dbKind)

    // Parse mask rules
    let maskRules = {}
    if (prompts.rulesFile) {
      maskRules = await loadRulesFromFile(prompts.rulesFile)
    } else if (prompts.rules) {
      maskRules = parseMaskRules(prompts.rules)
    }

    // If specific columns provided, apply same mask type to all
    if (prompts.columns) {
      const cols = prompts.columns.split(',').map(c => c.trim())
      for (const col of cols) {
        maskRules[col] = { type: prompts.maskType }
      }
    }

    // Get data to mask
    const data = await getDataToMask(dbClient, schema, table, prompts.whereClause, dbKind)

    // Apply masking rules
    const maskedData = applyMaskingRules(data, tableColumns, maskRules)

    // Generate SQL UPDATE statements
    const sqlStatements = generateUpdateStatements(schema, table, data, maskedData)

    // Output results
    if (prompts.output) {
      const fs = await import('fs')
      await fs.promises.writeFile(prompts.output, sqlStatements.join('\n'), 'utf-8')
    } else {
      console.log(sqlStatements.join('\n'))
    }

    if (!prompts.dryRun) {
      // Execute masking
      for (const sql of sqlStatements) {
        await dbClient.execSQL(sql)
      }
    }

    await dbClient.disconnect()

  } catch (error) {
    console.error(baseLite.bundle.getText("error.dataMask", [error.message]))
    process.exit(1)
  }
}

/**
 * Get current schema
 * @param {object} dbClient - Database client
 * @param {string} dbKind - Database kind
 * @returns {Promise<string>}
 */
async function getCurrentSchema(dbClient, dbKind) {
  if (dbKind === 'hana') {
    const result = await dbClient.query('SELECT CURRENT_SCHEMA FROM DUMMY')[0]
    return result?.CURRENT_SCHEMA || 'PUBLIC'
  }
  return 'public'
}

/**
 * Get table structure
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getTableStructure(dbClient, schema, table, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT COLUMN_NAME, DATA_TYPE_NAME, IS_NULLABLE FROM TABLE_COLUMNS WHERE SCHEMA_NAME = '${schema}' AND TABLE_NAME = '${table}'`
    : `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}'`
  
  return await dbClient.query(query)
}

/**
 * Get data to mask
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {string} whereClause - WHERE clause filter
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getDataToMask(dbClient, schema, table, whereClause, dbKind) {
  let query = `SELECT * FROM ${schema}.${table}`
  if (whereClause) {
    query += ` WHERE ${whereClause}`
  }
  
  return await dbClient.query(query)
}

/**
 * Parse mask rules from string format
 * @param {string} rulesStr - Rules string (column1:hash,column2:redact)
 * @returns {object}
 */
function parseMaskRules(rulesStr) {
  const rules = {}
  const parts = rulesStr.split(',')
  
  for (const part of parts) {
    const [col, type] = part.split(':').map(s => s.trim())
    if (col && type) {
      rules[col] = { type }
    }
  }
  
  return rules
}

/**
 * Load mask rules from file
 * @param {string} filePath - Path to rules file
 * @returns {Promise<object>}
 */
async function loadRulesFromFile(filePath) {
  const fs = await import('fs')
  const content = await fs.promises.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Apply masking rules to data
 * @param {Array} data - Original data
 * @param {Array} columns - Table columns
 * @param {object} rules - Masking rules
 * @returns {Array}
 */
function applyMaskingRules(data, columns, rules) {
  return data.map(row => {
    const maskedRow = { ...row }
    
    for (const [colName, rule] of Object.entries(rules)) {
      if (maskedRow.hasOwnProperty(colName)) {
        maskedRow[colName] = applyMask(maskedRow[colName], rule.type, rule.pattern)
      }
    }
    
    return maskedRow
  })
}

/**
 * Apply mask to a single value
 * @param {any} value - Value to mask
 * @param {string} maskType - Type of masking
 * @param {string} pattern - Pattern for replacement
 * @returns {any}
 */
function applyMask(value, maskType, pattern) {
  if (value === null || value === undefined) {
    return value
  }

  const strValue = String(value)

  switch (maskType) {
    case 'redact':
      return '***REDACTED***'
    
    case 'hash':
      return `HASH_${Math.abs(hashCode(strValue))}`
    
    case 'shuffle':
      return shuffleString(strValue)
    
    case 'replace':
      return pattern || 'XXXXX'
    
    case 'truncate':
      return strValue.substring(0, 2) + '*'.repeat(Math.max(0, strValue.length - 2))
    
    case 'pattern':
      if (pattern) {
        return applyPattern(strValue, pattern)
      }
      return strValue
    
    case 'random':
      return generateRandomValue(strValue.length)
    
    default:
      return value
  }
}

/**
 * Hash code for string
 * @param {string} str - String to hash
 * @returns {number}
 */
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

/**
 * Shuffle characters in string
 * @param {string} str - String to shuffle
 * @returns {string}
 */
function shuffleString(str) {
  const arr = str.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

/**
 * Apply pattern masking
 * @param {string} str - String to mask
 * @param {string} pattern - Pattern expression
 * @returns {string}
 */
function applyPattern(str, pattern) {
  // Simple pattern: XXX-XXX-XXX -> replace with X, keep -
  let result = ''
  let idx = 0
  
  for (const char of pattern) {
    if (char === 'X') {
      result += str[idx] ? 'X' : ''
      idx++
    } else {
      result += char
    }
  }
  
  return result
}

/**
 * Generate random value of specified length
 * @param {number} length - Length of random value
 * @returns {string}
 */
function generateRandomValue(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generate UPDATE SQL statements
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {Array} originalData - Original data
 * @param {Array} maskedData - Masked data
 * @returns {Array}
 */
function generateUpdateStatements(schema, table, originalData, maskedData) {
  const statements = []
  
  for (let i = 0; i < originalData.length; i++) {
    const original = originalData[i]
    const masked = maskedData[i]
    
    const setClauses = []
    const whereClauses = []
    
    for (const [col, value] of Object.entries(masked)) {
      if (original[col] !== value) {
        const sqlValue = value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`
        setClauses.push(`${col} = ${sqlValue}`)
      }
      
      // Use first column as WHERE condition
      if (whereClauses.length === 0) {
        const origValue = original[col] === null ? 'NULL' : `'${String(original[col]).replace(/'/g, "''")}'`
        whereClauses.push(`${col} = ${origValue}`)
      }
    }
    
    if (setClauses.length > 0) {
      const stmt = `UPDATE ${schema}.${table} SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')};`
      statements.push(stmt)
    }
  }
  
  return statements
}

export default { command, aliases, describe, builder, handler }
