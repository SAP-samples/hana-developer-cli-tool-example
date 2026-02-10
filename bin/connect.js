// @ts-check
import * as baseLite from '../utils/base-lite.js'
export const command = 'connect [user] [password]'
export const aliases = ['c', 'login']
export const describe = baseLite.bundle.getText("connect")

export const builder = baseLite.getBuilder({
  connection: {
    alias: 'n',
    desc: baseLite.bundle.getText("connection")
  },
  user: {
    alias: ['u', 'User'],
    desc: baseLite.bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: baseLite.bundle.getText("password")
  },
  userstorekey: {
    alias: ['U', 'UserStoreKey'],
    desc: baseLite.bundle.getText("userstorekey")
  },
  save: {
    alias: ['s', 'Save'],
    desc: baseLite.bundle.getText("save"),
    type: 'boolean',
    default: true
  },
  encrypt: {
    alias: ['e', 'Encrypt', 'ssl'],
    desc: baseLite.bundle.getText("encrypt"),
    type: 'boolean'
  },
  trustStore: {
    alias: ['t', 'Trust', 'trust', 'truststore'],
    desc: baseLite.bundle.getText("trustStore")
  }
}, false)


/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
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

/**
 * Connect to HANA database with provided credentials
 * @param {object} input - Input prompts with connection details
 * @returns {Promise<void>}
 */
export async function dbConnect(input) {
  const base = await import('../utils/base.js')
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

/**
 * Save connection environment to default-env-admin.json file
 * @param {object} options - Connection options to save
 * @returns {Promise<void>}
 */
export async function saveEnv(options) {
  const base = await import('../utils/base.js')
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
  console.log(baseLite.bundle.getText("adminSaved"))

}