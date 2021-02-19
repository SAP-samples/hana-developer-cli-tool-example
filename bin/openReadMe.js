const colors = require("colors/safe")
const bundle = global.__bundle;

exports.command = 'readme'
exports.aliases = ['openreadme', 'openReadme', 'openReadMe', 'openHelp', 'openhelp']
exports.describe = bundle.getText("readme")


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
        getReadMe(result)
    })
}


async function getReadMe() {


        let dbxReadmeURL = 'https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/README.md'
        console.log(dbxReadmeURL)
        const open = require('open')
        open(dbxReadmeURL)
        return

}

