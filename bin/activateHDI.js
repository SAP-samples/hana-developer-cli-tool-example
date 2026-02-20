// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'activateHDI [tenant]'
export const aliases = ['ahdi', 'ah']
export const describe = baseLite.bundle.getText("activateHDI")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  tenant: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("tenant")
  }
})).wrap(160).example('hana-cli activateHDI --container hdi_container', baseLite.bundle.getText("activateHDIExample")).wrap(160).epilog(buildDocEpilogue('activateHDI', 'hdi-management', ['adminHDI', 'adminHDIGroup', 'cds']))

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, activate, {
    tenant: {
      description: base.bundle.getText("tenant"),
      type: 'string',
      required: true
    }
  })
}

/**
 * Activate HDI (HANA Deployment Infrastructure) diserver on the specified tenant database
 * @param {object} prompts - Input prompts with tenant name
 * @returns {Promise<void>}
 */
export async function activate(prompts) {
  const base = await import('../utils/base.js')
  base.debug('activate')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()
    let results = await dbStatus.execSQL(
      `DO
      BEGIN
        DECLARE dbName NVARCHAR(25) = '${prompts.tenant}'; 
        -- Start diserver
        DECLARE diserverCount INT = 0;
        SELECT COUNT(*) INTO diserverCount FROM SYS_DATABASES.M_SERVICES WHERE SERVICE_NAME = 'diserver' AND DATABASE_NAME = :dbName AND ACTIVE_STATUS = 'YES';
        IF diserverCount = 0 THEN
          EXEC 'ALTER DATABASE ' || :dbName || ' ADD ''diserver''';
        END IF;           
      END;`)
    console.table(results)
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}