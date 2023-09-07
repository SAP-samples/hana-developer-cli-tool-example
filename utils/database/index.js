import * as base from '../base.js'
import cds from '@sap/cds'

/**
 * Database Client Abstract Super Class 
 * @class
 * @constructor
 * @public
 * @classdesc Database Client Abstract Level
 */
export default class {

    /**
     * prompts current value
     * @type {typeof import("prompt")}
     * @protected
     */
    #prompts
    #optionsCDS
    #db

    /**
     * Create an instance of the database client specific to the prompt profile
     * @param {typeof import("prompt")} prompts - input prompts current value
     */
    constructor(prompts, optionsCDS) {
        this.#prompts = prompts
        this.#optionsCDS = optionsCDS
        base.setPrompts(prompts)
        base.debug(optionsCDS)
        base.debug(`Database client generic class for profile: ${this.#prompts.profile}`)
    }

    static async getNewClient(prompts) {
        if (!prompts.profile) {
            prompts.profile = 'hybrid'  //Default to HANA if not selected from input
        }
        process.env.CDS_ENV = prompts.profile
        let optionsCDS = cds.env.requires.db
        let childClass = Object

        if (optionsCDS.kind === 'sqlite') {
            const { default: classAccess } = await import("./sqlite.js")
            childClass = new classAccess(prompts, optionsCDS)
        }
        else if (optionsCDS.kind === 'postgres') {
            const { default: classAccess } = await import("./postgres.js")
            childClass = new classAccess(prompts, optionsCDS)
        }
        else {
            throw new Error(`Unknown or Unsupported database client type: ${optionsCDS.kind}`)
        }
        return childClass
    }

    async cdsConnect() {
        this.#db = await cds.connect.to(this.#optionsCDS)
        return this.#db
    }

    async cdsConnectTargetSchema(schema) {
        let optionsCDS = this.#optionsCDS
        optionsCDS.credentials.schema = schema
        this.#db = await cds.connect.to(optionsCDS)
        return this.#db
    }

    adjustWildcard(input) {
        return input
    }

    async listTables() {

    }

    getPrompts() {
        return this.#prompts
    }

    getDB() {
        return this.#db
    }
}