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
 const exec = promisify(child_process.exec)

/**
 * Read central configuration file for XSA CLI
 * @returns {Promise<object>}
 */
export async function getCFConfig() {
    base.debug('getCFConfig')
    try {
        const data = fs.readFileSync(`${homedir}/.xsconfig`,
            { encoding: 'utf8', flag: 'r' })
        const object = properties.parse(data)
        return object
    }
    catch (error) {
        throw new Error(bundle.getText("errXSConfig"))
    }
}

/**
 * Get target organziation
 * @returns {Promise<object>}
 */
export async function getCFOrg() {
    base.debug('getCFOrg')
    const config = await getCFConfig()
    base.debug(config)
    return config
}

/**
 * Get target orgnaization name
 * @returns {Promise<string>}
 */
export async function getCFOrgName() {
    base.debug('getCFOrgName')
    const org = await getCFOrg()
    base.debug(org)
    return org.org
}

/**
 * Get target orgnaization GUID
 * @returns {Promise<string>}
 */
export async function getCFOrgGUID() {
    base.debug('getCFOrgGUID')
    const org = await getCFOrg()
    base.debug(org)
    return org.orgGuid
}

/**
 * Get target space details
 * @returns {Promise<object>}
 */
export async function getCFSpace() {
    base.debug('getCFSpace')
    const config = await getCFConfig()
    base.debug(config)
    return config
}

/**
 * Get target space name
 * @returns {Promise<string>}
 */
export async function getCFSpaceName() {
    base.debug('getCFSpaceName')
    const space = await getCFSpace()
    base.debug(space)
    return space.space
}

/**
 * Get target space GUID
 * @returns {Promise<string>}
 */
export async function getCFSpaceGUID() {
    base.debug('getCFSpaceGUID')
    const space = await getCFSpace()
    base.debug(space)
    return space.spaceGuid
}

/**
 * Get currrent targets
 * @returns {Promise<object>}
 */
export async function getCFTarget() {
    base.debug('getCFTarget')
    const config = await getCFConfig()
    base.debug(config)
    return config.api.replace(/\\:/g, ':')
}

/**
 * Get all instances of service plan hana
 * @returns {Promise<object>}
 */
export async function getHANAInstances() {
    base.debug('getHANAInstances')

    try {
        const spaceGUID = await getCFSpaceGUID()
        
        let script = `xs curl "/v2/service_instances?q=space_guid:${spaceGUID}&results-per-page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout).serviceInstances
        }


    } catch (error) {
        base.debug(error)
        throw (error)
    }
}

/**
 * Get instances of service plan hana that match input name
 * @param {string} name - service instance name
 * @returns {Promise<object>}
 */
export async function getHANAInstanceByName(name) {
    base.debug(`getHANAInstanceByName ${name}`)

    try {
        const spaceGUID = await getCFSpaceGUID()
        let script = `xs curl "/v2/service_instances?q=space_guid:${spaceGUID}%3Bname:${name}&results-per-page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout).serviceInstances
        }


    } catch (error) {
        base.debug(error)
        throw (error)
    }
}

/**
 * Get all service plans
 * @param {string} serviceGUID - service GUID
 * @returns {Promise<object>}
 */
export async function getServicePlans(serviceGUID) {
    base.debug(`getServicePlans ${serviceGUID}`)
    try {
        let script = `xs curl "/v2/services/${serviceGUID}/service_plans"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout).servicePlans
        }

    } catch (error) {
        base.debug(error)
        throw (error)
    }
}


/**
 * Get all services 
 * @returns {Promise<object>}
 */
export async function getServices() {
    base.debug('getServices')
    try {
        let script = `xs curl "/v2/services"`

        const { stdout, stderr } = await exec(script)
        if (stderr) {
            base.debug(`getServices Error: ${stderr}`)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            base.debug(`getServices Successful: ${stdout}`)
            return JSON.parse(stdout).services
        }


    } catch (error) {
        base.debug(`getServices Error: ${error}`)
        throw (error)
    }
}


/**
 * Get Service Plan GUID
 * @param {string} serviceGUID  - Service GUID
 * @param {string} servicePlan  - Service Plan Name
 * @returns {Promise<string>}
 */
export async function getServicePlanGUID(serviceGUID, servicePlan) {
    base.debug(`getServicePlanGUID ${serviceGUID} ${servicePlan}`)
    try {
        const servicePlans = await getServicePlans(serviceGUID)
        let item = servicePlans.find(x => x.servicePlanEntity.name == servicePlan)
        return item.metadata.guid

    } catch (error) {
        base.debug(error)
        throw (error)
    }
}

/**
 * Get Service GUID 
 * @param {string} service - Service name
 * @returns {Promise<string>}
 */
export async function getServiceGUID(service) {
    base.debug(`getServiceGUID ${service}`)
    try {
        const services = await getServices()
        let item = services.find(x => x.serviceEntity.label == service)
        base.debug(item.metadata)
        return item.metadata.guid

    } catch (error) {
        base.debug(error)
        throw (error)
    }
}

/**
 * Get all HDI service instances 
 * @returns {Promise<object>}
 */
export async function getHDIInstances() {
    base.debug(`getHDIInstances`)
    try {
        const spaceGUID = await getCFSpaceGUID()
        const serviceGUID = await getServiceGUID('hana')
        const planGUID = await getServicePlanGUID(serviceGUID, `hdi-shared`)
        let script = `xs curl "/v2/service_instances/?q=space_guid:${spaceGUID}%3Bservice_plan_guid:${planGUID}&results-per-page=5000"`
        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stderr)
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout).serviceInstances
        }
    }
    catch (error) {
        base.debug(error)
        throw (error)
    }
}


/**
 * Get all SBSS service instances 
 * @returns {Promise<object>}
 */
 export async function getSbssInstances() {
    base.debug(`getSbssInstances`)
    try {
        const spaceGUID = await getCFSpaceGUID()
        const serviceGUID = await getServiceGUID('hana')
        const planGUID = await getServicePlanGUID(serviceGUID, `sbss`)
        let script = `xs curl "/v2/service_instances/?q=space_guid:${spaceGUID}%3Bservice_plan_guid:${planGUID}&results-per-page=5000"`
        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stderr)
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout).serviceInstances
        }
    }
    catch (error) {
        base.debug(error)
        throw (error)
    }
}


/**
 * Get all SecureStore service instances 
 * @returns {Promise<object>}
 */
export async function getSecureStoreInstances() {
    base.debug(`getSecureStoreInstances`)
    try {
        const spaceGUID = await getCFSpaceGUID()
        const serviceGUID = await getServiceGUID('hana')
        const planGUID = await getServicePlanGUID(serviceGUID, `securestore`)
        let script = `xs curl "/v2/service_instances/?q=space_guid:${spaceGUID}%3Bservice_plan_guid:${planGUID}&results-per-page=5000"`
        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stderr)
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout).serviceInstances
        }
    }
    catch (error) {
        base.debug(error)
        throw (error)
    }
}


/**
 * Get all Schema service instances 
 * @returns {Promise<object>}
 */
export async function getSchemaInstances() {
    base.debug(`getSchemaInstances`)
    try {
        const spaceGUID = await getCFSpaceGUID()
        const serviceGUID = await getServiceGUID('hana')
        const planGUID = await getServicePlanGUID(serviceGUID, `schema`)
        let script = `xs curl "/v2/service_instances/?q=space_guid:${spaceGUID}%3Bservice_plan_guid:${planGUID}&results-per-page=5000"`
        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stderr)
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout).serviceInstances
        }
    }
    catch (error) {
        base.debug(error)
        throw (error)
    }
}


/**
 * Get all User Provided Service Instances
 * @returns {Promise<object>}
 */
export async function getUpsInstances() {
    base.debug(`getUpsInstances`)
    try {
        let script = `xs curl "/v2/user_provided_service_instances/?results-per-page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout).userProvidedServiceInstances
        }


    } catch (error) {
        base.debug(error)
        throw (error)
    }
}

