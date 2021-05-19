const base = require("../utils/base")

exports.command = 'changelog'
exports.aliases = ['openrchangelog', 'openChangeLog', 'openChangelog', 'ChangeLog', 'Changelog', 'changes', 'Changes']
exports.describe = base.bundle.getText("changelog")
exports.builder = base.getBuilder({}, false)
exports.handler = (argv) => {
    base.promptHandler(argv, getChangeLog, {}, false)
}

async function getChangeLog() {
    let dbxReadmeURL = 'https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/CHANGELOG.md'
    console.log(dbxReadmeURL)
    const open = require('open')
    open(dbxReadmeURL)
    return base.end()
}

