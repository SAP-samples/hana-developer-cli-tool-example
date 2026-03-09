// @ts-check

import * as base from './base.js'
import { promises as fsp } from 'fs'
import * as path from 'path'

/**
 * Build ProgressBar Options for Exports
 * @param {any} prompts 
 * @param {number} length
 */
function getProgressBarOptions(prompts, length) {
    let progressBarOptions = {
        eta: true,
        percent: true,
        inline: true,
        title: base.bundle.getText('mass.exportProgress'),
        items: length
    }
    return progressBarOptions
}

/**
 * Find tables matching pattern in schema
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {string} tablePattern
 * @param {number} limit
 * @returns {Promise<any>}
 */
async function getTablesInternal(db, schema, tablePattern, limit) {
    base.debug(base.bundle.getText("debug.callWithParams", ["getTablesInternal", `${schema} ${tablePattern}`]))
    
    tablePattern = base.dbClass.objectName(tablePattern)
    
    let query = `SELECT SCHEMA_NAME, TABLE_NAME, COMMENTS
                 FROM TABLES 
                 WHERE SCHEMA_NAME = ? AND TABLE_NAME LIKE ? 
                 ORDER BY SCHEMA_NAME, TABLE_NAME`
    if (limit) query += ` LIMIT ${limit}`
    
    let results = await db.statementExecPromisified(
        await db.preparePromisified(query), 
        [schema, tablePattern]
    )
    
    return results
}

/**
 * Get table structure (columns)
 * @param {any} db
 * @param {string} schema
 * @param {string} table
 * @returns {Promise<any>}
 */
async function getTableStructure(db, schema, table) {
    let query = `SELECT COLUMN_NAME, DATA_TYPE_NAME, IS_NULLABLE, COMMENTS, DEFAULT_VALUE
                 FROM TABLE_COLUMNS 
                 WHERE SCHEMA_NAME = ? AND TABLE_NAME = ?
                 ORDER BY COLUMN_POSITION`
    
    let results = await db.statementExecPromisified(
        await db.preparePromisified(query), 
        [schema, table]
    )
    
    return results
}

/**
 * Get table data
 * @param {any} db
 * @param {string} schema
 * @param {string} table
 * @param {number} limit
 * @returns {Promise<any>}
 */
async function getTableData(db, schema, table, limit) {
    let query = `SELECT * FROM "${schema}"."${table}"`
    if (limit) query += ` LIMIT ${limit}`
    
    let results = await db.statementExecPromisified(
        await db.preparePromisified(query)
    )
    
    return results
}

/**
 * Export table definition to file
 * @param {any} db
 * @param {any} tableObj
 * @param {string} schema
 * @param {string} format
 * @param {string} folderPath
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function exportTableDefinition(db, tableObj, schema, format, folderPath, logOutput) {
    try {
        const structure = await getTableStructure(db, schema, tableObj.TABLE_NAME)
        
        let filename = path.join(folderPath, `${tableObj.TABLE_NAME}_structure.${format}`)
        
        if (format === 'json') {
            await fsp.writeFile(filename, JSON.stringify({
                table: tableObj.TABLE_NAME,
                schema: schema,
                columns: structure,
                createdAt: new Date().toISOString()
            }, null, 2))
        } else if (format === 'csv') {
            // Simple CSV export for table structure
            let csv = 'COLUMN_NAME,DATA_TYPE_NAME,IS_NULLABLE,DEFAULT_VALUE\n'
            for (let col of structure) {
                csv += `"${col.COLUMN_NAME}","${col.DATA_TYPE_NAME}","${col.IS_NULLABLE}","${col.DEFAULT_VALUE || ''}"\n`
            }
            await fsp.writeFile(filename, csv)
        }
        
        logOutput.push({
            table: tableObj.TABLE_NAME,
            action: 'STRUCTURE_EXPORTED',
            filename: path.basename(filename),
            status: base.bundle.getText('status.success')
        })
    } catch (error) {
        logOutput.push({
            table: tableObj.TABLE_NAME,
            action: 'STRUCTURE_EXPORT_FAILED',
            status: base.bundle.getText('status.error'),
            message: error.message
        })
        throw error
    }
}

/**
 * Export table data to file
 * @param {any} db
 * @param {any} tableObj
 * @param {string} schema
 * @param {string} format
 * @param {string} folderPath
 * @param {number} limit
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function exportTableData(db, tableObj, schema, format, folderPath, limit, logOutput) {
    try {
        const data = await getTableData(db, schema, tableObj.TABLE_NAME, limit)
        
        if (data.length === 0) {
            logOutput.push({
                table: tableObj.TABLE_NAME,
                action: 'DATA_EXPORT',
                rows: 0,
                status: base.bundle.getText('status.success')
            })
            return
        }
        
        let filename = path.join(folderPath, `${tableObj.TABLE_NAME}_data.${format}`)
        
        if (format === 'json') {
            await fsp.writeFile(filename, JSON.stringify({
                table: tableObj.TABLE_NAME,
                schema: schema,
                rowCount: data.length,
                data: data,
                exportedAt: new Date().toISOString()
            }, null, 2))
        } else if (format === 'csv') {
            // Simple CSV export for table data
            if (data.length > 0) {
                let columns = Object.keys(data[0])
                let csv = columns.map(col => `"${col}"`).join(',') + '\n'
                for (let row of data) {
                    csv += columns.map(col => {
                        let val = row[col]
                        if (val === null || val === undefined) return '""'
                        return `"${String(val).replace(/"/g, '""')}"`
                    }).join(',') + '\n'
                }
                await fsp.writeFile(filename, csv)
            }
        }
        
        logOutput.push({
            table: tableObj.TABLE_NAME,
            action: 'DATA_EXPORTED',
            rows: data.length,
            filename: path.basename(filename),
            status: base.bundle.getText('status.success')
        })
    } catch (error) {
        logOutput.push({
            table: tableObj.TABLE_NAME,
            action: 'DATA_EXPORT_FAILED',
            rows: 0,
            status: base.bundle.getText('status.error'),
            message: error.message
        })
        throw error
    }
}

/**
 * Write export log
 * @param {any} prompts 
 * @param {any} dir
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function writeLog(prompts, dir, logOutput) {
    base.outputTableFancy(logOutput)
    let logFilename = path.join(dir, prompts.object.replace(/[*%]/g, '') + '_export_log.json')
    await fsp.writeFile(logFilename, JSON.stringify(logOutput, null, 2))
    let logMessage = `${base.bundle.getText("logWritten")}: ${logFilename}`
    console.log(logMessage)
    return logFilename
}

/**
 * Trigger Mass Export
 * @returns {Promise<any>}
 */
export async function exportObjects() {
    try {
        let prompts = base.getPrompts()
        const db = await base.createDBConnection()
        
        let schema = await base.dbClass.schemaCalc(prompts, db)
        let targetMsg = `${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("object")}: ${prompts.object}, ${base.bundle.getText("exportFormat")}: ${prompts.format}`
        base.debug(targetMsg)
        console.log(targetMsg)
        
        // Find tables to export
        let tableList = await getTablesInternal(
            db, 
            schema, 
            prompts.object, 
            prompts.limit
        )
        
        if (tableList.length === 0) {
            console.log(base.bundle.getText("noObjectsFound"))
            return base.end()
        }
        
        base.outputTableFancy(tableList)
        
        // Create export directory
        let dir = prompts.folder || '.'
        await fsp.mkdir(dir, { recursive: true })
        
        let logOutput = []
        
        // Create a progress bar for the export
        let progressBar = base.terminal.progressBar(
            getProgressBarOptions(prompts, tableList.length)
        )
        
        // Export each table
        for (let tableObj of tableList) {
            progressBar.startItem(tableObj.TABLE_NAME)
            
            try {
                // Always export structure
                await exportTableDefinition(db, tableObj, schema, prompts.format, dir, logOutput)
                
                // Export data if requested
                if (prompts.includeData) {
                    await exportTableData(db, tableObj, schema, prompts.format, dir, 10000, logOutput)
                }
                
                progressBar.itemDone(tableObj.TABLE_NAME)
            } catch (error) {
                progressBar.itemDone(tableObj.TABLE_NAME)
                logOutput.push({
                    table: tableObj.TABLE_NAME,
                    action: 'EXPORT_FAILED',
                    status: base.bundle.getText('status.error'),
                    message: error.message
                })
            }
        }
        
        progressBar.stop()
        
        // Write logs
        await writeLog(prompts, dir, logOutput)
        
        console.log(base.bundle.getText("exportCompleted", [tableList.length, dir]))
        
        return base.end()
    } catch (error) {
        base.error(error)
    }
}
