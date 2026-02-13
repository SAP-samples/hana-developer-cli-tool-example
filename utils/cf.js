/*eslint-env node, es6 */
// @ts-check

/**
 * @module cf - library for calling CF APIs via CLI
 */
import * as base from "./base.js"
const bundle = base.bundle
import * as fs from 'fs'
import { homedir } from 'os'
import { promisify } from 'util'
import * as child_process from 'child_process'

// Cache for CF configuration to avoid repeated file reads
let cfConfigCache = null

/**
 * Helper function to execute cf curl commands with consistent error handling
 * @param {string} endpoint - CF API endpoint
 * @returns {Promise<object>}
 * @private
 */
async function executeCFCurl(endpoint) {
    const exec = promisify(child_process.exec)
    const script = `cf curl "${endpoint}"`
    
    try {
        const { stdout, stderr } = await exec(script)
        
        if (stderr) {
            base.debug(bundle.getText("debug.cf.curlError", [endpoint, stderr]))
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        return stdout ? JSON.parse(stdout) : null
    } catch (error) {
        if (!(error instanceof SyntaxError)) {
            base.debug(error)
            throw error
        }
        throw new Error(`${bundle.getText("error")} ${bundle.getText("error.jsonParseError")}`)
    }
}

/**
 * Helper function to get service instances by plan names or type
 * @param {string|string[]} servicePlans - Service plan name(s) (comma-separated string or array)
 * @param {Object} options - Query options
 * @param {string} [options.name] - Filter by instance name
 * @param {string} [options.type] - Filter by instance type (e.g., 'user-provided')
 * @returns {Promise<object>}
 * @private
 */
async function getServiceInstancesByPlan(servicePlans, options = {}) {
    if (!servicePlans) {
        throw new Error(bundle.getText("error.cfServicePlansRequired"))
    }

    const space = await getCFSpace()
    const org = await getCFOrg()

    if (!space?.GUID || !org?.GUID) {
        throw new Error(bundle.getText("error.cfTargetUnavailable"))
    }

    const spaceGUID = space.GUID
    const orgGUID = org.GUID
    
    let endpoint = `/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&per_page=5000`
    
    if (options.type) {
        endpoint += `&type=${options.type}`
    } else if (servicePlans) {
        const plans = Array.isArray(servicePlans) ? servicePlans.join(',') : servicePlans
        endpoint += `&service_plan_names=${plans}`
    }
    
    if (options.name) {
        endpoint += `&names=${options.name}`
    }
    
    return executeCFCurl(endpoint)
}

/**
 * Get cf cli version
 * @returns {Promise<String>}
 */
export async function getVersion() {
    base.debug(bundle.getText("debug.call", ["getVersion"]))

    try {
        const exec = promisify(child_process.exec)
        const script = `cf -v`
        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        return stdout?.trim() || ''
    } catch (error) {
        base.debug(error)
        throw error
    }
}

/**
 * Read central configuration file for CF CLI
 * @returns {Promise<object>}
 */
export async function getCFConfig() {
    base.debug(bundle.getText("debug.call", ["getCFConfig"]))
    
    // Return cached config if available
    if (cfConfigCache) {
        return cfConfigCache
    }

    try {
        const configPath = `${homedir()}/.cf/config.json`
        const data = await fs.promises.readFile(configPath, { encoding: 'utf8' })
        cfConfigCache = JSON.parse(data)
        return cfConfigCache
    } catch (error) {
        base.debug(error)
        throw new Error(bundle.getText("errCFConfig"))
    }
}

/**
 * Clear CF config cache (useful for testing or forced refresh)
 * @returns {void}
 */
export function clearCFConfigCache() {
    cfConfigCache = null
}

/**
 * Get target organization
 * @returns {Promise<object>}
 */
export async function getCFOrg() {
    base.debug(bundle.getText("debug.call", ["getCFOrg"]))
    const config = await getCFConfig()
    return config.OrganizationFields
}

/**
 * Get target organization name
 * @returns {Promise<string>}
 */
export async function getCFOrgName() {
    base.debug(bundle.getText("debug.call", ["getCFOrgName"]))
    const org = await getCFOrg()
    return org.Name
}

/**
 * Get target organization GUID
 * @returns {Promise<string>}
 */
export async function getCFOrgGUID() {
    base.debug(bundle.getText("debug.call", ["getCFOrgGUID"]))
    const org = await getCFOrg()
    return org.GUID
}

/**
 * Get target space details
 * @returns {Promise<object>}
 */
export async function getCFSpace() {
    base.debug(bundle.getText("debug.call", ["getCFSpace"]))
    const config = await getCFConfig()
    return config.SpaceFields
}

/**
 * Get target space name
 * @returns {Promise<string>}
 */
export async function getCFSpaceName() {
    base.debug(bundle.getText("debug.call", ["getCFSpaceName"]))
    const space = await getCFSpace()
    return space.Name
}

/**
 * Get target space GUID
 * @returns {Promise<string>}
 */
export async function getCFSpaceGUID() {
    base.debug(bundle.getText("debug.call", ["getCFSpaceGUID"]))
    const space = await getCFSpace()
    return space.GUID
}

/**
 * Get current targets
 * @returns {Promise<object>}
 */
export async function getCFTarget() {
    base.debug(bundle.getText("debug.call", ["getCFTarget"]))
    const config = await getCFConfig()
    return config.Target
}

/**
 * Get all instances of service plan hana
 * @returns {Promise<object>}
 */
export async function getHANAInstances() {
    base.debug(bundle.getText("debug.call", ["getHANAInstances"]))
    return getServiceInstancesByPlan('hana,hana-free')
}

/**
 * Get instances of service plan hana that match input name
 * @param {string} name - service instance name
 * @returns {Promise<object>}
 */
export async function getHANAInstanceByName(name) {
    if (!name || typeof name !== 'string') {
        throw new Error(bundle.getText("error.cfServiceInstanceNameRequired"))
    }
    
    base.debug(bundle.getText("debug.callWithParams", ["getHANAInstanceByName", name]))
    return getServiceInstancesByPlan('hana,hana-free', { name })
}

/**
 * Get status of hana instance
 * @param {string} hanaInstanceGUID - HANA Service instance GUID
 * @returns {Promise<string>}
 */
export async function getHANAInstanceStatus(hanaInstanceGUID) {
    if (!hanaInstanceGUID || typeof hanaInstanceGUID !== 'string') {
        throw new Error(bundle.getText("error.cfHanaInstanceGuidRequired"))
    }
    
    base.debug(bundle.getText("debug.callWithParams", ["getHANAInstanceStatus", hanaInstanceGUID]))

    const serviceParameters = await getCFServiceInstanceParameters(hanaInstanceGUID)

    if (serviceParameters.errors) {
        return bundle.getText("hc.updateProgress")
    }

    switch (serviceParameters.data?.serviceStopped) {
        case false:
            return bundle.getText("hc.running")
        case true:
            return bundle.getText("hc.stopped")
        default:
            return bundle.getText("hc.unknown")
    }
}

/**
 * Get all HDI service instances 
 * @returns {Promise<object>}
 */
export async function getHDIInstances() {
    base.debug(bundle.getText("debug.call", ["getHDIInstances"]))
    return getServiceInstancesByPlan('hdi-shared')
}

/**
 * Get all SBSS service instances 
 * @returns {Promise<object>}
 */
export async function getSbssInstances() {
    base.debug(bundle.getText("debug.call", ["getSbssInstances"]))
    return getServiceInstancesByPlan('sbss')
}

/**
 * Get all SecureStore service instances 
 * @returns {Promise<object>}
 */
export async function getSecureStoreInstances() {
    base.debug(bundle.getText("debug.call", ["getSecureStoreInstances"]))
    return getServiceInstancesByPlan('securestore')
}

/**
 * Get all Schema service instances 
 * @returns {Promise<object>}
 */
export async function getSchemaInstances() {
    base.debug(bundle.getText("debug.call", ["getSchemaInstances"]))
    return getServiceInstancesByPlan('schema')
}

/**
 * Get all User Provided Service Instances
 * @returns {Promise<object>}
 */
export async function getUpsInstances() {
    base.debug(bundle.getText("debug.call", ["getUpsInstances"]))
    return getServiceInstancesByPlan(null, { type: 'user-provided' })
}


/**
 * Start HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name 
 * @returns {Promise<string>}
 */
export async function startHana(name) {
    if (!name || typeof name !== 'string') {
        throw new Error(bundle.getText("error.cfHanaInstanceNameRequired"))
    }
    
    base.debug(bundle.getText("debug.callWithParams", ["startHana", name]))
    
    const fileName = `${homedir()}/hana_start.json`
    
    try {
        await getCFSpace()
        
        const exec = promisify(child_process.exec)
        const data = { "data": { "serviceStopped": false } }
        
        await fs.promises.writeFile(fileName, JSON.stringify(data))
        
        const script = `cf update-service ${name} -c ${fileName}`
        const { stdout, stderr } = await exec(script)
        
        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        return stdout
    } catch (error) {
        base.debug(error)
        throw error
    } finally {
        try {
            await fs.promises.unlink(fileName)
        } catch (unlinkError) {
            // Log but don't throw if cleanup fails
            base.debug(bundle.getText("debug.cf.cleanupTempFileFailed", [fileName, unlinkError]))
        }
    }
}

/**
 * Stop HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name
 * @returns {Promise<string>}
 */
export async function stopHana(name) {
    if (!name || typeof name !== 'string') {
        throw new Error(bundle.getText("error.cfHanaInstanceNameRequired"))
    }
    
    base.debug(bundle.getText("debug.callWithParams", ["stopHana", name]))
    
    const fileName = `${homedir()}/hana_stop.json`
    
    try {
        await getCFSpace()
        
        const exec = promisify(child_process.exec)
        const data = { "data": { "serviceStopped": true } }
        
        await fs.promises.writeFile(fileName, JSON.stringify(data))
        
        const script = `cf update-service ${name} -c ${fileName}`
        const { stdout, stderr } = await exec(script)
        
        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        return stdout
    } catch (error) {
        base.debug(error)
        throw error
    } finally {
        try {
            await fs.promises.unlink(fileName)
        } catch (unlinkError) {
            // Log but don't throw if cleanup fails
            base.debug(bundle.getText("debug.cf.cleanupTempFileFailed", [fileName, unlinkError]))
        }
    }
}

/**
 * Get Cloud Foundry service instance parameters
 * @param {string} serviceInstanceGUID - Service instance GUID
 * @returns {Promise<object>}
 */
export async function getCFServiceInstanceParameters(serviceInstanceGUID) {
    if (!serviceInstanceGUID || typeof serviceInstanceGUID !== 'string') {
        throw new Error(bundle.getText("error.cfServiceInstanceGuidRequired"))
    }
    
    base.debug(bundle.getText("debug.callWithParams", ["getCFServiceInstanceParameters", serviceInstanceGUID]))
    return executeCFCurl(`/v3/service_instances/${serviceInstanceGUID}/parameters`)
}
