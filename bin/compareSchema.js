// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'compareSchema'
export const aliases = ['cmpschema', 'schemaCompare', 'compareschema']
export const describe = baseLite.bundle.getText("compareSchema")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  sourceSchema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("compareSchemaSourceSchema")
  },
  targetSchema: {
    alias: ['t'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("compareSchemaTargetSchema")
  },
  tables: {
    alias: ['tb'],
    type: 'string',
    desc: baseLite.bundle.getText("compareSchemaTableFilter")
  },
  compareIndexes: {
    alias: ['ci'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("compareSchemaCompareIndexes")
  },
  compareTriggers: {
    alias: ['ct'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("compareSchemaCompareTriggers")
  },
  compareConstraints: {
    alias: ['cc'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("compareSchemaCompareConstraints")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("compareSchemaOutput")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("compareSchemaTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).example(
  'hana-cli compareSchema --sourceSchema SCHEMA1 --targetSchema SCHEMA2',
  baseLite.bundle.getText("compareSchemaExample")
)

export let inputPrompts = {
  sourceSchema: {
    description: baseLite.bundle.getText("compareSchemaSourceSchema"),
    type: 'string',
    required: true
  },
  targetSchema: {
    description: baseLite.bundle.getText("compareSchemaTargetSchema"),
    type: 'string',
    required: true
  },
  tables: {
    description: baseLite.bundle.getText("compareSchemaTableFilter"),
    type: 'string',
    required: false,
    ask: () => false
  },
  compareIndexes: {
    description: baseLite.bundle.getText("compareSchemaCompareIndexes"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  compareTriggers: {
    description: baseLite.bundle.getText("compareSchemaCompareTriggers"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  compareConstraints: {
    description: baseLite.bundle.getText("compareSchemaCompareConstraints"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("compareSchemaOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  timeout: {
    description: baseLite.bundle.getText("compareSchemaTimeout"),
    type: 'number',
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
  base.promptHandler(argv, compareSchemaMain, inputPrompts)
}

/**
 * Compare schema structures
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function compareSchemaMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('compareSchemaMain')

  try {
    base.setPrompts(prompts)

    // Set operation timeout
    const timeoutHandle = prompts.timeout > 0
      ? setTimeout(() => process.exit(1), prompts.timeout * 1000)
      : null

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get current schema if using **CURRENT_SCHEMA**
    let sourceSchema = prompts.sourceSchema
    let targetSchema = prompts.targetSchema

    if (sourceSchema === '**CURRENT_SCHEMA**') {
      const result = await dbClient.execSQL("SELECT CURRENT_SCHEMA FROM DUMMY")
      sourceSchema = result?.[0]?.CURRENT_SCHEMA || 'PUBLIC'
    }

    if (targetSchema === '**CURRENT_SCHEMA**') {
      const result = await dbClient.execSQL("SELECT CURRENT_SCHEMA FROM DUMMY")
      targetSchema = result?.[0]?.CURRENT_SCHEMA || sourceSchema
    }

    if (!sourceSchema || !targetSchema) {
      throw new Error(baseLite.bundle.getText("errSchemaRequired"))
    }

    console.log(baseLite.bundle.getText("info.startingSchemaComparison", [sourceSchema, targetSchema]))

    // Get schema information
    const sourceSchemaInfo = await getSchemaInfo(dbClient, sourceSchema, dbKind, prompts)
    const targetSchemaInfo = await getSchemaInfo(dbClient, targetSchema, dbKind, prompts)

    // Compare schemas
    const comparison = await compareSchemaStructures(sourceSchemaInfo, targetSchemaInfo, prompts)

    // Output results
    if (prompts.output) {
      await outputSchemaComparison(prompts.output, comparison)
    } else {
      displaySchemaComparison(comparison)
    }

    console.log(baseLite.bundle.getText("success.schemaComparisonComplete", [
      comparison.tableMatches,
      comparison.tableDifferences,
      comparison.sourceOnlyTables,
      comparison.targetOnlyTables
    ]))

    await dbClient.disconnect()
    if (timeoutHandle) clearTimeout(timeoutHandle)

  } catch (error) {
    console.error(baseLite.bundle.getText("error.compareSchema", [error.message]))
    base.debug(error)
    throw error
  }
}

/**
 * Get schema information
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} dbKind - Database kind
 * @param {object} options - Comparison options
 * @returns {Promise<object>}
 */
async function getSchemaInfo(dbClient, schema, dbKind, options) {
  const info = {
    schema,
    tables: {},
    indexes: {},
    triggers: {},
    constraints: {}
  }

  if (dbKind === 'hana') {
    // Get tables
    const tableQuery = `SELECT TABLE_NAME, TABLE_TYPE FROM SYS.TABLES WHERE SCHEMA_NAME = ?`
    const tables = await dbClient.execSQL(tableQuery, [schema.toUpperCase()])

    for (const table of tables) {
      const tableName = table.TABLE_NAME
      const colQuery = `SELECT COLUMN_NAME, DATA_TYPE_NAME, IS_NULLABLE, POSITION 
                        FROM SYS.TABLE_COLUMNS 
                        WHERE SCHEMA_NAME = ? AND TABLE_NAME = ? 
                        ORDER BY POSITION`
      const columns = await dbClient.execSQL(colQuery, [schema.toUpperCase(), tableName])

      info.tables[tableName] = {
        type: table.TABLE_TYPE,
        columns: columns.map(c => ({
          name: c.COLUMN_NAME,
          type: c.DATA_TYPE_NAME,
          nullable: c.IS_NULLABLE === 'TRUE' || c.IS_NULLABLE === 'YES'
        }))
      }
    }

    // Get indexes
    if (options.compareIndexes) {
      const indexQuery = `SELECT INDEX_NAME, TABLE_NAME, COLUMN_NAME 
                          FROM SYS.INDEX_COLUMNS 
                          WHERE SCHEMA_NAME = ? ORDER BY TABLE_NAME, INDEX_NAME, POSITION`
      const indexes = await dbClient.execSQL(indexQuery, [schema.toUpperCase()])
      for (const idx of indexes) {
        const key = `${idx.TABLE_NAME}.${idx.INDEX_NAME}`
        if (!info.indexes[key]) {
          info.indexes[key] = { table: idx.TABLE_NAME, columns: [] }
        }
        info.indexes[key].columns.push(idx.COLUMN_NAME)
      }
    }

    // Get triggers
    if (options.compareTriggers) {
      const triggerQuery = `SELECT TRIGGER_NAME, SUBJECT_TABLE_NAME as TABLE_NAME FROM SYS.TRIGGERS WHERE SCHEMA_NAME = ? ORDER BY SUBJECT_TABLE_NAME`
      const triggers = await dbClient.execSQL(triggerQuery, [schema.toUpperCase()])
      for (const trig of triggers) {
        info.triggers[trig.TRIGGER_NAME] = { table: trig.TABLE_NAME }
      }
    }

  } else if (dbKind === 'postgres') {
    // Get tables
    const tableQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`
    const tables = await dbClient.execSQL(tableQuery, [schema.toLowerCase()])

    for (const table of tables) {
      const tableName = table.table_name
      const colQuery = `SELECT column_name, data_type, is_nullable 
                        FROM information_schema.columns 
                        WHERE table_schema = ? AND table_name = ? 
                        ORDER BY ordinal_position`
      const columns = await dbClient.execSQL(colQuery, [schema.toLowerCase(), tableName])

      info.tables[tableName] = {
        type: 'TABLE',
        columns: columns.map(c => ({
          name: c.column_name,
          type: c.data_type,
          nullable: c.is_nullable === 'YES'
        }))
      }
    }

    // Get indexes
    if (options.compareIndexes) {
      const indexQuery = `SELECT indexname, tablename FROM pg_indexes WHERE schemaname = ? ORDER BY tablename`
      const indexes = await dbClient.execSQL(indexQuery, [schema.toLowerCase()])
      for (const idx of indexes) {
        const key = `${idx.tablename}.${idx.indexname}`
        info.indexes[key] = { table: idx.tablename }
      }
    }
  }

  return info
}

/**
 * Compare two schema structures
 * @param {object} sourceSchema - Source schema info
 * @param {object} targetSchema - Target schema info
 * @param {object} options - Comparison options
 * @returns {Promise<object>}
 */
async function compareSchemaStructures(sourceSchema, targetSchema, options) {
  const comparison = {
    tableMatches: 0,
    tableDifferences: [],
    sourceOnlyTables: [],
    targetOnlyTables: [],
    indexDifferences: [],
    triggerDifferences: []
  }

  // Compare tables
  const sourceTables = new Set(Object.keys(sourceSchema.tables))
  const targetTables = new Set(Object.keys(targetSchema.tables))

  for (const table of sourceTables) {
    if (targetTables.has(table)) {
      const diff = compareTableStructure(sourceSchema.tables[table], targetSchema.tables[table])
      if (diff.length > 0) {
        comparison.tableDifferences.push({
          table,
          differences: diff
        })
      } else {
        comparison.tableMatches++
      }
      targetTables.delete(table)
    } else {
      comparison.sourceOnlyTables.push(table)
    }
  }

  for (const table of targetTables) {
    comparison.targetOnlyTables.push(table)
  }

  // Compare indexes
  if (options.compareIndexes) {
    const sourceIndexes = new Set(Object.keys(sourceSchema.indexes))
    const targetIndexes = new Set(Object.keys(targetSchema.indexes))

    for (const idx of sourceIndexes) {
      if (!targetIndexes.has(idx)) {
        comparison.indexDifferences.push({ type: 'missing', name: idx })
      }
      targetIndexes.delete(idx)
    }
    for (const idx of targetIndexes) {
      comparison.indexDifferences.push({ type: 'extra', name: idx })
    }
  }

  // Compare triggers
  if (options.compareTriggers) {
    const sourceTriggers = new Set(Object.keys(sourceSchema.triggers))
    const targetTriggers = new Set(Object.keys(targetSchema.triggers))

    for (const trig of sourceTriggers) {
      if (!targetTriggers.has(trig)) {
        comparison.triggerDifferences.push({ type: 'missing', name: trig })
      }
      targetTriggers.delete(trig)
    }
    for (const trig of targetTriggers) {
      comparison.triggerDifferences.push({ type: 'extra', name: trig })
    }
  }

  return comparison
}

/**
 * Compare table structures
 * @param {object} sourceTable - Source table
 * @param {object} targetTable - Target table
 * @returns {Array<object>}
 */
function compareTableStructure(sourceTable, targetTable) {
  const differences = []

  if (sourceTable.type !== targetTable.type) {
    differences.push({
      type: 'tableType',
      source: sourceTable.type,
      target: targetTable.type
    })
  }

  const sourceColMap = new Map(sourceTable.columns.map(c => [c.name, c]))
  const targetColMap = new Map(targetTable.columns.map(c => [c.name, c]))

  for (const col of sourceTable.columns) {
    if (targetColMap.has(col.name)) {
      const targetCol = targetColMap.get(col.name)
      if (col.type !== targetCol.type || col.nullable !== targetCol.nullable) {
        differences.push({
          type: 'columnChange',
          column: col.name,
          sourceType: col.type,
          targetType: targetCol.type,
          sourceNullable: col.nullable,
          targetNullable: targetCol.nullable
        })
      }
      targetColMap.delete(col.name)
    } else {
      differences.push({
        type: 'missingColumn',
        column: col.name
      })
    }
  }

  for (const col of targetColMap.values()) {
    differences.push({
      type: 'extraColumn',
      column: col.name
    })
  }

  return differences
}

/**
 * Display schema comparison in console
 * @param {object} comparison - Comparison results
 * @returns {void}
 */
function displaySchemaComparison(comparison) {
  console.log('\n' + '='.repeat(80))
  console.log(baseLite.colors.bold.cyan('SCHEMA COMPARISON RESULTS'))
  console.log('='.repeat(80) + '\n')

  // Summary Section
  console.log(baseLite.colors.bold('📊 SUMMARY'))
  console.log(baseLite.colors.green(`  ✓ Table Matches: ${comparison.tableMatches}`))
  console.log(baseLite.colors.yellow(`  ⚠ Table Differences: ${comparison.tableDifferences.length}`))
  console.log(baseLite.colors.cyan(`  ← Source-Only Tables: ${comparison.sourceOnlyTables.length}`))
  console.log(baseLite.colors.magenta(`  → Target-Only Tables: ${comparison.targetOnlyTables.length}`))
  console.log(baseLite.colors.yellow(`  ⚠ Index Differences: ${comparison.indexDifferences.length}`))
  console.log(baseLite.colors.yellow(`  ⚠ Trigger Differences: ${comparison.triggerDifferences.length}`))

  // Table Differences Detail
  if (comparison.tableDifferences.length > 0) {
    console.log('\n' + '-'.repeat(80))
    console.log(baseLite.colors.bold.yellow('⚠ TABLE STRUCTURE DIFFERENCES'))
    console.log('-'.repeat(80))
    
    comparison.tableDifferences.forEach(diff => {
      console.log(`\n${baseLite.colors.bold.white('Table:')} ${baseLite.colors.cyan(diff.table)}`)
      diff.differences.forEach(d => {
        if (d.type === 'columnChange') {
          console.log(`  ${baseLite.colors.yellow('●')} Column ${baseLite.colors.white(d.column)} changed:`)
          console.log(`      Type: ${baseLite.colors.cyan(d.sourceType)} → ${baseLite.colors.cyan(d.targetType)}`)
          console.log(`      Nullable: ${baseLite.colors.cyan(d.sourceNullable)} → ${baseLite.colors.cyan(d.targetNullable)}`)
        } else if (d.type === 'missingColumn') {
          console.log(`  ${baseLite.colors.red('✗')} Column ${baseLite.colors.red(d.column)} ${baseLite.colors.red('missing in target')}`)
        } else if (d.type === 'extraColumn') {
          console.log(`  ${baseLite.colors.green('+')} Column ${baseLite.colors.green(d.column)} ${baseLite.colors.green('only in target')}`)
        } else if (d.type === 'tableType') {
          console.log(`  ${baseLite.colors.yellow('●')} Table type changed: ${baseLite.colors.cyan(d.source)} → ${baseLite.colors.cyan(d.target)}`)
        }
      })
    })
  }

  // Source-Only Tables
  if (comparison.sourceOnlyTables.length > 0) {
    console.log('\n' + '-'.repeat(80))
    console.log(baseLite.colors.bold.cyan('← TABLES ONLY IN SOURCE'))
    console.log('-'.repeat(80))
    
    const maxPerLine = 5
    for (let i = 0; i < comparison.sourceOnlyTables.length; i += maxPerLine) {
      const batch = comparison.sourceOnlyTables.slice(i, i + maxPerLine)
      console.log('  ' + batch.map(t => baseLite.colors.cyan(t)).join(', '))
    }
  }

  // Target-Only Tables
  if (comparison.targetOnlyTables.length > 0) {
    console.log('\n' + '-'.repeat(80))
    console.log(baseLite.colors.bold.magenta('→ TABLES ONLY IN TARGET'))
    console.log('-'.repeat(80))
    
    const maxPerLine = 5
    for (let i = 0; i < comparison.targetOnlyTables.length; i += maxPerLine) {
      const batch = comparison.targetOnlyTables.slice(i, i + maxPerLine)
      console.log('  ' + batch.map(t => baseLite.colors.magenta(t)).join(', '))
    }
  }

  // Index Differences
  if (comparison.indexDifferences.length > 0) {
    console.log('\n' + '-'.repeat(80))
    console.log(baseLite.colors.bold.yellow('⚠ INDEX DIFFERENCES'))
    console.log('-'.repeat(80))
    
    comparison.indexDifferences.forEach(diff => {
      if (diff.type === 'missing') {
        console.log(`  ${baseLite.colors.red('✗')} ${baseLite.colors.red(diff.name)} ${baseLite.colors.red('(missing in target)')}`)
      } else if (diff.type === 'extra') {
        console.log(`  ${baseLite.colors.green('+')} ${baseLite.colors.green(diff.name)} ${baseLite.colors.green('(only in target)')}`)
      }
    })
  }

  // Trigger Differences
  if (comparison.triggerDifferences.length > 0) {
    console.log('\n' + '-'.repeat(80))
    console.log(baseLite.colors.bold.yellow('⚠ TRIGGER DIFFERENCES'))
    console.log('-'.repeat(80))
    
    comparison.triggerDifferences.forEach(diff => {
      if (diff.type === 'missing') {
        console.log(`  ${baseLite.colors.red('✗')} ${baseLite.colors.red(diff.name)} ${baseLite.colors.red('(missing in target)')}`)
      } else if (diff.type === 'extra') {
        console.log(`  ${baseLite.colors.green('+')} ${baseLite.colors.green(diff.name)} ${baseLite.colors.green('(only in target)')}`)
      }
    })
  }

  console.log('\n' + '='.repeat(80) + '\n')
}

/**
 * Output schema comparison to file
 * @param {string} filePath - Output file path
 * @param {object} comparison - Comparison results
 * @returns {Promise<void>}
 */
async function outputSchemaComparison(filePath, comparison) {
  const fs = await import('fs')
  const report = {
    summary: {
      tableMatches: comparison.tableMatches,
      tableDifferences: comparison.tableDifferences.length,
      sourceOnlyTables: comparison.sourceOnlyTables.length,
      targetOnlyTables: comparison.targetOnlyTables.length,
      indexDifferences: comparison.indexDifferences.length,
      triggerDifferences: comparison.triggerDifferences.length
    },
    details: comparison
  }
  await fs.promises.writeFile(filePath, JSON.stringify(report, null, 2), 'utf8')
}
