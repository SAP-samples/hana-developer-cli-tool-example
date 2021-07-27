"use strict"
const base = require("./base")

function checkVersion() {
    return new Promise(resolve => {
        const check = require("check-node-version")
        const version = require("../package.json").engines.node
        base.debug(base.bundle.getText('requestedVersion', [version]))
        check({ node: version },
            (error, results) => {
                if (error) {
                    base.error(error)
                    resolve()
                }
                base.debug(results)
                if (results.isSatisfied) {
                    resolve()
                }
                const colors = require("colors/safe")
                for (const packageName of Object.keys(results.versions)) {
                    if (!results.versions[packageName].isSatisfied) {
                        base.error(
                            `${colors.red( base.bundle.getText('warning'))} ${base.bundle.getText('versionCheckFail', [results.versions[packageName].wanted, results.versions[packageName].version])}`)
                    }
                }
                resolve()
            })
    })
}
module.exports.checkVersion = checkVersion