/*eslint-env node, es6 */
// @ts-check

/**
 * @module xs - library for calling XSA APIs via CLI
 */
"use strict";
const base = require("./base")
const bundle = base.bundle

/**
 * Read central configuration file for XSA CLI
 * @returns {Promise<object>}
 */
async function getCFConfig() {
    base.debug('getCFConfig')
    try {
        const fs = require('fs')
        const homedir = require('os').homedir()
        const propertiesToJSON = require("properties-to-json")
        const data = fs.readFileSync(`${homedir}/.xsconfig`,
            { encoding: 'utf8', flag: 'r' })
        const object = propertiesToJSON(data)
        return object
    }
    catch (error) {
        throw new Error(bundle.getText("errXSConfig"))
    }
}
module.exports.getCFConfig = getCFConfig

/**
 * Get target organziation
 * @returns {Promise<object>}
 */
async function getCFOrg() {
    base.debug('getCFOrg')
    const config = await getCFConfig()
    base.debug(config)
    return config
}
module.exports.getCFOrg = getCFOrg

/**
 * Get target orgnaization name
 * @returns {Promise<string>}
 */
async function getCFOrgName() {
    base.debug('getCFOrgName')
    const org = await getCFOrg()
    base.debug(org)
    return org.org
}
module.exports.getCFOrgName = getCFOrgName

/**
 * Get target orgnaization GUID
 * @returns {Promise<string>}
 */
async function getCFOrgGUID() {
    base.debug('getCFOrgGUID')
    const org = await getCFOrg()
    base.debug(org)
    return org.orgGuid
}
module.exports.getCFOrgGUID = getCFOrgGUID

/**
 * Get target space details
 * @returns {Promise<object>}
 */
async function getCFSpace() {
    base.debug('getCFSpace')
    const config = await getCFConfig()
    base.debug(config)
    return config
}
module.exports.getCFSpace = getCFSpace

/**
 * Get target space name
 * @returns {Promise<string>}
 */
async function getCFSpaceName() {
    base.debug('getCFSpaceName')
    const space = await getCFSpace()
    base.debug(space)
    return space.space
}
module.exports.getCFSpaceName = getCFSpaceName

/**
 * Get target space GUID
 * @returns {Promise<string>}
 */
async function getCFSpaceGUID() {
    base.debug('getCFSpaceGUID')
    const space = await getCFSpace()
    base.debug(space)
    return space.spaceGuid
}
module.exports.getCFSpaceGUID = getCFSpaceGUID

/**
 * Get currrent targets
 * @returns {Promise<object>}
 */
async function getCFTarget() {
    base.debug('getCFTarget')
    const config = await getCFConfig()
    base.debug(config)
    return config.api.replace(/\\:/g, ':')
}
module.exports.getCFTarget = getCFTarget

/**
 * Get all instances of service plan hana
 * @returns {Promise<object>}
 */
async function getHANAInstances() {
    base.debug('getHANAInstances')

    try {
        const spaceGUID = await getCFSpaceGUID()
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
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
module.exports.getHANAInstances = getHANAInstances

/**
 * Get instances of service plan hana that match input name
 * @param {string} name - service instance name
 * @returns {Promise<object>}
 */
async function getHANAInstanceByName(name) {
    base.debug(`getHANAInstanceByName ${name}`)

    try {
        const spaceGUID = await getCFSpaceGUID()
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
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
module.exports.getHANAInstanceByName = getHANAInstanceByName

/**
 * Get all service plans
 * @param {string} serviceGUID - service GUID
 * @returns {Promise<object>}
 */
async function getServicePlans(serviceGUID) {
    base.debug(`getServicePlans ${serviceGUID}`)
    try {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
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
module.exports.getServicePlans = getServicePlans

/**
 * Get all services 
 * @returns {Promise<object>}
 */
async function getServices() {
    base.debug('getServices')
    try {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
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
module.exports.getServices = getServices

/**
 * Get Service Plan GUID
 * @param {string} serviceGUID  - Service GUID
 * @param {string} servicePlan  - Service Plan Name
 * @returns {Promise<string>}
 */
async function getServicePlanGUID(serviceGUID, servicePlan) {
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
module.exports.getServicePlanGUID = getServicePlanGUID

/**
 * Get Service GUID 
 * @param {string} service - Service name
 * @returns {Promise<string>}
 */
async function getServiceGUID(service) {
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
module.exports.getServiceGUID = getServiceGUID

/**
 * Get all HDI service instances 
 * @returns {Promise<object>}
 */
async function getHDIInstances() {
    base.debug(`getHDIInstances`)
    try {
        const spaceGUID = await getCFSpaceGUID()
        const serviceGUID = await getServiceGUID('hana')
        const planGUID = await getServicePlanGUID(serviceGUID, `hdi-shared`)
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
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
module.exports.getHDIInstances = getHDIInstances


/**
 * Get all SBSS service instances 
 * @returns {Promise<object>}
 */
 async function getSbssInstances() {
    base.debug(`getSbssInstances`)
    try {
        const spaceGUID = await getCFSpaceGUID()
        const serviceGUID = await getServiceGUID('hana')
        const planGUID = await getServicePlanGUID(serviceGUID, `sbss`)
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
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
module.exports.getSbssInstances = getSbssInstances

/**
 * Get all SecureStore service instances 
 * @returns {Promise<object>}
 */
 async function getSecureStoreInstances() {
    base.debug(`getSecureStoreInstances`)
    try {
        const spaceGUID = await getCFSpaceGUID()
        const serviceGUID = await getServiceGUID('hana')
        const planGUID = await getServicePlanGUID(serviceGUID, `securestore`)
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
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
module.exports.getSecureStoreInstances = getSecureStoreInstances

/**
 * Get all Schema service instances 
 * @returns {Promise<object>}
 */
 async function getSchemaInstances() {
    base.debug(`getSchemaInstances`)
    try {
        const spaceGUID = await getCFSpaceGUID()
        const serviceGUID = await getServiceGUID('hana')
        const planGUID = await getServicePlanGUID(serviceGUID, `schema`)
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
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
module.exports.getSchemaInstances = getSchemaInstances

/**
 * Get all User Provided Service Instances
 * @returns {Promise<object>}
 */
async function getUpsInstances() {
    base.debug(`getUpsInstances`)
    try {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
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
module.exports.getUpsInstances = getUpsInstances
