import DBClientClass from "./index.js"
import * as base from '../base.js'

/**
 * Database Client for SQLite via CDS
 * @extends DBClientClass
 */
export default class extends DBClientClass {
    #clientType = 'sqlite'
    /**
     * Create an instance of the SQLite database client
     * @param {typeof import("prompt")} prompts - input prompts current value
     * @param {object} optionsCDS - CDS connection options
     */
    constructor(prompts, optionsCDS) {
        super(prompts, optionsCDS)
        base.debug(`Database client specific class for profile: ${prompts.profile}`)
    }

    /**
     * Get list of tables from SQLite database
     * @returns {Promise<Array>} - array of table objects
     */
    async listTables() {
        base.debug(`listTables for for ${this.#clientType}`)
        const prompts = super.getPrompts()
        prompts.limit = base.validateLimit(prompts.limit)
        const tableName = super.adjustWildcard(prompts.table)
        let dbQuery = SELECT
            .columns({ref:["name"],as:'TABLE_NAME'})
            .from("sqlite_schema")
            .where({ type: 'table', name: { like: tableName } })
            .limit(prompts.limit)
        base.debug(JSON.stringify(dbQuery))
        let results = await this.getDB().run(dbQuery)
        return results

    }
}