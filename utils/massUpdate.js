/*eslint-env node, es6 */
// @ts-check

import * as base from './base.js'
import { promises as fsp } from 'fs'
import * as path from 'path'

/**
 * Build ProgressBar Options for Updates
 * @param {any} prompts 
 * @param {number} length
 */
function getProgressBarOptions(prompts, length) {
    let progressBarOptions = {
        eta: true,
        percent: true,
        inline: true,
        title: base.bundle.getText('mass.updateProgress'),
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
    
    let query = `SELECT SCHEMA_NAME, TABLE_NAME 
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
 * Get count of rows to be updated for a table
 * @param {any} db
 * @param {string} schema
 * @param {string} table
 * @param {string} whereClause
 * @returns {Promise<number>}
 */
async function getUpdateCount(db, schema, table, whereClause) {
    let query = `SELECT COUNT(*) as COUNT FROM "${schema}"."${table}"`
    if (whereClause && whereClause.trim()) {
        query += ` WHERE ${whereClause}`
    }
    
    let result = await db.statementExecPromisified(
        await db.preparePromisified(query)
    )
    return result[0]?.COUNT || 0
}

/**
 * Execute bulk update on a table
 * @param {any} db
 * @param {any} tableList
 * @param {string} schema
 * @param {string} setClause
 * @param {string} whereClause
 * @param {boolean} dry
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function executeUpdate(db, tableList, schema, setClause, whereClause, dry, logOutput) {
    let progressBar = base.terminal.progressBar(
        getProgressBarOptions({}, tableList.length)
    )
    
    for (let [i, tableObj] of tableList.entries()) {
        try {
            progressBar.startItem(tableObj.TABLE_NAME)
            
            // Get count of rows to be updated
            let count = await getUpdateCount(db, schema, tableObj.TABLE_NAME, whereClause)
            
            let stmt = `UPDATE "${schema}"."${tableObj.TABLE_NAME}" SET ${setClause}`
            if (whereClause && whereClause.trim()) {
                stmt += ` WHERE ${whereClause}`
            }
            
            if (dry) {
                base.debug(`DRY RUN: ${stmt}`)
                logOutput.push({
                    table: tableObj.TABLE_NAME,
                    action: 'DRY_RUN',
                    rowsAffected: count,
                    status: base.bundle.getText('status.success')
                })
            } else {
                await db.execSQL(stmt)
                logOutput.push({
                    table: tableObj.TABLE_NAME,
                    action: 'UPDATED',
                    rowsAffected: count,
                    status: base.bundle.getText('status.success')
                })
            }
            
            progressBar.itemDone(tableObj.TABLE_NAME)
        } catch (error) {
            progressBar.itemDone(tableObj.TABLE_NAME)
            logOutput.push({
                table: tableObj.TABLE_NAME,
                status: base.bundle.getText('status.error'),
                message: error.message
            })
        }
    }
    progressBar.stop()
}

/**
 * Write update log
 * @param {any} prompts 
 * @param {any} dir
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function writeLog(prompts, dir, logOutput) {
    base.outputTableFancy(logOutput)
    let logFilename = path.join(dir, prompts.object.replace(/[*%]/g, '') + '_update_log.json')
    await fsp.writeFile(logFilename, JSON.stringify(logOutput, null, 2))
    let logMessage = `${base.bundle.getText("logWritten")}: ${logFilename}`
    console.log(logMessage)
    return logFilename
}

/**
 * Trigger Mass Update
 * @returns {Promise<any>}
 */
export async function updateObjects() {
    try {
        let prompts = base.getPrompts()
        const db = await base.createDBConnection()
        
        let schema = await base.dbClass.schemaCalc(prompts, db)
        let targetMsg = `${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("object")}: ${prompts.object}, ${base.bundle.getText("setClause")}: ${prompts.setClause}`
        base.debug(targetMsg)
        console.log(targetMsg)
        
        if (prompts.whereClause) {
            console.log(`${base.bundle.getText("whereClause")}: ${prompts.whereClause}`)
        }
        
        // Find tables to update
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
        
        // Ask for confirmation unless dry-run
        if (!prompts.dry) {
            const inquirer = (await import('inquirer')).default
            const answer = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirm',
                message: base.bundle.getText('mass.confirmUpdate', [tableList.length]),
                default: false
            }])
            
            if (!answer.confirm) {
                console.log(base.bundle.getText("mass.updateCancelled"))
                return base.end()
            }
        }
        
        let logOutput = []
        let dir = prompts.folder || '.'
        
        if (prompts.dry) {
            console.log(base.bundle.getText("dryRunMode"))
        }
        
        // Execute update
        await executeUpdate(db, tableList, schema, prompts.setClause, prompts.whereClause, prompts.dry, logOutput)
        
        // Write logs if requested
        if (prompts.log) {
            await writeLog(prompts, dir, logOutput)
        }
        
        if (prompts.dry) {
            console.log(base.bundle.getText("dryRunCompleted"))
        } else {
            console.log(base.bundle.getText("updateCompleted", [tableList.length]))
        }
        
        return base.end()
    } catch (error) {
        base.error(error)
    }
}
