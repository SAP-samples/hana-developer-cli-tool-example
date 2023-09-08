/**
 * Database Client Abstract Super Class
 * @class
 * @constructor
 * @public
 * @classdesc Database Client Abstract Level
 */
export default class dbClientClass {
    /**
     * Static Factory Method to initialize the DB Client in your selected Flavor
     * @param {object} prompts - processed input prompts
     * @returns {Promise<dbClientClass>} childClass - flavor specific DB client class instance
     */
    static getNewClient(prompts: object): Promise<dbClientClass>;
    /**
     * Create an instance of the database client specific to the prompt profile
     * @param {typeof import("prompt")} prompts - input prompts current value
     */
    constructor(prompts: any, optionsCDS: any);
    /**
    * Connect to the target database
    * @returns {Promise<object>} cds connection object
    */
    connect(): Promise<object>;
    /**
    * Disconnect from the target database
    */
    disconnect(): void;
    /**
    * Connect to the target database and set a specific Schema
    * @param {String} schema - Database Schema name
    * @returns {Promise<object>} cds connection object
    */
    connectTargetSchema(schema: string): Promise<object>;
    /**
    * Database specific wildcard handling
    * @param {String} input - database object name that needs wildcard handling
    */
    adjustWildcard(input: string): string;
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
    listTables(): Promise<{
        SCHEMA_NAME?: string;
        TABLE_NAME: string;
        TABLE_OID?: string;
        COMMENTS?: string;
    }[]>;
    /**
     * Execute single SQL Statement and directly return result set
     * @param {string} sql - SQL Statement
     * @returns {Promise<any>} - result set object
     */
    execSQL(query: any): Promise<any>;
    /**
    * Getter for Prompts Private Attribute
    * @returns {typeof import("prompt")} prompts - input prompts current value
    */
    getPrompts(): any;
    /**
    * Getter for CDS or HDB database object Private Attribute
    * @returns @type {Object}
    */
    getDB(): any;
    /**
    * Getter for database kind/flavor Private Attribute
    * @returns @type {String} Database Kind / Flavor
    */
    getKind(): any;
    /**
    * Setter for CDS or HDB database object Private Attribute
    * @param @type {Object} db
    */
    setDB(db: any): void;
    /**
    * From Input parameters, calculate the schema that should be used for the rest of this operation
    * @param @type {typeof import("prompt")} prompts - input prompts current value
    * @param @type {Object} optionsCDS - CDS based Connection Options
    */
    schemaCalculation(prompts: any, optionsCDS: any): string;
    #private;
}
