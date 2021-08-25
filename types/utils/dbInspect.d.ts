export namespace options { }
export namespace results { }
/**
 * Get Table Constraints
 */
export type objType = {
    SCHEMA_NAME: string;
    TABLE_NAME: string;
};
/**
 * Return the HANA DB Version
 * @param {object} db - Database Connection
 * @returns {Promise<object>}
 */
export function getHANAVersion(db: object): Promise<object>;
/**
 * Get DB View details
 * @param {object} db - Database Connection
 * @param {string} scheam - Schema
 * @param {string} viewId - View Unique ID
 * @returns {Promise<object>}
 */
export function getView(db: object, scheam: string, viewId: string): Promise<object>;
/**
 * Get DB Object Definition
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {*} Id - Object ID
 * @returns {Promise<string>}
 */
export function getDef(db: object, schema: string, Id: any): Promise<string>;
/**
 * Get View Fields and Metadata
 * @param {object} db - Database Connection
 * @param {string} viewOid - View Unique ID
 * @returns {Promise<object>}
 */
export function getViewFields(db: object, viewOid: string): Promise<object>;
/**
 * Get DB Table Details
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} tableId - Table Unqiue ID
 * @returns {Promise<object>}
 */
export function getTable(db: object, schema: string, tableId: string): Promise<object>;
/**
 * Get Table Fields and Metadata
 * @param {object} db - Database Connection
 * @param {string} tableOid - Table Unique ID
 * @returns {Promise<object>}
 */
export function getTableFields(db: object, tableOid: string): Promise<object>;
/**
 * Get Table Constraints
 * @typedef {{SCHEMA_NAME: string, TABLE_NAME: string}} objType
 * @param {object} db - Database Connection
 * @param {Array<objType>} object
 * @returns
 */
export function getConstraints(db: object, object: Array<objType>): Promise<any>;
/**
 * Get Stored Procedure Details
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} procedure - Procedure name
 * @returns {Promise<object>}
 */
export function getProcedure(db: object, schema: string, procedure: string): Promise<object>;
/**
 * Get Procedure Parameters
 * @param {object} db - Database Connection
 * @param {string} procOid - Procedure unique ID
 * @returns {Promise<object>}
 */
export function getProcedurePrams(db: object, procOid: string): Promise<object>;
export function getProcedurePramCols(db: any, procOid: any): Promise<any>;
/**
 * Get Function details
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} functionName - Function Name
 * @returns {Promise<object>}
 */
export function getFunction(db: object, schema: string, functionName: string): Promise<object>;
/**
 * Get Function Parameters
 * @param {object} db - Database Connection
 * @param {string} funcOid - Function Unique ID
 * @returns {Promise<object>}
 */
export function getFunctionPrams(db: object, funcOid: string): Promise<object>;
/**
 * Get Function Parameter Columns
 * @param {object} db - Database Connection
 * @param {string} funcOid - Function Unique ID
 * @returns {Promise<object>}
 */
export function getFunctionPramCols(db: object, funcOid: string): Promise<object>;
/**
 * Convert DB Object Metadata to CDS
 * @param {object} db - Database Connection
 * @param {object} object - DB Object Details
 * @param {object} fields - Object Fields
 * @param {object} constraints - Object Contstraints
 * @param {string} type - DB Object type
 * @param {string} parent - Calling context which impacts formatting
 * @returns {Promise<string>}
 */
export function formatCDS(db: object, object: object, fields: object, constraints: object, type: string, parent: string): Promise<string>;
/**
 * Get Geo Columns requires special lookup and details
 * @param {object} db - Database Connection
 * @param {object} object - DB Object Details
 * @param {object} field - Object Field
 * @param {string} type - View or table
 * @returns {Promise<string>} GEO SRS ID
 */
export function getGeoColumns(db: object, object: object, field: object, type: string): Promise<string>;
