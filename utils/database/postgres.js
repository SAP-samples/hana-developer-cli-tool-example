/* eslint-disable no-undef */
import DBClientClass from "./index.js"
import * as base from '../base.js'

export default class extends DBClientClass {
    #clientType = 'postgres'
    #schema
    constructor(prompts, optionsCDS) {
        super(prompts, optionsCDS)
        base.debug(`Database client specific class for profile: ${prompts.profile}`)
        if (optionsCDS.credentials.schema) {
            this.#schema = optionsCDS.credentials.schema
        } else {
            this.#schema = "public"
        }
    }

    async listTables() {
        base.debug(`listTables for ${this.#clientType}`)
        const tableName = super.adjustWildcard(super.getPrompts().table)

        let dbQuery = SELECT
            .columns("table_schema",{ref:["table_name"],as:'TABLE_NAME'} )
            .from("tables")
            .where({ table_schema: this.#schema, table_name: { like: tableName }, table_type: 'BASE TABLE' })
            .limit(super.getPrompts().limit)

            base.debug(JSON.stringify(dbQuery))
        let results = await this.getDB().run(dbQuery)
        return results
    }
}