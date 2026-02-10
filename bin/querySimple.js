// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'querySimple'
export const aliases = ['qs', "querysimple"]
export const describe = baseLite.bundle.getText("querySimple")

export const builder = baseLite.getBuilder({
  query: {
    alias: ['q', 'Query'],
    type: 'string',
    desc: baseLite.bundle.getText("query")
  },
  folder: {
    alias: ['f', 'Folder'],
    type: 'string',
    default: './',
    desc: baseLite.bundle.getText("folder")
  },
  filename: {
    alias: ['n', 'Filename'],
    type: 'string',
    desc: baseLite.bundle.getText("filename")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["table", "json", "excel", "csv"],
    default: "table",
    type: 'string',
    desc: baseLite.bundle.getText("outputTypeQuery")
  },
  profile: {
    alias: ['p', 'Profile'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})

export let inputPrompts = {
  query: {
    description: baseLite.bundle.getText("query"),
    type: 'string',
    required: true
  },
  folder: {
    description: baseLite.bundle.getText("folder"),
    type: 'string',
    required: true
  },
  filename: {
    description: baseLite.bundle.getText("filename"),
    type: 'string',
    required: true,
    ask: () => {
      return false
    }
  },
  output: {
    description: baseLite.bundle.getText("outputTypeQuery"),
    type: 'string',
    required: true
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
 * @returns {void}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dbQuery, inputPrompts)
}

/**
 * Remove newline characters from data row values
 * @param {object} dataRow - Data row object
 * @returns {object} - Cleaned data row
 */
export function removeNewlineCharacter(dataRow) {

  let newDataRow = {}
  Object.keys(dataRow).forEach((key) => {
    if (typeof dataRow[key] === "string") {
      newDataRow[key] = dataRow[key].replace(/[\n\r]+/g, ' ')
    } else {
      newDataRow[key] = dataRow[key];
    }
  })
  return newDataRow
}

/**
 * Execute a simple database query and output results in various formats
 * @param {object} prompts - Input prompts with query, output format, and file options
 * @returns {Promise<any>}
 */
export async function dbQuery(prompts) {
  const base = await import('../utils/base.js')
  base.debug('dbQuery')
  const [{ highlight }, { AsyncParser }] = await Promise.all([
    import('cli-highlight'),
    import('@json2csv/node')
  ])

  const opts = { delimiter: ";", transforms: [removeNewlineCharacter] }
  const transformOpts = {}
  const asyncOpts = {}
  // @ts-ignore
  const parser = new AsyncParser(opts, transformOpts, asyncOpts)
  try {
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()
    let results = await dbClient.execSQL(prompts.query)

    if (!results[0]) {
      return base.error(baseLite.bundle.getText("errNoResults"))
    }

    switch (prompts.output) {
      case 'excel':
        if (prompts.filename) {
          let out = []
          //Column Headers
          let header = []
          for (const [key] of Object.entries(results[0])) {
            header.push(key)
          }
          out.push(header)

          for (let item of results) {
            let innerItem = []
            for (const [key] of Object.entries(item)) {
              innerItem.push(item[key])
            }
            out.push(innerItem)
          }
          // @ts-ignore
/*           let excelOutput = excel.build([{
            name: "Query Results",
            data: out
          }]) */
          throw new Error(`Excel Export temporarily disabled due to issue with install of required module in Business Application Studio`)
          //await toFile(prompts.folder, prompts.filename, 'xlsx', excelOutput)
        } else {
          base.error(baseLite.bundle.getText("errExcel"))
          await dbClient.disconnect()
          return
        }
        break
      case 'json':
        if (prompts.filename) {
          await toFile(prompts.folder, prompts.filename, 'json', JSON.stringify(results, null, 2))
        } else {
          console.log(highlight(JSON.stringify(results, null, 2)))
          await dbClient.disconnect()
          return JSON.stringify(results, null, 2)
        }
        break
      case 'csv':
        if (prompts.filename) {
          const csv = await parser.parse(results).promise()
          await toFile(prompts.folder, prompts.filename, 'csv', csv)
        } else {
          const csv = await parser.parse(results).promise()
          console.log(highlight(csv))
          await dbClient.disconnect()
          return csv
        }
        break
      default:
        if (prompts.filename) {
          // Format results as a simple text table for file output
          const textTable = formatAsTextTable(results)
          await toFile(prompts.folder, prompts.filename, 'txt', textTable)
        } else {
          base.outputTableFancy(results)
        }
        break
    }
    await dbClient.disconnect()
    return results
  } catch (error) {
    await base.error(error)
  }
}

async function toFile(folder, file, ext, content) {
  const base = await import('../utils/base.js')
  base.debug('toFile')
  const [{ default: fs }, { default: path }] = await Promise.all([
    import('fs'),
    import('path')
  ])
  let dir = folder
  !fs.existsSync(dir) && fs.mkdirSync(dir)
  file = `${file}.${ext}`
  let fileLocal = path.join(dir, file)
  fs.writeFileSync(fileLocal, content)
  console.log(`${baseLite.bundle.getText("contentWritten")}: ${fileLocal}`)
}

/**
 * Format a value based on its type for text output
 * @param {*} val - Value to format
 * @returns {string} Formatted value
 */
function formatValue(val) {
  if (val === null || val === undefined) {
    return ''
  }
  // Handle Date objects and ISO date strings
  if (val instanceof Date) {
    return val.toISOString()
  }
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
    // ISO date string - format it nicely
    return new Date(val).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')
  }
  // Format numbers with locale-appropriate separators
  if (typeof val === 'number') {
    // Check if it's an integer or has decimals
    return Number.isInteger(val) ? val.toLocaleString() : val.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }
  // Handle boolean values
  if (typeof val === 'boolean') {
    return val ? 'true' : 'false'
  }
  // Handle objects and arrays by converting to JSON
  if (typeof val === 'object') {
    return JSON.stringify(val)
  }
  return String(val)
}

/**
 * Format JSON results as a simple text table with type-aware formatting
 * @param {Array<Object>} results - Array of objects to format
 * @returns {string} Formatted table string
 */
function formatAsTextTable(results) {
  if (!results || results.length === 0) {
    return baseLite.bundle.getText('noData')
  }

  // Get all unique column names
  const columns = [...new Set(results.flatMap(row => Object.keys(row)))]
  
  // Calculate column widths with max width limit
  const MAX_COL_WIDTH = 50
  const widths = {}
  columns.forEach(col => {
    const maxContentWidth = Math.max(
      col.length,
      ...results.map(row => formatValue(row[col]).length)
    )
    // Limit column width to prevent overly wide tables
    widths[col] = Math.min(maxContentWidth, MAX_COL_WIDTH)
  })

  // Build header
  const header = columns.map(col => col.padEnd(widths[col])).join(' | ')
  const separator = columns.map(col => '-'.repeat(widths[col])).join('-+-')
  
  // Build rows with type-aware formatting
  const rows = results.map(row => 
    columns.map(col => {
      const formatted = formatValue(row[col])
      // Truncate if exceeds max width
      const truncated = formatted.length > MAX_COL_WIDTH 
        ? formatted.substring(0, MAX_COL_WIDTH - 3) + '...'
        : formatted
      return truncated.padEnd(widths[col])
    }).join(' | ')
  )

  // Add summary for large datasets
  const summary = results.length > 1000 
    ? `\n\n[Total rows: ${results.length.toLocaleString()}]`
    : ''

  return [header, separator, ...rows].join('\n') + summary
}