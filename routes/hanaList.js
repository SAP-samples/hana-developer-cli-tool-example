// @ts-check
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'

export function route (app) {
    base.debug('hanaList Route')
    app.get('/hana', async (req, res) => {
        try {
            await base.clearConnection()
            const dbStatus = await base.createDBConnection()

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
            res.status(500).send(error.toString())
            return console.error(`${error}`)
        }

    })

    app.get(['/hana/tables', '/hana/tables-ui'], async (req, res) => {
        listHandler(res, "../bin/tables", 'getTables')
    })

    app.get(['/hana/views', '/hana/views-ui'], async (req, res) => {
        listHandler(res, "../bin/views", 'getViews')
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

    app.get(['/hana/functions', '/hana/functions-ui'], async (req, res) => {
        listHandler(res, "../bin/functions", 'getFunctions')
    })
    
    app.get(['/hana/hdi', '/hana/hdi-ui'], async (req, res) => {
        listHandler(res, "../bin/hanaCloudHDIInstances", 'listInstances')
    })

    app.get(['/hana/sbss', '/hana/sbss-ui'], async (req, res) => {
        listHandler(res, "../bin/hanaCloudSBSSInstances", 'listInstances')
    })

    app.get(['/hana/schemaInstances', '/hana/schemaInstances-ui'], async (req, res) => {
        listHandler(res, "../bin/hanaCloudSchemaInstances", 'listInstances')
    })

    app.get(['/hana/securestore', '/hana/securestore-ui'], async (req, res) => {
        listHandler(res, "../bin/hanaCloudSecureStoreInstances", 'listInstances')
    })

    app.get(['/hana/ups', '/hana/ups-ui'], async (req, res) => {
        listHandler(res, "../bin/hanaCloudUPSInstances", 'listInstances')
    })

    
    app.get(['/hana/indexes', '/hana/indexes-ui'], async (req, res) => {
        listHandler(res, "../bin/indexes", 'getIndexes')
    })
}

export async function listHandler(res, lib, func) {
    try {
        await base.clearConnection()
        const targetLibrary = await import(`${lib}.js`)
        let results = await targetLibrary[func](base.getPrompts())
        base.sendResults(res, results)
    } catch (error) {
        res.status(500).send(error.toString())
        return console.error(`${error}`)
    }
}
