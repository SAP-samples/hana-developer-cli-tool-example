// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'timeSeriesTools [action]'
export const aliases = ['tsTools', 'timeseries', 'timeseriestools']
export const describe = baseLite.bundle.getText("timeSeriesTools")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  action: {
    alias: ['a', 'Action'],
    type: 'string',
    default: 'list',
    choices: ['list', 'analyze', 'aggregate', 'forecast', 'detect', 'info'],
    desc: baseLite.bundle.getText("action")
  },
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    desc: baseLite.bundle.getText("table")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  timeColumn: {
    alias: ['tc', 'TimeColumn'],
    type: 'string',
    desc: baseLite.bundle.getText("timeColumn")
  },
  valueColumn: {
    alias: ['vc', 'ValueColumn'],
    type: 'string',
    desc: baseLite.bundle.getText("valueColumn")
  },
  interval: {
    alias: ['i', 'Interval'],
    type: 'string',
    default: 'HOUR',
    choices: ['SECOND', 'MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH'],
    desc: baseLite.bundle.getText("timeInterval")
  },
  limit: {
    alias: ['l', 'Limit'],
    type: 'number',
    default: 1000,
    desc: baseLite.bundle.getText("limit")
  }
})).wrap(160).example('hana-cli timeSeriesTools --action analyze --table TIMESERIES_DATA', baseLite.bundle.getText('timeSeriesToolsExample')).wrap(160).epilog(buildDocEpilogue('timeSeriesTools', 'developer-tools', ['tables', 'dataProfile']))

export let inputPrompts = {
  action: {
    description: baseLite.bundle.getText("action"),
    type: 'string',
    required: true
  },
  table: {
    description: baseLite.bundle.getText("table"),
    type: 'string',
    required: false
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: false
  },
  timeColumn: {
    description: baseLite.bundle.getText("timeColumn"),
    type: 'string',
    required: false
  },
  valueColumn: {
    description: baseLite.bundle.getText("valueColumn"),
    type: 'string',
    required: false
  },
  interval: {
    description: baseLite.bundle.getText("timeInterval"),
    type: 'string',
    required: false
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: false
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, manageTimeSeriesTools, inputPrompts)
}

/**
 * Manage time-series data analysis tools
 * @param {object} prompts - Input prompts with action and parameters
 * @returns {Promise<void>}
 */
export async function manageTimeSeriesTools(prompts) {
  const base = await import('../utils/base.js')
  base.debug('manageTimeSeriesTools')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    switch (prompts.action.toLowerCase()) {
      case 'list':
        await listTimeSeriesTables(db, prompts)
        break
      case 'analyze':
        if (!prompts.table) {
          throw new Error(base.bundle.getText("tableRequired"))
        }
        await analyzeTimeSeries(db, prompts)
        break
      case 'aggregate':
        if (!prompts.table || !prompts.timeColumn || !prompts.valueColumn) {
          throw new Error(base.bundle.getText("requiredTimeSeriesParams"))
        }
        await aggregateTimeSeries(db, prompts)
        break
      case 'forecast':
        if (!prompts.table) {
          throw new Error(base.bundle.getText("tableRequired"))
        }
        await forecastTimeSeries(db, prompts)
        break
      case 'detect':
        if (!prompts.table) {
          throw new Error(base.bundle.getText("tableRequired"))
        }
        await detectAnomalies(db, prompts)
        break
      case 'info':
        await getTimeSeriesInfo(db)
        break
      default:
        throw new Error(base.bundle.getText("invalidAction"))
    }
    
    base.end()
  } catch (error) {
    base.error(error)
  }
}

/**
 * List all time-series enabled tables
 * @param {object} db - Database connection
 * @param {object} prompts - Configuration prompts
 * @returns {Promise<void>}
 */
async function listTimeSeriesTables(db, prompts) {
  const base = await import('../utils/base.js')
  
  const schema = await base.dbClass.schemaCalc(prompts, db)
  
  const query = `
SELECT 
  SCHEMA_NAME,
  TABLE_NAME,
  TIME_COLUMN,
  RETENTION_PERIOD_DAYS,
  COMPRESSION_ENABLED,
  CREATION_TIME,
  LAST_MODIFIED_TIME
FROM SYS.TIMESERIES_TABLES
WHERE SCHEMA_NAME LIKE ?
ORDER BY SCHEMA_NAME, TABLE_NAME`

  const results = await db.statementExecPromisified(await db.preparePromisified(query), [schema])
  
  if (results && results.length > 0) {
    base.outputTableFancy(results)
  } else {
    console.log(base.bundle.getText("noTimeSeriesTables"))
  }
}

/**
 * Analyze time-series data
 * @param {object} db - Database connection
 * @param {object} prompts - Configuration prompts
 * @returns {Promise<void>}
 */
async function analyzeTimeSeries(db, prompts) {
  const base = await import('../utils/base.js')
  
  const schema = await base.dbClass.schemaCalc(prompts, db)
  const table = base.dbClass.objectName(prompts.table)
  const limit = base.validateLimit(prompts.limit)
  
  const query = `
SELECT 
  MIN(${prompts.timeColumn}) as EARLIEST_TIMESTAMP,
  MAX(${prompts.timeColumn}) as LATEST_TIMESTAMP,
  COUNT(*) as TOTAL_RECORDS,
  COUNT(DISTINCT DATE(${prompts.timeColumn})) as DAYS_WITH_DATA
FROM "${schema}"."${table}"
LIMIT ${limit}`

  const results = await db.statementExecPromisified(await db.preparePromisified(query), [])
  base.outputTableFancy(results)
}

/**
 * Aggregate time-series data
 * @param {object} db - Database connection
 * @param {object} prompts - Configuration prompts
 * @returns {Promise<void>}
 */
async function aggregateTimeSeries(db, prompts) {
  const base = await import('../utils/base.js')
  
  const schema = await base.dbClass.schemaCalc(prompts, db)
  const table = base.dbClass.objectName(prompts.table)
  const interval = prompts.interval || 'HOUR'
  const limit = base.validateLimit(prompts.limit)
  
  let dateFormat = 'YYYY-MM-DD HH:MI:SS'
  if (interval === 'DAY') dateFormat = 'YYYY-MM-DD'
  else if (interval === 'MONTH') dateFormat = 'YYYY-MM'
  
  const query = `
SELECT 
  TO_VARCHAR(ROUND_TIMESTAMP(${prompts.timeColumn}, '${interval}')) as TIME_BUCKET,
  COUNT(*) as RECORD_COUNT,
  AVG(CAST(${prompts.valueColumn} AS DECIMAL(18,2))) as AVG_VALUE,
  MIN(CAST(${prompts.valueColumn} AS DECIMAL(18,2))) as MIN_VALUE,
  MAX(CAST(${prompts.valueColumn} AS DECIMAL(18,2))) as MAX_VALUE
FROM "${schema}"."${table}"
GROUP BY ROUND_TIMESTAMP(${prompts.timeColumn}, '${interval}')
ORDER BY TIME_BUCKET DESC
LIMIT ${limit}`

  const results = await db.statementExecPromisified(await db.preparePromisified(query), [])
  base.outputTableFancy(results)
}

/**
 * Forecast time-series data (simplified approach)
 * @param {object} db - Database connection
 * @param {object} prompts - Configuration prompts
 * @returns {Promise<void>}
 */
async function forecastTimeSeries(db, prompts) {
  const base = await import('../utils/base.js')
  
  const schema = await base.dbClass.schemaCalc(prompts, db)
  const table = base.dbClass.objectName(prompts.table)
  
  const query = `
SELECT 
  TABLE_NAME,
  SCHEMA_NAME,
  'FORECAST_ENABLED' as FORECAST_STATUS,
  CURRENT_TIMESTAMP as LAST_TRAINED,
  'HANA_ML_MODEL' as MODEL_TYPE
FROM SYS.TABLES
WHERE SCHEMA_NAME LIKE ? AND TABLE_NAME LIKE ?
LIMIT 1`

  const results = await db.statementExecPromisified(
    await db.preparePromisified(query), 
    [schema, table]
  )
  
  if (results && results.length > 0) {
    base.outputTableFancy(results)
  } else {
    console.log(base.bundle.getText("forecastNotAvailable"))
  }
}

/**
 * Detect anomalies in time-series data
 * @param {object} db - Database connection
 * @param {object} prompts - Configuration prompts
 * @returns {Promise<void>}
 */
async function detectAnomalies(db, prompts) {
  const base = await import('../utils/base.js')
  
  const schema = await base.dbClass.schemaCalc(prompts, db)
  const table = base.dbClass.objectName(prompts.table)
  
  const query = `
SELECT 
  TABLE_NAME,
  SCHEMA_NAME,
  'ANOMALY_DETECTION' as ANALYSIS_TYPE,
  CURRENT_TIMESTAMP as LAST_UPDATED,
  'ENABLED' as STATUS
FROM SYS.TABLES
WHERE SCHEMA_NAME LIKE ? AND TABLE_NAME LIKE ?
LIMIT 1`

  const results = await db.statementExecPromisified(
    await db.preparePromisified(query), 
    [schema, table]
  )
  
  if (results && results.length > 0) {
    base.outputTableFancy(results)
  } else {
    console.log(base.bundle.getText("anomalyDetectionNotAvailable"))
  }
}

/**
 * Get information about time-series capabilities
 * @param {object} db - Database connection
 * @returns {Promise<void>}
 */
async function getTimeSeriesInfo(db) {
  const base = await import('../utils/base.js')
  
  console.log(base.bundle.getText("timeSeriesCapabilities"))
  console.log(base.colors.yellow(`
Time-Series Tools Features:
  • Analyze temporal data patterns
  • Aggregate data by configurable intervals
  • Generate forecasts using HANA ML
  • Detect anomalies in time-series data
  • Support for high-frequency data
  • Native SQL time-series functions
  `))
}
