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
        let childClass = Object
        if (!prompts.profile) { //HANA Without CDS
            prompts.profile = 'hybrid'  //Default to HANA if not selected from input
            const { default: classAccess } = await import("./hanaDirect.js")
            childClass = new classAccess(prompts)
        } else {  //CDS based connectivity
            process.env.CDS_ENV = prompts.profile
            let optionsCDS = cds.env.requires.db
            if (optionsCDS.kind === 'sqlite') {  //SQLite CDS
                const { default: classAccess } = await import("./sqlite.js")
                childClass = new classAccess(prompts, optionsCDS)
            }
            else if (optionsCDS.kind === 'postgres') { //PostgresSQL CDS
                const { default: classAccess } = await import("./postgres.js")
                childClass = new classAccess(prompts, optionsCDS)
            }
            else if (optionsCDS.kind === 'hana') { //HANA CDS
                const { default: classAccess } = await import("./hanaCDS.js")
                childClass = new classAccess(prompts, optionsCDS)
            }
            else {
                throw new Error(`Unknown or Unsupported database client type: ${optionsCDS.kind}`)
            }
        }
        return childClass
    }

    async connect() {
        this.#db = await cds.connect.to(this.#optionsCDS)
        this.#connectLogging()
        return this.#db
    }

    disconnect() {
        base.debug(`Disconnect`)
        base.end()
        cds.exit()
    }

    async connectTargetSchema(schema) {
        let optionsCDS = this.#optionsCDS
        optionsCDS.credentials.schema = schema
        this.#db = await cds.connect.to(optionsCDS)
        this.#connectLogging()
        return this.#db
    }

    #connectLogging() {
        if (!this.#prompts.debug) {
            cds.log('pool', 'log')
        }
        if (base.verboseOutput(this.#prompts)) { console.log(`${base.bundle.getText("connFile2")} ${`CDS Profiles - ${this.#optionsCDS.kind}`} \n`) }
    }

    adjustWildcard(input) {
        base.debug(`adjustWildcard`)
        if (input == "*") {
            input = "%"
        }
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

    getKind(){
        if(this.#optionsCDS){
            return this.#optionsCDS.kind
        }
    }

    setDB(db) {
        this.#db = db
    }

    schemaCalculation(prompts, optionsCDS) {
        let schema = ""
        if (!prompts.schema || prompts.schema === '**CURRENT_SCHEMA**') {
            if (optionsCDS && optionsCDS.credentials && optionsCDS.credentials.schema) {
                schema = optionsCDS.credentials.schema
            } else {
                schema = "public"
            }
        }
        else if (prompts.schema === '*') {
            schema = "%"
        }
        else {
            schema = prompts.schema
        }
        return schema
    }
}