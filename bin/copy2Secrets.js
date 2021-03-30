const bundle = global.__bundle

const fs = require('fs');
const path = require('path')

exports.command = 'copy2Secrets'
exports.aliases = ['secrets', 'make:secrets']
exports.describe = bundle.getText("copy2Secrets")


exports.builder = {
    envJson: {
        alias: ['from-file'],
        type: 'string',
        default: "default-env.json",
        desc: bundle.getText("envJson")
    },
    secretsFolder: {
        alias: ['to-folder'],
        type: 'string',
        default: "secrets",
        desc: bundle.getText("secretsFolder")
    },
    filter: {
        type: 'string',
        desc: bundle.getText("secretsFitlter")
    }
}

exports.handler = function (argv) {
    makeSecrets(argv)     
}

async function makeSecrets ({envFile,secretsFolder, filter}) {

    const xsenv = require("@sap/xsenv")
    xsenv.loadEnv(envFile)

    const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);                

    for (const service in VCAP_SERVICES) {
        const instances = VCAP_SERVICES[service]
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            const instanceName = instance.name;
            if (filter && filter.length && !filter.includes(instanceName.toLowerCase())) {
                continue;
            }
            const credsPath = path.join(secretsFolder, service, instanceName);
            fs.mkdirSync(credsPath, {recursive: true});
            for (const key in instance.credentials) {
                const value = instance.credentials[key]
                const keyPath = path.join(secretsFolder, service, instanceName, key);
                fs.writeFileSync(
                    keyPath,
                    typeof value === 'string' ? value : JSON.stringify(value)
                )
                console.log('CREATED: ' + keyPath);
            }       
        }
    }
}