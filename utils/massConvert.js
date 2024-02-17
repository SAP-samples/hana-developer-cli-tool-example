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

/**
 * Build ProgressBar Options for Tables
 * @param {any} prompts 
 * @param {number} length
 */
function getProcessBarTableOptions(prompts, length) {
    let progressBarOptions = progressBarOptionsTemplate
    progressBarOptions.title = base.bundle.getText('mass.tblupd', [prompts.output])
    progressBarOptions.items = length
    return progressBarOptions
}
/**
 * Build ProgressBar Options for Views
 * @param {any} prompts 
 * @param {number} length
 */
function getProcessBarViewOptions(prompts, length) {
    let progressBarOptions = progressBarOptionsTemplate
    progressBarOptions.title = base.bundle.getText('mass.viewupd', [prompts.output])
    progressBarOptions.items = length
    return progressBarOptions
}

/**
 * HDBTABLE - Table SQL based Output
 * @param {any} prompts 
 * @param {any} results - Result Set
 * @param {any} wss - Web Socket Server
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {any} replacer
 * @param {any} zip
 * @param {any} logOutput
 * @returns {Promise<any>} 
 */
async function hdbtableTablesSQL(prompts, results, wss, db, schema, replacer, zip, logOutput) {
    let progressBar = base.terminal.progressBar(
        getProcessBarTableOptions(prompts, results.length)
    )
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
                progressBar.itemDone(table.TABLE_NAME)
                logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
            } else {
                progressBar.stop()
                base.error(error)
                broadcast(wss, `${error}`)
                return
            }
        }
    }
    progressBar.stop()
    return
}

/**
 * HDBTABLE - View SQL based Output
 * @param {any} prompts 
 * @param {any} viewResults - Result Set
 * @param {any} wss - Web Socket Server
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {any} replacer
 * @param {any} zip
 * @param {any} logOutput
 * @returns {Promise<any>} 
 */
async function hdbtableViewsSQL(prompts, viewResults, wss, db, schema, replacer, zip, logOutput) {
    let viewProgressBar = base.terminal.progressBar(
        getProcessBarViewOptions(prompts, viewResults.length)
    )

    for (let [i, view] of viewResults.entries()) {
        try {
            viewProgressBar.startItem(view.VIEW_NAME)
            broadcast(wss, view.VIEW_NAME, i / viewResults.length * 100)
            let output = await dbInspect.getDef(db, schema, view.VIEW_NAME)

            output = output.slice(7)
            output = output.replace(replacer, '')
            output = await removeCSTypes(db, output)
            await zip.file(view.VIEW_NAME.toString() + ".hdbview", output + "\n\n")
            viewProgressBar.itemDone(view.VIEW_NAME)
            logOutput.push({ object: view.VIEW_NAME, status: 'Success' })
        }
        catch (error) {
            if (prompts.log) {
                viewProgressBar.itemDone(view.VIEW_NAME)
                logOutput.push({ object: view.VIEW_NAME, status: 'Error', message: error })
            } else {
                viewProgressBar.stop()
                base.error(error)
                broadcast(wss, `${error}`)
                return
            }
        }
    }
    viewProgressBar.stop()
    return
}

/**
 * HDBTABLE - CDS Compile Table Metadata to HDBTABLE based Output
 * @param {any} prompts 
 * @param {any} results - Result Set
 * @param {any} wss - Web Socket Server
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {any} replacer
 * @param {any} zip
 * @param {any} logOutput
 * @returns {Promise<any>} 
 */
async function hdbtableTables(prompts, results, wss, db, schema, replacer, zip, logOutput) {
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
                progressBar.itemDone(table.TABLE_NAME)
                logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
            } else {
                progressBar.stop()
                base.error(error)
                broadcast(wss, `${error}`)
                return
            }
        }
    }
    progressBar.stop()
    return
}

/**
 * HDBTABLE - CDS Compile to HDBTABLE for View Metadata based Output
 * @param {any} prompts 
 * @param {any} viewResults - Result Set
 * @param {any} wss - Web Socket Server
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {any} replacer
 * @param {any} zip
 * @param {any} logOutput
 * @returns {Promise<any>} 
 */
async function hdbtableViews(prompts, viewResults, wss, db, schema, replacer, zip, logOutput) {
    let viewProgressBar = base.terminal.progressBar(
        getProcessBarViewOptions(prompts, viewResults.length)
    )

    for (let [i, view] of viewResults.entries()) {
        try {
            viewProgressBar.startItem(view.VIEW_NAME)
            broadcast(wss, view.VIEW_NAME, i / viewResults.length * 100)
            let object = await dbInspect.getView(db, schema, view.VIEW_NAME)
            let fields = []
            if (await dbInspect.isCalculationView(db, schema, view.VIEW_NAME)) {
                fields = await dbInspect.getCalcViewFields(db, schema, view.VIEW_NAME, object[0].VIEW_OID)
            } else {
                fields = await dbInspect.getViewFields(db, object[0].VIEW_OID)
            }
            let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "hdbview", schema)
            let all = cds.compile.to.hdbtable(cds.parse(cdsSource))
            let output
            for (let [src] of all) {
                output = src
                output = await addAssociations(db, schema, view.VIEW_NAME, output)
            }
            await zip.file(view.VIEW_NAME.toString() + ".hdbtable", output + "\n\n")
            viewProgressBar.itemDone(view.VIEW_NAME)
            logOutput.push({ object: view.VIEW_NAME, status: 'Success' })
        }
        catch (error) {
            if (prompts.log) {
                viewProgressBar.itemDone(view.VIEW_NAME)
                logOutput.push({ object: view.VIEW_NAME, status: 'Error', message: error })
            } else {
                viewProgressBar.stop()
                base.error(error)
                broadcast(wss, `${error}`)
                return
            }
        }
    }
    viewProgressBar.stop()
    return
}

/**
 * HDBMIGRATIONTABLE - Table SQL based Output
 * @param {any} prompts 
 * @param {any} results - Result Set
 * @param {any} wss - Web Socket Server
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {any} replacer
 * @param {any} zip
 * @param {any} logOutput
 * @returns {Promise<any>} 
 */
async function hdbmigrationtableTablesSQL(prompts, results, wss, db, schema, replacer, zip, logOutput) {
    let progressBar = base.terminal.progressBar(
        getProcessBarTableOptions(prompts, results.length)
    )
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
                progressBar.itemDone(table.TABLE_NAME)
                logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
            } else {
                progressBar.stop()
                base.error(error)
                broadcast(wss, `${error}`)
                return
            }
        }
    }
    progressBar.stop()
    return
}

/**
 * HDBMIGRATIONTABLE - CDS Compile Table Metadata to HDBMIGRATIONTABLE based Output
 * @param {any} prompts 
 * @param {any} results - Result Set
 * @param {any} wss - Web Socket Server
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {any} replacer
 * @param {any} zip
 * @param {any} logOutput
 * @returns {Promise<any>} 
 */
async function hdbmigrationtableTables(prompts, results, wss, db, schema, replacer, zip, logOutput) {
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
            let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", schema, null)
            let options = { names: 'quoted', dialect: 'hana', src: 'cds' }
            let all = cds.compile.to.hdbtable(cds.parse(cdsSource), options)
            let output
            for (let [src] of all) {
                output = src
                output = `== version = 1 \n` + src
                output = await addAssociations(db, schema, table.TABLE_NAME, output)
            }
            await zip.file(table.TABLE_NAME.toString() + ".hdbmigrationtable", output + "\n\n")
            progressBar.itemDone(table.TABLE_NAME)
            logOutput.push({ object: table.TABLE_NAME, status: 'Success' })
        }
        catch (error) {
            if (prompts.log) {
                progressBar.itemDone(table.TABLE_NAME)
                logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
            } else {
                progressBar.stop()
                base.error(error)
                broadcast(wss, `${error}`)
                return
            }
        }
    }
    progressBar.stop()
    return
}

/**
 * CDS - Table based Output
 * @param {any} prompts 
 * @param {any} results - Result Set
 * @param {any} wss - Web Socket Server
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {string} cdsSource
 * @param {any} logOutput
 * @returns {Promise<string>} 
 */
async function cdsTables(prompts, results, wss, db, schema, cdsSource, logOutput) {
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
            if (dbInspect.options.userCatalogPure) {
                let output = await dbInspect.getDef(db, schema, table.TABLE_NAME)
                output = output.slice(7)
                cdsSource = dbInspect.parseSQLOptions(output, cdsSource)
            }
            cdsSource += await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null) + '\n'
            progressBar.itemDone(table.TABLE_NAME)
            logOutput.push({ object: table.TABLE_NAME, status: 'Success' })
        }
        catch (error) {
            if (prompts.log) {
                progressBar.itemDone(table.TABLE_NAME)
                logOutput.push({ object: table.TABLE_NAME, status: 'Error', message: error })
            } else {
                progressBar.stop()
                base.error(error)
                broadcast(wss, `${error}`)
                return
            }
        }
    }
    progressBar.stop()
    return cdsSource
}

/**
 * CDS - View based Output
 * @param {any} prompts 
 * @param {any} viewResults - Result Set
 * @param {any} wss - Web Socket Server
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {string} cdsSource
 * @param {any} logOutput
 * @returns {Promise<string>} 
 */
async function cdsViews(prompts, viewResults, wss, db, schema, cdsSource, logOutput) {
    let viewProgressBar = base.terminal.progressBar(
        getProcessBarViewOptions(prompts, viewResults.length)
    )

    for (let [i, view] of viewResults.entries()) {
        try {
            viewProgressBar.startItem(view.VIEW_NAME)
            broadcast(wss, view.VIEW_NAME, i / viewResults.length * 100)
            let object = await dbInspect.getView(db, schema, view.VIEW_NAME)
            let fields = []
            let parameters = []
            if (await dbInspect.isCalculationView(db, schema, view.VIEW_NAME)) {
                fields = await dbInspect.getCalcViewFields(db, schema, view.VIEW_NAME, object[0].VIEW_OID)
                parameters = await dbInspect.getCalcViewParameters(db, schema, view.VIEW_NAME, object[0].VIEW_OID)
            } else {
                fields = await dbInspect.getViewFields(db, object[0].VIEW_OID)
                parameters = await dbInspect.getViewParameters(db, object[0].VIEW_OID)
            }
            cdsSource += await dbInspect.formatCDS(db, object, fields, null, "view", schema, null, parameters)

            viewProgressBar.itemDone(view.VIEW_NAME)
            logOutput.push({ object: view.VIEW_NAME, status: 'Success' })
        }
        catch (error) {
            if (prompts.log) {
                viewProgressBar.itemDone(view.VIEW_NAME)
                logOutput.push({ object: view.VIEW_NAME, status: 'Error', message: error })
            } else {
                viewProgressBar.stop()
                base.error(error)
                broadcast(wss, `${error}`)
                return
            }
        }
    }
    viewProgressBar.stop()
    return cdsSource
}

/**
 * Write ZIP based output
 * @param {any} prompts 
 * @param {any} wss - Web Socket Server
 * @param {any} zip
 * @param {any} logOutput
 * @returns {Promise<any>} 
 */
async function writeZip(prompts, wss, zip, logOutput) {
    base.blankLine()
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
        await writeLog(prompts, wss, dir, logOutput)
    }
    console.log(finishMessage)
    broadcast(wss, finishMessage, 100)
    return
}

/**
 * Write CDS based output
 * @param {any} prompts 
 * @param {any} wss - Web Socket Server
 * @param {string} cdsSource
 * @param {any} logOutput
 * @returns {Promise<any>} 
 */
async function writeCDS(prompts, wss, cdsSource, logOutput) {
    base.blankLine()
    let dir = prompts.folder
    !fs.existsSync(dir) && fs.mkdirSync(dir)
    let filename = prompts.filename || dir + 'export.cds'
    fs.writeFile(filename, cdsSource, (err) => {
        if (err) throw err
    })
    let finishMessage = `${base.bundle.getText("contentWritten")}: ${filename}`
    if (prompts.log) {
        await writeLog(prompts, wss, dir, logOutput)
    }
    console.log(finishMessage)
    broadcast(wss, finishMessage, 100)
    return
}

/**
 * Write Synonyms
 * @param {any} prompts 
 * @param {any} wss - Web Socket Server
 * @returns {Promise<any>} 
 */
async function writeSynonyms(prompts, wss) {
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
        return
    }
}

/**
 * Write Log output as JSON
 * @param {any} prompts 
 * @param {any} wss - Web Socket Server
 * @param {any} dir
 * @param {any} logOutput
 * @returns {Promise<any>} 
 */
async function writeLog(prompts, wss, dir, logOutput) {
    base.outputTableFancy(logOutput)
    let logFilename = prompts.filename || dir + 'log'
    logFilename = `${logFilename}.json`
    fs.writeFile(logFilename, JSON.stringify(logOutput), (err) => {
        if (err) throw err
    })
    let logMessage = `${base.bundle.getText("logWritten")}: ${logFilename}`
    console.log(logMessage)
    broadcast(wss, logMessage, 100)
    return
}

/**
 * Trigger Mass Conversion
 * @param {any} wss - Web Socket Server
 * @returns {Promise<any>} 
 */
export async function convert(wss) {
    try {
        let prompts = base.getPrompts()
        const db = await base.createDBConnection()

        let schema = await base.dbClass.schemaCalc(prompts, db)
        let targetMsg = `${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("table")}: ${prompts.table}, ${base.bundle.getText("view")}: ${prompts.view}`
        base.debug(targetMsg)
        broadcast(wss, targetMsg)
        const search = `"${schema}".`
        const replacer =
            new RegExp(await escapeRegExp(search), 'g')

        let results = await getTablesInt(schema, prompts.table, db, prompts.limit)
        base.outputTableFancy(results)
        let viewResults = []
        if (prompts.view) {
            viewResults = await getViewsInt(schema, prompts.view, db, prompts.limit)
            if (viewResults.length > 0) {
                base.outputTableFancy(viewResults)
            }
        }

        dbInspect.options.useHanaTypes = prompts.useHanaTypes
        dbInspect.options.keepPath = prompts.keepPath
        dbInspect.options.noColons = prompts.noColons
        dbInspect.options.useExists = prompts.useExists
        dbInspect.options.useQuoted = prompts.useQuoted
        dbInspect.options.log = prompts.log
        dbInspect.options.userCatalogPure = prompts.useCatalogPure


        let logOutput = []

        switch (prompts.output) {
            case 'hdbtable': {
                const zip = new zipClass()
                if (prompts.useCatalogPure) {
                    await hdbtableTablesSQL(
                        prompts, results, wss, db, schema, replacer, zip, logOutput
                    )
                    await hdbtableViewsSQL(
                        prompts, viewResults, wss, db, schema, replacer, zip, logOutput
                    )
                } else {
                    await hdbtableTables(
                        prompts, results, wss, db, schema, replacer, zip, logOutput
                    )
                    await hdbtableViews(
                        prompts, viewResults, wss, db, schema, replacer, zip, logOutput
                    )
                }
                await writeZip(prompts, wss, zip, logOutput)
                break
            }
            case 'hdbmigrationtable': {
                const zip = new zipClass()
                if (prompts.useCatalogPure) {
                    await hdbmigrationtableTablesSQL(
                        prompts, results, wss, db, schema, replacer, zip, logOutput
                    )
                } else {
                    await hdbmigrationtableTables(
                        prompts, results, wss, db, schema, replacer, zip, logOutput
                    )
                }
                await writeZip(prompts, wss, zip, logOutput)
                break
            }
            default: {
                var cdsSource = prompts.namespace && `namespace ${prompts.namespace};\n` || ""
                cdsSource = await cdsTables(
                    prompts, results, wss, db, schema, cdsSource, logOutput
                )
                cdsSource = await cdsViews(
                    prompts, viewResults, wss, db, schema, cdsSource, logOutput
                )
                await writeCDS(prompts, wss, cdsSource, logOutput)
                await writeSynonyms(prompts, wss)
                break
            }
        }
        return
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
    //            AND IS_USER_DEFINED_TYPE = 'FALSE'
    let query =
        `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
            WHERE SCHEMA_NAME LIKE ? 
            AND TABLE_NAME LIKE ? 
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

/**
 * Escape and Safe Encode Regular Expression 
 * @param {string} string 
 * @returns {Promise<string>} - Processed String
 */
async function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

/**
 * Broadcast a message via the Web Socket Server 
 * @param {any} wss - Web Socket Server 
 * @param {string} msg
 * @param {number} [progress]
 */
function broadcast(wss, msg, progress) {
    if (wss) {
        if (progress) {
            wss.broadcast(msg, progress)
        } else {
            wss.broadcast(msg)
        }
    }
}

/**
 * Remove the HANA Column Store Types 
 * @param {any} client - Database Connection 
 * @param {string} output - Preprocessed output string with CS Types
 * @returns {Promise<string>} - Output String CS Types removed
 */
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

/**
 * Add Database Association Definitions to object
 * @param {any} client - Database Connection 
 * @param {string} schema
 * @param {string} table - DB Object name can be table or view name
 * @param {any} output - Preprocessed output string with current object definition
 * @returns {Promise<any>} - Output String with associations added 
 */
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