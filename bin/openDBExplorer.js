const colors = require("colors/safe")
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied")

exports.command = 'opendbx'
exports.aliases = ['open', 'openDBX', 'opendb', 'openDBExplorer', 'opendbexplorer']
exports.describe = bundle.getText("opendbx")


exports.builder = {
    admin: {
        alias: ['a', 'Admin'],
        type: 'boolean',
        default: false,
        desc: bundle.getText("admin")
    }
}


exports.handler = function (argv) {
    const prompt = require('prompt')
    prompt.override = argv
    prompt.message = colors.green(bundle.getText("input"))
    prompt.start()

    var schema = {
        properties: {
            admin: {
                description: bundle.getText("admin"),
                type: 'boolean',
                required: true,
                ask: () => {
                    return false;
                }
            }
        }
    }

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message)
        }
        //  global.startSpinner()
        getDBX(result)
    })
}


async function getDBX(result) {
    //const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)))
    try {
        require('dotenv').config()
        const xsenv = require("@sap/xsenv")
        xsenv.loadEnv(dbClass.resolveEnv(result))
        let options = ''
        if (!process.env.TARGET_CONTAINER) {
            options = xsenv.getServices({ hana: { tag: 'hana' } })
        } else {
            options = xsenv.getServices({ hana: { name: process.env.TARGET_CONTAINER } })
        }

        const host = options.hana.host
        let dbxURL = ''
        if (host.includes('us10.hanacloud')) {
            dbxURL = 'https://hana-cockpit.cfapps.us10.hana.ondemand.com/sap/hana/cst/catalog/index.html'
        } else if (host.includes('us20.hanacloud')) {
            dbxURL = 'https://hana-cockpit.cfapps.us20.hana.ondemand.com/sap/hana/cst/catalog/index.html'
        } else if (host.includes('eu10.hanacloud')) {
            dbxURL = 'https://hana-cockpit.cfapps.eu10.hana.ondemand.com/sap/hana/cst/catalog/index.html'
        } else if (host.includes('eu20.hanacloud')) {
            dbxURL = 'https://hana-cockpit.cfapps.eu20.hana.ondemand.com/sap/hana/cst/catalog/index.html'
        } else if (host.includes('ap10.hanacloud')) {
            dbxURL = 'https://hana-cockpit.cfapps.ap10.hana.ondemand.com/sap/hana/cst/catalog/index.html'
        } else if (host.includes('ap11.hanacloud')) {
            dbxURL = 'https://hana-cockpit.cfapps.ap11.hana.ondemand.com/sap/hana/cst/catalog/index.html'
        } else if (host.includes('ap21.hanacloud')) {
            dbxURL = 'https://hana-cockpit.cfapps.ap21.hana.ondemand.com/sap/hana/cst/catalog/index.html'
        } else {
            const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)))
            let query =
                `SELECT *  from M_INIFILE_CONTENTS 
                WHERE FILE_NAME LIKE 'xscontroller.ini'
                  AND KEY = 'api_url'      
                ORDER BY FILE_NAME, SECTION, KEY `
            let results = await db.statementExecPromisified(await db.preparePromisified(query), [])
            if (results[0]) {
                let apiUrl = results[0].VALUE
                dbxURL = `${apiUrl}/go/hrtt-core`
            } else {
                await console.log(`Sorry unable to determine Database Explorer URL from your HANA hostname: ${host}`)
                return
            }
        }
        console.log(dbxURL)
        const open = require('open')
        open(dbxURL)

        //  global.__spinner.stop()
        return
    } catch (error) {
        console.error(`Missing or badly formatted ${dbClass.resolveEnv(result)}. No HANA configuration can be read or processed`)
        //throw new Error();
    }
}

