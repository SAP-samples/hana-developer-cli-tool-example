/**
 * Database Client for PostgreSQL via CDS
 * @extends DBClientClass
 */
export default class _default extends DBClientClass {
    /**
     * Create an instance of the PostgreSQL database client
     * @param {typeof import("prompt")} prompts - input prompts current value
     * @param {object} optionsCDS - CDS connection options
     */
    constructor(prompts: typeof import("prompt"), optionsCDS: object);
    /**
     * Get list of tables from PostgreSQL database
     * @returns {Promise<Array>} - array of table objects
     */
    listTables(): Promise<any[]>;
    #private;
}
import DBClientClass from "./index.js";
