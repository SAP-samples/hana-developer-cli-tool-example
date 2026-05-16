// @ts-check
import * as base from '../utils/base.js'

/**
 * Allowed aggregation functions for measures
 * @type {Set<string>}
 */
const ALLOWED_AGGREGATIONS = new Set(['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'])

/**
 * Allowed filter operators
 * @type {Set<string>}
 */
const ALLOWED_OPERATORS = new Set(['=', '!=', '>', '<', '>=', '<=', 'IN', 'LIKE', 'BETWEEN'])

/**
 * Regex for valid SQL identifier names (no quoting or special characters)
 * @type {RegExp}
 */
const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

/**
 * Validate a SQL identifier against the allowed pattern.
 * Returns true if safe; false if it would constitute an injection vector.
 * @param {string} identifier
 * @returns {boolean}
 */
function isValidIdentifier(identifier) {
    return typeof identifier === 'string' && IDENTIFIER_REGEX.test(identifier)
}

/**
 * Quote a validated identifier with double-quotes for safe embedding in SQL.
 * MUST only be called after isValidIdentifier() returns true.
 * @param {string} identifier
 * @returns {string}
 */
function quoteIdentifier(identifier) {
    return `"${identifier}"`
}

/**
 * Build an aggregated analytics SQL query from a validated request body.
 *
 * @param {Object} body - Request body
 * @param {string}   body.schema     - Database schema name
 * @param {string}   body.object     - Table or view name
 * @param {string[]} [body.dimensions]  - Column names to group by
 * @param {Array<{column:string, aggregation:string, alias?:string}>} [body.measures] - Aggregated columns
 * @param {Array<{column:string, operator:string, value:*}>} [body.filters]  - WHERE conditions
 * @param {number}   [body.limit]    - Row limit (default 1000)
 * @returns {{ sql: string, params: any[] } | { error: string, status: number }}
 */
export function buildAnalyticsSQL(body) {
    const { schema, object, dimensions = [], measures = [], filters = [], limit = 1000 } = body || {}

    // --- Required field validation ---
    if (!schema || typeof schema !== 'string' || schema.trim() === '') {
        return { error: 'schema is required', status: 400 }
    }
    if (!object || typeof object !== 'string' || object.trim() === '') {
        return { error: 'object is required', status: 400 }
    }
    if (!Array.isArray(dimensions) || !Array.isArray(measures) ||
        (dimensions.length === 0 && measures.length === 0)) {
        return { error: 'at least one dimension or measure is required', status: 400 }
    }

    // --- Identifier validation: schema and object ---
    if (!isValidIdentifier(schema)) {
        return { error: `invalid identifier: schema "${schema}"`, status: 400 }
    }
    if (!isValidIdentifier(object)) {
        return { error: `invalid identifier: object "${object}"`, status: 400 }
    }

    // --- Validate dimensions ---
    for (const dim of dimensions) {
        if (!isValidIdentifier(dim)) {
            return { error: `invalid identifier in dimensions: "${dim}"`, status: 400 }
        }
    }

    // --- Validate measures ---
    for (const measure of measures) {
        if (!isValidIdentifier(measure.column)) {
            return { error: `invalid identifier in measures: "${measure.column}"`, status: 400 }
        }
        const aggUpper = (measure.aggregation || '').toUpperCase()
        if (!ALLOWED_AGGREGATIONS.has(aggUpper)) {
            return {
                error: `invalid aggregation function "${measure.aggregation}". Allowed: ${[...ALLOWED_AGGREGATIONS].join(', ')}`,
                status: 400
            }
        }
        if (measure.alias && !isValidIdentifier(measure.alias)) {
            return { error: `invalid identifier in measure alias: "${measure.alias}"`, status: 400 }
        }
    }

    // --- Validate filters ---
    const params = []
    const whereClauses = []
    for (const filter of filters) {
        if (!isValidIdentifier(filter.column)) {
            return { error: `invalid identifier in filters: "${filter.column}"`, status: 400 }
        }
        const opUpper = (filter.operator || '').toUpperCase()
        if (!ALLOWED_OPERATORS.has(opUpper)) {
            return {
                error: `invalid filter operator "${filter.operator}". Allowed: ${[...ALLOWED_OPERATORS].join(', ')}`,
                status: 400
            }
        }

        const col = quoteIdentifier(filter.column)
        if (opUpper === 'IN') {
            if (!Array.isArray(filter.value) || filter.value.length === 0) {
                return { error: `IN operator requires a non-empty array value for column "${filter.column}"`, status: 400 }
            }
            const placeholders = filter.value.map(() => '?').join(', ')
            whereClauses.push(`${col} IN (${placeholders})`)
            params.push(...filter.value)
        } else if (opUpper === 'BETWEEN') {
            if (!Array.isArray(filter.value) || filter.value.length !== 2) {
                return { error: `BETWEEN operator requires an array of exactly 2 values for column "${filter.column}"`, status: 400 }
            }
            whereClauses.push(`${col} BETWEEN ? AND ?`)
            params.push(filter.value[0], filter.value[1])
        } else {
            whereClauses.push(`${col} ${filter.operator} ?`)
            params.push(filter.value)
        }
    }

    // --- Build SELECT list ---
    const selectParts = []

    for (const dim of dimensions) {
        selectParts.push(quoteIdentifier(dim))
    }

    for (const measure of measures) {
        const aggUpper = measure.aggregation.toUpperCase()
        const col = quoteIdentifier(measure.column)
        const alias = measure.alias
            ? ` AS ${quoteIdentifier(measure.alias)}`
            : ` AS "${aggUpper}_${measure.column}"`
        selectParts.push(`${aggUpper}(${col})${alias}`)
    }

    // --- FROM clause ---
    const fromClause = `${quoteIdentifier(schema)}.${quoteIdentifier(object)}`

    // --- Build SQL ---
    let sql = `SELECT ${selectParts.join(', ')} FROM ${fromClause}`

    if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`
    }

    if (dimensions.length > 0) {
        sql += ` GROUP BY ${dimensions.map(quoteIdentifier).join(', ')}`
        sql += ` ORDER BY ${dimensions.map(quoteIdentifier).join(', ')}`
    }

    const rowLimit = Math.max(1, Math.min(Number.isInteger(limit) ? limit : 1000, 10000))
    sql += ` LIMIT ${rowLimit}`

    return { sql, params }
}

export function route(app) {
    /**
     * @swagger
     * /hana/analytics-ui:
     *   post:
     *     tags: [HANA Analytics]
     *     summary: Execute an aggregated analytics query
     *     description: |
     *       Builds and executes a parameterized GROUP BY query from the supplied
     *       dimensions, measures and filters.  Identifiers are validated against a
     *       strict allow-list regex and double-quoted in the generated SQL.  Filter
     *       values are always passed via prepared-statement parameters — never
     *       interpolated into the SQL string.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [schema, object]
     *             properties:
     *               schema:
     *                 type: string
     *                 description: Database schema name
     *               object:
     *                 type: string
     *                 description: Table or view name
     *               dimensions:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Column names to group by
     *               measures:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     column:
     *                       type: string
     *                     aggregation:
     *                       type: string
     *                       enum: [SUM, AVG, COUNT, MIN, MAX]
     *                     alias:
     *                       type: string
     *               filters:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     column:
     *                       type: string
     *                     operator:
     *                       type: string
     *                       enum: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'LIKE', 'BETWEEN']
     *                     value:
     *                       description: Scalar, array (IN/BETWEEN), or string
     *               limit:
     *                 type: integer
     *                 default: 1000
     *                 maximum: 10000
     *     responses:
     *       200:
     *         description: Analytics query results
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 columns:
     *                   type: array
     *                   items:
     *                     type: string
     *                 data:
     *                   type: array
     *                   description: 2D array of result rows
     *                   items:
     *                     type: array
     *                 metadata:
     *                   type: object
     *                   properties:
     *                     totalRows:
     *                       type: integer
     *                     aggregated:
     *                       type: boolean
     *                     executionTime:
     *                       type: number
     *                       description: Execution time in milliseconds
     *       400:
     *         description: Validation error (missing fields, invalid identifiers, bad aggregation)
     *       500:
     *         description: Database or internal server error
     */
    app.post('/hana/analytics-ui', async (req, res, next) => {
        try {
            const body = req.body || {}
            base.debug('analytics-ui request body:', JSON.stringify(body))

            // Build SQL — returns either { sql, params } or { error, status }
            const built = buildAnalyticsSQL(body)
            if (built.status) {
                return res.status(built.status).json({ error: built.error })
            }

            const { sql, params } = built
            base.debug('analytics-ui SQL:', sql)
            base.debug('analytics-ui params:', JSON.stringify(params))

            const startTime = Date.now()
            const db = await base.createDBConnection()
            const statement = await db.preparePromisified(sql)
            const rows = await db.statementExecPromisified(statement, params)
            const executionTime = Date.now() - startTime

            // Extract column names from first row (if any)
            const columns = rows.length > 0 ? Object.keys(rows[0]) : []

            // Convert array-of-objects to 2D array
            const data = rows.map(row => columns.map(col => row[col]))

            const hasMeasures = Array.isArray(body.measures) && body.measures.length > 0

            return res.status(200).json({
                columns,
                data,
                metadata: {
                    totalRows: rows.length,
                    aggregated: hasMeasures,
                    executionTime
                }
            })
        } catch (error) {
            if (error && error.status) {
                // Structured validation error propagated as an Error object
                return res.status(error.status).json({ error: error.message })
            }
            next(error)
        }
    })
}
