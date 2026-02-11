import DBClientClass from "./index.js"
import * as base from '../base.js'

export default class extends DBClientClass {
    #clientType = 'hanaCDS'
    #schema
    constructor(prompts, optionsCDS) {
        super(prompts, optionsCDS)
        base.debug(`Database client specific class for profile: ${prompts.profile}`)
        this.#schema = super.schemaCalculation(prompts, optionsCDS)
    }

    async listTables() {
        base.debug(`listTables for ${this.#clientType}`)
        const prompts = super.getPrompts()
        prompts.limit = base.validateLimit(prompts.limit)
        const tableName = super.adjustWildcard(prompts.table)
        let dbQuery = SELECT
            .columns("SCHEMA_NAME", "TABLE_NAME",
            {ref:["TABLE_OID"], as:'TABLE_OID', cast: {type:"cds.String"}},"COMMENTS" )
            .from("TABLES")
            .where({ SCHEMA_NAME: {like: this.#schema}, TABLE_NAME: { like: tableName } })
            .orderBy("SCHEMA_NAME", "TABLE_NAME")
            .limit(prompts.limit)

        base.debug(JSON.stringify(dbQuery))
        let db = this.getDB()
        let results = await db.run(dbQuery)
        return results
    }
}