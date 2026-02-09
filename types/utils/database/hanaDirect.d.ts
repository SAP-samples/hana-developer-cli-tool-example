/**
 * Database Client for HANA Direct Connection (non-CDS)
 * @extends DBClientClass
 */
export default class _default extends DBClientClass {
    /**
     * Create an instance of the HANA Direct database client
     * @param {typeof import("prompt")} prompts - input prompts current value
     */
    constructor(prompts: typeof import("prompt"));
    /**
     * Get list of tables from HANA database
     * @returns {Promise<Array>} - array of table objects
     */
    listTables(): Promise<any[]>;
    /**
     * Execute SQL query directly on HANA
     * @param {string} query - SQL query string
     * @returns {Promise<any>} - query results
     */
    execSQL(query: string): Promise<any>;
    #private;
}
import DBClientClass from "./index.js";
