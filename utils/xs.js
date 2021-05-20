/*eslint-env node, es6 */
"use strict";
const bundle = global.__bundle

async function getCFConfig() {

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

async function getCFOrg() {
    const config = await getCFConfig()
    return config
}
module.exports.getCFOrg = getCFOrg

async function getCFOrgName() {
    const org = await getCFOrg()
    return org.org
}
module.exports.getCFOrgName = getCFOrgName

async function getCFOrgGUID() {
    const org = await getCFOrg()
    return org.orgGuid
}
module.exports.getCFOrgGUID = getCFOrgGUID

async function getCFSpace() {
    const config = await getCFConfig()
    return config
}
module.exports.getCFSpace = getCFSpace

async function getCFSpaceName() {
    const space = await getCFSpace()
    return space.space
}
module.exports.getCFSpaceName = getCFSpaceName

async function getCFSpaceGUID() {
    const space = await getCFSpace()
    return space.spaceGuid
}
module.exports.getCFSpaceGUID = getCFSpaceGUID

async function getCFTarget() {
    const config = await getCFConfig()
    return config.api.replace(/\\:/g,':')
}
module.exports.getCFTarget = getCFTarget

async function getHANAInstances() {

    const spaceGUID = await getCFSpaceGUID()

    try {
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
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getHANAInstances = getHANAInstances

async function getHANAInstanceByName(name) {
    const spaceGUID = await getCFSpaceGUID()

    try {
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
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getHANAInstanceByName = getHANAInstanceByName


async function getServicePlans(serviceGUID){
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
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getServicePlans = getServicePlans


async function getServices(){
    try {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `xs curl "/v2/services"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
           return JSON.parse(stdout).services
        }


    } catch (error) {
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getServices = getServices

async function getServicePlanGUID(serviceGUID, servicePlan){
    try {
        const servicePlans = await getServicePlans(serviceGUID)
        let item = servicePlans.find(x => x.servicePlanEntity.name == servicePlan)
        return item.metadata.guid

    } catch (error) {
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getServicePlanGUID = getServicePlanGUID

async function getServiceGUID(service){
    try {
        const services = await getServices()
        let item = services.find(x => x.serviceEntity.label == service)
        return item.metadata.guid

    } catch (error) {
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getServiceGUID = getServiceGUID

async function getHDIInstances() {
    const spaceGUID = await getCFSpaceGUID()
    const serviceGUID = await getServiceGUID('hana')
    const planGUID = await getServicePlanGUID(serviceGUID, `hdi-shared`)
    try {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `xs curl "/v2/service_instances/?q=space_guid:${spaceGUID}%3Bservice_plan_guid:${planGUID}&results-per-page=5000`
         const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout).serviceInstances
        }


    } catch (error) {
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getHDIInstances = getHDIInstances

async function getUpsInstances() {

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
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getUpsInstances = getUpsInstances
