import DBClientClass from "./index.js"
import * as base from '../base.js'

/**
 * Database Client for HANA Direct Connection (non-CDS)
 * @extends DBClientClass
 */
export default class extends DBClientClass {
    #clientType = 'hanaCDS'
    #schema
    /**
     * Create an instance of the HANA Direct database client
     * @param {typeof import("prompt")} prompts - input prompts current value
     */
    constructor(prompts) {
        super(prompts)
        base.debug(`Database client specific class for profile: ${prompts.profile}`)
    }

    /**
     * Connect to HANA database directly
     * @returns {Promise<object>} - database connection object
     */
    async connect() {
        const db = await base.createDBConnection()
        super.setDB(db)
        return db
    }
    
    /**
     * Disconnect from HANA database
     * @returns {Promise<void>}
     */
    async disconnect(){
        // Don't call base.end() as it exits the process
        // Instead use disconnectOnly to cleanup connection without exiting
        base.debug(`hanaDirect disconnect called`)
        await base.disconnectOnly()
    }

    /**
     * Get list of tables from HANA database
     * @returns {Promise<Array>} - array of table objects
     */
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

    /**
     * Execute SQL query directly on HANA
     * @param {string} query - SQL query string
     * @returns {Promise<any>} - query results
     */
    async execSQL(query){
        base.debug(`execSQL for ${this.#clientType}`)
        const db = super.getDB()
        let results = await db.execSQL(query)
        return results
    }

}