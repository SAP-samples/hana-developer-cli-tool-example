/*eslint-env node, es6 */
// @ts-check

/**
 * @module xs - library for calling XSA APIs via CLI
 */
import * as base from "./base.js"
const bundle = base.bundle
import * as fs from 'fs'
import { homedir } from 'os'
import properties from 'properties'
import { promisify } from 'util'
import * as child_process from 'child_process'

// Cache for XS configuration to avoid repeated file reads
let xsConfigCache = null

/**
 * Helper function to execute xs curl commands with consistent error handling
 * @param {string} endpoint - XSA API endpoint
 * @returns {Promise<object>}
 * @private
 */
async function executeXSCurl(endpoint) {
    const exec = promisify(child_process.exec)
    const script = `xs curl "${endpoint}"`
    
    try {
        const { stdout, stderr } = await exec(script)
        
        if (stderr) {
            base.debug(`XS curl error on ${endpoint}: ${stderr}`)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        return stdout ? JSON.parse(stdout) : null
    } catch (error) {
        if (!(error instanceof SyntaxError)) {
            base.debug(error)
            throw error
        }
        throw new Error(`${bundle.getText("error")} JSON parse error`)
    }
}

/**
 * Helper function to get service instances by plan name
 * @param {string} planName - Service plan name
 * @returns {Promise<object>}
 * @private
 */
async function getServiceInstancesByPlan(planName) {
    if (!planName || typeof planName !== 'string') {
        throw new Error('Service plan name must be a non-empty string')
    }
    
    const spaceGUID = await getCFSpaceGUID()
    const serviceGUID = await getServiceGUID('hana')
    const planGUID = await getServicePlanGUID(serviceGUID, planName)
    
    const endpoint = `/v2/service_instances/?q=space_guid:${spaceGUID}%3Bservice_plan_guid:${planGUID}&results-per-page=5000`
    const result = await executeXSCurl(endpoint)
    
    return result?.serviceInstances || []
}

/**
 * Read central configuration file for XSA CLI
 * @returns {Promise<object>}
 */
export async function getCFConfig() {
    base.debug('getCFConfig')
    
    // Return cached config if available
    if (xsConfigCache) {
        return xsConfigCache
    }

    try {
        const configPath = `${homedir()}/.xsconfig`
        const data = await fs.promises.readFile(configPath, { encoding: 'utf8' })
        xsConfigCache = properties.parse(data)
        return xsConfigCache
    } catch (error) {
        base.debug(error)
        throw new Error(bundle.getText("errXSConfig"))
    }
}

/**
 * Clear XS config cache (useful for testing or forced refresh)
 * @returns {void}
 */
export function clearXSConfigCache() {
    xsConfigCache = null
}

/**
 * Get target organization
 * @returns {Promise<object>}
 */
export async function getCFOrg() {
    base.debug('getCFOrg')
    const config = await getCFConfig()
    return config
}

/**
 * Get target organization name
 * @returns {Promise<string>}
 */
export async function getCFOrgName() {
    base.debug('getCFOrgName')
    const org = await getCFOrg()
    return org.org
}

/**
 * Get target organization GUID
 * @returns {Promise<string>}
 */
export async function getCFOrgGUID() {
    base.debug('getCFOrgGUID')
    const org = await getCFOrg()
    return org.orgGuid
}

/**
 * Get target space details
 * @returns {Promise<object>}
 */
export async function getCFSpace() {
    base.debug('getCFSpace')
    const config = await getCFConfig()
    return config
}

/**
 * Get target space name
 * @returns {Promise<string>}
 */
export async function getCFSpaceName() {
    base.debug('getCFSpaceName')
    const space = await getCFSpace()
    return space.space
}

/**
 * Get target space GUID
 * @returns {Promise<string>}
 */
export async function getCFSpaceGUID() {
    base.debug('getCFSpaceGUID')
    const space = await getCFSpace()
    return space.spaceGuid
}

/**
 * Get current targets
 * @returns {Promise<string>}
 */
export async function getCFTarget() {
    base.debug('getCFTarget')
    const config = await getCFConfig()
    return config.api?.replace(/\\:/g, ':') || ''
}

/**
 * Get all instances of service plan hana
 * @returns {Promise<object[]>}
 */
export async function getHANAInstances() {
    base.debug('getHANAInstances')

    try {
        const spaceGUID = await getCFSpaceGUID()
        const endpoint = `/v2/service_instances?q=space_guid:${spaceGUID}&results-per-page=5000`
        const result = await executeXSCurl(endpoint)
        return result?.serviceInstances || []
    } catch (error) {
        base.debug(error)
        throw error
    }
}

/**
 * Get instances of service plan hana that match input name
 * @param {string} name - service instance name
 * @returns {Promise<object[]>}
 */
export async function getHANAInstanceByName(name) {
    if (!name || typeof name !== 'string') {
        throw new Error('Service instance name must be a non-empty string')
    }
    
    base.debug(`getHANAInstanceByName ${name}`)

    try {
        const spaceGUID = await getCFSpaceGUID()
        const endpoint = `/v2/service_instances?q=space_guid:${spaceGUID}%3Bname:${name}&results-per-page=5000`
        const result = await executeXSCurl(endpoint)
        return result?.serviceInstances || []
    } catch (error) {
        base.debug(error)
        throw error
    }
}

/**
 * Get all services
 * @returns {Promise<object[]>}
 */
export async function getServices() {
    base.debug('getServices')
    
    try {
        const result = await executeXSCurl('/v2/services')
        return result?.services || []
    } catch (error) {
        base.debug(`getServices Error: ${error}`)
        throw error
    }
}

/**
 * Get all service plans for a service
 * @param {string} serviceGUID - service GUID
 * @returns {Promise<object[]>}
 */
export async function getServicePlans(serviceGUID) {
    if (!serviceGUID || typeof serviceGUID !== 'string') {
        throw new Error('Service GUID must be a non-empty string')
    }
    
    base.debug(`getServicePlans ${serviceGUID}`)
    
    try {
        const endpoint = `/v2/services/${serviceGUID}/service_plans`
        const result = await executeXSCurl(endpoint)
        return result?.servicePlans || []
    } catch (error) {
        base.debug(error)
        throw error
    }
}

/**
 * Get Service GUID by service name
 * @param {string} service - Service name
 * @returns {Promise<string>}
 */
export async function getServiceGUID(service) {
    if (!service || typeof service !== 'string') {
        throw new Error('Service name must be a non-empty string')
    }
    
    base.debug(`getServiceGUID ${service}`)
    
    try {
        const services = await getServices()
        const item = services.find(x => x.serviceEntity?.label === service)
        
        if (!item) {
            throw new Error(`Service '${service}' not found`)
        }
        
        return item.metadata.guid
    } catch (error) {
        base.debug(error)
        throw error
    }
}

/**
 * Get Service Plan GUID
 * @param {string} serviceGUID - Service GUID
 * @param {string} servicePlan - Service Plan Name
 * @returns {Promise<string>}
 */
export async function getServicePlanGUID(serviceGUID, servicePlan) {
    if (!serviceGUID || typeof serviceGUID !== 'string') {
        throw new Error('Service GUID must be a non-empty string')
    }
    if (!servicePlan || typeof servicePlan !== 'string') {
        throw new Error('Service plan name must be a non-empty string')
    }
    
    base.debug(`getServicePlanGUID ${serviceGUID} ${servicePlan}`)
    
    try {
        const servicePlans = await getServicePlans(serviceGUID)
        const item = servicePlans.find(x => x.servicePlanEntity?.name === servicePlan)
        
        if (!item) {
            throw new Error(`Service plan '${servicePlan}' not found`)
        }
        
        return item.metadata.guid
    } catch (error) {
        base.debug(error)
        throw error
    }
}

/**
 * Get all HDI service instances 
 * @returns {Promise<object[]>}
 */
export async function getHDIInstances() {
    base.debug('getHDIInstances')
    return getServiceInstancesByPlan('hdi-shared')
}

/**
 * Get all SBSS service instances 
 * @returns {Promise<object[]>}
 */
export async function getSbssInstances() {
    base.debug('getSbssInstances')
    return getServiceInstancesByPlan('sbss')
}

/**
 * Get all SecureStore service instances 
 * @returns {Promise<object[]>}
 */
export async function getSecureStoreInstances() {
    base.debug('getSecureStoreInstances')
    return getServiceInstancesByPlan('securestore')
}

/**
 * Get all Schema service instances 
 * @returns {Promise<object[]>}
 */
export async function getSchemaInstances() {
    base.debug('getSchemaInstances')
    return getServiceInstancesByPlan('schema')
}

/**
 * Get all User Provided Service Instances
 * @returns {Promise<object[]>}
 */
export async function getUpsInstances() {
    base.debug('getUpsInstances')
    
    try {
        const endpoint = '/v2/user_provided_service_instances/?results-per-page=5000'
        const result = await executeXSCurl(endpoint)
        return result?.userProvidedServiceInstances || []
    } catch (error) {
        base.debug(error)
        throw error
    }
}

