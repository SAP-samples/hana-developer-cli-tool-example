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
            const tables = require("../bin/tables")
            let results = await tables.getTables(base.getPrompts())
            res.type("application/json").status(200).send(results)
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }
    })

    app.get('/hana/schemas', async (req, res) => {
        try {
            await base.clearConnection()
            const schemas = require("../bin/schemas")
            let results = await schemas.getSchemas(base.getPrompts())
            res.type("application/json").status(200).send(results)
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }
    })
}
