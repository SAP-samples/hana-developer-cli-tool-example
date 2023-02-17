/*eslint-env node, es6 */
// @ts-check

import * as base from './base.js'
import { promises as fsp } from 'fs'
import * as path from 'path'
import cds from '@sap/cds'
import * as dbInspect from '../utils/dbInspect.js'
import * as fs from 'fs'
import zipClass from 'node-zip'

const progressBarOptionsTemplate = {
   // width: 80,
    eta: true,
    percent: true,
    inline: true
}

function getProcessBarTableOptions(prompts, length) {
    let progressBarOptions = progressBarOptionsTemplate
    progressBarOptions.title = base.bundle.getText('mass.tblupd', [prompts.output])
    progressBarOptions.items = length
    return progressBarOptions
}
/* function getProcessBarViewOptions(prompts, length) {
    let progressBarOptions = progressBarOptionsTemplate
    progressBarOptions.title = base.bundle.getText('mass.viewupd', [prompts.output])
    progressBarOptions.items = length
    return progressBarOptions
} */

export async function convert(wss) {
    try {
        let prompts = base.getPrompts()
        const db = await base.createDBConnection()

        let schema = await base.dbClass.schemaCalc(prompts, db)
        let targetMsg = `${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("table")}: ${prompts.table}, ${base.bundle.getText("view")}: ${prompts.view}`
        base.debug(targetMsg)
        broadcast(wss, targetMsg)


        let results = await getTablesInt(schema, prompts.table, db, prompts.limit)
        base.outputTableFancy(results)
        let viewResults = []
        if (prompts.view) {
            viewResults = await getViewsInt(schema, prompts.view, db, prompts.limit)
            if (viewResults.length > 0)
                base.outputTableFancy(viewResults)
        }

        dbInspect.options.useHanaTypes = prompts.useHanaTypes
        dbInspect.options.keepPath = prompts.keepPath
        dbInspect.options.noColons = prompts.noColons
        dbInspect.options.useExists = prompts.useExists
        dbInspect.options.useQuoted = prompts.useQuoted
        dbInspect.options.log = prompts.log

        const search = `"${schema}".`
        const replacer =
            new RegExp(await escapeRegExp(search), 'g')
        let logOutput = []

        switch (prompts.output) {
            case 'hdbtable': {
                const zip = new zipClass()
                let progressBar = base.terminal.progressBar(
                    getProcessBarTableOptions(prompts, results.length)
                )
                if (prompts.useCatalogPure) {
                    for (let [i, table] of results.entries()) {
                        try {
                            progressBar.startItem(table.TABLE_NAME)
                            broadcast(wss, table.TABLE_NAME, i / results.length * 100)
                            let output = await dbInspect.getDef(db, schema, table.TABLE_NAME)

                            output = output.slice(7)
                            output = output.replace(replacer, '')
                            output = await removeCSTypes(db, output)
                            await zip.file(table.TABLE_NAME.toString() + ".hdbtable", output + "\n\n")
                            progressBar.itemDone(table.TABLE_NAME)
                            logOutput.push({ object: table.TABLE_NAME, status: 'Success' })
                        }
                        catch (error) {
                            if (prompts.log) {
                                logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
                            } else {
                                progressBar.stop()
                                base.error(error)
                                broadcast(wss, `${error}`)
                            }
                        }
                    }
                } else {
                    for (let [i, table] of results.entries()) {
                        try {
                            progressBar.startItem(table.TABLE_NAME)
                            broadcast(wss, table.TABLE_NAME, i / results.length * 100)
                            let object = await dbInspect.getTable(db, schema, table.TABLE_NAME)
                            let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
                            let constraints = await dbInspect.getConstraints(db, object)
                            let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", schema, null)
                            let options = { names: 'quoted', dialect: 'hana', src: 'cds' }
                            let all = cds.compile.to.hdbtable(cds.parse(cdsSource), options)
                            let output
                            for (let [src] of all) {
                                output = src
                                output = await addAssociations(db, schema, table.TABLE_NAME, output)
                            }
                            await zip.file(table.TABLE_NAME.toString() + ".hdbtable", output + "\n\n")
                            progressBar.itemDone(table.TABLE_NAME)
                            logOutput.push({ object: table.TABLE_NAME, status: 'Success' })
                        }
                        catch (error) {
                            if (prompts.log) {
                                logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
                            } else {
                                progressBar.stop()
                                base.error(error)
                                broadcast(wss, `${error}`)
                            }
                        }
                    }
                }
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
                if (prompts.log) {
                    console.table(logOutput)
                    let logFilename = prompts.filename || dir + 'log'
                    logFilename = `${logFilename}.json`
                    fs.writeFile(logFilename, JSON.stringify(logOutput), (err) => {
                        if (err) throw err
                    })
                    let logMessage = `${base.bundle.getText("logWritten")}: ${logFilename}`
                    console.log(logMessage)
                    broadcast(wss, logMessage, 100)
                }
                console.log(finishMessage)
                broadcast(wss, finishMessage, 100)
                break
            }
            case 'hdbmigrationtable': {
                const zip = new zipClass()
                let progressBar = base.terminal.progressBar(
                    getProcessBarTableOptions(prompts, results.length)
                )
                if (prompts.useCatalogPure) {
                    for (let [i, table] of results.entries()) {
                        try {
                            progressBar.startItem(table.TABLE_NAME)
                            broadcast(wss, table.TABLE_NAME, i / results.length * 100)
                            let output = await dbInspect.getDef(db, schema, table.TABLE_NAME)
                            output = output.slice(7)
                            output = `== version = 1 \n` + output
                            output = output.replace(replacer, '')
                            output = await removeCSTypes(db, output)
                            await zip.file(table.TABLE_NAME.toString() + ".hdbmigrationtable", output + "\n\n")
                            progressBar.itemDone(table.TABLE_NAME)
                            logOutput.push({ object: table.TABLE_NAME, status: 'Success' })
                        }
                        catch (error) {
                            if (prompts.log) {
                                logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
                            } else {
                                progressBar.stop()
                                base.error(error)
                                broadcast(wss, `${error}`)
                            }
                        }
                    }

                } else {
                    for (let [i, table] of results.entries()) {
                        try {
                            progressBar.startItem(table.TABLE_NAME)
                            broadcast(wss, table.TABLE_NAME, i / results.length * 100)
                            let object = await dbInspect.getTable(db, schema, table.TABLE_NAME)
                            let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
                            let constraints = await dbInspect.getConstraints(db, object)
                            let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", schema, null)
                            let options = { names: 'quoted', dialect: 'hana', src: 'cds' }
                            let all = cds.compile.to.hdbtable(cds.parse(cdsSource), options)
                            let output
                            for (let [src] of all) {
                                output = `== version = 1 \n` + src
                                output = await addAssociations(db, schema, table.TABLE_NAME, output)

                            }
                            await zip.file(table.TABLE_NAME.toString() + ".hdbmigrationtable", output + "\n\n")
                            progressBar.itemDone(table.TABLE_NAME)
                            logOutput.push({ object: table.TABLE_NAME, status: 'Success' })
                        }
                        catch (error) {
                            if (prompts.log) {
                                logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
                            } else {
                                progressBar.stop()
                                base.error(error)
                                broadcast(wss, `${error}`)
                            }
                        }
                    }
                }
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
                if (prompts.log) {
                    console.table(logOutput)
                    let logFilename = prompts.filename || dir + 'log'
                    logFilename = `${logFilename}.json`
                    fs.writeFile(logFilename, JSON.stringify(logOutput), (err) => {
                        if (err) throw err
                    })
                    let logMessage = `${base.bundle.getText("logWritten")}: ${logFilename}`
                    console.log(logMessage)
                    broadcast(wss, logMessage, 100)
                }
                console.log(finishMessage)
                broadcast(wss, finishMessage, 100)
                break
            }
            default: {
                var cdsSource = prompts.namespace && `namespace ${prompts.namespace};\n` || ""
                let progressBar = base.terminal.progressBar(
                    getProcessBarTableOptions(prompts, results.length)
                )
                for (let [i, table] of results.entries()) {
                    try {
                        progressBar.startItem(table.TABLE_NAME)
                        broadcast(wss, table.TABLE_NAME, i / results.length * 100)
                        let object = await dbInspect.getTable(db, schema, table.TABLE_NAME)
                        let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
                        let constraints = await dbInspect.getConstraints(db, object)
                        cdsSource += await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null) + '\n'
                        progressBar.itemDone(table.TABLE_NAME)
                        logOutput.push({ object: table.TABLE_NAME, status: 'Success' })
                    }
                    catch (error) {
                        if (prompts.log) {
                            logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
                        } else {
                            progressBar.stop()
                            base.error(error)
                            broadcast(wss, `${error}`)
                        }
                    }
                }
                let dir = prompts.folder
                !fs.existsSync(dir) && fs.mkdirSync(dir)
                let filename = prompts.filename || dir + 'export.cds'
                fs.writeFile(filename, cdsSource, (err) => {
                    if (err) throw err
                })
                let finishMessage = `${base.bundle.getText("contentWritten")}: ${filename}`
                console.log(finishMessage)
                if (prompts.log) {
                    console.table(logOutput)
                    let logFilename = prompts.filename || dir + 'log'
                    logFilename = `${logFilename}.json`
                    fs.writeFile(logFilename, JSON.stringify(logOutput), (err) => {
                        if (err) throw err
                    })
                    let logMessage = `${base.bundle.getText("logWritten")}: ${logFilename}`
                    console.log(logMessage)
                    broadcast(wss, logMessage, 100)
                }
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

/**
 * Get list of tables based upon input parameters
 * @param {string} schema 
 * @param {string} table
 * @param {any} client
 * @param {number} limit
 * @returns {Promise<any>} - Array of Table Info 
 */
async function getTablesInt(schema, table, client, limit) {
    base.debug(`getTablesInt ${schema} ${table} ${limit}`)
    table = base.dbClass.objectName(table)
    let query =
        `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
            WHERE SCHEMA_NAME LIKE ? 
            AND TABLE_NAME LIKE ? 
            AND IS_USER_DEFINED_TYPE = 'FALSE'
            ORDER BY SCHEMA_NAME, TABLE_NAME `
    if (limit | base.sqlInjectionUtils.isAcceptableParameter(limit)) {
        query += `LIMIT ${limit.toString()}`
    }
    let results = await client.statementExecPromisified(await client.preparePromisified(query), [schema, table])
    return results
}

/**
 * Get list of views based upon input parameters
 * @param {string} schema 
 * @param {string} view
 * @param {any} client
 * @param {number} limit
 * @returns {Promise<any>} - Array of View Info 
 */
async function getViewsInt(schema, view, client, limit) {
    base.debug(`getViewsInt ${schema} ${view} ${limit}`)
    view = base.dbClass.objectName(view)
    let query =
        `SELECT SCHEMA_NAME, VIEW_NAME, TO_NVARCHAR(VIEW_OID) AS VIEW_OID, COMMENTS  from VIEWS 
            WHERE SCHEMA_NAME LIKE ? 
            AND VIEW_NAME LIKE ? 
            ORDER BY SCHEMA_NAME, VIEW_NAME `
    if (limit | base.sqlInjectionUtils.isAcceptableParameter(limit)) {
        query += `LIMIT ${limit.toString()}`
    }
    let results = await client.statementExecPromisified(await client.preparePromisified(query), [schema, view])
    return results
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

async function removeCSTypes(client, output) {
    try {
        base.debug(`removeCSTypes}`)
        let query =
            `SELECT DISTINCT CS_DATA_TYPE_NAME from TABLE_COLUMNS ORDER BY LENGTH(CS_DATA_TYPE_NAME) DESC`
        let results = await client.statementExecPromisified(await client.preparePromisified(query))
        for (let type of results) {
            const search = `CS_${type.CS_DATA_TYPE_NAME}`
            const replacer =
                new RegExp(await escapeRegExp(search), 'g')
            output = output.replace(replacer, '')
        }
        return output
    } catch (error) {
        return output
        //Ignore errors as CS_TYPES are not present in HANA Cloud systems
    }
}

async function addAssociations(client, schema, table, output) {
    try {
        base.debug(`addAssociations}`)
        let query =
            `SELECT * FROM ASSOCIATIONS WHERE SCHEMA_NAME = ? and OBJECT_NAME = ?`
        let results = await client.statementExecPromisified(await client.preparePromisified(query), [schema, table])
        for (let [i, association] of results.entries()) {
            if (i == 0) {
                output += `\n`
                output += `WITH ASSOCIATIONS( `
            }
            output += ` JOIN "${association.TARGET_OBJECT_NAME}" AS "${association.ASSOCIATION_NAME}" ON ${association.JOIN_CONDITION}`
            if (i < results.length - 1) {
                output += ` , `
            } else {
                output += ` ) `
            }
        }
        return output
    } catch (error) {
        base.error(error)
        return output
    }
}