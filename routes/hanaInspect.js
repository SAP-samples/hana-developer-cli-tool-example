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
        if(sql.sql){
            results.sql = sql.sql
        }
        if(cds.cds){
            results.cds = cds.cds
        }
        if(hdbtable.hdbtable){
            results.hdbtable = hdbtable.hdbtable
        }

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
