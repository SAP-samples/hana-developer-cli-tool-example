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

    app.get(['/hana/tables', '/hana/tables-ui'], async (req, res) => {
        listHandler(res, "../bin/tables", 'getTables')
    })

    app.get(['/hana/schemas', '/hana/schemas-ui'], async (req, res) => {
        listHandler(res, "../bin/schemas", 'getSchemas')
    })

    app.get(['/hana/containers', '/hana/containers-ui'], async (req, res) => {
        listHandler(res, "../bin/containers", 'getContainers')
    })

    app.get(['/hana/dataTypes', '/hana/dataTypes-ui'], async (req, res) => {
        listHandler(res, "../bin/dataTypes", 'dbStatus')
    })

    app.get(['/hana/features', '/hana/features-ui'], async (req, res) => {
        listHandler(res, "../bin/features", 'dbStatus')
    })
    
    app.get(['/hana/featureUsage', '/hana/featureUsage-ui'], async (req, res) => {
        listHandler(res, "../bin/featureUsage", 'dbStatus')
    })
}

async function listHandler(res, lib, func) {
    try {
        await base.clearConnection()
        const targetLibrary = require(lib)
        let results = await targetLibrary[func](base.getPrompts())
        base.sendResults(res, results)
    } catch (error) {
        res.status(500).send(error.toString())
        return console.error(`${error}`)
    }
}
