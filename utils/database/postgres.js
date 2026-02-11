import DBClientClass from "./index.js"
import * as base from '../base.js'

/**
 * Database Client for PostgreSQL via CDS
 * @extends DBClientClass
 */
export default class extends DBClientClass {
    #clientType = 'postgres'
    #schema
    /**
     * Create an instance of the PostgreSQL database client
     * @param {typeof import("prompt")} prompts - input prompts current value
     * @param {object} optionsCDS - CDS connection options
     */
    constructor(prompts, optionsCDS) {
        super(prompts, optionsCDS)
        base.debug(`Database client specific class for profile: ${prompts.profile}`)
        this.#schema = super.schemaCalculation(prompts, optionsCDS)
    }

    /**
     * Get list of tables from PostgreSQL database
     * @returns {Promise<Array>} - array of table objects
     */
    async listTables() {
        base.debug(`listTables for ${this.#clientType}`)
        const prompts = super.getPrompts()
        prompts.limit = base.validateLimit(prompts.limit)
        const tableName = super.adjustWildcard(prompts.table)

        await this.getDB().run(`SET search_path TO ${this.#schema}, information_schema`)
        let dbQuery = SELECT
            .columns(
                {ref:["table_schema"],as: `"SCHEMA_NAME"` },
                {ref:["table_name"],as:'TABLE_NAME'} )
            .from("tables")
            .where({ table_schema: this.#schema, table_name: { like: tableName }, table_type: 'BASE TABLE' })
            .limit(prompts.limit)

            base.debug(JSON.stringify(dbQuery))
        let results = await this.getDB().run(dbQuery)
        return results
    }
}