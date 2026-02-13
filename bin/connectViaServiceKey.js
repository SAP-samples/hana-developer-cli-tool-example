// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'serviceKey [instance] [key]'
export const aliases = ['key', 'servicekey', 'service-key']
export const describe = baseLite.bundle.getText("serviceKey")

export const builder = baseLite.getBuilder({
  instance: {
    alias: ['i', 'Instance'],
    desc: baseLite.bundle.getText("instance")
  },
  key: {
    alias: ['k', 'key'],
    desc: baseLite.bundle.getText("key")
  },
  encrypt: {
    alias: ['e', 'Encrypt', 'ssl'],
    desc: baseLite.bundle.getText("encrypt"),
    type: 'boolean',
    default: true
  },
  validate: {
    alias: ['v', 'Validate', 'validateCertificate'],
    desc: baseLite.bundle.getText("validate"),
    type: 'boolean',
    default: false
  },
  cf: {
    alias: ['c', 'cmd'],
    desc: baseLite.bundle.getText("cfxs"),
    type: 'boolean',
    default: true
  },
  save: {
    alias: ['s', 'Save'],
    desc: baseLite.bundle.getText("save2"),
    type: 'boolean',
    default: true
  }
}, false)

export async function handler (argv) {
  const base = await import('../utils/base.js')
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

export async function setKeyDetails(input) {
  const base = await import('../utils/base.js')
  base.debug('setKeyDetails')
  base.debug(input)
  const { default:child_process } = await import('child_process')
  let child = child_process.exec
  //create serviceKey
  try {

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
      console.log(baseLite.bundle.getText("serviceKey.created", [input.key]))
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

export async function saveEnv(options, input) {
  const base = await import('../utils/base.js')
  base.debug('saveEnv')
  let defaultEnv = {}
  defaultEnv.VCAP_SERVICES = {}
  let credentials
  if(options["credentials"]){
    credentials = options.credentials
  }else{
    credentials = options
  }
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
    credentials: credentials
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
    const db = await base.createDBConnection(defaultEnv.VCAP_SERVICES.hana[0].credentials) //options)
    let results = await db.execSQL(`SELECT CURRENT_USER AS "Current User", CURRENT_SCHEMA AS "Current Schema" FROM DUMMY`);
    base.outputTableFancy(results)

    let resultsSession = await db.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`);
    base.outputTableFancy(resultsSession)

  } catch (error) {
    base.error(error)
  }

  if (input.save) {
    const { default:fs } = await import('fs')
    fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), (err) => {
      if (err) {
        throw new Error(`${baseLite.bundle.getText("errConn")} ${JSON.stringify(err)}`)
      }
      console.log(baseLite.bundle.getText("saved"))
      // Don't call base.end() as it exits the process
    })
  } else {
    // No need to call base.end() for non-save path
  }
}