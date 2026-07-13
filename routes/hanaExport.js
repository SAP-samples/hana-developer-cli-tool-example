// @ts-check
import * as base from '../utils/base.js'
import { serializeCSV, serializeExcel, serializeJSON } from '../bin/export.js'

const CONTENT_TYPES = {
  csv: 'text/csv; charset=utf-8',
  json: 'application/json; charset=utf-8',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}
const EXT = { csv: 'csv', json: 'json', excel: 'xlsx' }

/**
 * Validate a single SQL identifier via the project's injection guard.
 * @param {string} value
 * @returns {boolean}
 */
function validIdentifier(value) {
  return typeof value === 'string' && value.length > 0 && base.sqlInjection.isAcceptableParameter(value)
}

/**
 * @param {string|null} schema
 * @param {string} table
 * @returns {string}
 */
function qualifiedName(schema, table) {
  return schema ? `"${schema}"."${table}"` : `"${table}"`
}

export function route (app) {
  base.debug('hanaExport Route')

  /**
   * @swagger
   * /hana/export:
   *   get:
   *     tags: [Export]
   *     summary: Export table/view data as a downloadable file
   *     responses:
   *       200:
   *         description: File attachment (csv, xlsx, or json)
   *       400:
   *         description: Invalid parameters or no data
   */
  app.get('/hana/export', async (req, res, next) => {
    try {
      const q = req.query
      const format = ['csv', 'excel', 'json'].includes(String(q.format)) ? String(q.format) : 'csv'
      const table = String(q.table || '')
      let schema = q.schema ? String(q.schema) : '**CURRENT_SCHEMA**'

      if (!validIdentifier(table)) {
        return res.status(400).json({ error: 'Invalid or missing table name' })
      }
      if (schema && schema !== '**CURRENT_SCHEMA**' && !validIdentifier(schema)) {
        return res.status(400).json({ error: 'Invalid schema name' })
      }

      // Columns: '*' or a validated comma list
      let columnList = '*'
      if (q.columns && String(q.columns).trim()) {
        const cols = String(q.columns).split(',').map(c => c.trim()).filter(Boolean)
        if (!cols.every(validIdentifier)) {
          return res.status(400).json({ error: 'Invalid column list' })
        }
        columnList = cols.map(c => `"${c}"`).join(', ')
      }

      // Limit: integer only
      let limit = 1000000
      if (q.limit !== undefined && q.limit !== '') {
        const n = Number(q.limit)
        if (!Number.isInteger(n) || n < 0) {
          return res.status(400).json({ error: 'Invalid limit' })
        }
        limit = n
      }

      // Establish a connection using the shared prompts/config mechanism
      base.setPrompts({ ...base.getPrompts(), schema, table, isGui: true })
      await base.clearConnection()
      const db = await base.createDBConnection()

      // Resolve current schema placeholder
      if (!schema || schema === '**CURRENT_SCHEMA**') {
        schema = await base.dbClass.schemaCalc(base.getPrompts(), db)
      }

      let query = `SELECT ${columnList} FROM ${qualifiedName(schema, table)}`
      if (limit > 0) query += ` LIMIT ${limit}`

      base.debug(`Export query: ${query}`)
      const rows = await db.execSQL(query)

      if (!rows || rows.length === 0) {
        return res.status(400).json({ error: 'No data to export' })
      }

      let body
      if (format === 'json') {
        body = serializeJSON(rows)
      } else if (format === 'excel') {
        body = await serializeExcel(rows, { sheetName: table, nullValue: q.nullValue ? String(q.nullValue) : '' })
      } else {
        body = serializeCSV(rows, {
          delimiter: q.delimiter ? String(q.delimiter) : ',',
          includeHeaders: q.includeHeaders === undefined ? true : String(q.includeHeaders) !== 'false',
          nullValue: q.nullValue ? String(q.nullValue) : ''
        })
      }

      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `${table}_${ts}.${EXT[format]}`
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.setHeader('Content-Type', CONTENT_TYPES[format])
      return res.status(200).send(body)
    } catch (error) {
      next(error)
    }
  })
}
