/*eslint-env node, es6 */
"use strict"
const base = require("./base")
const fsp = require('fs').promises
const path = require("path")

module.exports = {
    convert: async (wss) => {
        try {
            let prompts = base.getPrompts()
            const db = await base.createDBConnection()
            const dbClass = require("sap-hdbext-promisfied")
            const cds = require('@sap/cds')

            let schema = await dbClass.schemaCalc(prompts, db)
            let targetMsg = `${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("table")}: ${prompts.table}`
            base.debug(targetMsg)
            broadcast(wss, targetMsg)


            let results = await getTablesInt(schema, prompts.table, db, prompts.limit)
            const dbInspect = require("../utils/dbInspect")
            dbInspect.options.useHanaTypes = prompts.useHanaTypes
            dbInspect.options.keepPath = prompts.keepPath
            dbInspect.options.noColons = prompts.noColons

            const search = `"${schema}".`
            const replacer =
                new RegExp(escapeRegExp(search), 'g')


            switch (prompts.output) {
                case 'hdbtable': {
                    let zip = new require("node-zip")()
                    if (prompts.useCatalogPure) {
                        for (let [i, table] of results.entries()) {
                            broadcast(wss, i / results.length * 100)
                            let output = await dbInspect.getDef(db, schema, table.TABLE_NAME)
                            output = output.slice(7)
                            output = output.replace(replacer, '')
                            await zip.file(table.TABLE_NAME.toString() + ".hdbtable", output + "\n\n")
                        }
                    } else {
                        for (let [i, table] of results.entries()) {
                            broadcast(wss, table.TABLE_NAME, i / results.length * 100)
                            let object = await dbInspect.getTable(db, schema, table.TABLE_NAME)
                            let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
                            let constraints = await dbInspect.getConstraints(db, object)
                            let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable")
                            let all = cds.compile.to.hdbtable(cds.parse(cdsSource))
                            let output
                            for (let [src] of all) {
                                output = src
                            }
                            await zip.file(table.TABLE_NAME.toString() + ".hdbtable", output + "\n\n")
                        }
                    }
                    let fs = require('fs')
                    let dir = prompts.folder
                    !fs.existsSync(dir) && fs.mkdirSync(dir)
                    let data = await zip.generate({
                        base64: false,
                        compression: "DEFLATE"
                    })
                    let filename = prompts.filename || dir + 'export.zip'
                    fs.writeFile(filename, data, 'binary', (err) => {
                        if (err) throw err
                    })
                    let finishMessage = `${base.bundle.getText("contentWritten")}: ${filename}`
                    console.log(finishMessage)
                    broadcast(wss, finishMessage, 100)
                    break
                }
                case 'hdbmigrationtable': {
                    let zip = new require("node-zip")()

                    if (prompts.useCatalogPure) {
                        for (let [i, table] of results.entries()) {
                            broadcast(wss, table.TABLE_NAME, i / results.length * 100)
                            let output = await dbInspect.getDef(db, schema, table.TABLE_NAME)
                            output = output.slice(7)
                            output = `== version = 1 \n` + output
                            output = output.replace(replacer, '')
                            await zip.file(table.TABLE_NAME.toString() + ".hdbmigrationtable", output + "\n\n")
                        }
                    } else {
                        for (let [i, table] of results.entries()) {
                            broadcast(wss, table.TABLE_NAME, i / results.length * 100)
                            let object = await dbInspect.getTable(db, schema, table.TABLE_NAME)
                            let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
                            let constraints = await dbInspect.getConstraints(db, object)
                            let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable")
                            let all = cds.compile.to.hdbtable(cds.parse(cdsSource))
                            let output
                            for (let [src] of all) {
                                output = `== version = 1 \n` + src
                            }
                            await zip.file(table.TABLE_NAME.toString() + ".hdbmigrationtable", output + "\n\n")
                        }
                    }

                    let fs = require('fs')
                    let dir = prompts.folder
                    !fs.existsSync(dir) && fs.mkdirSync(dir)
                    let data = await zip.generate({
                        base64: false,
                        compression: "DEFLATE"
                    })
                    let filename = prompts.filename || dir + 'export.zip'
                    fs.writeFile(filename, data, 'binary', (err) => {
                        if (err) throw err
                    })
                    let finishMessage = `${base.bundle.getText("contentWritten")}: ${filename}`
                    console.log(finishMessage)
                    broadcast(wss, finishMessage, 100)
                    break
                }
                default: {
                    var cdsSource = prompts.namespace && `namespace ${prompts.namespace};\n` || ""
                    for (let [i, table] of results.entries()) {
                        broadcast(wss, table.TABLE_NAME, i / results.length * 100)
                        let object = await dbInspect.getTable(db, schema, table.TABLE_NAME)
                        let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
                        let constraints = await dbInspect.getConstraints(db, object)
                        cdsSource += await dbInspect.formatCDS(db, object, fields, constraints, "table") + '\n'
                    }
                    let fs = require('fs')
                    let dir = prompts.folder
                    !fs.existsSync(dir) && fs.mkdirSync(dir)
                    let filename = prompts.filename || dir + 'export.cds'
                    fs.writeFile(filename, cdsSource, (err) => {
                        if (err) throw err
                    })
                    let finishMessage = `${base.bundle.getText("contentWritten")}: ${filename}`
                    console.log(finishMessage)
                    broadcast(wss, finishMessage, 100)

                    // store synonyms if filename is provided
                    if (prompts.synonyms) {
                        if (!prompts.synonyms.includes('hdbsynonym')) {
                            prompts.synonyms += '.hdbsynonym'
                        }
                        await fsp.mkdir(path.dirname(prompts.synonyms), { recursive: true })
                        await fsp.writeFile(
                            prompts.synonyms,
                            JSON.stringify(dbInspect.results.synonyms, null, '\t')
                        )
                        let finishMessage2 = `Synonyms are written to ${prompts.synonyms} file`
                        console.log(finishMessage2)
                        broadcast(wss, finishMessage2, 100)
                    }
                    break
                }
            }
        } catch (error) {
            base.error(error)
            broadcast(wss, `${error}`)
        }
    }
}

async function getTablesInt(schema, table, client, limit) {
    base.debug(`getTablesInt ${schema} ${table} ${limit}`)
    const dbClass = require("sap-hdbext-promisfied")
    table = dbClass.objectName(table)
    var query =
        `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
            WHERE SCHEMA_NAME LIKE ? 
            AND TABLE_NAME LIKE ? 
            AND IS_USER_DEFINED_TYPE = 'FALSE'
            ORDER BY SCHEMA_NAME, TABLE_NAME `
    if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
        query += `LIMIT ${limit.toString()}`
    }
    return await client.statementExecPromisified(await client.preparePromisified(query), [schema, table])
}

async function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

function broadcast(wss, msg, progress) {
    if (wss) {
        if (progress) {
            wss.broadcast(msg, progress)
        } else {
            wss.broadcast(msg)
        }
    }
}