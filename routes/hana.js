const base = require("../utils/base")

module.exports = (app) => {
    app.get('/hana', async (req, res) => {
        try {
            await base.clearConnection()
            const dbStatus = await base.createDBConnection()
            const dbInspect = require("../utils/dbInspect")

            let [session, user, overview, services, version] = await Promise.all([
                dbStatus.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`),
                dbStatus.execSQL(`SELECT CURRENT_USER, CURRENT_SCHEMA FROM DUMMY`),
                dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SYSTEM_OVERVIEW"`),
                dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SERVICES"`),
                dbInspect.getHANAVersion(dbStatus)
            ])
            let hana = {
                CURRENT_USER: user[0].CURRENT_USER,
                session: session,
                user: user,
                overview: overview,
                services: services,
                version: version
            }
            res.type("application/json").status(200).send(hana)
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }

    })

    app.get('/hana/tables', async (req, res) => {
        try {
            await base.clearConnection()
            let prompts = base.getPrompts()
            const db = await base.createDBConnection()
            const dbClass = require("sap-hdbext-promisfied")

            let schema = await dbClass.schemaCalc(prompts, db)
            base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("table")}: ${prompts.table}`)

            let results = await getTablesInt(schema, prompts.table, db, prompts.limit)
            outputJSON(results, res)
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }
    })

    app.get('/hana/schemas', async (req, res) => {
        try {
            await base.clearConnection()
            let prompts = base.getPrompts()
            const db = await base.createDBConnection()
            let results = await getSchemasInt(prompts.schema, db, prompts.limit)
            outputJSON(results, res)
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }
    })
}

async function getTablesInt(schema, table, client, limit) {
    base.debug(`getTablesInt ${schema} ${table} ${limit}`)
    const dbClass = require("sap-hdbext-promisfied")
    table = dbClass.objectName(table)

    let query =
        `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
    WHERE SCHEMA_NAME LIKE ? 
      AND TABLE_NAME LIKE ? 
    ORDER BY SCHEMA_NAME, TABLE_NAME `
    if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
        query += `LIMIT ${limit.toString()}`
    }
    return await client.statementExecPromisified(await client.preparePromisified(query), [schema, table])
}


async function getSchemasInt(schema, client, limit, all) {
    base.debug(`getSchemasInt ${schema} ${limit} ${all}`)
    const dbClass = require("sap-hdbext-promisfied")  
    schema = dbClass.objectName(schema)
    let hasPrivileges = 'FALSE'
    if (!all) { hasPrivileges = 'TRUE' }
    console.log(schema)
    var query =
      `SELECT * from SCHEMAS 
          WHERE SCHEMA_NAME LIKE ? 
            AND HAS_PRIVILEGES = ?
            ORDER BY SCHEMA_NAME `
    if (limit !== null) {
      query += `LIMIT ${limit.toString()}`
    }
    return await client.statementExecPromisified(await client.preparePromisified(query), [schema, hasPrivileges])
  }

function outputJSON(jsonOut, res) {
    let out = []
    for (let item of jsonOut) {
        out.push(item)
    }
    res.type("application/json").status(200).send(JSON.stringify(out))
    return
}