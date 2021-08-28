// @ts-check
import * as base from '../utils/base.js'

export function route (app) {
    app.get(['/hana/inspectTable', '/hana/inspectTable-ui'], async (req, res) => {
        inspectTableHandler(res, "../bin/inspectTable", 'tableInspect')
    })
}

export async function inspectTableHandler(res, lib, func) {
    try {
        await base.clearConnection()
        const targetLibrary = await import(`${lib}.js`)
        let prompts = base.getPrompts()
        prompts.useHanaTypes = true
        prompts.output = 'tbl'
        let results = await targetLibrary[func](prompts)

        await base.clearConnection()
        prompts.output = 'sql'
        let sql =  await targetLibrary[func](prompts)
        results.sql = sql.sql

        await base.clearConnection()
        prompts.output = 'cds'
        let cds =  await targetLibrary[func](prompts)
        results.cds = cds.cds

        await base.clearConnection()
        prompts.output = 'hdbtable'
        let hdbtable =  await targetLibrary[func](prompts)
        results.hdbtable = hdbtable.hdbtable

        base.sendResults(res, results)
    } catch (error) {
        res.status(500).send(error.toString())
        return console.error(`${error}`)
    }
}

export async function inspectHandler(res, lib, func) {
    try {
        await base.clearConnection()
        const targetLibrary = await import(`${lib}.js`)
        let results = await targetLibrary[func](base.getPrompts())
        base.sendResults(res, results)
    } catch (error) {
        res.status(500).send(error.toString())
        return console.error(`${error}`)
    }
}
