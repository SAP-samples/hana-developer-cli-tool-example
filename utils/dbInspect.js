/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
// @ts-check

/**
 * @module dbInspect - Database Object Dynamic Inspection and Metadata processing
 */
import * as base from "./base.js"
const bundle = base.bundle

// Version cache to avoid repeated database queries
let cachedVersion = null

/**
 * Return the HANA DB Version
 * @param {object} db - Database Connection
 * @returns {Promise<object>}
 */
export async function getHANAVersion(db) {
	base.debug(bundle.getText("debug.call", ["getHANAVersion"]))
	// Return cached version if available
	if (cachedVersion) {
		return cachedVersion
	}
	const statement = await db.preparePromisified(
		`SELECT *
                 FROM M_DATABASE`)
	const object = await db.statementExecPromisified(statement, [])
	if (object.length < 1) {
		throw new Error(bundle.getText("errMDB"))
	}
	object[0].versionMajor = object[0].VERSION.charAt(0)
	cachedVersion = object[0]
	base.debug(bundle.getText("debug.hanaVersion", [JSON.stringify(object)]))
	return cachedVersion
}


/**
 * Check if a view is a Calculation View
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} viewId - View Unique ID
 * @returns {Promise<boolean>}
 */
export async function isCalculationView(db, schema, viewId) {
	base.debug(bundle.getText("debug.callWithParams", ["isCalculationView", `${schema} ${viewId}`]))
	const vers = await getHANAVersion(db)
	if (vers.versionMajor < 2) {
		return false
	}
	// Try lookup by both QUALIFIED_NAME and VIEW_NAME to handle both identification methods
	const statementString = `SELECT CUBE_ID, SCHEMA_NAME, QUALIFIED_NAME, VIEW_NAME, CUBE_TYPE, IS_HDI_OBJECT
	   FROM _SYS_BI.BIMC_REPORTABLE_VIEWS
	   WHERE SCHEMA_NAME LIKE ?
	     AND (QUALIFIED_NAME = ? OR VIEW_NAME = ?)`
	const statement = await db.preparePromisified(statementString)
	const object = await db.statementExecPromisified(statement, [schema, viewId, viewId])
	return object.length >= 1
}

/**
 * Get DB View details
 * @param {object} db - Database Connection
 * @param {string} scheam - Schema
 * @param {string} viewId - View Unique ID
 * @returns {Promise<object>}
 */
export async function getView(db, scheam, viewId) {
	base.debug(bundle.getText("debug.callWithParams", ["getView", `${scheam} ${viewId}`]))
	//Select View
	let statementString = ``
	const vers = await getHANAVersion(db)
	if (vers.versionMajor < 2) {
		statementString = `SELECT SCHEMA_NAME, VIEW_NAME, VIEW_OID, COMMENTS, IS_COLUMN_VIEW, VIEW_TYPE, HAS_STRUCTURED_PRIVILEGE_CHECK, HAS_CACHE
		FROM VIEWS 
		 WHERE SCHEMA_NAME LIKE ?
		   AND VIEW_NAME = ?`
	} else {
		statementString = `SELECT SCHEMA_NAME, VIEW_NAME, VIEW_OID, COMMENTS, IS_COLUMN_VIEW, VIEW_TYPE, HAS_STRUCTURED_PRIVILEGE_CHECK, HAS_PARAMETERS, HAS_CACHE, CREATE_TIME
		FROM VIEWS 
		 WHERE SCHEMA_NAME LIKE ?
		   AND VIEW_NAME = ?`
	}
	const statement = await db.preparePromisified(statementString)
	const object = await db.statementExecPromisified(statement, [scheam, viewId])
	if (object.length < 1) {
		throw new Error(bundle.getText("errInput"))
	}
	return object
}


/**
 * Get DB Object Definition
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {*} Id - Object ID
 * @returns {Promise<string>}
 */
export async function getDef(db, schema, Id) {
	base.debug(bundle.getText("debug.callWithParams", ["getDef", `${schema} ${Id}`]))
	//Select View
	const inputParams = {
		SCHEMA: `"${schema}"`,
		OBJECT: `"${Id}"`
	}

	const sp = await db.loadProcedurePromisified("SYS", "GET_OBJECT_DEFINITION")
	const object = await db.callProcedurePromisified(sp, inputParams)
	if (object.length < 1) {
		throw new Error(bundle.getText("errObj"))
	}
	const output = object.results[0].OBJECT_CREATION_STATEMENT.toString().replace(/,/g, ",\n")
	return output
}

/**
 * Get View Fields and Metadata
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} viewId - View Unique ID
 * @param {string} viewOid - View Unique ID
 * @returns {Promise<object>}
 */
export async function getCalcViewFields(db, schema, viewId, viewOid) {
	base.debug(bundle.getText("debug.callWithParams", ["getCalcViewFields", `${schema} ${viewId}`]))
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT SCHEMA_NAME, QUALIFIED_NAME AS VIEW_NAME, NULL AS VIEW_OID, COLUMN_NAME, 
				"ORDER" AS POSITION, DESC_TYPE_D AS DATA_TYPE_NAME, 0 AS OFFSET, 0 AS LENGTH, SCALE, 
				IS_NULLABLE, NULL AS DEFAULT_VALUE, NULL AS COLUMN_ID, COLUMN_CAPTION AS COMMENTS, KEY_COLUMN_NAME
         FROM _SYS_BI.BIMC_DIMENSION_VIEW
		 		  WHERE SCHEMA_NAME LIKE ?
				    AND QUALIFIED_NAME = ? ORDER BY POSITION`)
	let fields = await db.statementExecPromisified(statement, [schema, viewId])
	if (fields.length < 1) {
		const statementString = `SELECT CUBE_ID, SCHEMA_NAME, QUALIFIED_NAME, VIEW_NAME, CUBE_TYPE, IS_HDI_OBJECT
							       FROM _SYS_BI.BIMC_REPORTABLE_VIEWS
	   							  WHERE SCHEMA_NAME LIKE ?
									AND VIEW_NAME = ?`
		const statementLookup = await db.preparePromisified(statementString)
		const object = await db.statementExecPromisified(statementLookup, [schema, viewId])
		if (object.length >= 1) {
			const lookupStatement = await db.preparePromisified(
				`SELECT SCHEMA_NAME, QUALIFIED_NAME AS VIEW_NAME, NULL AS VIEW_OID, COLUMN_NAME, 
			"ORDER" AS POSITION, DESC_TYPE_D AS DATA_TYPE_NAME, 0 AS OFFSET, 0 AS LENGTH, SCALE, 
			IS_NULLABLE, NULL AS DEFAULT_VALUE, NULL AS COLUMN_ID, COLUMN_CAPTION AS COMMENTS, KEY_COLUMN_NAME
	 			FROM _SYS_BI.BIMC_DIMENSION_VIEW
			   WHERE SCHEMA_NAME LIKE ?
				 AND QUALIFIED_NAME = ? ORDER BY POSITION`)
			fields = await db.statementExecPromisified(lookupStatement, [schema, object[0].QUALIFIED_NAME])
		}
	}
	// Batch lookup all field details in single query instead of N+1 queries
	if (fields.length > 0) {
		const columnNames = fields.map(f => `'${f.COLUMN_NAME}'`).join(', ')
		const batchStatement = await db.preparePromisified(
			`SELECT COLUMN_NAME, OFFSET, LENGTH, DEFAULT_VALUE, DATA_TYPE_NAME
			   FROM VIEW_COLUMNS 
		      WHERE VIEW_OID = ? AND COLUMN_NAME IN (${columnNames})`)
		const sqlFields = await db.statementExecPromisified(batchStatement, [viewOid])
		// Create lookup map for O(1) access instead of array search
		const sqlFieldMap = new Map(sqlFields.map(f => [f.COLUMN_NAME, f]))
		for (let field of fields) {
			const sqlField = sqlFieldMap.get(field.COLUMN_NAME)
			if (sqlField) {
				field.OFFSET = sqlField.OFFSET
				field.LENGTH = sqlField.LENGTH
				field.DEFAULT_VALUE = sqlField.DEFAULT_VALUE
				field.DATA_TYPE_NAME = sqlField.DATA_TYPE_NAME
			}
		}
	}
	return fields
}

/**
 * Get View Fields and Metadata
 * @param {object} db - Database Connection
 * @param {string} viewOid - View Unique ID
 * @returns {Promise<object>}
 */
export async function getViewFields(db, viewOid) {
	base.debug(bundle.getText("debug.callWithParams", ["getViewFields", viewOid]))
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT SCHEMA_NAME, VIEW_NAME, VIEW_OID, COLUMN_NAME, POSITION, DATA_TYPE_NAME, OFFSET, LENGTH, SCALE, IS_NULLABLE, DEFAULT_VALUE, COLUMN_ID, COMMENTS, NULL as KEY_COLUMN_NAME
         FROM VIEW_COLUMNS 
		WHERE VIEW_OID = ? ORDER BY POSITION`)
	const fields = await db.statementExecPromisified(statement, [viewOid])
	return fields
}

/**
 * Get View Parameters and Metadata
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} viewId - View Unique ID
 * @param {string} viewOid - View Unique ID
 * @returns {Promise<object>}
 */
export async function getCalcViewParameters(db, schema, viewId, viewOid) {
	base.debug(bundle.getText("debug.callWithParams", ["getCalcViewParameters", `${schema} ${viewId}`]))
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT SCHEMA_NAME, QUALIFIED_NAME as "VIEW_NAME", VARIABLE_NAME AS "PARAMETER_NAME",
		        COLUMN_TYPE, COLUMN_TYPE_D as "DATA_TYPE_NAME",
		        COLUMN_SQL_TYPE, VALUE_TYPE, MANDATORY, DESCRIPTION, 
				PLACEHOLDER_NAME, DEFAULT_VALUE, SCHEMA_NAME, QUALIFIED_NAME, IS_INPUT_ENABLED,
				VARIABLE_TYPE, VARIABLE_SUB_TYPE
         FROM _SYS_BI.BIMC_VARIABLE_VIEW
		 		  WHERE SCHEMA_NAME LIKE ?
				    AND QUALIFIED_NAME = ?`)
	let parameters = await db.statementExecPromisified(statement, [schema, viewId])
	for (let parameter of parameters) {
		// Use regex to extract length from type (more reliable than split)
		const lengthMatch = parameter.COLUMN_SQL_TYPE.match(/\(([^)]+)\)/)
		parameter.LENGTH = lengthMatch ? lengthMatch[1] : 0
	}
	
	return parameters
}

/**
 * Get View Parameters and Metadata
 * @param {object} db - Database Connection
 * @param {string} viewOid - View Unique ID
 * @returns {Promise<object>}
 */
export async function getViewParameters(db, viewOid) {
	base.debug(bundle.getText("debug.callWithParams", ["getViewParameters", viewOid]))
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT SCHEMA_NAME, VIEW_NAME, VIEW_OID, PARAMETER_NAME, DATA_TYPE_ID, DATA_TYPE_NAME,
		        LENGTH, SCALE, POSITION, HAS_DEFAULT_VALUE
         FROM VIEW_PARAMETERS
	    WHERE VIEW_OID = ?`)
	let parameters = await db.statementExecPromisified(statement, [viewOid])	
	return parameters
}

/**
 * Get DB Table Details
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} tableId - Table Unqiue ID
 * @returns {Promise<object>}
 */
export async function getTable(db, schema, tableId) {
	base.debug(bundle.getText("debug.callWithParams", ["getTable", `${schema} ${tableId}`]))
	//Select Table
	let statementString = ``
		const vers = await getHANAVersion(db)
	if (vers.versionMajor < 2) {
		statementString = `SELECT SCHEMA_NAME, TABLE_NAME, TABLE_OID, TABLE_TYPE, HAS_PRIMARY_KEY, UNLOAD_PRIORITY, IS_PRELOAD
		FROM TABLES 
		WHERE SCHEMA_NAME LIKE ?
		  AND TABLE_NAME = ?`
	} else {
		statementString = `SELECT SCHEMA_NAME, TABLE_NAME, TABLE_OID, TABLE_TYPE, HAS_PRIMARY_KEY, UNLOAD_PRIORITY, IS_PRELOAD, CREATE_TIME
		FROM TABLES 
		WHERE SCHEMA_NAME LIKE ?
		  AND TABLE_NAME = ?`
	}
	const statement = await db.preparePromisified(statementString)
	const object = await db.statementExecPromisified(statement, [schema, tableId])
	if (object.length < 1) {
		throw new Error(bundle.getText("errTable"))
	}
	return object
}

/**
 * Get Table Fields and Metadata
 * @param {object} db - Database Connection
 * @param {string} tableOid - Table Unique ID
 * @returns {Promise<object>}
 */
export async function getTableFields(db, tableOid) {
	base.debug(bundle.getText("debug.callWithParams", ["getTableFields", tableOid]))
	//Select Fields
	let statementString = ``
	const vers = await getHANAVersion(db)
	if (vers.versionMajor < 2) {
		statementString =
			`SELECT SCHEMA_NAME, TABLE_NAME, TABLE_OID, COLUMN_NAME, POSITION, DATA_TYPE_NAME, OFFSET, LENGTH, SCALE, IS_NULLABLE, DEFAULT_VALUE, COLUMN_ID, COMMENTS
		FROM TABLE_COLUMNS 
				WHERE TABLE_OID = ? ORDER BY POSITION`
	} else {
		statementString =
			`SELECT SCHEMA_NAME, TABLE_NAME, TABLE_OID, COLUMN_NAME, POSITION, DATA_TYPE_NAME, OFFSET, LENGTH, SCALE, IS_NULLABLE, DEFAULT_VALUE, COLUMN_ID, COMMENTS
		FROM TABLE_COLUMNS 
				WHERE TABLE_OID = ? ORDER BY POSITION`
	}
	const statement = await db.preparePromisified(statementString)
	const fields = await db.statementExecPromisified(statement, [tableOid])
	return fields
}

/**
 * Get Table Constraints 
 * @typedef {{SCHEMA_NAME: string, TABLE_NAME: string}} objType
 * @param {object} db - Database Connection 
 * @param {Array<objType>} object 
 * @returns 
 */
export async function getConstraints(db, object) {
	base.debug(bundle.getText("debug.callWithParams", ["getConstraints", JSON.stringify(object)]))
	//Select Constraints
	const statement = await db.preparePromisified(
		`SELECT * from CONSTRAINTS 
	          WHERE SCHEMA_NAME LIKE ? 
	           AND TABLE_NAME = ? 
	           AND IS_PRIMARY_KEY = ? 
	         ORDER BY POSITION `
	);
	const constraints = await db.statementExecPromisified(statement, [object[0].SCHEMA_NAME, object[0].TABLE_NAME, "TRUE"])
	return constraints
}

/**
 * Get Stored Procedure Details
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} procedure - Procedure name
 * @returns {Promise<object>}
 */
export async function getProcedure(db, schema, procedure) {
	base.debug(bundle.getText("debug.callWithParams", ["getProcedure", `${schema} ${procedure}`]))
	//Select View
	let statementString = ``
	const vers = await getHANAVersion(db)
	if (vers.versionMajor < 2) {
		statementString = `SELECT SCHEMA_NAME, PROCEDURE_NAME, PROCEDURE_OID, SQL_SECURITY, DEFAULT_SCHEMA_NAME,
		INPUT_PARAMETER_COUNT, OUTPUT_PARAMETER_COUNT, INOUT_PARAMETER_COUNT, RESULT_SET_COUNT,
		PROCEDURE_TYPE, READ_ONLY, IS_VALID, IS_HEADER_ONLY, OWNER_NAME
		FROM PROCEDURES 
		WHERE SCHEMA_NAME LIKE ?
		  AND PROCEDURE_NAME = ?`
	} else {
		statementString = `SELECT SCHEMA_NAME, PROCEDURE_NAME, PROCEDURE_OID, SQL_SECURITY, DEFAULT_SCHEMA_NAME,
		INPUT_PARAMETER_COUNT, OUTPUT_PARAMETER_COUNT, INOUT_PARAMETER_COUNT, RESULT_SET_COUNT,
		IS_ENCRYPTED, PROCEDURE_TYPE, READ_ONLY, IS_VALID, IS_HEADER_ONLY, OWNER_NAME, CREATE_TIME
		FROM PROCEDURES 
		WHERE SCHEMA_NAME LIKE ?
		  AND PROCEDURE_NAME = ?`
	}

	const statement = await db.preparePromisified(statementString)
	const object = await db.statementExecPromisified(statement, [schema, procedure])
	if (object.length < 1) {
		throw new Error(bundle.getText("errProc"))
	}
	return object
}

/**
 * Get Procedure Parameters
 * @param {object} db - Database Connection
 * @param {string} procOid - Procedure unique ID
 * @returns {Promise<object>}
 */
export async function getProcedurePrams(db, procOid) {
	base.debug(bundle.getText("debug.callWithParams", ["getProcedurePrams", procOid]))
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT PARAMETER_NAME, DATA_TYPE_NAME, LENGTH, SCALE, POSITION, TABLE_TYPE_NAME, PARAMETER_TYPE, HAS_DEFAULT_VALUE, IS_NULLABLE
          FROM PROCEDURE_PARAMETERS 
				  WHERE PROCEDURE_OID = ?
				  ORDER BY POSITION`)
	const fields = await db.statementExecPromisified(statement, [procOid])
	return fields
}


export async function getProcedurePramCols(db, procOid) {
	base.debug(bundle.getText("debug.callWithParams", ["getProcedurePramCols", procOid]))
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT PARAMETER_NAME, PARAMETER_POSITION, COLUMN_NAME, POSITION, DATA_TYPE_NAME, LENGTH, SCALE, IS_NULLABLE 
          FROM PROCEDURE_PARAMETER_COLUMNS 
				  WHERE PROCEDURE_OID = ?
				  ORDER BY PARAMETER_POSITION, POSITION`)
	const fields = await db.statementExecPromisified(statement, [procOid])
	return fields
}

/**
 * Get Function details
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} functionName - Function Name
 * @returns {Promise<object>}
 */
export async function getFunction(db, schema, functionName) {
	base.debug(bundle.getText("debug.callWithParams", ["getFunction", `${schema} ${functionName}`]))
	//Select Functions
	let statementString = ``
	const vers = await getHANAVersion(db)
	if (vers.versionMajor < 2) {
		statementString = `SELECT SCHEMA_NAME, FUNCTION_NAME, FUNCTION_OID, SQL_SECURITY, DEFAULT_SCHEMA_NAME,
		INPUT_PARAMETER_COUNT, RETURN_VALUE_COUNT,
		FUNCTION_TYPE, FUNCTION_USAGE_TYPE, IS_VALID, IS_HEADER_ONLY, OWNER_NAME
		FROM FUNCTIONS 
		WHERE SCHEMA_NAME LIKE ?
		  AND FUNCTION_NAME = ?`
	} else {
		statementString = `SELECT SCHEMA_NAME, FUNCTION_NAME, FUNCTION_OID, SQL_SECURITY, DEFAULT_SCHEMA_NAME,
		INPUT_PARAMETER_COUNT, RETURN_VALUE_COUNT,
		IS_ENCRYPTED, FUNCTION_TYPE, FUNCTION_USAGE_TYPE, IS_VALID, IS_HEADER_ONLY, OWNER_NAME, CREATE_TIME
		FROM FUNCTIONS 
		WHERE SCHEMA_NAME LIKE ?
		  AND FUNCTION_NAME = ?`
	}

	const statement = await db.preparePromisified(statementString)
	const object = await db.statementExecPromisified(statement, [schema, functionName])
	if (object.length < 1) {
		throw new Error(bundle.getText("errFunc"))
	}
	return object
}

/**
 * Get Function Parameters
 * @param {object} db - Database Connection
 * @param {string} funcOid - Function Unique ID
 * @returns {Promise<object>}
 */
export async function getFunctionPrams(db, funcOid) {
	base.debug(bundle.getText("debug.callWithParams", ["getFunctionPrams", funcOid]))
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT PARAMETER_NAME, DATA_TYPE_NAME, LENGTH, SCALE, POSITION, TABLE_TYPE_NAME, PARAMETER_TYPE, HAS_DEFAULT_VALUE, IS_NULLABLE
          FROM FUNCTION_PARAMETERS 
				  WHERE FUNCTION_OID = ?
				  ORDER BY POSITION`)
	const fields = await db.statementExecPromisified(statement, [funcOid])
	return fields
}

/**
 * Get Function Parameter Columns
 * @param {object} db - Database Connection 
 * @param {string} funcOid - Function Unique ID
 * @returns {Promise<object>}
 */
export async function getFunctionPramCols(db, funcOid) {
	base.debug(bundle.getText("debug.callWithParams", ["getFunctionPramCols", funcOid]))
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT PARAMETER_NAME, PARAMETER_POSITION, COLUMN_NAME, POSITION, DATA_TYPE_NAME, LENGTH, SCALE, IS_NULLABLE 
          FROM FUNCTION_PARAMETER_COLUMNS 
				  WHERE FUNCTION_OID = ?
				  ORDER BY PARAMETER_POSITION, POSITION`)
	const fields = await db.statementExecPromisified(statement, [funcOid])
	return fields
}

// Data-driven type mapping to eliminate ~300 lines of duplicated switch statements
const typeMap = {
	// Common types for both useHanaTypes modes
	NVARCHAR: (len) => `String(${len})`,
	NCLOB: () => "LargeString",
	VARBINARY: (len) => `Binary(${len})`,
	BLOB: () => "LargeBinary",
	INTEGER: () => "Integer",
	BIGINT: () => "Integer64",
	DECIMAL: (len, scale) => scale ? `Decimal(${len}, ${scale})` : `Decimal(${len})`,
	DOUBLE: () => "Double",
	DAYDATE: () => "Date",
	DATE: () => "Date",
	TIME: () => "Time",
	SECONDDATE: () => "String",
	TIMESTAMP: () => "Timestamp",
	BOOLEAN: () => "Boolean",
	REAL_VECTOR: () => "Vector",
	// Standard mode only types
	VARCHAR: (len) => `String(${len})`,
	TINYINT: () => "UInt8",
	SMALLINT: () => "Int16"
}

const hanaTypeMap = {
	// HANA-specific types when useHanaTypes = true
	SMALLINT: () => "hana.SMALLINT",
	TINYINT: () => "hana.TINYINT",
	SMALLDECIMAL: () => "hana.SMALLDECIMAL",
	REAL: () => "hana.REAL",
	CLOB: () => "hana.CLOB",
	CHAR: (len) => `hana.CHAR(${len})`,
	NCHAR: (len) => `hana.NCHAR(${len})`,
	BINARY: (len) => `hana.BINARY(${len})`,
	VARCHAR: (len) => `hana.VARCHAR(${len})`
}

/**
 * Get CDS type string for a field, eliminating massive duplicate switch statements
 * @param {string} dataType - HANA data type name
 * @param {number} length - Type length parameter
 * @param {number} scale - Type scale (for DECIMAL)
 * @param {boolean} useHanaTypes - Whether to use HANA-specific type names
 * @param {string|number|null} geoSrsId - SRS ID for geometry types
 * @returns {string} CDS type definition
 */
function getTypeMapping(dataType, length, scale, useHanaTypes, geoSrsId) {
	// Handle geometry types with SRS ID
	if (geoSrsId !== null && geoSrsId !== undefined) {
		return `hana.${dataType}(${geoSrsId})`
	}

	// Select appropriate type map based on useHanaTypes option
	const typeFunc = useHanaTypes ? hanaTypeMap[dataType] : typeMap[dataType]
	if (typeFunc) {
		return typeFunc(length, scale)
	}

	// Fallback for unsupported types
	return `**UNSUPPORTED TYPE - ${dataType}`
}

export let options = {
	useHanaTypes: false,
	noColons: false,
	keepPath: false,
	useExists: true
}

let synonyms = new Map()

// @ts-ignore
/* options = {
	set useHanaTypes(useHanaTypes) { options.useHanaTypes = useHanaTypes },
	set noColons(noColons) { options.noColons = noColons },
	set keepPath(keepPath) { options.keepPath = keepPath },
} */

export let results = {
	get synonyms() { return Object.fromEntries(synonyms) }
}

/**
 * Convert DB Object Metadata to CDS 
 * @param {object} db - Database Connection 
 * @param {object} object - DB Object Details
 * @param {object} fields - Object Fields
 * @param {object} constraints - Object Constraints
 * @param {string} type - DB Object type
 * @param {string} [schema] - Schema 
 * @param {string} [parent] - Calling context which impacts formatting
 * @param {object} [parameters] - View Parameters
 * @returns {Promise<string>}
 */
export async function formatCDS(db, object, fields, constraints, type, schema, parent, parameters) {
	base.debug(bundle.getText("debug.callWithParams", ["formatCDS", type]))
	let cdstable = ""
	let originalName

	switch (type) {
		case "view":
		case "hdbview":
			originalName = object[0].VIEW_NAME
			break
		default:
			originalName = object[0].TABLE_NAME
			break
	}

	let newName = originalName
	// if noColons option is used a.b.c::d.e will become a.b.c.d.e  
	if (parent === 'preview') {
		options.noColons && (newName = newName.replace(/::/g, "_"))
	} else {
		options.noColons && (newName = newName.replace(/::/g, "."))
	}
	// if we keep path a.b.c::d.e will stay as is
	// otherwise it will become a_b_c::d_e
	options.keepPath || (newName = newName.replace(/\./g, "_"))

	if ((type === "view" || type === "table") && (options.useExists)) {
		cdstable += "@cds.persistence.exists \n"
		if (await isCalculationView(db, schema, originalName)) {
			cdstable += "@cds.persistence.calcview \n"
		}
	}
	if (options.useQuoted){
		newName && (cdstable += `Entity ![${newName}] `)
	}else{
		newName && (cdstable += `Entity ${newName} `)
	}

	if (parameters && parameters.length > 0){
		cdstable += `(`
		for (let parameter of parameters) {
			cdstable += `${parameter.PARAMETER_NAME} : `
			
			// Handle geo types that need SRS ID
			const isGeo = (parameter.DATA_TYPE_NAME === "ST_POINT" || parameter.DATA_TYPE_NAME === "ST_GEOMETRY")
			const geoSrsId = isGeo ? await getGeoColumns(db, object[0], parameter, type) : null
			
			let typeStr = getTypeMapping(parameter.DATA_TYPE_NAME, parameter.LENGTH, parameter.SCALE, options.useHanaTypes, geoSrsId)
			
			// Override TIMESTAMP for preview context
			if (parameter.DATA_TYPE_NAME === "TIMESTAMP" && parent === 'preview') {
				typeStr = "String"
			}
			
			cdstable += typeStr
			cdstable += ", "
		}
		cdstable = cdstable.slice(0, -2)
		cdstable += `)`

	}
	//closing entity
	cdstable += `{\n`

	// if modified real table names will be stored in synonyms
	if (newName !== originalName) {
		synonyms.set(newName, {
			target: { object: originalName, schema: object[0].SCHEMA_NAME },
		})
	} else {
		synonyms.set(originalName, {
			target: { object: originalName, schema: object[0].SCHEMA_NAME },
		})
	}
	var isKey = "FALSE"
	for (let field of fields) {

		isKey = "FALSE"
		if (type === "table" || type === "hdbtable") {
			if (object[0].HAS_PRIMARY_KEY === "TRUE") {
				for (let constraint of constraints) {
					if (field.COLUMN_NAME === constraint.COLUMN_NAME) {
						constraint.COLUMN_NAME = constraint.COLUMN_NAME.replace(/\./g, "_")
						cdstable += "key "
						isKey = "TRUE"
					}
				}
			}
		} else {
			if (field.KEY_COLUMN_NAME) {
				cdstable += "key "
				isKey = "TRUE"
			}
		}
		let xref = {}
		xref.before = field.COLUMN_NAME
		field.COLUMN_NAME = field.COLUMN_NAME.replace(/\./g, "_")
		xref.after = field.COLUMN_NAME

		cdstable += "\t"
		if (options.useQuoted){
			cdstable += `![${field.COLUMN_NAME}]` + ": "
		}else{
			cdstable += `${field.COLUMN_NAME}` + ": "
		}

		// Handle geo types that need SRS ID
		const isGeo = (field.DATA_TYPE_NAME === "ST_POINT" || field.DATA_TYPE_NAME === "ST_GEOMETRY")
		const geoSrsId = isGeo ? await getGeoColumns(db, object[0], field, type) : null
		
		let typeStr = getTypeMapping(field.DATA_TYPE_NAME, field.LENGTH, field.SCALE, options.useHanaTypes, geoSrsId)
		
		// Override TIMESTAMP for preview context
		if (field.DATA_TYPE_NAME === "TIMESTAMP" && parent === 'preview') {
			typeStr = "String"
		}
		
		cdstable += typeStr

		xref.dataType = field.DATA_TYPE_NAME

		global.__xRef.push(xref)
		if (field.DEFAULT_VALUE) {
			if(field.DATA_TYPE_NAME === "BOOLEAN"){
				switch (field.DEFAULT_VALUE) {
					case 0:
						cdstable += ` default false`
						break
					case 1:
						cdstable += ` default true`
						break
					default:
						cdstable += ` default false`
				}
				
			}else{
				cdstable += ` default '${field.DEFAULT_VALUE}'`
			}


		}

		if (field.IS_NULLABLE === "FALSE") {
			if (isKey === "FALSE") {
				cdstable += " not null"
			}
		} else {
			//	if (isKey === "FALSE") {
			//		cdstable += " null"
			//	}
		}
		if (field.COMMENTS) {
			cdstable += `  @title: '${field.COLUMN_NAME}: ${field.COMMENTS.replace(/[']/g, "'$&")}' `
		} else {
			cdstable += `  @title: '${field.COLUMN_NAME}' `
		}
		cdstable += "; "

		cdstable += "\n"
	}
	cdstable += "}\n"
	return cdstable
}


/**
 * Get Geo Columns requires special lookup and details
 * @param {object} db - Database Connection 
 * @param {object} object - DB Object Details
 * @param {object} field - Object Field
 * @param {string} type - View or table
 * @returns {Promise<string>} GEO SRS ID
 */
export async function getGeoColumns(db, object, field, type) {
	base.debug(bundle.getText("debug.call", ["getGeoColumns"]))
	const statementString = `SELECT SRS_ID FROM ST_GEOMETRY_COLUMNS WHERE SCHEMA_NAME = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`
	const statement = await db.preparePromisified(statementString)
	let name = ''
	if (type === "view") {
		name = object.VIEW_NAME
	} else {
		name = object.TABLE_NAME
	}

	const geoColumns = await db.statementExecPromisified(statement, [object.SCHEMA_NAME, name, field.COLUMN_NAME])
	return geoColumns[0].SRS_ID
}


export function parseSQLOptions(output, cdsSource){
	// Define a regular expression to match the extended syntax
	const extendedSyntaxRegex = /(?:UNLOAD PRIORITY \d+|AUTO MERGE|NO AUTO MERGE|GROUP TYPE "[^"]*"|GROUP SUBTYPE "[^"]*"|GROUP NAME "[^"]*"|GROUP LEAD|GROUP SUBTYPE "[^"]*"\))/gi
	// Find the index of PARTITION statement
	let partitionIndex = output.indexOf('PARTITION')
	let partitionStatement
	// Check if PARTITION is found
	if (partitionIndex !== -1) {
		// Find the index of the ';' character
		let semicolonIndex = output.indexOf(';', partitionIndex)
		// Extract the PARTITION statement
		partitionStatement = semicolonIndex !== -1 ? output.substring(partitionIndex, semicolonIndex + 1) : output.substring(partitionIndex)
	}
	// Extract extended syntax using regex
	const extendedSyntax = output.match(extendedSyntaxRegex)
	if (extendedSyntax || partitionStatement) {
		cdsSource += `@sql.append: \`\`\`sql \n`
		for (let index = 0; index < extendedSyntax.length; index++) {
			const element = extendedSyntax[index]
			cdsSource += `${element}\n`
		}
		if (partitionStatement) {
			cdsSource += `${partitionStatement}\n`
		}
		cdsSource += `\`\`\`\n`
	}
	return cdsSource
}