/*eslint-env node, es6 */
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

//import cds from '@sap/cds'
// @ts-ignore
//const LOG = cds.log('bind')
//import { createRequire } from 'module'
//const require = createRequire(import.meta.url)


/**
 * Check parameter folders to see if the input file exists there
 * @param {string} filename 
 * @returns {string} - the file path if found 
 */
export function getFileCheckParents(filename) {
    base.debug(`getFileCheckParents ${filename}`)
    try {

        //check current dir for package.json
        let root = filename
        root = path.join('.', root)
        if (fs.existsSync(root)) return root

        root = path.join('..', root)
        if (fs.existsSync(root)) return root

        root = path.join('..', root)
        if (fs.existsSync(root)) return root

        root = path.join('..', root)
        if (fs.existsSync(root)) return root

        root = path.join('..', root)
        if (fs.existsSync(root)) return root

        return
    }
    catch (error) {
        throw new Error(`${base.bundle.getText("error")} ${error}`)
    }
}

/**
 * Check current and parent directories for a package.json
 * @returns {string} - the file path if found 
 */
export function getPackageJSON() {
    base.debug('getPackageJSON')
    return getFileCheckParents(`package.json`)
}

/**
 * Check current and parent directories for a mta.yaml
 * @returns {string} - the file path if found 
 */
export function getMTA() {
    base.debug('getMTA')
    return getFileCheckParents(`mta.yaml`)
}

/**
 * Check current and parent directories for a default-env.json
 * @returns {string} - the file path if found 
 */
export function getDefaultEnv() {
    base.debug('getDefaultEnv')
    return getFileCheckParents(`default-env.json`)
}

/**
 * Check current and parent directories for a default-env-admin.json
 * @returns {string} - the file path if found 
 */
export function getDefaultEnvAdmin() {
    base.debug('getDefaultEnvAdmin')
    return getFileCheckParents(`default-env-admin.json`)
}

/**
 * Check current and parent directories for a .env
 * @returns {string} - the file path if found 
 */
export function getEnv() {
    base.debug('getEnv')
    return getFileCheckParents(`.env`)
}

/**
 * Check current and parent directories for a .cdsrc-private.json
 * @returns {string} - the file path if found 
 */
export function getCdsrcPrivate() {
    base.debug('getCdsrcPrivate')
    return getFileCheckParents(`.cdsrc-private.json`)
}

/**
 * Resolve Environment by deciding which option between default-env and default-env-admin we should take
 * @param {*} options 
 * @returns {string} - the file path if found 
 */
export function resolveEnv(options) {
    base.debug(`resolveEnv ${options}`)
    let file = 'default-env.json'
    if (options && Object.prototype.hasOwnProperty.call(options, 'admin') && options.admin) {
        file = 'default-env-admin.json'
    }
    let envFile = path.resolve(process.cwd(), file)
    return envFile
}


/**
 * Get Connection Options from input prompts
 * @param {object} prompts - input prompts
 * @returns {Promise<object>} connection options
 */
export async function getConnOptions(prompts) {
    base.debug('getConnOptions')
    delete process.env.VCAP_SERVICES
    let envFile

    //Look for Admin option - it overrides everything
    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'admin') && prompts.admin) {
        envFile = getDefaultEnvAdmin()
    }

    //No Admin option or no default-env-admin.json file found - try for .cdsrc-private.json and cds bind
    if (!envFile) {
        let cdsrcPrivate = getCdsrcPrivate()

        //No Admin option or no default-env-admin.json file found - try for .env 
        if (!cdsrcPrivate) {
            let dotEnvFile = getEnv()
            dotenv.config({ path: dotEnvFile, quiet: true })
        } else {
            try {
                const data = fs.readFileSync(cdsrcPrivate,
                    { encoding: 'utf8', flag: 'r' })
                const object = JSON.parse(data)
                const resolveBinding = require('@sap/cds-dk/lib/bind/cf') //.BindingResolver(LOG)
                let resolvedService = await resolveBinding.resolve(null, object.requires['[hybrid]'].db.binding)
                let options = { hana: resolvedService.credentials }
                base.debug(options)
                base.debug(base.bundle.getText("connectionFile"))
                base.debug(`.cdsrc-private.json`)
                if (base.verboseOutput(prompts)) { console.log(`${base.bundle.getText("connFile2")} ${`.cdsrc-private.json`} \n`) }
                return (options)
            }
            catch (e) {
                if (e.code !== 'MODULE_NOT_FOUND') {
                    // Re-throw not "Module not found" errors 
                    throw e
                }
                throw base.bundle.getText("cds-dk2")
            }
        }
    }



    //No .env File found or it doesn't contain a VCAP_SERVICES - try other options
    base.debug(process.env.VCAP_SERVICES)
    base.debug(envFile)
    if (!process.env.VCAP_SERVICES && !envFile) {
        //Check for specific configuration file by special parameter 
        if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'conn') && prompts.conn) {
            envFile = getFileCheckParents(prompts.conn)

            //Conn parameters can also refer to a central configuration file in the user profile
            if (!envFile) {
                envFile = getFileCheckParents(`${homedir}/.hana-cli/${prompts.conn}`)
            }
        }

        base.debug(`Before ${envFile}`)
        //No specific configuration file requested go back to default-env.json
        if (!envFile) {
            envFile = getDefaultEnv()
            base.debug(`Lookup Env ${envFile}`)
            //Last resort - default.json in user profile location
            if (!envFile) {
                envFile = getFileCheckParents(`${homedir}/.hana-cli/default.json`)
            }
        }
        if (envFile && base.verboseOutput(prompts)) { console.log(`${base.bundle.getText("connFile2")} ${envFile} \n`) }

    } else {
        if (!envFile && base.verboseOutput(prompts)) { console.log(`${base.bundle.getText("connFile2")} ${getEnv()} \n`) }
        else if (base.verboseOutput(prompts)) { console.log(`${base.bundle.getText("connFile2")} ${envFile} \n`) }
    }

    xsenv.loadEnv(envFile)

    base.debug(base.bundle.getText("connectionFile"))
    base.debug(envFile)

    /** @type object */
    let options = ''
    try {
        if (!process.env.TARGET_CONTAINER) {
            options = xsenv.getServices({ hana: { tag: 'hana' } })
        } else {
            options = xsenv.getServices({ hana: { name: process.env.TARGET_CONTAINER } })
        }
    } catch (error) {
        try {
            options = xsenv.getServices({ hana: { tag: 'hana', plan: "hdi-shared" } })
        } catch (error) {
            if (envFile) { throw new Error(`${base.bundle.getText("badConfig")} ${envFile}.  ${base.bundle.getText("fullDetails")} ${error}`) }
            else { throw new Error(`${base.bundle.getText("missingConfig")} ${error}`) }

        }
    }
    base.debug(options)
    return (options)
}

/**
 * Create Database Connection 
 * @param {object} prompts - input prompt values
 * @param {boolean} directConnect - Direct Connection parameters are supplied in prompts
 * @returns {Promise<object>} HANA DB connection of type hdb
 */
export async function createConnection(prompts, directConnect = false) {
    base.debug('createConnection')

    /** @type object */
    let options = []
    if (directConnect) {
        options.hana = prompts
    } else {
        options = await getConnOptions(prompts)
    }

    base.debug(`In Create Connection`)
    return base.dbClass.createConnection(options)
}
