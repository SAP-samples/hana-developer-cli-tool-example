import * as base from '../base.js'
import cds from '@sap/cds'

/**
 * Database Client Abstract Super Class 
 * @class
 * @constructor
 * @public
 * @classdesc Database Client Abstract Level
 */
export default class dbClientClass {

    /**
     * prompts current value
     * @type {typeof import("prompt")}
     * @private
     */
    #prompts
    /**
     * CDS connection options
     * @type {Object}
     * @private
     */
    #optionsCDS
    /**
     * CDS connection object - returned from cds.connect.to or hdb module instance
     * @type {Object}
     * @private
     */
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

    /**
     * Static Factory Method to initialize the DB Client in your selected Flavor
     * @param {object} prompts - processed input prompts
     * @returns {Promise<dbClientClass>} childClass - flavor specific DB client class instance
     */
    static async getNewClient(prompts) {
        let childClass = Object
        if (!prompts.profile) { //HANA Without CDS
            prompts.profile = 'hybrid'  //Default to HANA if not selected from input
            const { default: classAccess } = await import("./hanaDirect.js")
            childClass = new classAccess(prompts)
        } else {  //CDS based connectivity
            process.env.CDS_ENV = prompts.profile
            process.env.NODE_ENV = prompts.profile
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

    /**
    * Connect to the target database
    * @returns {Promise<object>} cds connection object
    */
    async connect() {
        this.#db = await cds.connect.to(this.#optionsCDS)
        this.#connectLogging()
        return this.#db
    }

    /**
    * Disconnect from the target database
    */
    disconnect() {
        base.debug(`Disconnect`)
        base.debug(`In Gui: ${base.isGui(this.#prompts)}`)
        if (!base.isGui(this.#prompts)) {
            base.end()
            base.debug(`CDS Exit is Called`)
            cds.exit()
        } else {
            base.end()
        }
    }

    /**
    * Connect to the target database and set a specific Schema
    * @param {String} schema - Database Schema name
    * @returns {Promise<object>} cds connection object
    */
    async connectTargetSchema(schema) {
        let optionsCDS = this.#optionsCDS
        optionsCDS.credentials.schema = schema
        this.#db = await cds.connect.to(optionsCDS)
        this.#connectLogging()
        return this.#db
    }

    /**
    * Set logging parameters upon connect. Deactivate most logging unless in debug mode
    * @private
    */
    #connectLogging() {
        if (!this.#prompts.debug) {
            cds.log('pool', 'log')
        }
        if (base.verboseOutput(this.#prompts)) { console.log(`${base.bundle.getText("connFile2")} ${`CDS Profiles - ${this.#optionsCDS.kind}`} \n`) }
    }

    /**
    * Database specific wildcard handling 
    * @param {String} input - database object name that needs wildcard handling
    */
    adjustWildcard(input) {
        base.debug(`adjustWildcard`)
        if (input == "*") {
            input = "%"
        }
        return input
    }


    /** 
    * TableData as JSON
    * @typedef {Object} TableLine
    * @property {String} [SCHEMA_NAME]
    * @property {String} TABLE_NAME
    * @property {String} [TABLE_OID]
    * @property {String} [COMMENTS]
    */

    /** 
    * TableData as JSON
    * @typedef {Array.<TableLine>} TableData
    */

    /**
    * return a list of database tables
    * @returns {Promise<TableData>} table of database tables
    */
    async listTables() {

    }

    getPrompts() {
        return this.#prompts
    }

    getDB() {
        return this.#db
    }

    getKind() {
        if (this.#optionsCDS) {
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