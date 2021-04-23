const base = require("../utils/base")

exports.command = 'hcStart [name]'
exports.aliases = ['hcstart', 'hc_start', 'start']
exports.describe = base.bundle.getText("hcStart")

exports.builder = base.getBuilder({
    name: {
        alias: ['n'],
        type: 'string',
        default: `**default**`,
        desc: base.bundle.getText("hc_instance_name")
    }
}, false)

exports.handler = (argv) => {
    base.promptHandler(argv, hcStart, {
        name: {
            description: base.bundle.getText("hc_instance_name"),
            type: 'string',
            required: true
        }
    }, false)
}

async function hcStart(prompts) {
    try {
        const cf = require("../utils/cf")
        let results = ''
        if (prompts.name === '**default**') {
            results = await cf.getHANAInstances()
        } else {
            results = await cf.getHANAInstanceByName(prompts.name)
        }
        for (let item of results.resources) {
            console.log(await cf.startHana(item.name))
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}