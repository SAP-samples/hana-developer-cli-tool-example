// @ts-check
import * as base from '../utils/base.js'

export function route(app) {
    app.get(['/hana/inspectTable', '/hana/inspectTable-ui'], async (req, res, next) => {
        try {
            await inspectTableHandler(res, "../bin/inspectTable", 'tableInspect')
        } catch (error) {
            next(error)
        }
    })

    app.get(['/hana/inspectView', '/hana/inspectView-ui'], async (req, res, next) => {
        try {
            await inspectViewHandler(res, "../bin/inspectView", 'viewInspect')
        } catch (error) {
            next(error)
        }
    })

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
