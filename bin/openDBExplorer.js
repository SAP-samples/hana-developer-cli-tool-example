// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as conn from '../utils/connections.js'
import * as btp from '../utils/btp.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'opendbx'
export const aliases = ['open', 'openDBX', 'opendb', 'openDBExplorer', 'opendbexplorer', 'dbx', 'DBX']
export const describe = baseLite.bundle.getText("opendbx")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).wrap(160).example(
  'hana-cli opendbx',
  baseLite.bundle.getText("opendbxExample")
).epilog(buildDocEpilogue('openDBExplorer', 'schema-tools', ['tables', 'schemas', 'objects']))
export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, getDBX, {})
}

export async function getDBX(prompts) {
  const base = await import('../utils/base.js')
    base.debug('getDBX')
    const { default:open } = await import('open')
    try {
        let dbxURL = ''
        
        // First, try to get HANA Cloud instance from BTP
        try {
            let instances = await btp.getHANAServiceInstances()
            
            if (instances && instances.length > 0) {
                // Use the first (default) instance
                let instance = instances[0]
                
                // Construct DB explorer URL from the instance's dashboard URL
                let dashboardUrl = instance.dashboard_url
                let url = new URL(dashboardUrl)
                dbxURL = `${url.protocol}//${url.host}/sap/hana/cst/catalog/index.html`
            }
        } catch (error) {
            base.debug('Failed to get HANA Cloud instances from BTP, falling back to on-premise lookup')
        }
        
        // Fallback logic for on-premise XSA based systems
        if (!dbxURL) {
            let options = await conn.getConnOptions(prompts)
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
                await console.log(`${baseLite.bundle.getText("errDBX")}: Unable to determine DB Explorer URL`)
                return
            }
        }        
        
        await open(dbxURL, {wait: true})
        console.log(dbxURL)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}

