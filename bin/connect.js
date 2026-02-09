// @ts-check
import * as base from '../utils/base.js'
export const command = 'connect [user] [password]'
export const aliases = ['c', 'login']
export const describe = base.bundle.getText("connect")

export const builder = base.getBuilder({
  connection: {
    alias: 'n',
    desc: base.bundle.getText("connection")
  },
  user: {
    alias: ['u', 'User'],
    desc: base.bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: base.bundle.getText("password")
  },
  userstorekey: {
    alias: ['U', 'UserStoreKey'],
    desc: base.bundle.getText("userstorekey")
  },
  save: {
    alias: ['s', 'Save'],
    desc: base.bundle.getText("save"),
    type: 'boolean',
    default: true
  },
  encrypt: {
    alias: ['e', 'Encrypt', 'ssl'],
    desc: base.bundle.getText("encrypt"),
    type: 'boolean'
  },
  trustStore: {
    alias: ['t', 'Trust', 'trust', 'truststore'],
    desc: base.bundle.getText("trustStore")
  }
}, false)


export function handler(argv) {
  base.promptHandler(argv, dbConnect, {
    connection: {
      description: base.bundle.getText("connection"),
      pattern: /[^:]+:[0-9]+$/,
      message: base.bundle.getText("connErr"),
      required: true,
      ask: () => {
        return !argv.userstorekey
      }
    },
    user: {
      description: base.bundle.getText("user"),
      required: true,
      ask: () => {
        return !argv.userstorekey
      }
    },
    password: {
      description: base.bundle.getText("password"),
      hidden: true,
      replace: '*',
      required: true,
      ask: () => {
        return !argv.userstorekey
      }
    },
    save: {
      description: base.bundle.getText("save"),
      type: 'boolean',
      required: true
    },
    encrypt: {
      description: base.bundle.getText("encrypt"),
      type: 'boolean',
      required: true,
      default: true
    },
    userstorekey: {
      description: base.bundle.getText("userstorekey"),
      required: false,
      ask: () => {
        return !argv.userstorekey && !argv.connection
      }
    },
    trustStore: {
      description: base.bundle.getText("trustStore"),
      required: false,
      ask: () => {
        return !argv.trustStore
      }
    }
  }, false)
}

export async function dbConnect(input) {
  base.debug(`dbConnect`)
  try {
    input.admin = true
    base.setPrompts(input)
    let options = {}
    options.pooling = true
    options.encrypt = input.encrypt
    options.serverNode = input.userstorekey || input.connection
    if (!input.userstorekey) { options.user = input.user }
    if (!input.userstorekey) { options.password = input.password }
    options.sslValidateCertificate = false
    options.validate_certificate = false
    if (input.trustStore) {
      options.sslTrustStore = input.trustStore
      //  options.sslCryptoProvider = 'openssl'
      options.sslValidateCertificate = true
    }
    base.debug(options)

    if (input.save) {
      await saveEnv(options)
    }
    const db = await base.createDBConnection()

    let results = await db.execSQL(`SELECT CURRENT_USER AS "Current User", CURRENT_SCHEMA AS "Current Schema" FROM DUMMY`)
    base.outputTableFancy(results)

    let resultsSession = await db.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`)
    base.outputTableFancy(resultsSession)

    return base.end()
  } catch (error) {
    await base.error(error)
  }
}

export async function saveEnv(options) {
  base.debug('saveEnv')
  let parts = options.serverNode.split(':')
  let defaultEnv = {}
  defaultEnv.VCAP_SERVICES = {}
  defaultEnv.VCAP_SERVICES.hana = [{
    name: "hana-cli",
    label: "hana",
    tags: [
      "hana",
      "database",
      "relational"
    ],
    plan: "hdi-shared",
    credentials: {
      password: options.password,
      port: parts[1],
      encrypt: options.encrypt,
      db_hosts: [
        {
          port: parts[1],
          host: parts[0]
        }
      ],
      host: parts[0],
      user: options.user
    }
  }]
  if (options.sslTrustStore) {
    defaultEnv.VCAP_SERVICES.hana[0].credentials.sslTrustStore = options.sslTrustStore
    defaultEnv.VCAP_SERVICES.hana[0].credentials.sslCryptoProvider = 'openssl'
    defaultEnv.VCAP_SERVICES.hana[0].credentials.sslValidateCertificate = true
  }
  const {default:fs} = await import('fs')
  fs.writeFileSync("default-env-admin.json", JSON.stringify(defaultEnv, null, '\t'))
  console.log(base.bundle.getText("adminSaved"))

}