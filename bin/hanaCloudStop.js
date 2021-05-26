const base = require("../utils/base")

exports.command = 'hcStop [name]'
exports.aliases = ['hcstop', 'hc_stop', 'stop']
exports.describe = base.bundle.getText("hcStop")

exports.builder = base.getBuilder({
    name: {
        alias: ['n'],
        type: 'string',
        default: `**default**`,
        desc: base.bundle.getText("hc_instance_name")
    }
}, false)

exports.handler = (argv) => {
    base.promptHandler(argv, hcStop, {
        name: {
            description: base.bundle.getText("hc_instance_name"),
            type: 'string',
            required: true
        }
    }, false)
}


async function hcStop(prompts) {
    base.debug(`hcStop`)
    try {
        const cf = require("../utils/cf")
        let results = ''
        if (prompts.name === '**default**') {
            results = await cf.getHANAInstances()
        } else {
            results = await cf.getHANAInstanceByName(prompts.name)
        }
        for (let item of results.resources) {
            console.log(await cf.stopHana(item.name))
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}