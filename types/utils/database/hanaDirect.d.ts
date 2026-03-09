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
     * Report database kind for direct HANA connections
     * @returns {string}
     */
    getKind(): string;
    #private;
}
import DBClientClass from "./index.js";
