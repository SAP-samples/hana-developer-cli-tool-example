/*eslint-env node, es6 */
// @ts-check

/**
 * @module cf - library for calling CF APIs via CLI
 */
"use strict";
const base = require("./base")
const bundle = base.bundle

/**
 * Read central configuration file for CF CLI
 * @returns {Promise<object>}
 */
async function getCFConfig() {
    base.debug('getCFConfig')
    try {
        const fs = require('fs')
        const homedir = require('os').homedir()
        const data = fs.readFileSync(`${homedir}/.cf/config.json`,
            { encoding: 'utf8', flag: 'r' })
        const object = JSON.parse(data)
        return object
    }
    catch (error) {
        throw new Error(bundle.getText("errCFConfig"))
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
    return config.OrganizationFields
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
    return org.Name
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
    return org.GUID
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
    return config.SpaceFields
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
    return space.Name
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
    return space.GUID
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
    return config.Target
}
module.exports.getCFTarget = getCFTarget

/**
 * Get all instances of service plan hana
 * @returns {Promise<object>}
 */
async function getHANAInstances() {
    base.debug('getHANAInstances')

    try {
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=hana&per_page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
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
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=hana&names=${name}&per_page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }


    } catch (error) {
        base.debug(error)
        throw (error)
    }
}
module.exports.getHANAInstanceByName = getHANAInstanceByName

/**
 * Get all HDI service instances 
 * @returns {Promise<object>}
 */
async function getHDIInstances() {
    base.debug(`getHDIInstances`)
    try {
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=hdi-shared&per_page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }

    } catch (error) {
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
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=sbss&per_page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }

    } catch (error) {
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
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=securestore&per_page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }

    } catch (error) {
        base.debug(error)
        throw (error)
    }
}
module.exports.getSecureStoreInstances = getSecureStoreInstances

/**
 * Get all SecureStore service instances 
 * @returns {Promise<object>}
 */
 async function getSchemaInstances() {
    base.debug(`getSchemaInstances`)
    try {
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=schema&per_page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }

    } catch (error) {
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
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&type=user-provided&per_page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }


    } catch (error) {
        base.debug(error)
        throw (error)
    }
}
module.exports.getUpsInstances = getUpsInstances

/**
 * Start HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name 
 * @returns any
 */
async function startHana(name) {
    base.debug(`startHana ${name}`)
    try {
        await getCFSpace()
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        const homedir = require('os').homedir()
        const fs = require('fs')
        const data = { "data": { "serviceStopped": false } }
        const fileName = `${homedir}/hana_start.json`
        fs.writeFileSync(fileName, JSON.stringify(data))

        let script = `cf update-service ${name} -c ${homedir}/hana_start.json`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            fs.unlinkSync(fileName)
            return stdout
        }

    } catch (error) {
        base.debug(error)
        throw (error)
    }
}
module.exports.startHana = startHana

/**
 * Stop HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name
 * @returns any
 */
async function stopHana(name) {
    base.debug(`stopHana ${name}`)
    try {
        await getCFSpace()
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        const homedir = require('os').homedir()
        const fs = require('fs')
        const data = { "data": { "serviceStopped": true } }
        const fileName = `${homedir}/hana_stop.json`
        fs.writeFileSync(fileName, JSON.stringify(data))

        let script = `cf update-service ${name} -c ${homedir}/hana_stop.json`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            fs.unlinkSync(fileName)
            return stdout
        }

    } catch (error) {
        base.debug(error)
        throw (error)
    }
}
module.exports.stopHana = stopHana