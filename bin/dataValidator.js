// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'dataValidator'
export const aliases = ['dval', 'validateData', 'dataValidation']
export const describe = baseLite.bundle.getText("dataValidator")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("dataValidatorTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("dataValidatorSchema")
  },
  rules: {
    alias: ['r'],
    type: 'string',
    desc: baseLite.bundle.getText("dataValidatorRules")
  },
  rulesFile: {
    alias: ['rf'],
    type: 'string',
    desc: baseLite.bundle.getText("dataValidatorRulesFile")
  },
  columns: {
    alias: ['c'],
    type: 'string',
    desc: baseLite.bundle.getText("dataValidatorColumns")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("dataValidatorOutput")
  },
  format: {
    alias: ['f'],
    choices: ["json", "csv", "summary", "detailed"],
    default: "json",
    type: 'string',
    desc: baseLite.bundle.getText("dataValidatorFormat")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 10000,
    desc: baseLite.bundle.getText("dataValidatorLimit")
  },
  stopOnFirstError: {
    alias: ['sfe'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("dataValidatorStopOnFirstError")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("dataValidatorTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).example('hana-cli dataValidator --table myTable --rules validation.json', baseLite.bundle.getText("dataValidatorExample"))

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("dataValidatorTable"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("dataValidatorSchema"),
    type: 'string',
    required: false
  },
  rules: {
    description: baseLite.bundle.getText("dataValidatorRules"),
    type: 'string',
    required: true,
    ask: () => true
  },
  columns: {
    description: baseLite.bundle.getText("dataValidatorColumns"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("dataValidatorOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  format: {
    description: baseLite.bundle.getText("dataValidatorFormat"),
    type: 'string',
    required: false,
    ask: () => false
  },
  limit: {
    description: baseLite.bundle.getText("dataValidatorLimit"),
    type: 'number',
    required: false,
    default: 10000,
    ask: () => false
  },
  timeout: {
    description: baseLite.bundle.getText("dataValidatorTimeout"),
    type: 'number',
    required: false,
    default: 3600,
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
  await base.promptHandler(argv, dataValidatorMain, inputPrompts, true, false)
}

/**
 * Validate data against business rules
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function dataValidatorMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('dataValidatorMain')

  let dbClient = null
  let timeoutHandle = null

  try {
    base.setPrompts(prompts)

    // Set operation timeout
    timeoutHandle = prompts.timeout > 0
      ? setTimeout(() => process.exit(1), prompts.timeout * 1000)
      : null

    // Connect to database
    dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get schema if not provided
    let schema = prompts.schema
    // Handle the **CURRENT_SCHEMA** placeholder
    if (!schema || schema === '**CURRENT_SCHEMA**') {
      if (dbKind !== 'sqlite') {
        schema = await getCurrentSchema(dbClient, dbKind)
      }
    }

    const table = prompts.table
    
    console.log(`Starting data validation for table: ${table}`)

    // Parse validation rules
    const rules = parseValidationRules(prompts.rules, prompts.rulesFile)

    if (rules.length === 0) {
      throw new Error(baseLite.bundle.getText("error.noValidationRules"))
    }

    // Get table columns
    const tableColumns = await getTableColumns(dbClient, schema, table, dbKind)

    // Get data to validate
    let query = `SELECT * FROM ${formatQualifiedName(schema, table)}`
    if (prompts.limit > 0) {
      query += ` LIMIT ${prompts.limit}`
    }

    const rows = await dbClient.execSQL(query)

    // Validate data
    const validationResults = validateData(rows, rules, tableColumns, prompts.stopOnFirstError)

    // Output results
    if (prompts.output) {
      await outputValidationResults(prompts.output, validationResults, prompts.format)
    } else {
      displayValidationResults(validationResults, prompts.format)
    }

    console.log(`Data validation complete. Total rows: ${validationResults.totalRows}, Valid: ${validationResults.validRows}, Invalid: ${validationResults.invalidRows}, Errors: ${validationResults.totalErrors}`)

    await dbClient.disconnect()
    if (timeoutHandle) clearTimeout(timeoutHandle)

  } catch (error) {
    const errorMsg = `Data validation error: ${error.message}`
    console.error(errorMsg)
    base.debug(error)
    if (timeoutHandle) clearTimeout(timeoutHandle)
    if (dbClient) {
      try {
        await dbClient.disconnect()
      } catch (e) {
        // Ignore disconnect errors
      }
    }
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
    const result = await dbClient.execSQL('SELECT CURRENT_SCHEMA FROM DUMMY')
    return result[0]?.CURRENT_SCHEMA || 'PUBLIC'
  } else if (dbKind === 'postgres') {
    const result = await dbClient.execSQL('SELECT current_schema()')
    return result[0]?.current_schema || 'public'
  }
  return 'public'
}

/**
 * Get table columns
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array<string>>}
 */
async function getTableColumns(dbClient, schema, table, dbKind) {
  let query

  if (dbKind === 'hana') {
    query = `SELECT COLUMN_NAME FROM SYS.TABLE_COLUMNS 
             WHERE SCHEMA_NAME = ? AND TABLE_NAME = ? 
             ORDER BY POSITION`
    const result = await dbClient.execSQL(query, [schema || 'PUBLIC', table.toUpperCase()])
    return result.map(r => r.COLUMN_NAME)
  } else if (dbKind === 'postgres') {
    query = `SELECT column_name FROM information_schema.columns 
             WHERE table_schema = ? AND table_name = ? 
             ORDER BY ordinal_position`
    const result = await dbClient.execSQL(query, [schema || 'public', table.toLowerCase()])
    return result.map(r => r.column_name)
  }

  return []
}

/**
 * Parse validation rules from string or file
 * @param {string} rulesStr - Rules string
 * @param {string} rulesFile - Rules file path
 * @returns {Array<object>}
 */
function parseValidationRules(rulesStr, rulesFile) {
  let ruleContent = rulesStr || ''

  if (rulesFile) {
    try {
      const fs = require('fs')
      ruleContent = fs.readFileSync(rulesFile, 'utf-8')
    } catch (err) {
      console.warn(`Could not read rules file: ${err.message}`)
    }
  }

  if (!ruleContent) {
    return []
  }

  // Parse rules in format: column:rule1,rule2;column2:rule3
  // Rules: required, numeric, email, date, length:min:max, pattern:regex, range:min:max
  const rules = []
  const parts = ruleContent.split(';')

  for (const part of parts) {
    const [column, ruleStr] = part.split(':')
    if (!column || !ruleStr) continue

    const ruleParts = ruleStr.split(',')
    for (const rule of ruleParts) {
      const trimmedRule = rule.trim()
      rules.push({
        column: column.trim(),
        rule: trimmedRule
      })
    }
  }

  return rules
}

/**
 * Validate data against rules
 * @param {Array<object>} rows - Data rows
 * @param {Array<object>} rules - Validation rules
 * @param {Array<string>} columns - Table columns
 * @param {boolean} stopOnFirstError - Stop on first error
 * @returns {object}
 */
function validateData(rows, rules, columns, stopOnFirstError) {
  const results = {
    totalRows: rows.length,
    validRows: 0,
    invalidRows: 0,
    totalErrors: 0,
    errors: []
  }

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx]
    let rowValid = true

    for (const ruleObj of rules) {
      const value = row[ruleObj.column]
      const error = validateValue(value, ruleObj.rule, ruleObj.column)

      if (error) {
        rowValid = false
        results.totalErrors++
        results.errors.push({
          rowNumber: rowIdx + 1,
          column: ruleObj.column,
          value: value,
          rule: ruleObj.rule,
          error: error
        })

        if (stopOnFirstError) {
          break
        }
      }
    }

    if (rowValid) {
      results.validRows++
    } else {
      results.invalidRows++
    }

    if (stopOnFirstError && results.totalErrors > 0) {
      break
    }
  }

  return results
}

/**
 * Validate a single value against a rule
 * @param {*} value - Value to validate
 * @param {string} rule - Validation rule
 * @param {string} column - Column name
 * @returns {string|null}
 */
function validateValue(value, rule, column) {
  const ruleName = rule.split(':')[0]

  switch (ruleName) {
    case 'required':
      if (value === null || value === undefined || value === '') {
        return `Column ${column} is required`
      }
      break

    case 'numeric':
      if (value !== null && isNaN(Number(value))) {
        return `Column ${column} must be numeric, got: ${value}`
      }
      break

    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        return `Column ${column} must be valid email`
      }
      break

    case 'date':
      if (value && isNaN(Date.parse(String(value)))) {
        return `Column ${column} must be valid date`
      }
      break

    case 'length':
      {
        const parts = rule.split(':')
        if (parts.length >= 3) {
          const minLen = parseInt(parts[1])
          const maxLen = parseInt(parts[2])
          const len = String(value).length
          if (len < minLen || len > maxLen) {
            return `Column ${column} length must be between ${minLen} and ${maxLen}`
          }
        }
      }
      break

    case 'pattern':
      {
        const parts = rule.split(':')
        if (parts.length >= 2) {
          const pattern = parts[1]
          if (value && !new RegExp(pattern).test(String(value))) {
            return `Column ${column} does not match pattern: ${pattern}`
          }
        }
      }
      break

    case 'range':
      {
        const parts = rule.split(':')
        if (parts.length >= 3) {
          const min = Number(parts[1])
          const max = Number(parts[2])
          const val = Number(value)
          if (val < min || val > max) {
            return `Column ${column} must be between ${min} and ${max}`
          }
        }
      }
      break
  }

  return null
}

/**
 * Format qualified table name
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @returns {string}
 */
function formatQualifiedName(schema, table) {
  if (schema) {
    return `"${schema}"."${table}"`
  }
  return `"${table}"`
}

/**
 * Output validation results to file
 * @param {string} filePath - Output file path
 * @param {object} results - Validation results
 * @param {string} format - Output format
 * @returns {Promise<void>}
 */
async function outputValidationResults(filePath, results, format) {
  const fsModule = await import('fs')
  const fs = fsModule.promises

  let content

  if (format === 'json') {
    content = JSON.stringify(results, null, 2)
  } else if (format === 'csv') {
    content = 'Row,Column,Value,Rule,Error\n'
    for (const error of results.errors) {
      content += `${error.rowNumber},"${error.column}","${String(error.value).replace(/"/g, '""')}","${error.rule}","${error.error}"\n`
    }
  } else {
    content = formatSummaryReport(results)
  }

  await fs.writeFile(filePath, content)
}

/**
 * Format summary report for display
 * @param {object} results - Validation results
 * @returns {string}
 */
function formatSummaryReport(results) {
  let report = 'Data Validation Report\n'
  report += '=======================\n\n'
  report += `Total Rows:  ${results.totalRows}\n`
  report += `Valid Rows:  ${results.validRows}\n`
  report += `Invalid Rows: ${results.invalidRows}\n`
  report += `Total Errors: ${results.totalErrors}\n\n`

  if (results.errors.length > 0) {
    report += 'Errors:\n'
    for (const error of results.errors.slice(0, 100)) {
      report += `  Row ${error.rowNumber}, Column ${error.column}: ${error.error}\n`
    }
    if (results.errors.length > 100) {
      report += `  ... and ${results.errors.length - 100} more errors\n`
    }
  }

  return report
}

/**
 * Display validation results in console
 * @param {object} results - Validation results
 * @param {string} format - Display format
 * @returns {void}
 */
function displayValidationResults(results, format) {
  if (format === 'detailed' || format === 'json') {
    console.log(JSON.stringify(results, null, 2))
  } else if (format === 'csv') {
    console.log('Row,Column,Value,Rule,Error')
    for (const error of results.errors) {
      console.log(`${error.rowNumber},"${error.column}","${String(error.value).replace(/"/g, '""')}","${error.rule}","${error.error}"`)
    }
  } else {
    console.log(formatSummaryReport(results))
  }
}
