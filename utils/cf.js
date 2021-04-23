/*eslint-env node, es6 */
"use strict";
const bundle = global.__bundle

async function getCFConfig() {

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
    const config = await getCFConfig()
    return config.OrganizationFields
}
module.exports.getCFOrg = getCFOrg

async function getCFOrgName() {
    const org = await getCFOrg()
    return org.Name
}
module.exports.getCFOrgName = getCFOrgName

async function getCFOrgGUID() {
    const org = await getCFOrg()
    return org.GUID
}
module.exports.getCFOrgGUID = getCFOrgGUID

async function getCFSpace() {
    const config = await getCFConfig()
    return config.SpaceFields
}
module.exports.getCFSpace = getCFSpace

async function getCFSpaceName() {
    const space = await getCFSpace()
    return space.Name
}
module.exports.getCFSpaceName = getCFSpaceName

async function getCFSpaceGUID() {
    const space = await getCFSpace()
    return space.GUID
}
module.exports.getCFSpaceGUID = getCFSpaceGUID

async function getCFTarget() {
    const config = await getCFConfig()
    return config.Target
}
module.exports.getCFTarget = getCFTarget

async function getHANAInstances() {
    const space = await getCFSpace()
    const org = await getCFOrg()

    const spaceGUID = space.GUID
    const orgGUID = org.GUID


    try {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=hana"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }


    } catch (error) {
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getHANAInstances = getHANAInstances

async function getHANAInstanceByName(name) {
    const space = await getCFSpace()
    const org = await getCFOrg()

    const spaceGUID = space.GUID
    const orgGUID = org.GUID


    try {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=hana&names=${name}"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }


    } catch (error) {
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getHANAInstanceByName = getHANAInstanceByName

async function getHDIInstances() {
    const space = await getCFSpace()
    const org = await getCFOrg()

    const spaceGUID = space.GUID
    const orgGUID = org.GUID


    try {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&service_plan_names=hdi-shared"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }


    } catch (error) {
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getHDIInstances = getHDIInstances

async function getUpsInstances() {
    const space = await getCFSpace()
    const org = await getCFOrg()

    const spaceGUID = space.GUID
    const orgGUID = org.GUID


    try {
        const util = require('util')
        const exec = util.promisify(require('child_process').exec)
        let script = `cf curl "/v3/service_instances?space_guids=${spaceGUID}&organization_guids=${orgGUID}&type=user-provided"`

        const { stdout, stderr } = await exec(script)

        if (stderr) {
            console.log(stdout)
            throw new Error(`${bundle.getText("error")} ${stderr.toString()}`)
        } else {
            return JSON.parse(stdout)
        }


    } catch (error) {
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.getUpsInstances = getUpsInstances

async function startHana(name) {
    await getCFSpace()
    try {
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
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.startHana = startHana

async function stopHana(name) {
    await getCFSpace()
    try {
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
        throw new Error(`${bundle.getText("errConn")} ${JSON.stringify(error)}`);
    }
}
module.exports.stopHana = stopHana