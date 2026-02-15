/*eslint-env node, es6 */
// @ts-check

import * as base from './base.js'
import { promises as fsp } from 'fs'
import * as path from 'path'

/**
 * Build ProgressBar Options for Deletions
 * @param {any} prompts 
 * @param {number} length
 */
function getProgressBarOptions(prompts, length) {
    let progressBarOptions = {
        eta: true,
        percent: true,
        inline: true,
        title: base.bundle.getText('mass.deleteProgress'),
        items: length
    }
    return progressBarOptions
}

/**
 * Delete objects with filtering based on prompts
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {string} objectPattern
 * @param {string} objectType
 * @param {number} limit
 * @param {boolean} dry
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function deleteObjectsInternal(db, schema, objectPattern, objectType, limit, dry, logOutput) {
    base.debug(base.bundle.getText("debug.callWithParams", ["deleteObjectsInternal", `${schema} ${objectPattern}`]))
    
    objectPattern = base.dbClass.objectName(objectPattern)
    
    // Build query based on object type
    let query = ''
    let results = []
    
    if (!objectType || objectType.toUpperCase() === 'TABLE') {
        query = `SELECT SCHEMA_NAME, TABLE_NAME, 'TABLE' AS OBJECT_TYPE 
                 FROM TABLES 
                 WHERE SCHEMA_NAME = ? AND TABLE_NAME LIKE ? 
                 ORDER BY SCHEMA_NAME, TABLE_NAME`
        if (limit) query += ` LIMIT ${limit}`
        
        results = await db.statementExecPromisified(
            await db.preparePromisified(query), 
            [schema, objectPattern]
        )
    }
    
    if (!objectType || objectType.toUpperCase() === 'VIEW') {
        query = `SELECT SCHEMA_NAME, VIEW_NAME as TABLE_NAME, 'VIEW' AS OBJECT_TYPE 
                 FROM VIEWS 
                 WHERE SCHEMA_NAME = ? AND VIEW_NAME LIKE ? 
                 ORDER BY SCHEMA_NAME, VIEW_NAME`
        if (limit) query += ` LIMIT ${limit}`
        
        let viewResults = await db.statementExecPromisified(
            await db.preparePromisified(query), 
            [schema, objectPattern]
        )
        results = results.concat(viewResults)
    }
    
    return results
}

/**
 * Execute bulk delete operation
 * @param {any} db
 * @param {any} objectList
 * @param {boolean} dry
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function executeDeletion(db, objectList, dry, logOutput) {
    let progressBar = base.terminal.progressBar(
        getProgressBarOptions({}, objectList.length)
    )
    
    for (let [i, obj] of objectList.entries()) {
        try {
            progressBar.startItem(`${obj.OBJECT_TYPE} ${obj.TABLE_NAME}`)
            
            let stmt = `DROP ${obj.OBJECT_TYPE} "${obj.SCHEMA_NAME}"."${obj.TABLE_NAME}"`
            
            if (dry) {
                base.debug(`DRY RUN: ${stmt}`)
                logOutput.push({ 
                    object: obj.TABLE_NAME, 
                    type: obj.OBJECT_TYPE,
                    action: 'DRY_RUN', 
                    status: base.bundle.getText('status.success') 
                })
            } else {
                await db.execSQL(stmt)
                logOutput.push({ 
                    object: obj.TABLE_NAME, 
                    type: obj.OBJECT_TYPE,
                    action: 'DELETED', 
                    status: base.bundle.getText('status.success') 
                })
            }
            
            progressBar.itemDone(`${obj.OBJECT_TYPE} ${obj.TABLE_NAME}`)
        } catch (error) {
            progressBar.itemDone(`${obj.OBJECT_TYPE} ${obj.TABLE_NAME}`)
            logOutput.push({ 
                object: obj.TABLE_NAME, 
                type: obj.OBJECT_TYPE,
                status: base.bundle.getText('status.error'), 
                message: error.message 
            })
        }
    }
    progressBar.stop()
}

/**
 * Write deletion log
 * @param {any} prompts 
 * @param {any} dir
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function writeLog(prompts, dir, logOutput) {
    base.outputTableFancy(logOutput)
    let logFilename = path.join(dir, prompts.object.replace(/[*%]/g, '') + '_delete_log.json')
    await fsp.writeFile(logFilename, JSON.stringify(logOutput, null, 2))
    let logMessage = `${base.bundle.getText("logWritten")}: ${logFilename}`
    console.log(logMessage)
    return logFilename
}

/**
 * Trigger Mass Deletion
 * @returns {Promise<any>}
 */
export async function deleteObjects() {
    try {
        let prompts = base.getPrompts()
        const db = await base.createDBConnection()
        
        let schema = await base.dbClass.schemaCalc(prompts, db)
        let targetMsg = `${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("object")}: ${prompts.object}`
        base.debug(targetMsg)
        console.log(targetMsg)
        
        // Find objects to delete
        let objectList = await deleteObjectsInternal(
            db, 
            schema, 
            prompts.object, 
            prompts.objectType, 
            prompts.limit,
            false,
            []
        )
        
        if (objectList.length === 0) {
            console.log(base.bundle.getText("noObjectsFound"))
            return base.end()
        }
        
        base.outputTableFancy(objectList)
        
        // Ask for confirmation unless dry-run or force
        if (!prompts.dry && !prompts.force) {
            const inquirer = (await import('inquirer')).default
            const answer = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirm',
                message: base.bundle.getText('mass.confirmDelete', [objectList.length]),
                default: false
            }])
            
            if (!answer.confirm) {
                console.log(base.bundle.getText("mass.deleteCancelled"))
                return base.end()
            }
        }
        
        let logOutput = []
        let dir = prompts.folder || '.'
        
        if (prompts.dry) {
            console.log(base.bundle.getText("dryRunMode"))
        }
        
        // Execute deletion
        await executeDeletion(db, objectList, prompts.dry, logOutput)
        
        // Write logs if requested
        if (prompts.log) {
            await writeLog(prompts, dir, logOutput)
        }
        
        if (prompts.dry) {
            console.log(base.bundle.getText("dryRunCompleted"))
        } else {
            console.log(base.bundle.getText("deletionCompleted", [objectList.length]))
        }
        
        return base.end()
    } catch (error) {
        base.error(error)
    }
}
