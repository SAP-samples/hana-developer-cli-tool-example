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
     */
    #prompts
    /**
     * CDS connection options
     * @type {Object}
     */
    #optionsCDS
    /**
     * CDS connection object - returned from cds.connect.to or hdb module instance
     * @type {Object}
     */
    #db
    /**
     * Database Client type/flavor
     * @type {String}
     */
    #clientType = 'generic'

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
            if(!optionsCDS || !optionsCDS.kind){
                throw new Error(`No CAP/CDS Project Configuration Found. Commands via Profiles can only be performed in CAP projects`)
            }
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
            // Don't call base.end() as it exits the process
            base.debug(`CDS Exit is Called`)
            cds.exit()
        }
        // Connection cleanup handled naturally
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
        return
    }

    /**
     * Execute single SQL Statement and directly return result set
     * @param {string} sql - SQL Statement
     * @returns {Promise<any>} - result set object
     */
    async execSQL(query){
        base.debug(`execSQL for ${this.#clientType}`)
        let results = await this.#db.run(query)
        return results
    }

    /**
    * Getter for Prompts Private Attribute
    * @returns {typeof import("prompt")} prompts - input prompts current value
    */    
    getPrompts() {
        return this.#prompts
    }

    /**
    * Getter for CDS or HDB database object Private Attribute
    * @returns @type {Object}
    */        
    getDB() {
        return this.#db
    }

    /**
    * Getter for database kind/flavor Private Attribute
    * @returns @type {String} Database Kind / Flavor
    */      
    getKind() {
        if (this.#optionsCDS) {
            return this.#optionsCDS.kind
        }
        return ""
    }

    /**
    * Setter for CDS or HDB database object Private Attribute
    * @param @type {Object} db
    */   
    setDB(db) {
        this.#db = db
    }

    /**
    * From Input parameters, calculate the schema that should be used for the rest of this operation
    * @param @type {typeof import("prompt")} prompts - input prompts current value 
    * @param @type {Object} optionsCDS - CDS based Connection Options
    */     
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