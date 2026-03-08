// @ts-check

/**
 * @module connections - helper utility for making connections to HANA DB and determine connection settings
 */
import * as base from "./base.js"
import { require } from "./base.js"
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'
import { homedir } from 'os'
import * as xsenv from '@sap/xsenv'
import cds from '@sap/cds'

const fileCheckCache = new Map()
const cdsrcPrivateCache = new Map()

//import cds from '@sap/cds'
// @ts-ignore
//const LOG = cds.log('bind')
//import { createRequire } from 'module'
//const require = createRequire(import.meta.url)


/**
 * Check parameter folders to see if the input file exists there
 * @param {string} filename 
 * @param {number} maxDepth - Maximum directory depth to search (default: 5)
 * @returns {string|undefined} - the file path if found 
 */
export function getFileCheckParents(filename, maxDepth = 5) {
    base.debug(base.bundle.getText("debug.callWithParams", ["getFileCheckParents", filename]))
    try {
        const cacheKey = `${process.cwd()}|${filename}|${maxDepth}`
        if (fileCheckCache.has(cacheKey)) {
            const cachedPath = fileCheckCache.get(cacheKey)
            return cachedPath || undefined
        }
        let currentPath = '.'
        
        for (let i = 0; i < maxDepth; i++) {
            const fullPath = path.join(currentPath, filename)
            if (fs.existsSync(fullPath)) {
                fileCheckCache.set(cacheKey, fullPath)
                return fullPath
            }
            currentPath = path.join(currentPath, '..')
        }
        
        fileCheckCache.set(cacheKey, null)
        return undefined
    }
    catch (error) {
        throw new Error(`${base.bundle.getText("error")} ${error}`)
    }
}

// Convenience wrapper functions that delegate to getFileCheckParents
/**
 * Check current and parent directories for a package.json
 * @returns {string|undefined} - the file path if found 
 */
export const getPackageJSON = () => getFileCheckParents('package.json')

/**
 * Check current and parent directories for a mta.yaml
 * @returns {string|undefined} - the file path if found 
 */
export const getMTA = () => getFileCheckParents('mta.yaml')

/**
 * Check current and parent directories for a default-env.json
 * @returns {string|undefined} - the file path if found 
 */
export const getDefaultEnv = () => getFileCheckParents('default-env.json')

/**
 * Check current and parent directories for a default-env-admin.json
 * @returns {string|undefined} - the file path if found 
 */
export const getDefaultEnvAdmin = () => getFileCheckParents('default-env-admin.json')

/**
 * Check current and parent directories for a .env
 * @returns {string|undefined} - the file path if found 
 */
export const getEnv = () => getFileCheckParents('.env')

/**
 * Check current and parent directories for a .cdsrc-private.json
 * @returns {string|undefined} - the file path if found 
 */
export const getCdsrcPrivate = () => getFileCheckParents('.cdsrc-private.json')

/**
 * Resolve CDS binding credentials from .cdsrc-private.json only
 * @param {object} prompts
 * @returns {Promise<object|undefined>}
 */
export async function getCdsrcBindingOptions(prompts) {
    const cdsrcPrivate = prompts?.admin ? undefined : getCdsrcPrivate()
    if (!cdsrcPrivate) {
        return undefined
    }

    try {
        let object = cdsrcPrivateCache.get(cdsrcPrivate)
        if (!object) {
            const data = fs.readFileSync(cdsrcPrivate, { encoding: 'utf8', flag: 'r' })
            object = JSON.parse(data)
            cdsrcPrivateCache.set(cdsrcPrivate, object)
        }

        const binding = object?.requires?.['[hybrid]']?.db?.binding
        if (!binding) {
            return undefined
        }

        const resolveBinding = require('@sap/cds-dk/lib/bind/cf')
        const resolvedService = await resolveBinding.resolve(null, binding)
        const options = { hana: resolvedService.credentials }
        base.debug(options)
        if (base.verboseOutput(prompts)) { console.log(`${base.bundle.getText("connFile2")} .cdsrc-private.json\n`) }
        return options
    }
    catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e
    }

    return undefined
}

/**
 * Resolve Environment by deciding which option between default-env and default-env-admin we should take
 * @param {object} options 
 * @returns {string} - the file path if found 
 */
export function resolveEnv(options) {
    base.debug(base.bundle.getText("debug.callWithParams", ["resolveEnv", options]))
    const file = options?.admin ? 'default-env-admin.json' : 'default-env.json'
    return path.resolve(process.cwd(), file)
}


/**
 * Get Connection Options from input prompts
 * @param {object} prompts - input prompts
 * @returns {Promise<object>} connection options
 */
export async function getConnOptions(prompts) {
    base.debug(base.bundle.getText("debug.call", ["getConnOptions"]))
    
    // NEW: Check for project-specific context from MCP server
    // This allows AI agents to specify which project's database to use
    const projectPath = process.env.HANA_CLI_PROJECT_PATH;
    const connFile = process.env.HANA_CLI_CONN_FILE;
    
    // If project path provided, change to that directory so connection resolution starts there
    if (projectPath && fs.existsSync(projectPath)) {
        process.chdir(projectPath);
        base.debug(`Using project directory for connection resolution: ${projectPath}`);
    }
    
    // NEW: Check for direct database credentials from MCP (for explicit connection setup)
    // This is used when connection file isn't available or for temporary connections
    if (process.env.HANA_CLI_HOST) {
        const directConnection = {
            hana: {
                host: process.env.HANA_CLI_HOST,
                port: parseInt(process.env.HANA_CLI_PORT || '30013'),
                user: process.env.HANA_CLI_USER,
                password: process.env.HANA_CLI_PASSWORD,
                database: process.env.HANA_CLI_DATABASE || 'SYSTEMDB',
            }
        };
        base.debug('Using direct database connection from MCP context');
        return directConnection;
    }
    
    delete process.env.VCAP_SERVICES

    // Try .cdsrc-private.json with CDS binding first
    const cdsrcOptions = await getCdsrcBindingOptions(prompts)
    if (cdsrcOptions) {
        return cdsrcOptions
    }

    // Determine which env file to load
    let envFile = prompts?.admin ? getDefaultEnvAdmin() : getDefaultEnv()
    
    if (!envFile && prompts?.conn) {
        // Try custom configuration file
        envFile = getFileCheckParents(prompts.conn)
        if (!envFile) {
            envFile = getFileCheckParents(`${homedir()}/.hana-cli/${prompts.conn}`)
        }
    }
    
    if (!envFile) {
        // Last resort - configuration file in user profile
        envFile = getFileCheckParents(`${homedir()}/.hana-cli/default.json`)
    }
    
    if (!envFile && !process.env.VCAP_SERVICES) {
        // Try .env file as fallback
        const dotEnvFile = getEnv()
        if (dotEnvFile) dotenv.config({ path: dotEnvFile, quiet: true })
    }

    if (envFile && base.verboseOutput(prompts)) {
        console.log(`${base.bundle.getText("connFile2")} ${envFile}\n`)
    }

    xsenv.loadEnv(envFile)
    base.debug(base.bundle.getText("connectionFile"))
    base.debug(envFile)

    // Fetch HANA service configuration
    let options
    try {
        const serviceQuery = process.env.TARGET_CONTAINER 
            ? { hana: { name: process.env.TARGET_CONTAINER } }
            : { hana: { tag: 'hana' } }
        options = xsenv.getServices(serviceQuery)
    } catch (error) {
        try {
            options = xsenv.getServices({ hana: { tag: 'hana', plan: 'hdi-shared' } })
        } catch (retryError) {
            const errorMsg = envFile 
                ? `${base.bundle.getText("badConfig")} ${envFile}. ${base.bundle.getText("fullDetails")} ${retryError}`
                : `${base.bundle.getText("missingConfig")} ${retryError}`
            throw new Error(errorMsg)
        }
    }
    
    base.debug(options)
    return options
}

/**
 * Create Database Connection 
 * @param {object} prompts - input prompt values
 * @param {boolean} directConnect - Direct Connection parameters are supplied in prompts
 * @returns {Promise<object>} HANA DB connection of type hdb
 */
export async function createConnection(prompts, directConnect = false) {
    base.debug(base.bundle.getText("debug.call", ["createConnection"]))

    const options = directConnect 
        ? { hana: prompts }
        : await getConnOptions(prompts)

    base.debug(base.bundle.getText("debug.connectionCreateStart"))
    return base.dbClass.createConnection(options)
}
