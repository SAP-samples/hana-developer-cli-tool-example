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
            base.debug(bundle.getText("debug.xs.curlError", [endpoint, stderr]))
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
 * Helper function to get service instances by plan name
 * @param {string} planName - Service plan name
 * @returns {Promise<object>}
 * @private
 */
async function getServiceInstancesByPlan(planName) {
    if (!planName || typeof planName !== 'string') {
        throw new Error(bundle.getText("error.xsServicePlanNameRequired"))
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
    base.debug(bundle.getText("debug.call", ["getCFConfig"]))
    
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
    base.debug(bundle.getText("debug.call", ["getCFOrg"]))
    const config = await getCFConfig()
    return config
}

/**
 * Get target organization name
 * @returns {Promise<string>}
 */
export async function getCFOrgName() {
    base.debug(bundle.getText("debug.call", ["getCFOrgName"]))
    const org = await getCFOrg()
    return org.org
}

/**
 * Get target organization GUID
 * @returns {Promise<string>}
 */
export async function getCFOrgGUID() {
    base.debug(bundle.getText("debug.call", ["getCFOrgGUID"]))
    const org = await getCFOrg()
    return org.orgGuid
}

/**
 * Get target space details
 * @returns {Promise<object>}
 */
export async function getCFSpace() {
    base.debug(bundle.getText("debug.call", ["getCFSpace"]))
    const config = await getCFConfig()
    return config
}

/**
 * Get target space name
 * @returns {Promise<string>}
 */
export async function getCFSpaceName() {
    base.debug(bundle.getText("debug.call", ["getCFSpaceName"]))
    const space = await getCFSpace()
    return space.space
}

/**
 * Get target space GUID
 * @returns {Promise<string>}
 */
export async function getCFSpaceGUID() {
    base.debug(bundle.getText("debug.call", ["getCFSpaceGUID"]))
    const space = await getCFSpace()
    return space.spaceGuid
}

/**
 * Get current targets
 * @returns {Promise<string>}
 */
export async function getCFTarget() {
    base.debug(bundle.getText("debug.call", ["getCFTarget"]))
    const config = await getCFConfig()
    return config.api?.replace(/\\:/g, ':') || ''
}

/**
 * Get all instances of service plan hana
 * @returns {Promise<object[]>}
 */
export async function getHANAInstances() {
    base.debug(bundle.getText("debug.call", ["getHANAInstances"]))

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
        throw new Error(bundle.getText("error.xsServiceInstanceNameRequired"))
    }
    
    base.debug(bundle.getText("debug.callWithParams", ["getHANAInstanceByName", name]))

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
    base.debug(bundle.getText("debug.call", ["getServices"]))
    
    try {
        const result = await executeXSCurl('/v2/services')
        return result?.services || []
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getServices", error]))
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
        throw new Error(bundle.getText("error.xsServiceGuidRequired"))
    }
    
    base.debug(bundle.getText("debug.callWithParams", ["getServicePlans", serviceGUID]))
    
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
        throw new Error(bundle.getText("error.xsServiceNameRequired"))
    }
    
    base.debug(bundle.getText("debug.callWithParams", ["getServiceGUID", service]))
    
    try {
        const services = await getServices()
        const item = services.find(x => x.serviceEntity?.label === service)
        
        if (!item) {
            throw new Error(bundle.getText("error.xsServiceNotFound", [service]))
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
        throw new Error(bundle.getText("error.xsServiceGuidRequired"))
    }
    if (!servicePlan || typeof servicePlan !== 'string') {
        throw new Error(bundle.getText("error.xsServicePlanNameRequired"))
    }
    
    base.debug(bundle.getText("debug.callWithParams", ["getServicePlanGUID", `${serviceGUID} ${servicePlan}`]))
    
    try {
        const servicePlans = await getServicePlans(serviceGUID)
        const item = servicePlans.find(x => x.servicePlanEntity?.name === servicePlan)
        
        if (!item) {
            throw new Error(bundle.getText("error.xsServicePlanNotFound", [servicePlan]))
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
    base.debug(bundle.getText("debug.call", ["getHDIInstances"]))
    return getServiceInstancesByPlan('hdi-shared')
}

/**
 * Get all SBSS service instances 
 * @returns {Promise<object[]>}
 */
export async function getSbssInstances() {
    base.debug(bundle.getText("debug.call", ["getSbssInstances"]))
    return getServiceInstancesByPlan('sbss')
}

/**
 * Get all SecureStore service instances 
 * @returns {Promise<object[]>}
 */
export async function getSecureStoreInstances() {
    base.debug(bundle.getText("debug.call", ["getSecureStoreInstances"]))
    return getServiceInstancesByPlan('securestore')
}

/**
 * Get all Schema service instances 
 * @returns {Promise<object[]>}
 */
export async function getSchemaInstances() {
    base.debug(bundle.getText("debug.call", ["getSchemaInstances"]))
    return getServiceInstancesByPlan('schema')
}

/**
 * Get all User Provided Service Instances
 * @returns {Promise<object[]>}
 */
export async function getUpsInstances() {
    base.debug(bundle.getText("debug.call", ["getUpsInstances"]))
    
    try {
        const endpoint = '/v2/user_provided_service_instances/?results-per-page=5000'
        const result = await executeXSCurl(endpoint)
        return result?.userProvidedServiceInstances || []
    } catch (error) {
        base.debug(error)
        throw error
    }
}

