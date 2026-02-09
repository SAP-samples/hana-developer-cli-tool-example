/**
 * Database Client for SQLite via CDS
 * @extends DBClientClass
 */
export default class _default extends DBClientClass {
    /**
     * Get list of tables from SQLite database
     * @returns {Promise<Array>} - array of table objects
     */
    listTables(): Promise<any[]>;
    #private;
}
import DBClientClass from "./index.js";
