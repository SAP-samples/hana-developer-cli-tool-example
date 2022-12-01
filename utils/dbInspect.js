/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
// @ts-check

/**
 * @module dbInspect - Database Object Dynamic Inspection and Metadata processing
 */
import * as base from "./base.js"
const bundle = base.bundle

/**
 * Return the HANA DB Version
 * @param {object} db - Database Connection
 * @returns {Promise<object>}
 */
export async function getHANAVersion(db) {
	base.debug(`getHANAVersion`)
	const statement = await db.preparePromisified(
		`SELECT *
                 FROM M_DATABASE`)
	const object = await db.statementExecPromisified(statement, [])
	if (object.length < 1) {
		throw new Error(bundle.getText("errMDB"))
	}
	object[0].versionMajor = object[0].VERSION.charAt(0)
	base.debug(`HANA Version ${JSON.stringify(object)}`)
	return object[0]
}


/**
 * Check if a view is a Calculation View
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} viewId - View Unique ID
 * @returns {Promise<boolean>}
 */
export async function isCalculationView(db, schema, viewId) {
	base.debug(`isCalculationView ${schema} ${viewId}`)
	const vers = await getHANAVersion(db)
	if (vers.versionMajor < 2) {
		return false
	}
	//Select View
	let statementString = ``
	statementString = `SELECT CUBE_ID, SCHEMA_NAME, QUALIFIED_NAME, VIEW_NAME, CUBE_TYPE, IS_HDI_OBJECT
	   FROM _SYS_BI.BIMC_REPORTABLE_VIEWS
	   WHERE SCHEMA_NAME LIKE ?
	     AND QUALIFIED_NAME = ?`
	const statement = await db.preparePromisified(statementString)
	const object = await db.statementExecPromisified(statement, [schema, viewId])
	if (object.length < 1) {
		statementString = `SELECT CUBE_ID, SCHEMA_NAME, QUALIFIED_NAME, VIEW_NAME, CUBE_TYPE, IS_HDI_OBJECT
	   							 FROM _SYS_BI.BIMC_REPORTABLE_VIEWS
	   							WHERE SCHEMA_NAME LIKE ?
	    						  AND VIEW_NAME = ?`
		const statement = await db.preparePromisified(statementString)
		const object = await db.statementExecPromisified(statement, [schema, viewId])
		if (object.length < 1) {
			return false
		} else {
			return true
		}
	} else {
		return true
	}
}

/**
 * Get DB View details
 * @param {object} db - Database Connection
 * @param {string} scheam - Schema
 * @param {string} viewId - View Unique ID
 * @returns {Promise<object>}
 */
export async function getView(db, scheam, viewId) {
	base.debug(`getView ${scheam} ${viewId}`)
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
	base.debug(`getDef ${schema} ${Id}`)
	//Select View
	var inputParams = {
		SCHEMA: `"${schema}"`,
		OBJECT: `"${Id}"`
	}

	let sp = await db.loadProcedurePromisified("SYS", "GET_OBJECT_DEFINITION")
	let object = await db.callProcedurePromisified(sp, inputParams)
	if (object.length < 1) {
		throw new Error(bundle.getText("errObj"))
	}
	let output = object.results[0].OBJECT_CREATION_STATEMENT
	output = output.toString()
	output = output.replace(new RegExp(",", "g"), ",\n")
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
	base.debug(`getCalcViewFields ${schema} ${viewId}`)
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
			const statement = await db.preparePromisified(
				`SELECT SCHEMA_NAME, QUALIFIED_NAME AS VIEW_NAME, NULL AS VIEW_OID, COLUMN_NAME, 
			"ORDER" AS POSITION, DESC_TYPE_D AS DATA_TYPE_NAME, 0 AS OFFSET, 0 AS LENGTH, SCALE, 
			IS_NULLABLE, NULL AS DEFAULT_VALUE, NULL AS COLUMN_ID, COLUMN_CAPTION AS COMMENTS, KEY_COLUMN_NAME
	 			FROM _SYS_BI.BIMC_DIMENSION_VIEW
			   WHERE SCHEMA_NAME LIKE ?
				 AND QUALIFIED_NAME = ? ORDER BY POSITION`)
			fields = await db.statementExecPromisified(statement, [schema, object[0].QUALIFIED_NAME])
		}
	}
	for (let field of fields) {
		const fieldStatement = await await db.preparePromisified(
			`SELECT OFFSET, LENGTH, DEFAULT_VALUE, DATA_TYPE_NAME
			   FROM VIEW_COLUMNS 
		      WHERE VIEW_OID = ? AND COLUMN_NAME = ?`
		)
		const sqlField = await db.statementExecPromisified(fieldStatement, [viewOid, field.COLUMN_NAME])
		if (sqlField.length >= 1) {
			field.OFFSET = sqlField[0].OFFSET
			field.LENGTH = sqlField[0].LENGTH
			field.DEFAULT_VALUE = sqlField[0].DEFAULT_VALUE
			field.DATA_TYPE_NAME = sqlField[0].DATA_TYPE_NAME
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
	base.debug(`getViewFields ${viewOid}`)
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT SCHEMA_NAME, VIEW_NAME, VIEW_OID, COLUMN_NAME, POSITION, DATA_TYPE_NAME, OFFSET, LENGTH, SCALE, IS_NULLABLE, DEFAULT_VALUE, COLUMN_ID, COMMENTS, NULL as KEY_COLUMN_NAME
         FROM VIEW_COLUMNS 
		WHERE VIEW_OID = ? ORDER BY POSITION`)
	const fields = await db.statementExecPromisified(statement, [viewOid])
	return fields
}

/**
 * Get DB Table Details
 * @param {object} db - Database Connection
 * @param {string} schema - Schema
 * @param {string} tableId - Table Unqiue ID
 * @returns {Promise<object>}
 */
export async function getTable(db, schema, tableId) {
	base.debug(`getTable ${schema} ${tableId}`)
	//Select Table
	let statementString = ``
	const vers = await await getHANAVersion(db)
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
	base.debug(`getTableFields ${tableOid}`)
	//Select Fields
	let statementString = ``
	const vers = await await getHANAVersion(db)
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
	base.debug(`getConstraints ${JSON.stringify(object)}`)
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
	base.debug(`getProcedure ${schema} ${procedure}`)
	//Select View
	let statementString = ``
	const vers = await await getHANAVersion(db)
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
	base.debug(`getProcedurePrams ${procOid}`)
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
	base.debug(`getProcedurePramCols ${procOid}`)
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
	base.debug(`getFunction ${schema} ${functionName}`)
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
	base.debug(`getFunctionPrams ${funcOid}`)
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
	base.debug(`getFunctionPramCols ${funcOid}`)
	//Select Fields
	const statement = await db.preparePromisified(
		`SELECT PARAMETER_NAME, PARAMETER_POSITION, COLUMN_NAME, POSITION, DATA_TYPE_NAME, LENGTH, SCALE, IS_NULLABLE 
          FROM FUNCTION_PARAMETER_COLUMNS 
				  WHERE FUNCTION_OID = ?
				  ORDER BY PARAMETER_POSITION, POSITION`)
	const fields = await db.statementExecPromisified(statement, [funcOid])
	return fields
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
 * @returns {Promise<string>}
 */
export async function formatCDS(db, object, fields, constraints, type, schema, parent) {
	base.debug(`formatCDS ${type}`)
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
		newName && (cdstable += `Entity ![${newName}] {\n`)
	}else{
		newName && (cdstable += `Entity ${newName} {\n`)
	}


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

		if (options.useHanaTypes) {
			switch (field.DATA_TYPE_NAME) {
				case "NVARCHAR":
					cdstable += `String(${field.LENGTH})`
					break
				case "NCLOB":
					cdstable += "LargeString"
					break
				case "VARBINARY":
					cdstable += `Binary(${field.LENGTH})`
					break
				case "BLOB":
					cdstable += "LargeBinary"
					break
				case "INTEGER":
					cdstable += "Integer"
					break
				case "BIGINT":
					cdstable += "Integer64"
					break
				case "DECIMAL":
					cdstable += field.SCALE ? `Decimal(${field.LENGTH}, ${field.SCALE})` : `Decimal(${field.LENGTH})`
					break
				case "DOUBLE":
					cdstable += "Double"
					break
				case "DATE":
					cdstable += "Date"
					break
				case "TIME":
					cdstable += "Time"
					break
				case "SECONDDATE":
					cdstable += "String"
					break
				case "TIMESTAMP":
					if (parent === 'preview') {
						cdstable += "String"
					} else {
						cdstable += "Timestamp"
					}
					break
				case "BOOLEAN":
					cdstable += "Boolean"
					break
				// hana types
				case "SMALLINT":
				case "TINYINT":
				case "SMALLDECIMAL":
				case "REAL":
				case "CLOB":
					cdstable += `hana.${field.DATA_TYPE_NAME}`
					break
				case "CHAR":
				case "NCHAR":
				case "BINARY":
					cdstable += `hana.${field.DATA_TYPE_NAME}(${field.LENGTH})`
					break
				case "VARCHAR":
					cdstable += `hana.${field.DATA_TYPE_NAME}(${field.LENGTH})`
					break
				case "ST_POINT":
				case "ST_GEOMETRY":
					cdstable += `hana.${field.DATA_TYPE_NAME}(${await getGeoColumns(db, object[0], field, type)})`
					break
				default:
					cdstable += `**UNSUPPORTED TYPE - ${field.DATA_TYPE_NAME}`
			}
		} else {
			switch (field.DATA_TYPE_NAME) {
				case "NVARCHAR":
					cdstable += `String(${field.LENGTH})`
					break
				case "NCLOB":
					cdstable += "LargeString"
					break
				case "VARBINARY":
					cdstable += `Binary(${field.LENGTH})`
					break
				case "BLOB":
					cdstable += "LargeBinary"
					break
				case "INTEGER":
					cdstable += "Integer"
					break
				case "BIGINT":
					cdstable += "Integer64"
					break
				case "TINYINT":
					cdstable += "UInt8"
					break
				case "SMALLINT":
					cdstable += "Int16"
					break
				case "DECIMAL":
					cdstable += field.SCALE ? `Decimal(${field.LENGTH}, ${field.SCALE})` : `Decimal(${field.LENGTH})`
					break
				case "DOUBLE":
					cdstable += "Double"
					break
				case "DATE":
					cdstable += "Date"
					break
				case "TIME":
					cdstable += "Time"
					break
				case "SECONDDATE":
					cdstable += "String"
					break
				case "TIMESTAMP":
					if (parent === 'preview') {
						cdstable += "String"
					} else {
						cdstable += "Timestamp"
					}
					break
				case "BOOLEAN":
					cdstable += "Boolean"
					break
				case "VARCHAR":
					// backward compatible change
					cdstable += `String(${field.LENGTH})`
					break
				default:
					cdstable += `**UNSUPPORTED TYPE - ${field.DATA_TYPE_NAME}`
			}
		}

		xref.dataType = field.DATA_TYPE_NAME

		global.__xRef.push(xref)
		if (field.DEFAULT_VALUE) {
			cdstable += ` default "${field.DEFAULT_VALUE}"`
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
	base.debug(`getGeoColumns`)
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
