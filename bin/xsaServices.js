// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'xsaServices [action]'
export const aliases = ['xsa', 'xsaSvc', 'xsaservices']
export const describe = baseLite.bundle.getText("xsaServices")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  action: {
    alias: ['a', 'Action'],
    type: 'string',
    default: 'list',
    choices: ['list', 'status', 'start', 'stop', 'restart', 'info'],
    desc: baseLite.bundle.getText("action")
  },
  service: {
    alias: ['sv', 'Service'],
    type: 'string',
    desc: baseLite.bundle.getText("service")
  },
  details: {
    alias: ['d', 'Details'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("details")
  }
})).example('hana-cli xsaServices --action list --details', baseLite.bundle.getText('xsaServicesExample'))

export let inputPrompts = {
  action: {
    description: baseLite.bundle.getText("action"),
    type: 'string',
    required: true
  },
  service: {
    description: baseLite.bundle.getText("service"),
    type: 'string',
    required: false
  },
  details: {
    description: baseLite.bundle.getText("details"),
    type: 'boolean',
    required: false
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, manageXSAServices, inputPrompts)
}

/**
 * Manage XSA (Extended Services Architecture) services
 * @param {object} prompts - Input prompts with action and service name
 * @returns {Promise<void>}
 */
export async function manageXSAServices(prompts) {
  const base = await import('../utils/base.js')
  base.debug('manageXSAServices')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    switch (prompts.action.toLowerCase()) {
      case 'list':
        await listXSAServices(db, prompts.details)
        break
      case 'status':
        await getXSAServiceStatus(db, prompts.service, prompts.details)
        break
      case 'start':
        if (!prompts.service) {
          throw new Error(base.bundle.getText("serviceRequired"))
        }
        await startXSAService(db, prompts.service)
        break
      case 'stop':
        if (!prompts.service) {
          throw new Error(base.bundle.getText("serviceRequired"))
        }
        await stopXSAService(db, prompts.service)
        break
      case 'restart':
        if (!prompts.service) {
          throw new Error(base.bundle.getText("serviceRequired"))
        }
        await restartXSAService(db, prompts.service)
        break
      case 'info':
        await getXSAServiceInfo(db, prompts.service, prompts.details)
        break
      default:
        throw new Error(base.bundle.getText("invalidAction"))
    }
    
    base.end()
  } catch (error) {
    base.error(error)
  }
}

/**
 * List all XSA services
 * @param {object} db - Database connection
 * @param {boolean} details - Include detailed information
 * @returns {Promise<void>}
 */
async function listXSAServices(db, details) {
  const base = await import('../utils/base.js')
  
  const query = `
SELECT 
  SERVICE_NAME,
  COMPONENT_NAME,
  ACTIVE,
  STARTUP_TYPE,
  CREATION_TIME
FROM SYS.XSA_SERVICES
ORDER BY SERVICE_NAME`

  const results = await db.statementExecPromisified(await db.preparePromisified(query), [])
  
  if (results && results.length > 0) {
    base.outputTableFancy(results)
  } else {
    console.log(base.bundle.getText("noServicesFound"))
  }
}

/**
 * Get status of XSA services
 * @param {object} db - Database connection
 * @param {string} service - Service name (optional)
 * @param {boolean} details - Include detailed information
 * @returns {Promise<void>}
 */
async function getXSAServiceStatus(db, service, details) {
  const base = await import('../utils/base.js')
  
  let query = `
SELECT 
  SERVICE_NAME,
  ACTIVE,
  STARTUP_TYPE,
  MEMORY_USAGE_MB,
  CPU_USAGE_PCT
FROM SYS.XSA_SERVICE_STATUS
WHERE 1=1`

  const params = []
  if (service) {
    query += ` AND SERVICE_NAME = ?`
    params.push(service)
  }
  
  query += ` ORDER BY SERVICE_NAME`

  const results = await db.statementExecPromisified(await db.preparePromisified(query), params)
  base.outputTableFancy(results)
}

/**
 * Start an XSA service
 * @param {object} db - Database connection
 * @param {string} service - Service name
 * @returns {Promise<void>}
 */
async function startXSAService(db, service) {
  const base = await import('../utils/base.js')
  
  const query = `CALL SYS.XSA_START_SERVICE(?)`
  await db.statementExecPromisified(await db.preparePromisified(query), [service])
  
  console.log(base.bundle.getText("serviceStarted", [service]))
}

/**
 * Stop an XSA service
 * @param {object} db - Database connection
 * @param {string} service - Service name
 * @returns {Promise<void>}
 */
async function stopXSAService(db, service) {
  const base = await import('../utils/base.js')
  
  const query = `CALL SYS.XSA_STOP_SERVICE(?)`
  await db.statementExecPromisified(await db.preparePromisified(query), [service])
  
  console.log(base.bundle.getText("serviceStopped", [service]))
}

/**
 * Restart an XSA service
 * @param {object} db - Database connection
 * @param {string} service - Service name
 * @returns {Promise<void>}
 */
async function restartXSAService(db, service) {
  const base = await import('../utils/base.js')
  
  await stopXSAService(db, service)
  await startXSAService(db, service)
  
  console.log(base.bundle.getText("serviceRestarted", [service]))
}

/**
 * Get detailed information about XSA services
 * @param {object} db - Database connection
 * @param {string} service - Service name (optional)
 * @param {boolean} details - Include detailed information
 * @returns {Promise<void>}
 */
async function getXSAServiceInfo(db, service, details) {
  const base = await import('../utils/base.js')
  
  let query = `
SELECT 
  SERVICE_NAME,
  COMPONENT_NAME,
  VERSION,
  ACTIVE,
  STARTUP_TYPE,
  CREATION_TIME,
  LAST_MODIFIED_TIME
FROM SYS.XSA_SERVICES
WHERE 1=1`

  const params = []
  if (service) {
    query += ` AND SERVICE_NAME = ?`
    params.push(service)
  }
  
  query += ` ORDER BY SERVICE_NAME`

  const results = await db.statementExecPromisified(await db.preparePromisified(query), params)
  base.outputTableFancy(results)
}
