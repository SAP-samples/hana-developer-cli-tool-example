// @ts-check
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'
import express from 'express'

const jsonParser = express.json()

export function route (app) {
    base.debug('hanaList Route')
    
    /**
     * @swagger
     * /hana:
     *   get:
     *     tags: [HANA System]
     *     summary: Get HANA database system information
     *     description: Returns comprehensive system information including session context, user details, system overview, services, and version information
     *     responses:
     *       200:
     *         description: HANA system information
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 CURRENT_USER:
     *                   type: string
     *                 session:
     *                   type: array
     *                   items:
     *                     type: object
     *                 user:
     *                   type: array
     *                   items:
     *                     type: object
     *                 overview:
     *                   type: array
     *                   items:
     *                     type: object
     *                 services:
     *                   type: array
     *                   items:
     *                     type: object
     *                 version:
     *                   type: object
     *       500:
     *         description: Database connection or query error
     */
    app.get('/hana', async (req, res, next) => {
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
            res.type("application/json")
               .status(200)
               .json(hana)
        } catch (error) {
            console.error(base.colors.red(`${error}`))
            next(error) // Pass to centralized error handler
        }
    })

    /**
     * @swagger
     * /hana/version-ui:
     *   get:
     *     tags: [HANA System]
     *     summary: Get hana-cli version information
     *     description: Returns version information for hana-cli, Node.js, CLI tools, and SAP packages
     *     responses:
     *       200:
     *         description: Version information
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 hana-cli:
     *                   type: string
     *                 Node.js:
     *                   type: string
     *                 cf-cli:
     *                   type: string
     *                 btp-cli:
     *                   type: string
     *                 latestVersion:
     *                   type: string
     */
    app.get('/hana/version-ui', async (req, res, next) => {
        try {
            await listHandlerNoConnection(res, "../bin/version", 'getVersionUI')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/tables:
     *   get:
     *     tags: [HANA Objects]
     *     summary: List all database tables
     *     description: Retrieves a list of all tables in the database schema
     *     responses:
     *       200:
     *         description: List of database tables
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   SCHEMA_NAME:
     *                     type: string
     *                   TABLE_NAME:
     *                     type: string
     *                   TABLE_TYPE:
     *                     type: string
     */
    app.get(['/hana/tables', '/hana/tables-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/tables", 'getTables')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/views:
     *   get:
     *     tags: [HANA Objects]
     *     summary: List all database views
     *     description: Retrieves a list of all views in the database schema
     *     responses:
     *       200:
     *         description: List of database views
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/views', '/hana/views-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/views", 'getViews')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/schemas:
     *   get:
     *     tags: [HANA Objects]
     *     summary: List all database schemas
     *     description: Retrieves a list of all schemas in the database
     *     responses:
     *       200:
     *         description: List of database schemas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/schemas', '/hana/schemas-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/schemas", 'getSchemas')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/containers:
     *   get:
     *     tags: [HDI]
     *     summary: List HDI containers
     *     description: Retrieves a list of all HDI containers
     *     responses:
     *       200:
     *         description: List of HDI containers
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/containers', '/hana/containers-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/containers", 'getContainers')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/certificates:
     *   get:
     *     tags: [HANA System]
     *     summary: List system certificates
     *     description: Retrieves a list of system certificates
     *     responses:
     *       200:
     *         description: List of certificates
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/certificates', '/hana/certificates-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/certificates", 'certs')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/btpInfo:
     *   get:
     *     tags: [BTP System]
     *     summary: Get BTP configuration information
     *     description: Retrieves BTP CLI configuration including user, server URL, version, and target hierarchy
     *     responses:
     *       200:
     *         description: BTP configuration information
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 UserName:
     *                   type: string
     *                 ServerURL:
     *                   type: string
     *                 Version:
     *                   type: string
     *                 TargetHierarchy:
     *                   type: array
     *                   items:
     *                     type: object
     */
    app.get(['/hana/btpInfo', '/hana/btpInfo-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/btpInfo", 'getBTPInfoUI')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/btpSubs:
     *   get:
     *     tags: [BTP System]
     *     summary: List BTP subscriptions
     *     description: Retrieves BTP subscriptions and their subscription URLs
     *     responses:
     *       200:
     *         description: List of BTP subscriptions
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/btpSubs', '/hana/btpSubs-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/btpSubs", 'getSubsUI')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/btp-ui:
     *   get:
     *     tags: [BTP System]
     *     summary: Get BTP hierarchy for target selection
     *     description: Retrieves BTP global account, hierarchy with folders/directories and subaccounts for target selection
     *     responses:
     *       200:
     *         description: BTP hierarchy and current target
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 globalAccount:
     *                   type: object
     *                   properties:
     *                     guid:
     *                       type: string
     *                     displayName:
     *                       type: string
     *                 hierarchy:
     *                   type: object
     *                 currentTarget:
     *                   type: string
     */
    app.get('/hana/btp-ui', async (req, res, next) => {
        try {
            await listHandler(res, "../bin/btpTarget", 'getBTPTargetUI')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/btp-ui/setTarget:
     *   post:
     *     tags: [BTP System]
     *     summary: Set BTP subaccount target
     *     description: Sets the target subaccount for BTP CLI operations
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               subaccount:
     *                 type: string
     *                 description: The GUID of the subaccount to target
     *     responses:
     *       200:
     *         description: Target set successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     */
    app.post('/hana/btp-ui/setTarget', jsonParser, async (req, res, next) => {
        try {
            const btpUtils = await import('../utils/btp.js')
            const subaccount = req.body.subaccount
            
            if (!subaccount) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Subaccount GUID is required' 
                })
            }
            
            const result = await btpUtils.setBTPSubAccount(subaccount)
            
            res.type("application/json")
               .status(200)
               .json({ 
                   success: true, 
                   message: result 
               })
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/dataTypes:
     *   get:
     *     tags: [HANA System]
     *     summary: List database data types
     *     description: Retrieves information about available data types in the database
     *     responses:
     *       200:
     *         description: List of data types
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/dataTypes', '/hana/dataTypes-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/dataTypes", 'dbStatus')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/features:
     *   get:
     *     tags: [HANA System]
     *     summary: List database features
     *     description: Retrieves information about database features and their status
     *     responses:
     *       200:
     *         description: List of database features
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/features', '/hana/features-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/features", 'dbStatus')
        } catch (error) {
            next(error)
        }
    })
    
    /**
     * @swagger
     * /hana/featureUsage:
     *   get:
     *     tags: [HANA System]
     *     summary: Get database feature usage statistics
     *     description: Retrieves usage statistics for database features
     *     responses:
     *       200:
     *         description: Feature usage statistics
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/featureUsage', '/hana/featureUsage-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/featureUsage", 'dbStatus')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/functions:
     *   get:
     *     tags: [HANA Objects]
     *     summary: List database functions
     *     description: Retrieves a list of all functions in the database
     *     responses:
     *       200:
     *         description: List of database functions
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/functions', '/hana/functions-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/functions", 'getFunctions')
        } catch (error) {
            next(error)
        }
    })
    
    /**
     * @swagger
     * /hana/hdi:
     *   get:
     *     tags: [Cloud Services]
     *     summary: List HANA Cloud HDI instances
     *     description: Retrieves a list of all HANA Cloud HDI service instances
     *     responses:
     *       200:
     *         description: List of HDI instances
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/hdi', '/hana/hdi-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/hanaCloudHDIInstances", 'listInstances')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/sbss:
     *   get:
     *     tags: [Cloud Services]
     *     summary: List HANA Cloud Schema and Broker Shared Service instances
     *     description: Retrieves a list of all SBSS service instances
     *     responses:
     *       200:
     *         description: List of SBSS instances
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/sbss', '/hana/sbss-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/hanaCloudSBSSInstances", 'listInstances')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/schemaInstances:
     *   get:
     *     tags: [Cloud Services]
     *     summary: List HANA Cloud Schema service instances
     *     description: Retrieves a list of all HANA Cloud Schema service instances
     *     responses:
     *       200:
     *         description: List of schema service instances
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/schemaInstances', '/hana/schemaInstances-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/hanaCloudSchemaInstances", 'listInstances')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/securestore:
     *   get:
     *     tags: [Cloud Services]
     *     summary: List HANA Cloud Secure Store instances
     *     description: Retrieves a list of all HANA Cloud Secure Store service instances
     *     responses:
     *       200:
     *         description: List of secure store instances
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/securestore', '/hana/securestore-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/hanaCloudSecureStoreInstances", 'listInstances')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/ups:
     *   get:
     *     tags: [Cloud Services]
     *     summary: List User-Provided Service instances
     *     description: Retrieves a list of all User-Provided Service (UPS) instances
     *     responses:
     *       200:
     *         description: List of UPS instances
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/ups', '/hana/ups-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/hanaCloudUPSInstances", 'listInstances')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/indexes:
     *   get:
     *     tags: [HANA Objects]
     *     summary: List database indexes
     *     description: Retrieves a list of all indexes in the database
     *     responses:
     *       200:
     *         description: List of database indexes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/indexes', '/hana/indexes-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/indexes", 'getIndexes')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/users:
     *   get:
     *     tags: [HANA Objects]
     *     summary: List database users
     *     description: Retrieves a list of all database users
     *     responses:
     *       200:
     *         description: List of database users
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/users', '/hana/users-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/users", 'getUsers')
        } catch (error) {
            next(error)
        }
    })

    /**
     * @swagger
     * /hana/procedures:
     *   get:
     *     tags: [HANA Objects]
     *     summary: List database procedures
     *     description: Retrieves a list of all stored procedures in the database
     *     responses:
     *       200:
     *         description: List of database procedures
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    app.get(['/hana/procedures', '/hana/procedures-ui'], async (req, res, next) => {
        try {
            await listHandler(res, "../bin/procedures", 'getProcedures')
        } catch (error) {
            next(error)
        }
    })
}

export async function listHandler(res, lib, func) {
    await base.clearConnection()
    const targetLibrary = await import(`${lib}.js`)
    let results = await targetLibrary[func](base.getPrompts())
    base.sendResults(res, results)
}

export async function listHandlerNoConnection(res, lib, func) {
    const targetLibrary = await import(`${lib}.js`)
    let results = await targetLibrary[func]()
    base.sendResults(res, results)
}
