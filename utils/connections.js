/*eslint-env node, es6 */
"use strict"

function getFileCheckParents(filename) {

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

        return false

    }
    catch (error) {
        throw new Error(`Error: ${error}`)
    }
}
module.exports.getFileCheckParents = getFileCheckParents

function getPackageJSON() {
    return getFileCheckParents(`package.json`)
}
module.exports.getPackageJSON = getPackageJSON

function getMTA() {
    return getFileCheckParents(`mta.yaml`)
}
module.exports.getMTA = getMTA

function getDefaultEnv() {
    return getFileCheckParents(`default-env.json`)
}
module.exports.getDefaultEnv = getDefaultEnv

function getDefaultEnvAdmin() {
    return getFileCheckParents(`default-env-admin.json`)
}
module.exports.getDefaultEnvAdmin = getDefaultEnvAdmin

function getEnv() {
    return getFileCheckParents(`.env`)
}
module.exports.getEnv = getEnv


function resolveEnv(options) {
    let path = require("path")
    let file = 'default-env.json'
    if (options && Object.prototype.hasOwnProperty.call(options, 'admin') && options.admin) {
        file = 'default-env-admin.json'
    }
    let envFile = path.resolve(process.cwd(), file)
    return envFile
}
module.exports.resolveEnv = resolveEnv

async function createConnection(prompts) {
    return new Promise((resolve, reject) => {
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
            if (envFile) { console.log(`Using Connection Configuration loaded via ${envFile} \n`) }

        } else {
            if (!envFile) { console.log(`Using Connection Configuration from Environment loaded via ${getEnv()} \n`) }
            else { console.log(`Using Admin Configuration loaded via ${envFile} \n`) }
        }



        //Load Environment 
        const xsenv = require("@sap/xsenv")
        xsenv.loadEnv(envFile)

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
                if (envFile) { throw new Error(`Badly formatted configuration file ${envFile}.  Full Details: ${error}`) } 
                else { throw new Error(`Missing configuration file. No default-env.json or substitute found. Full Details: ${error}`) }

            }
        }
        let hdbext = require("@sap/hdbext")
        options.hana.pooling = true

        hdbext.createConnection(options.hana, (error, client) => {
            if (error) {
                reject(error)
            } else {
                resolve(client)
            }
        })
    })
}
module.exports.createConnection = createConnection