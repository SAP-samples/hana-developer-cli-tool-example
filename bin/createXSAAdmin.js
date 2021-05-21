const base = require("../utils/base")

exports.command = 'createXSAAdmin [user] [password]'
exports.aliases = ['cXSAAdmin', 'cXSAA', 'cxsaadmin', 'cxsaa']
exports.describe = base.bundle.getText("createXSAAdmin")

exports.builder = base.getBuilder({
  user: {
    alias: ['u', 'User'],
    desc: base.bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: base.bundle.getText("password")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, activate, {
    user: {
      description: base.bundle.getText("user"),
      required: true
    },
    password: {
      description: base.bundle.getText("password"),
      hidden: true,
      replace: '*',
      required: true
    }
  })
}

async function activate(prompts) {
  base.debug('activate')
  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))

    let results = await dbStatus.execSQL(`CREATE USER ${prompts.user} PASSWORD "${prompts.password}" NO FORCE_FIRST_PASSWORD_CHANGE;`)
    console.table(results)

    let resultsGrant = await dbStatus.execSQL(
      `ALTER USER ${prompts.user} DISABLE PASSWORD LIFETIME;`)
    console.table(resultsGrant)
    resultsGrant = await dbStatus.execSQL(
      `ALTER USER ${prompts.user} SET PARAMETER EMAIL ADDRESS = '${prompts.user}@sap.com';`)
    console.table(resultsGrant)
    resultsGrant = await dbStatus.execSQL(
      `ALTER USER ${prompts.user} SET PARAMETER XS_RC_XS_CONTROLLER_ADMIN = 'XS_CONTROLLER_ADMIN';`)
    console.table(resultsGrant)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}