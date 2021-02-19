const colors = require("colors/safe")
const bundle = global.__bundle;

exports.command = 'changelog'
exports.aliases = ['openrchangelog', 'openChangeLog', 'openChangelog', 'ChangeLog', 'Changelog', 'changes', 'Changes']
exports.describe = bundle.getText("changelog")


exports.builder = {
}


exports.handler = function (argv) {
    const prompt = require('prompt')
    prompt.override = argv
    prompt.message = colors.green(bundle.getText("input"))
    prompt.start()

    var schema = {
        properties: {            
        }
    }

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message)
        }
        getChangeLog(result)
    })
}


async function getChangeLog() {


        let dbxReadmeURL = 'https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/CHANGELOG.md'
        console.log(dbxReadmeURL)
        const open = require('open')
        open(dbxReadmeURL)
        return

}

