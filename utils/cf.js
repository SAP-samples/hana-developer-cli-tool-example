/*eslint-env node, es6 */
"use strict";
const base = require("./base")
const bundle = global.__bundle

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

async function getCFOrg() {
    base.debug('getCFOrg')
    const config = await getCFConfig()
    base.debug(config)
    return config.OrganizationFields
}
module.exports.getCFOrg = getCFOrg

async function getCFOrgName() {
    base.debug('getCFOrgName')
    const org = await getCFOrg()
    base.debug(org)
    return org.Name
}
module.exports.getCFOrgName = getCFOrgName

async function getCFOrgGUID() {
    base.debug('getCFOrgGUID')
    const org = await getCFOrg()
    base.debug(org)
    return org.GUID
}
module.exports.getCFOrgGUID = getCFOrgGUID

async function getCFSpace() {
    base.debug('getCFSpace')
    const config = await getCFConfig()
    base.debug(config)
    return config.SpaceFields
}
module.exports.getCFSpace = getCFSpace

async function getCFSpaceName() {
    base.debug('getCFSpaceName')
    const space = await getCFSpace()
    base.debug(space)
    return space.Name
}
module.exports.getCFSpaceName = getCFSpaceName

async function getCFSpaceGUID() {
    base.debug('getCFSpaceGUID')
    const space = await getCFSpace()
    base.debug(space)
    return space.GUID
}
module.exports.getCFSpaceGUID = getCFSpaceGUID

async function getCFTarget() {
    base.debug('getCFTarget')
    const config = await getCFConfig()
    base.debug(config)
    return config.Target
}
module.exports.getCFTarget = getCFTarget

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