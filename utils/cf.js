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

/**
 * Read central configuration file for CF CLI
 * @returns {Promise<object>}
 */
export async function getCFConfig() {
    base.debug('getCFConfig')
    try {

        const data = fs.readFileSync(`${homedir}/.cf/config.json`,
            { encoding: 'utf8', flag: 'r' })
        const object = JSON.parse(data)
        return object
    }
    catch (error) {
        throw new Error(bundle.getText("errCFConfig"))
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
    return config.OrganizationFields
}

/**
 * Get target orgnaization name
 * @returns {Promise<string>}
 */
export async function getCFOrgName() {
    base.debug('getCFOrgName')
    const org = await getCFOrg()
    base.debug(org)
    return org.Name
}

/**
 * Get target orgnaization GUID
 * @returns {Promise<string>}
 */
export async function getCFOrgGUID() {
    base.debug('getCFOrgGUID')
    const org = await getCFOrg()
    base.debug(org)
    return org.GUID
}


/**
 * Get target space details
 * @returns {Promise<object>}
 */
export async function getCFSpace() {
    base.debug('getCFSpace')
    const config = await getCFConfig()
    base.debug(config)
    return config.SpaceFields
}

/**
 * Get target space name
 * @returns {Promise<string>}
 */
export async function getCFSpaceName() {
    base.debug('getCFSpaceName')
    const space = await getCFSpace()
    base.debug(space)
    return space.Name
}

/**
 * Get target space GUID
 * @returns {Promise<string>}
 */
export async function getCFSpaceGUID() {
    base.debug('getCFSpaceGUID')
    const space = await getCFSpace()
    base.debug(space)
    return space.GUID
}

/**
 * Get currrent targets
 * @returns {Promise<object>}
 */
export async function getCFTarget() {
    base.debug('getCFTarget')
    const config = await getCFConfig()
    base.debug(config)
    return config.Target
}

/**
 * Get all instances of service plan hana
 * @returns {Promise<object>}
 */
export async function getHANAInstances() {
    base.debug('getHANAInstances')

    try {
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const exec = promisify(child_process.exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=hana,hana-free&per_page=5000"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            if(stdout){
                try {
               return JSON.parse(stdout)
            } catch(e) {
                return
            }
            }
            return
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
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID
        const exec = promisify(child_process.exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=hana,hana-free&names=${name}&per_page=5000"`

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

/**
 * Get status of hana instance
 * @param {string} hanaInstanceGUID - HANA Service instance GUID
 * @returns {Promise<string>}
 */
 export async function getHANAInstanceStatus(hanaInstanceGUID) {
    base.debug('getHANAInstanceStatus')

    const serviceParameters = await getCFServiceInstanceParameters(hanaInstanceGUID)

    if (serviceParameters.errors) {
        return bundle.getText("hc.updateProgress")
    }

    switch (serviceParameters.data.serviceStopped) {
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
    base.debug(`getHDIInstances`)
    try {
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const exec = promisify(child_process.exec)
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

/**
 * Get all SBSS service instances 
 * @returns {Promise<object>}
 */
export async function getSbssInstances() {
    base.debug(`getSbssInstances`)
    try {
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const exec = promisify(child_process.exec)
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

/**
 * Get all SecureStore service instances 
 * @returns {Promise<object>}
 */
export async function getSecureStoreInstances() {
    base.debug(`getSecureStoreInstances`)
    try {
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const exec = promisify(child_process.exec)
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

/**
 * Get all SecureStore service instances 
 * @returns {Promise<object>}
 */
export async function getSchemaInstances() {
    base.debug(`getSchemaInstances`)
    try {
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const exec = promisify(child_process.exec)
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

/**
 * Get all User Provided Service Instances
 * @returns {Promise<object>}
 */
export async function getUpsInstances() {
    base.debug(`getUpsInstances`)

    try {
        const space = await getCFSpace()
        const org = await getCFOrg()

        const spaceGUID = space.GUID
        const orgGUID = org.GUID

        const exec = promisify(child_process.exec)
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


/**
 * Start HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name 
 * @returns any
 */
export async function startHana(name) {
    base.debug(`startHana ${name}`)
    try {
        await getCFSpace()
        const exec = promisify(child_process.exec)
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

/**
 * Stop HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name
 * @returns any
 */
export async function stopHana(name) {
    base.debug(`stopHana ${name}`)
    try {
        await getCFSpace()
        const exec = promisify(child_process.exec)
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

/**
 * Get Cloud Foundry service instance parameters
 * @param {string} serviceInstanceGUID - Service instance GUID
 * @returns object
 */
export async function getCFServiceInstanceParameters(serviceInstanceGUID) {
    base.debug('getCFServiceInstanceParameters')

    try {
        const exec = promisify(child_process.exec)
        let script = `cf curl "/v3/service_instances/${serviceInstanceGUID}/parameters"`

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
