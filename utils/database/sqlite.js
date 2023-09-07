/* eslint-disable no-undef */
import DBClientClass from "./index.js"
import * as base from '../base.js'

export default class extends DBClientClass {
    #clientType = 'sqlite'
    constructor(prompts, optionsCDS) {
        super(prompts, optionsCDS)
        base.debug(`Database client specific class for profile: ${prompts.profile}`)
    }

    adjustWildcard(input) {
        base.debug(`adjustWildcard for ${this.#clientType}`)
        input = super.adjustWildcard(input)
        if (input == "*") {
            input = "%"
        }
        return input
    }

    async listTables() {
        base.debug(`listTables for for ${this.#clientType}`)
        const tableName = this.adjustWildcard(super.getPrompts().table)
        let dbQuery = SELECT
            .columns("name")
            .from("sqlite_schema")
            .where({ type: 'table', name: { like: tableName } })
            .limit(super.getPrompts().limit)
        base.debug(dbQuery)
        let results = await this.getDB().run(dbQuery)
        return results

    }
}