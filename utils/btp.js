/*eslint-env node, es6 */
// @ts-check

/**
 * @module btp - library for calling BTP APIs via CLI
 */
import * as base from "./base.js"
const bundle = base.bundle
const globalAccount = "globalaccount"
const subAccount = "subaccount"
const hanaCloudTools = "hana-cloud-tools"
const applicationStudio = "sapappstudio"
const hanaPlanName = "hana"

import * as fs from 'fs'
import { promisify } from 'util'
import * as child_process from 'child_process'


/**
 * Read central configuration file for BTP CLI
 * @returns {Promise<object>}
 */
export async function getBTPConfig() {
    base.debug('getBTPConfig')
    try {
        let localDir = process.env.BTP_CLIENTCONFIG
        if (!localDir){
            localDir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
            localDir = `${localDir}/SAP/btp/config.json`
        }
        const data = fs.readFileSync(localDir,
            { encoding: 'utf8', flag: 'r' })
        const object = JSON.parse(data)
        return object
    }
    catch (error) {
        throw new Error(bundle.getText("err.BTPNoTarget"))
    }
}

/**
 * Get current targets
 * @returns {Promise<object>}
 */
export async function getBTPTarget() {
    base.debug('getBTPTarget')
    const config = await getBTPConfig()
    if (config) {
        base.debug(config)
        return config.TargetHierarchy
    } else {
        throw new Error(bundle.getText("err.BTPNoTarget"))

    }

}

/**
 * Get target Global Account
 * @returns {Promise<string>}
 */
export async function getBTPGlobalAccount() {
    base.debug('getBTPGlobalAccount')
    const target = await getBTPTarget()
    let globalAccountDetails = ''
    for (let item of target) {
        if (item.Type === globalAccount) {
            globalAccountDetails = item
        }
    }
    if (globalAccountDetails) {
        base.debug(globalAccountDetails)
        return globalAccountDetails
    } else {
        throw new Error(bundle.getText("err.BTPNoGlobalAccount"))
    }
}

/**
 * Get target Sub-Account
 * @returns {Promise<string>}
 */
export async function getBTPSubAccount() {
    base.debug('getBTPSubaccount')
    const target = await getBTPTarget()
    let subAccountDetails = ''
    for (let item of target) {
        if (item.Type === subAccount) {
            subAccountDetails = item
        }
    }
    if (subAccountDetails) {
        base.debug(subAccountDetails)
        return subAccountDetails
    } else {
        throw new Error(bundle.getText("err.BTPNoSubAccount"))
    }
}

/**
 * Get all Subscriptions
 * @returns {Promise<object>}
 */
export async function getBTPSubscriptions() {
    base.debug('getBTPSubscriptions')

    try {

        const exec = promisify(child_process.exec)
        let script = `btp --format json list accounts/subscriptions`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            if (stdout) {
                try {
                    return JSON.parse(stdout)
                } catch (e) {
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
 * Get HANA Cloud Tools Subscription
 * @returns {Promise<object>}
 */
export async function getHANACloudSub() {
    base.debug('getHANACloudSub')
    const subs = await getBTPSubscriptions()
    let hanaCloudSub = ''
    for (let item of subs.applications) {
        if (item.appName === hanaCloudTools) {
            hanaCloudSub = item
        }
    }
    base.debug(hanaCloudSub)
    return hanaCloudSub
}

/**
 * Get HANA Cloud Tools Subscription URL 
 * @returns {Promise<string>}
 */
export async function getHANACloudSubURL() {
    base.debug('getHANACloudSubURL')
    const hanaCloudSub = await getHANACloudSub()
    base.debug(hanaCloudSub.subscriptionUrl)
    return hanaCloudSub.subscriptionUrl
}

/**
 * Get Business Application Studio Subscription
 * @returns {Promise<object>}
 */
export async function getBASSub() {
    base.debug('getBASSub')
    const subs = await getBTPSubscriptions()
    let basSub = ''
    for (let item of subs.applications) {
        if (item.appName === applicationStudio) {
            basSub = item
        }
    }
    base.debug(basSub)
    return basSub
}

/**
 * Get HANA Cloud Tools Subscription URL 
 * @returns {Promise<string>}
 */
export async function getBASSubURL() {
    base.debug('getBASSubURL')
    const basSub = await getBASSub()
    base.debug(basSub.subscriptionUrl)
    return basSub.subscriptionUrl
}

/**
 * Get all Subscriptions
 * @returns {Promise<object>}
 */
export async function getBTPPlans() {
    base.debug('getBTPPlans')

    try {

        const exec = promisify(child_process.exec)
        let script = `btp --format json list services/plan`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            if (stdout) {
                try {
                    return JSON.parse(stdout)
                } catch (e) {
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
 * Get HANA Plan
 * @returns {Promise<object>}
 */
export async function getHANAPlan() {
    base.debug('getHANAPlan')
    const subs = await getBTPPlans()
    let hanaPlan = ''
    for (let item of subs) {
        if (item.catalog_name === hanaPlanName) {
            hanaPlan = item
        }
    }
    base.debug(hanaPlan)
    return hanaPlan
}

/**
 * Get all Service Instances
 * @returns {Promise<object>}
 */
export async function getBTPServiceInstances() {
    base.debug('getBTPServiceInstances')

    try {

        const exec = promisify(child_process.exec)
        let script = `btp --format json list services/instance`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            if (stdout) {
                try {
                    return JSON.parse(stdout)
                } catch (e) {
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
 * Get Service Instance Details
 * @param {string} id - service instance id 
 * @returns {Promise<object>}
 */
export async function getBTPServiceInstanceDetails(id) {
    base.debug('getBTPServiceInstanceDetails')

    try {

        const exec = promisify(child_process.exec)
        let script = `btp --format json get services/instance ${id}`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            if (stdout) {
                try {
                    return JSON.parse(stdout)
                } catch (e) {
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
 * Get all Service Instances Parameters
 * @param {string} id - service instance id 
 * @returns {Promise<object>}
 */
export async function getBTPServiceInstanceParameters(id) {
    base.debug('getBTPServiceInstanceParameters')

    try {

        const exec = promisify(child_process.exec)
        let script = `btp --format json get services/instance ${id} --show-parameters`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            if (stdout) {
                try {
                    return JSON.parse(stdout)
                } catch (e) {
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
 * Get HANA Cloud Service Instance(s)
 * @returns {Promise<object>}
 */
export async function getHANAServiceInstances() {
    base.debug('getHANAServiceInstances')
    const subs = await getBTPServiceInstances()
    const hanaPlan = await getHANAPlan()
    let hanaInstances = []
    for (let item of subs) {
        // @ts-ignore
        if (item.service_plan_id === hanaPlan.id) {
            let details = await getBTPServiceInstanceDetails(item.id)
            let parameters = await getBTPServiceInstanceParameters(item.id)
            item.last_operation = details.last_operation
            item.parameters = parameters
            hanaInstances.push(item)
        }
    }
    base.debug(hanaInstances)
    return hanaInstances
}

/**
 * Get status of hana instance
 * @param {object} serviceParameters - HANA Service instance Parameters
 * @returns {Promise<string>}
 */
export async function getHANAInstanceStatus(serviceParameters) {
    base.debug('getHANAInstanceStatus')
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
 * Get instances of service plan hana that match input name
 * @param {string} name - service instance name
 * @returns {Promise<object>}
 */
export async function getHANAInstanceByName(name) {
    base.debug(`getHANAInstanceByName ${name}`)
    const instances = await getHANAServiceInstances()
    let hanaInstance = []
    for (let item of instances) {
        // @ts-ignore
        if (item.name === name) {
            hanaInstance = item
        }
    }
    base.debug(hanaInstance)
    return hanaInstance
}