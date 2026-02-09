/**
 * Database Client for PostgreSQL via CDS
 * @extends DBClientClass
 */
export default class _default extends DBClientClass {
    /**
     * Get list of tables from PostgreSQL database
     * @returns {Promise<Array>} - array of table objects
     */
    listTables(): Promise<any[]>;
    #private;
}
import DBClientClass from "./index.js";
