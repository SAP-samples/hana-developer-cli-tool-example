// @ts-check
import * as base from '../utils/base.js'
import * as conn from '../utils/connections.js'

export const command = 'opendbx'
export const aliases = ['open', 'openDBX', 'opendb', 'openDBExplorer', 'opendbexplorer', 'dbx', 'DBX']
export const describe = base.bundle.getText("opendbx")
export const builder = base.getBuilder({})
export function handler (argv) {
    base.promptHandler(argv, getDBX, {})
}

export async function getDBX(prompts) {
    base.debug('getDBX')
    const { default:open } = await import('open')
    try {
        let options = await conn.getConnOptions(prompts)
        
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
            const db = new base.dbClass(await conn.createConnection(prompts))
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
                await console.log(`${base.bundle.getText("errDBX")}: ${host}`)
                return
            }
        }        
        open(dbxURL)
        console.log(dbxURL)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}

