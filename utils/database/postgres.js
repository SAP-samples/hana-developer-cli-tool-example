import DBClientClass from "./index.js"
import * as base from '../base.js'

/**
 * Database Client for PostgreSQL via CDS
 * @extends DBClientClass
 */
export default class extends DBClientClass {
    #clientType = 'postgres'
    #schema
    #searchPathSet = false
    /**
     * Create an instance of the PostgreSQL database client
     * @param {typeof import("prompt")} prompts - input prompts current value
     * @param {object} optionsCDS - CDS connection options
     */
    constructor(prompts, optionsCDS) {
        super(prompts, optionsCDS)
        base.debug(base.bundle.getText("debug.dbClientSpecificProfile", [prompts.profile]))
        this.#schema = super.schemaCalculation(prompts, optionsCDS)
    }

    /**
     * Get list of tables from PostgreSQL database
     * @returns {Promise<Array>} - array of table objects
     */
    async listTables() {
        base.debug(base.bundle.getText("debug.dbListTablesForClient", [this.#clientType]))
        const prompts = super.getPrompts()
        prompts.limit = base.validateLimit(prompts.limit)
        const tableName = super.adjustWildcard(prompts.table)

        if (!this.#searchPathSet) {
            await this.getDB().run(`SET search_path TO ${this.#schema}, information_schema`)
            this.#searchPathSet = true
        }
        let dbQuery = SELECT
            .columns(
                {ref:["table_schema"],as: `"SCHEMA_NAME"` },
                {ref:["table_name"],as:'TABLE_NAME'} )
            .from("tables")
            .where({ table_schema: this.#schema, table_name: { like: tableName }, table_type: 'BASE TABLE' })
            .limit(prompts.limit)

        if (prompts.debug) {
            base.debug(JSON.stringify(dbQuery))
        }
        let results = await this.getDB().run(dbQuery)
        return results
    }
}