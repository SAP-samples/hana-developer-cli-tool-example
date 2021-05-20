const base = require("../utils/base")

exports.command = 'serviceKey [instance] [key]'
exports.aliases = ['key', 'servicekey', 'service-key']
exports.describe = base.bundle.getText("serviceKey")

exports.builder = base.getBuilder({
  instance: {
    alias: ['i', 'Instance'],
    desc: base.bundle.getText("instance")
  },
  key: {
    alias: ['k', 'key'],
    desc: base.bundle.getText("key")
  },
  encrypt: {
    alias: ['e', 'Encrypt', 'ssl'],
    desc: base.bundle.getText("encrypt"),
    type: 'boolean',
    default: true
  },
  validate: {
    alias: ['v', 'Validate', 'validateCertificate'],
    desc: base.bundle.getText("validate"),
    type: 'boolean',
    default: false
  },
  cf: {
    alias: ['c', 'cmd'],
    desc: base.bundle.getText("cfxs"),
    type: 'boolean',
    default: true
  },
  save: {
    alias: ['s', 'Save'],
    desc: base.bundle.getText("save2"),
    type: 'boolean',
    default: true
  }
}, false)

exports.handler = (argv) => {
  base.promptHandler(argv, setKeyDetails, {
    instance: {
      description: base.bundle.getText("instance"),
      required: true
    },
    key: {
      description: base.bundle.getText("key"),
      required: true
    },
    encrypt: {
      description: base.bundle.getText("encrypt"),
      type: 'boolean',
      default: true,
      required: false
    },
    validate: {
      description: base.bundle.getText("validate"),
      type: 'boolean',
      default: false,
      required: false
    },
    cf: {
      description: base.bundle.getText("cfxs"),
      type: 'boolean',
      default: true,
      required: false
    },
    save: {
      description: base.bundle.getText("save2"),
      type: 'boolean',
      required: true
    }
  }, false)
}

async function setKeyDetails(input) {
  base.debug(input)

  //create serviceKey
  try {
    let child = require("child_process").exec
    let script = ''

    if (input.cf) {
      script = `cf create-service-key ${input.instance} ${input.key}`
    } else {
      script = `xs create-service-key ${input.instance} ${input.key}`
    }
    child(script, (err) => {
      if (err) {
        return base.error(err)
      } 
      console.log(`Service Key ${input.key} created`)

      let child = require("child_process").exec
      let script = ''
      if (input.cf) {
        script = `cf service-key ${input.instance} ${input.key}`
      } else {
        script = `xs service-key ${input.instance} ${input.key}`
      }
      child(script, (err, stdout) => {
        if (err) {
          return base.error(err)
        } else {
          let lines = stdout.split('\n')
          console.log(lines[0])
          lines.splice(0, 2)
          if (!input.cf) {
            lines.splice(-3, 3)
          }
          let newtext = lines.join('\n')
          let returnContent = JSON.parse(newtext)
  
          if (input.save) {
            saveEnv(returnContent, input)
          }
        }
      })
      return base.end()
    })
  } catch (error) {
    base.error(error)
  }
}

async function saveEnv(options, input) {
  let defaultEnv = {}
  defaultEnv.VCAP_SERVICES = {}
  defaultEnv.VCAP_SERVICES.hana = [{
    name: input.instance,
    instance_name: input.instance,
    label: "hana",
    tags: [
      "hana",
      "database",
      "relational"
    ],
    plan: "hdi-shared",
    credentials: options
  }]

  defaultEnv.VCAP_SERVICES.hana[0].credentials.encrypt = input.encrypt
  //defaultEnv.VCAP_SERVICES.hana[0].credentials.sslCryptoProvider = 'openssl'
  if (input.validate) {
    defaultEnv.VCAP_SERVICES.hana[0].credentials.sslValidateCertificate = true
  } else {
    defaultEnv.VCAP_SERVICES.hana[0].credentials.sslValidateCertificate = false
    delete defaultEnv.VCAP_SERVICES.hana[0].credentials.certificate
  }
  base.debug(defaultEnv.VCAP_SERVICES)
  try {
    const dbClass = require("sap-hdbext-promisfied")
    const db = new dbClass(await dbClass.createConnection(options))
    let results = await db.execSQL(`SELECT CURRENT_USER AS "Current User", CURRENT_SCHEMA AS "Current Schema" FROM DUMMY`);
    console.table(results)

    let resultsSession = await db.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`);
    console.table(resultsSession)

  } catch (error) {
    base.error(error)
  }

  if (input.save) {
    const fs = require('fs')
    fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), (err) => {
      if (err) {
        throw new Error(`${base.bundle.getText("errConn")} ${JSON.stringify(err)}`)
      }
      console.log(base.bundle.getText("saved"));

    })
  }
}