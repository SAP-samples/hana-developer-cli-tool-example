const base = require("../utils/base")

exports.command = 'readme'
exports.aliases = ['openreadme', 'openReadme', 'openReadMe', 'openHelp', 'openhelp']
exports.describe = base.bundle.getText("readme")
exports.builder = base.getBuilder({}, false)
exports.handler = (argv) => {
    base.promptHandler(argv, getReadMe, {}, false)
}

async function getReadMe() {
    let dbxReadmeURL = 'https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/README.md'
    console.log(dbxReadmeURL)
    const open = require('open')
    open(dbxReadmeURL)
    return base.end()
}

