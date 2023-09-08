import DBClientClass from "./index.js"
import * as base from '../base.js'

export default class extends DBClientClass {
    #clientType = 'hanaCDS'
    #schema
    constructor(prompts) {
        super(prompts)
        base.debug(`Database client specific class for profile: ${prompts.profile}`)
    }

    async connect() {
        const db = await base.createDBConnection()
        super.setDB(db)
        return db
    }
    
    disconnect(){
        base.end()
    }

    async listTables() {
        base.debug(`listTables for ${this.#clientType}`)
        const db = super.getDB()
        const prompts = super.getPrompts()

        this.#schema = await base.dbClass.schemaCalc(prompts, db)
        const table = super.adjustWildcard(prompts.table)
        base.debug(`${base.bundle.getText("schema")}: ${this.#schema}, ${base.bundle.getText("table")}: ${table}`)

        base.debug(`getTablesInt ${this.#schema} ${table} ${prompts.limit}`)
        let dbQuery =
            `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
              WHERE SCHEMA_NAME LIKE ? 
                AND TABLE_NAME LIKE ? 
              ORDER BY SCHEMA_NAME, TABLE_NAME `
        if (prompts.limit | base.sqlInjectionUtils.isAcceptableParameter(prompts.limit)) {
            dbQuery += `LIMIT ${prompts.limit.toString()}`
        }
        base.debug(dbQuery)
        let results = await db.statementExecPromisified(await db.preparePromisified(dbQuery), [this.#schema, table])
        return results
    }

}