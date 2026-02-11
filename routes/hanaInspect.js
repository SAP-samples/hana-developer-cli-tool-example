// @ts-check
import * as base from '../utils/base.js'

export function route(app) {
    /**
     * @swagger
     * /hana/inspectTable:
     *   get:
     *     tags: [HANA Inspect]
     *     summary: Inspect database table structure
     *     description: Returns detailed information about a database table including columns, data types, and generates SQL, CDS, and hdbtable definitions
     *     responses:
     *       200:
     *         description: Table inspection results with multiple format outputs
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 columns:
     *                   type: array
     *                   items:
     *                     type: object
     *                 sql:
     *                   type: string
     *                   description: SQL DDL statement
     *                 cds:
     *                   type: string
     *                   description: CDS definition
     *                 hdbtable:
     *                   type: string
     *                   description: HANA hdbtable format
     */
    app.get(['/hana/inspectTable', '/hana/inspectTable-ui'], async (req, res, next) => {
        try {
            await inspectTableHandler(res, "../bin/inspectTable", 'tableInspect')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/inspectView:
     *   get:
     *     tags: [HANA Inspect]
     *     summary: Inspect database view structure
     *     description: Returns detailed information about a database view including columns, data types, and generates CDS and hdbview definitions
     *     responses:
     *       200:
     *         description: View inspection results with multiple format outputs
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 columns:
     *                   type: array
     *                   items:
     *                     type: object
     *                 sql:
     *                   type: string
     *                 cds:
     *                   type: string
     *                 hdbtable:
     *                   type: string
     */
    app.get(['/hana/inspectView', '/hana/inspectView-ui'], async (req, res, next) => {
        try {
            await inspectViewHandler(res, "../bin/inspectView", 'viewInspect')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/querySimple:
     *   get:
     *     tags: [HANA Inspect]
     *     summary: Execute a simple SQL query
     *     description: Executes a SQL query against the database and returns results
     *     responses:
     *       200:
     *         description: Query results
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/querySimple', '/hana/querySimple-ui'], async (req, res, next) => {
        try {
            await querySimpleHandler(res, "../bin/querySimple", 'dbQuery')
        } catch (error) {
            next(error)
        }
    })
}


export async function querySimpleHandler(res, lib, func) {
    await base.clearConnection()
    const targetLibrary = await import(`${lib}.js`)
    let results = await targetLibrary[func](base.getPrompts())
    base.sendResults(res, results)
}

export async function inspectTableHandler(res, lib, func) {
    await base.clearConnection()
    const targetLibrary = await import(`${lib}.js`)
    let prompts = base.getPrompts()
    prompts.useHanaTypes = true
    prompts.useExists = true
    prompts.output = 'tbl'
    let promptsSQL = Object.assign({}, prompts)
    promptsSQL.output = 'sql'
    let promptsCDS = Object.assign({}, prompts)
    promptsCDS.output = 'cds'
    let promptsHDBTable = Object.assign({}, prompts)
    promptsHDBTable.output = 'hdbtable'

    let [results, sql, cds, hdbtable] = await Promise.all([
        targetLibrary[func](prompts),
        targetLibrary[func](promptsSQL),
        targetLibrary[func](promptsCDS),
        targetLibrary[func](promptsHDBTable)
    ])
    if (sql.sql) {
        results.sql = sql.sql
    }
    if (cds.cds) {
        results.cds = cds.cds
    }
    if (hdbtable.hdbtable) {
        results.hdbtable = hdbtable.hdbtable
    }

    base.sendResults(res, results)
}

export async function inspectViewHandler(res, lib, func) {
    try {
        await base.clearConnection()
        const targetLibrary = await import(`${lib}.js`)
        let prompts = base.getPrompts()
        prompts.useHanaTypes = true
        prompts.useExists = true
        prompts.output = 'tbl'
        let promptsSQL = Object.assign({}, prompts)
        promptsSQL.output = 'sql'
        let promptsCDS = Object.assign({}, prompts)
        promptsCDS.output = 'cds'
        let promptsHDBTable = Object.assign({}, prompts)
        promptsHDBTable.output = 'hdbview'


        let [results, cds, hdbtable] = await Promise.all([
            targetLibrary[func](prompts),
            targetLibrary[func](promptsCDS),
            targetLibrary[func](promptsHDBTable)
        ])
        var sql = {}
        try {
            sql = await targetLibrary[func](promptsSQL)
        } catch (error) {
            sql['sql'] = error.toString()
            console.error(base.colors.red(error.toString()))
        }
        if (sql.sql) {
            results.sql = sql.sql
        }
        if (cds.cds) {
            results.cds = cds.cds
        }
        if (hdbtable.hdbtable) {
            results.hdbtable = hdbtable.hdbtable
        }

        base.sendResults(res, results)
    } catch (error) {
        console.error(base.colors.red(`${error}`))
        throw error // Let it propagate to be caught by the outer try-catch
    }




}

export async function inspectHandler(res, lib, func) {
    await base.clearConnection()
    const targetLibrary = await import(`${lib}.js`)
    let results = await targetLibrary[func](base.getPrompts())
    base.sendResults(res, results)
}
