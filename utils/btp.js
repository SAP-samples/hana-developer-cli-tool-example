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

import { homedir } from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import * as child_process from 'child_process'
import { tmpdir } from 'os'

/**
 * Execute BTP CLI command with error handling
 * @param {string} command - BTP command to execute (without 'btp' prefix)
 * @param {Object} options - Command options
 * @param {boolean} [options.json=false] - Parse output as JSON
 * @returns {Promise<any>}
 * @private
 */
async function executeBTPCommand(command, options = { json: false }) {
    base.debug(bundle.getText("debug.btp.executeCommand", [command]))
    
    try {
        const exec = promisify(child_process.exec)
        const jsonFormat = options.json ? '--format json ' : ''
        const script = `btp ${jsonFormat}${command}`
        
        const { stdout } = await exec(script)
        
        if (!stdout) {
            return options.json ? null : ''
        }
        
        if (options.json) {
            try {
                return JSON.parse(stdout)
            } catch (e) {
                base.debug(bundle.getText("debug.jsonParseFailed", [e.message]))
                return null
            }
        }
        
        return stdout
    } catch (error) {
        base.debug(bundle.getText("debug.btp.executeCommandError", [error.message]))
        throw error
    }
}

/**
 * Find item in array matching predicate
 * @param {Array} array - Array to search
 * @param {Function} predicate - Test function
 * @param {any} defaultValue - Default value if not found (default: null)
 * @returns {any}
 * @private
 */
function findInArray(array, predicate, defaultValue = null) {
    if (!array || !Array.isArray(array)) {
        return defaultValue
    }
    const found = array.find(item => predicate(item))
    return found || defaultValue
}

/**
 * Write parameters to temporary file
 * @param {Object} data - Data to write
 * @returns {string} - Path to temporary file
 * @private
 */
function writeTempParameterFile(data) {
    const fileName = path.join(tmpdir(), `btp-params-${Date.now()}.json`)
    fs.writeFileSync(fileName, JSON.stringify(data))
    return fileName
}

/**
 * Get btp CLI version
 * @returns {Promise<String>}
 */
export async function getVersion() {
    base.debug(bundle.getText("debug.call", ["getVersion"]))
    try {
        const result = await executeBTPCommand('--version')
        return result || ''
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getVersion", error.message]))
        throw error
    }
}

/**
 * Get btp CLI info
 * @returns {Promise<Object>}
 */
export async function getInfo() {
    base.debug(bundle.getText("debug.call", ["getInfo"]))
    try {
        const output = await executeBTPCommand('--info')
        const infoOut = {}
        
        if (!output) {
            return infoOut
        }
        
        const lines = output.split("\n")
        
        // Parse output more robustly by searching for key patterns
        for (const line of lines) {
            if (line.includes('Configuration')) {
                const parts = line.split(/:(.*)/s)
                if (parts[1]) infoOut.Configuration = parts[1].trim()
            } else if (line.includes('URL') || line.includes('url')) {
                const parts = line.split(/:(.*)/s)
                if (parts[1]) infoOut.serverURL = parts[1].trim()
            } else if (line.includes('User') || line.includes('user')) {
                const parts = line.split(/:(.*)/s)
                if (parts[1]) infoOut.user = parts[1].trim()
            }
        }
        
        return infoOut
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getInfo", error.message]))
        throw error
    }
}

/**
 * Read central configuration file for BTP CLI
 * @returns {Promise<object>}
 */
export async function getBTPConfig() {
    base.debug(bundle.getText("debug.call", ["getBTPConfig"]))

    let localDir = process.env.BTP_CLIENTCONFIG
    if (!localDir) {
        let info = await getInfo()
        if (info.Configuration) {
            localDir = info.Configuration
        }
    }
    if (!localDir || !fs.existsSync(localDir)) {
        if (process.env.APPDATA) {
            localDir = `${process.env.APPDATA}/SAP/btp/config.json`
        } else if (process.platform == 'darwin') {
            localDir = `${process.env.HOME}/Library/Preferences/SAP/btp/config.json`
        } else {
            localDir = `${process.env.HOME}/.config/.btp/config.json`
        }
    }
    //MacOS fallback location
    if (!fs.existsSync(localDir) && process.platform == 'darwin') {
        localDir = `${process.env.HOME}/Library/Application Support/.btp/config.json`
    }
    base.debug(localDir)
    try {
        let data = fs.readFileSync(localDir,
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
    base.debug(bundle.getText("debug.call", ["getBTPTarget"]))
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
 * @returns {Promise<object>}
 */
export async function getBTPGlobalAccount() {
    base.debug(bundle.getText("debug.call", ["getBTPGlobalAccount"]))
    const target = await getBTPTarget()
    const globalAccountDetails = findInArray(target, item => item.Type === globalAccount)
    
    if (!globalAccountDetails) {
        throw new Error(bundle.getText("err.BTPNoGlobalAccount"))
    }
    
    base.debug(globalAccountDetails)
    return globalAccountDetails
}

/**
 * Get target Sub-Account
 * @returns {Promise<string>}
 */
export async function getBTPSubAccount() {
    base.debug(bundle.getText("debug.call", ["getBTPSubaccount"]))
    const target = await getBTPTarget()
    const subAccountDetails = findInArray(target, item => item.Type === subAccount)
    
    if (!subAccountDetails) {
        throw new Error(bundle.getText("err.BTPNoSubAccount"))
    }
    
    base.debug(subAccountDetails)
    return subAccountDetails
}

/**
 * Get all Subscriptions
 * @returns {Promise<object>}
 */
export async function getBTPSubscriptions() {
    base.debug(bundle.getText("debug.call", ["getBTPSubscriptions"]))
    try {
        const exec = promisify(child_process.exec)
        const { stdout, stderr } = await exec('btp --format json list accounts/subscriptions')
        
        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        if (stdout) {
            try {
                return JSON.parse(stdout)
            } catch (e) {
                return null
            }
        }
        return null
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getBTPSubscriptions", error.message]))
        throw error
    }
}

/**
 * Get HANA Cloud Tools Subscription
 * @returns {Promise<object>}
 */
export async function getHANACloudSub() {
    base.debug(bundle.getText("debug.call", ["getHANACloudSub"]))
    const subs = await getBTPSubscriptions()
    if (!subs || !subs.applications) {
        return null
    }
    const hanaCloudSub = findInArray(subs.applications, item => item.appName === hanaCloudTools)
    base.debug(hanaCloudSub)
    return hanaCloudSub
}

/**
 * Get HANA Cloud Tools Subscription URL 
 * @returns {Promise<string>}
 */
export async function getHANACloudSubURL() {
    base.debug(bundle.getText("debug.call", ["getHANACloudSubURL"]))
    const hanaCloudSub = await getHANACloudSub()
    base.debug(hanaCloudSub.subscriptionUrl)
    return hanaCloudSub.subscriptionUrl
}

/**
 * Get Business Application Studio Subscription
 * @returns {Promise<object>}
 */
export async function getBASSub() {
    base.debug(bundle.getText("debug.call", ["getBASSub"]))
    const subs = await getBTPSubscriptions()
    if (!subs || !subs.applications) {
        return null
    }
    const basSub = findInArray(subs.applications, 
        item => (item.appName === applicationStudio || item.appName === 'build-code') && item.state === 'SUBSCRIBED')
    base.debug(basSub)
    return basSub
}

/**
 * Get HANA Cloud Tools Subscription URL 
 * @returns {Promise<string>}
 */
export async function getBASSubURL() {
    base.debug(bundle.getText("debug.call", ["getBASSubURL"]))
    const basSub = await getBASSub()
    base.debug(basSub.subscriptionUrl)
    return basSub.subscriptionUrl
}

/**
 * Get Global Account Hierarchy
 * @returns {Promise<object>}
 */
export async function getBTPHierarchy() {
    base.debug(bundle.getText("debug.call", ["getBTPHierarchy"]))
    try {
        const exec = promisify(child_process.exec)
        const { stdout, stderr } = await exec('btp --format json get accounts/global-account --show-hierarchy')
        
        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        if (stdout) {
            try {
                return JSON.parse(stdout)
            } catch (e) {
                return null
            }
        }
        return null
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getBTPHierarchy", error.message]))
        throw error
    }
}


/**
 * Get all Sub-Accounts
 * @returns {Promise<object>}
 */
export async function getBTPSubAccounts() {
    base.debug(bundle.getText("debug.call", ["getBTPSubAccounts"]))
    try {
        const exec = promisify(child_process.exec)
        const { stdout, stderr } = await exec('btp --format json list accounts/subaccount')
        
        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        if (stdout) {
            try {
                return JSON.parse(stdout)
            } catch (e) {
                return null
            }
        }
        return null
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getBTPSubAccounts", error.message]))
        throw error
    }
}

/**
 * Get all Service Plans
 * @returns {Promise<object>}
 */
export async function getBTPPlans() {
    base.debug(bundle.getText("debug.call", ["getBTPPlans"]))
    try {
        const exec = promisify(child_process.exec)
        const { stdout, stderr } = await exec('btp --format json list services/plan')
        
        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        if (stdout) {
            try {
                return JSON.parse(stdout)
            } catch (e) {
                return null
            }
        }
        return null
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getBTPPlans", error.message]))
        throw error
    }
}

/**
 * Get HANA Plan
 * @returns {Promise<object>}
 */
export async function getHANAPlan() {
    base.debug(bundle.getText("debug.call", ["getHANAPlan"]))
    const plans = await getBTPPlans()
    if (!plans) {
        return null
    }
    const hanaPlan = findInArray(plans, item => item.catalog_name === hanaPlanName)
    base.debug(hanaPlan)
    return hanaPlan
}

/**
 * Get all Service Instances
 * @returns {Promise<object>}
 */
export async function getBTPServiceInstances() {
    base.debug(bundle.getText("debug.call", ["getBTPServiceInstances"]))
    try {
        const exec = promisify(child_process.exec)
        const { stdout, stderr } = await exec('btp --format json list services/instance')
        
        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        if (stdout) {
            try {
                return JSON.parse(stdout)
            } catch (e) {
                return null
            }
        }
        return null
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getBTPServiceInstances", error.message]))
        throw error
    }
}

/**
 * Get Service Instance Details
 * @param {string} id - service instance id 
 * @returns {Promise<object>}
 */
export async function getBTPServiceInstanceDetails(id) {
    base.debug(bundle.getText("debug.call", ["getBTPServiceInstanceDetails"]))
    
    if (!id || typeof id !== 'string') {
        throw new Error(bundle.getText("error.btpServiceInstanceIdRequired"))
    }
    
    try {
        const exec = promisify(child_process.exec)
        const { stdout, stderr } = await exec(`btp --format json get services/instance ${id}`)
        
        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        if (stdout) {
            try {
                return JSON.parse(stdout)
            } catch (e) {
                return null
            }
        }
        return null
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getBTPServiceInstanceDetails", error.message]))
        throw error
    }
}

/**
 * Set Target Subaccount
 * @param {string} subAccount - BTP Subaccount
 * @returns {Promise<object>}
 */
export async function setBTPSubAccount(subAccount) {
    base.debug(bundle.getText("debug.call", ["setBTPSubAccount"]))
    
    if (!subAccount || typeof subAccount !== 'string') {
        throw new Error(bundle.getText("error.btpSubaccountIdRequired"))
    }
    
    try {
        return await executeBTPCommand(`target --subaccount ${subAccount}`)
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["setBTPSubAccount", error.message]))
        throw error
    }
}
/**
 * Get Service Instance Parameters
 * @param {string} id - service instance id 
 * @returns {Promise<object>}
 */
export async function getBTPServiceInstanceParameters(id) {
    base.debug(bundle.getText("debug.call", ["getBTPServiceInstanceParameters"]))
    
    if (!id || typeof id !== 'string') {
        throw new Error(bundle.getText("error.btpServiceInstanceIdRequired"))
    }
    
    try {
        const exec = promisify(child_process.exec)
        const { stdout, stderr } = await exec(`btp --format json get services/instance ${id} --show-parameters`)
        
        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        }
        
        if (stdout) {
            try {
                return JSON.parse(stdout)
            } catch (e) {
                return null
            }
        }
        return null
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getBTPServiceInstanceParameters", error.message]))
        throw error
    }
}

/**
 * Get HANA Cloud Service Instance(s)
 * @returns {Promise<object>}
 */
export async function getHANAServiceInstances() {
    base.debug(bundle.getText("debug.call", ["getHANAServiceInstances"]))
    try {
        const subs = await getBTPServiceInstances()
        const hanaPlan = await getHANAPlan()
        
        if (!subs || !hanaPlan) {
            return []
        }
        
        // Filter for HANA instances first
        const hanaInstanceItems = subs.filter(item => item.service_plan_id === hanaPlan.id)
        
        // Fetch details and parameters in parallel for all instances
        const enrichedInstances = await Promise.all(
            hanaInstanceItems.map(async (item) => {
                try {
                    const [details, parameters] = await Promise.all([
                        getBTPServiceInstanceDetails(item.id),
                        getBTPServiceInstanceParameters(item.id)
                    ])
                    item.last_operation = details.last_operation
                    item.parameters = parameters
                    return item
                } catch (error) {
                    base.debug(bundle.getText("debug.btp.enrichInstanceError", [item.id, error.message]))
                    return null
                }
            })
        )
        
        // Filter out failed enrichments
        const hanaInstances = enrichedInstances.filter(item => item !== null)
        base.debug(hanaInstances)
        return hanaInstances
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["getHANAServiceInstances", error.message]))
        throw error
    }
}

/**
 * Get status of hana instance
 * @param {object} serviceParameters - HANA Service instance Parameters
 * @returns {Promise<string>}
 */
export async function getHANAInstanceStatus(serviceParameters) {
    base.debug(bundle.getText("debug.call", ["getHANAInstanceStatus"]))
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
    base.debug(bundle.getText("debug.callWithParams", ["getHANAInstanceByName", name]))
    
    if (!name || typeof name !== 'string') {
        throw new Error(bundle.getText("error.btpInstanceNameRequired"))
    }
    
    const instances = await getHANAServiceInstances()
    // @ts-ignore
    const hanaInstance = instances.filter(item => item.name === name)
    base.debug(hanaInstance)
    return hanaInstance
}

/**
 * Start HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name 
 * @returns {Promise<string>}
 */
export async function startHana(name) {
    base.debug(bundle.getText("debug.callWithParams", ["startHana", name]))
    
    if (!name || typeof name !== 'string') {
        throw new Error(bundle.getText("error.btpInstanceNameRequired"))
    }
    
    let fileName = null
    try {
        const data = { "data": { "serviceStopped": false } }
        fileName = writeTempParameterFile(data)
        
        const result = await executeBTPCommand(`update services/instance --name ${name} --parameters ${fileName}`)
        return result
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["startHana", error.message]))
        throw error
    } finally {
        if (fileName && fs.existsSync(fileName)) {
            try {
                fs.unlinkSync(fileName)
            } catch (cleanupError) {
                base.debug(bundle.getText("debug.btp.cleanupTempFileFailed", [cleanupError.message]))
            }
        }
    }
}

/**
 * Stop HANA Cloud Instance
 * @param {string} name - HANA Cloud instance name
 * @returns {Promise<string>}
 */
export async function stopHana(name) {
    base.debug(bundle.getText("debug.callWithParams", ["stopHana", name]))
    
    if (!name || typeof name !== 'string') {
        throw new Error(bundle.getText("error.btpInstanceNameRequired"))
    }
    
    let fileName = null
    try {
        const data = { "data": { "serviceStopped": true } }
        fileName = writeTempParameterFile(data)
        
        const result = await executeBTPCommand(`update services/instance --name ${name} --parameters ${fileName}`)
        return result
    } catch (error) {
        base.debug(bundle.getText("debug.callError", ["stopHana", error.message]))
        throw error
    } finally {
        if (fileName && fs.existsSync(fileName)) {
            try {
                fs.unlinkSync(fileName)
            } catch (cleanupError) {
                base.debug(bundle.getText("debug.btp.cleanupTempFileFailed", [cleanupError.message]))
            }
        }
    }
}