/*eslint-env node, es6 */
// @ts-check

import * as base from './base.js'
import { promises as fsp } from 'fs'
import * as path from 'path'

/**
 * Build ProgressBar Options for Grants
 * @param {any} prompts 
 * @param {number} length
 */
function getProgressBarOptions(prompts, length) {
    let progressBarOptions = {
        eta: true,
        percent: true,
        inline: true,
        title: base.bundle.getText('mass.grantProgress'),
        items: length
    }
    return progressBarOptions
}

/**
 * Find objects matching pattern in schema
 * @param {any} db - Database Interface
 * @param {string} schema
 * @param {string} objectPattern
 * @param {string} objectType
 * @param {number} limit
 * @returns {Promise<any>}
 */
async function getObjectsInternal(db, schema, objectPattern, objectType, limit) {
    base.debug(base.bundle.getText("debug.callWithParams", ["getObjectsInternal", `${schema} ${objectPattern}`]))
    
    objectPattern = base.dbClass.objectName(objectPattern)
    
    let results = []
    
    // Tables
    if (!objectType || objectType.toUpperCase() === 'TABLE') {
        let query = `SELECT SCHEMA_NAME, TABLE_NAME as OBJECT_NAME, 'TABLE' AS OBJECT_TYPE 
                     FROM TABLES 
                     WHERE SCHEMA_NAME = ? AND TABLE_NAME LIKE ? 
                     ORDER BY SCHEMA_NAME, TABLE_NAME`
        if (limit) query += ` LIMIT ${limit}`
        
        let tableResults = await db.statementExecPromisified(
            await db.preparePromisified(query), 
            [schema, objectPattern]
        )
        results = results.concat(tableResults)
    }
    
    // Views
    if (!objectType || objectType.toUpperCase() === 'VIEW') {
        let query = `SELECT SCHEMA_NAME, VIEW_NAME as OBJECT_NAME, 'VIEW' AS OBJECT_TYPE 
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
    
    // Procedures
    if (!objectType || objectType.toUpperCase() === 'PROCEDURE') {
        let query = `SELECT SCHEMA_NAME, PROCEDURE_NAME as OBJECT_NAME, 'PROCEDURE' AS OBJECT_TYPE 
                     FROM PROCEDURES 
                     WHERE SCHEMA_NAME = ? AND PROCEDURE_NAME LIKE ? 
                     ORDER BY SCHEMA_NAME, PROCEDURE_NAME`
        if (limit) query += ` LIMIT ${limit}`
        
        let procResults = await db.statementExecPromisified(
            await db.preparePromisified(query), 
            [schema, objectPattern]
        )
        results = results.concat(procResults)
    }
    
    return results
}

/**
 * Execute bulk privilege grant
 * @param {any} db
 * @param {any} objectList
 * @param {string} grantee
 * @param {string} privilege
 * @param {boolean} withGrantOption
 * @param {boolean} dry
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function executeGrant(db, objectList, grantee, privilege, withGrantOption, dry, logOutput) {
    let progressBar = base.terminal.progressBar(
        getProgressBarOptions({}, objectList.length)
    )
    
    for (let [i, obj] of objectList.entries()) {
        try {
            progressBar.startItem(`${obj.OBJECT_TYPE} ${obj.OBJECT_NAME}`)
            
            let stmt = `GRANT ${privilege} ON "${obj.SCHEMA_NAME}"."${obj.OBJECT_NAME}" TO ${grantee}`
            
            if (withGrantOption) {
                stmt += ` WITH GRANT OPTION`
            }
            
            if (dry) {
                base.debug(`DRY RUN: ${stmt}`)
                logOutput.push({
                    object: obj.OBJECT_NAME,
                    type: obj.OBJECT_TYPE,
                    grantee: grantee,
                    privilege: privilege,
                    action: 'DRY_RUN',
                    status: base.bundle.getText('status.success')
                })
            } else {
                await db.execSQL(stmt)
                logOutput.push({
                    object: obj.OBJECT_NAME,
                    type: obj.OBJECT_TYPE,
                    grantee: grantee,
                    privilege: privilege,
                    action: 'GRANTED',
                    status: base.bundle.getText('status.success')
                })
            }
            
            progressBar.itemDone(`${obj.OBJECT_TYPE} ${obj.OBJECT_NAME}`)
        } catch (error) {
            progressBar.itemDone(`${obj.OBJECT_TYPE} ${obj.OBJECT_NAME}`)
            logOutput.push({
                object: obj.OBJECT_NAME,
                type: obj.OBJECT_TYPE,
                grantee: grantee,
                privilege: privilege,
                status: base.bundle.getText('status.error'),
                message: error.message
            })
        }
    }
    progressBar.stop()
}

/**
 * Write grant log
 * @param {any} prompts 
 * @param {any} dir
 * @param {any} logOutput
 * @returns {Promise<any>}
 */
async function writeLog(prompts, dir, logOutput) {
    base.outputTableFancy(logOutput)
    let logFilename = path.join(dir, `${prompts.object.replace(/[*%]/g, '')}_grant_${prompts.grantee}_log.json`)
    await fsp.writeFile(logFilename, JSON.stringify(logOutput, null, 2))
    let logMessage = `${base.bundle.getText("logWritten")}: ${logFilename}`
    console.log(logMessage)
    return logFilename
}

/**
 * Trigger Mass Grant
 * @returns {Promise<any>}
 */
export async function grantPrivileges() {
    try {
        let prompts = base.getPrompts()
        const db = await base.createDBConnection()
        
        let schema = await base.dbClass.schemaCalc(prompts, db)
        let targetMsg = `${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("object")}: ${prompts.object}, ${base.bundle.getText("privilege")}: ${prompts.privilege}, ${base.bundle.getText("grantee")}: ${prompts.grantee}`
        base.debug(targetMsg)
        console.log(targetMsg)
        
        // Find objects to grant privileges on
        let objectList = await getObjectsInternal(
            db, 
            schema, 
            prompts.object, 
            prompts.objectType,
            prompts.limit
        )
        
        if (objectList.length === 0) {
            console.log(base.bundle.getText("noObjectsFound"))
            return base.end()
        }
        
        base.outputTableFancy(objectList)
        
        // Ask for confirmation unless dry-run
        if (!prompts.dry) {
            const inquirer = (await import('inquirer')).default
            const answer = await inquirer.prompt([{
                type: 'confirm',
                name: 'confirm',
                message: base.bundle.getText('mass.confirmGrant', [prompts.privilege, prompts.grantee, objectList.length]),
                default: false
            }])
            
            if (!answer.confirm) {
                console.log(base.bundle.getText("mass.grantCancelled"))
                return base.end()
            }
        }
        
        let logOutput = []
        let dir = prompts.folder || '.'
        
        if (prompts.dry) {
            console.log(base.bundle.getText("dryRunMode"))
        }
        
        // Execute grant
        await executeGrant(db, objectList, prompts.grantee, prompts.privilege, prompts.withGrantOption, prompts.dry, logOutput)
        
        // Write logs if requested
        if (prompts.log) {
            await writeLog(prompts, dir, logOutput)
        }
        
        if (prompts.dry) {
            console.log(base.bundle.getText("dryRunCompleted"))
        } else {
            console.log(base.bundle.getText("grantCompleted", [prompts.privilege, objectList.length, prompts.grantee]))
        }
        
        return base.end()
    } catch (error) {
        base.error(error)
    }
}
