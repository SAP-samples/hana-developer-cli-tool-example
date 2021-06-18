/*eslint-env node, es6 */
// @ts-check

/**
 * @module connections - helper utility for making connections to HANA DB and determine connection settings
 */
"use strict"
const base = require("./base")

/**
 * Check parameter folders to see if the input file exists there
 * @param {string} filename 
 * @returns {string} - the file path if found 
 */
function getFileCheckParents(filename) {
    base.debug(`getFileCheckParents ${filename}`)
    try {
        const fs = require('fs')
        const path = require('path')

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
module.exports.getFileCheckParents = getFileCheckParents

/**
 * Check current and parent directories for a package.json
 * @returns {string} - the file path if found 
 */
function getPackageJSON() {
    base.debug('getPackageJSON')
    return getFileCheckParents(`package.json`)
}
module.exports.getPackageJSON = getPackageJSON

/**
 * Check current and parent directories for a mta.yaml
 * @returns {string} - the file path if found 
 */
function getMTA() {
    base.debug('getMTA')
    return getFileCheckParents(`mta.yaml`)
}
module.exports.getMTA = getMTA

/**
 * Check current and parent directories for a default-env.json
 * @returns {string} - the file path if found 
 */
function getDefaultEnv() {
    base.debug('getDefaultEnv')
    return getFileCheckParents(`default-env.json`)
}
module.exports.getDefaultEnv = getDefaultEnv

/**
 * Check current and parent directories for a default-env-admin.json
 * @returns {string} - the file path if found 
 */
function getDefaultEnvAdmin() {
    base.debug('getDefaultEnvAdmin')
    return getFileCheckParents(`default-env-admin.json`)
}
module.exports.getDefaultEnvAdmin = getDefaultEnvAdmin

/**
 * Check current and parent directories for a .env
 * @returns {string} - the file path if found 
 */
function getEnv() {
    base.debug('getEnv')
    return getFileCheckParents(`.env`)
}
module.exports.getEnv = getEnv

/**
 * Resolve Environment by deciding which option between default-env and default-env-admin we should take
 * @param {*} options 
 * @returns {string} - the file path if found 
 */
function resolveEnv(options) {
    base.debug(`resolveEnv ${options}`)
    let path = require("path")
    let file = 'default-env.json'
    if (options && Object.prototype.hasOwnProperty.call(options, 'admin') && options.admin) {
        file = 'default-env-admin.json'
    }
    let envFile = path.resolve(process.cwd(), file)
    return envFile
}
module.exports.resolveEnv = resolveEnv

/**
 * Get Connection Options from input prompts
 * @param {object} prompts - input prompts
 * @returns {object} connection options
 */
function getConnOptions(prompts) {
    base.debug('getConnOptions')
    let envFile

    //Look for Admin option - it overrides everything
    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'admin') && prompts.admin) {
        envFile = getDefaultEnvAdmin()
    }

    //No Admin option or no default-env-admin.json file found - try for .env 
    if (!envFile) {
        let dotEnvFile = getEnv()
        require('dotenv').config({ path: dotEnvFile })
    }

    //No .env File found or it doesn't contain a VCAP_SERVICES - try other options
    if (!process.env.VCAP_SERVICES && !envFile) {

        //Check for specific configuration file by special parameter 
        if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'conn') && prompts.conn) {
            envFile = getFileCheckParents(prompts.conn)

            //Conn parameters can also refer to a central configuration file in the user profile
            if (!envFile) {
                const homedir = require('os').homedir()
                envFile = getFileCheckParents(`${homedir}/.hana-cli/${prompts.conn}`)
            }
        }

        //No specific configuration file requested go back to default-env.json
        if (!envFile) {
            envFile = getDefaultEnv()

            //Last resort - default.json in user profile location
            if (!envFile) {
                const homedir = require('os').homedir()
                envFile = getFileCheckParents(`${homedir}/.hana-cli/default.json`)
            }
        }
        if (envFile && base.verboseOutput(prompts)) { console.log(`${base.bundle.getText("connFile2")} ${envFile} \n`) }

    } else {
        if (!envFile && base.verboseOutput(prompts)) { console.log(`${base.bundle.getText("connFile2")} ${getEnv()} \n`) }
        else if (base.verboseOutput(prompts)) { console.log(`${base.bundle.getText("connFile2")} ${envFile} \n`) }
    }

    //Load Environment 
    const xsenv = require("@sap/xsenv")
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
    options.hana.pooling = true
    base.debug(options)
    return (options)
}
module.exports.getConnOptions = getConnOptions

/**
 * Create Databse Connection 
 * @param {object} prompts - input prompt values
 * @param {boolean} directConnect - Direct Connection parameters are supplied in prompts
 * @returns {Promise<object>} HANA DB conneciton of type sap/hdbext
 */
async function createConnection(prompts, directConnect = false) {
    base.debug('createConnection')
    return new Promise((resolve, reject) => {
        /** @type object */
        let options = []
        if(directConnect){
            options.hana = prompts
        }else{
            options = getConnOptions(prompts)
        }

        base.debug(`In Create Connection`)
        let hdbext = require("@sap/hdbext")
        hdbext.createConnection(options.hana, (error, client) => {
            if (error) {
                reject(error)
            } else {
                resolve(client)
            }
        })
    }
    )
}
module.exports.createConnection = createConnection