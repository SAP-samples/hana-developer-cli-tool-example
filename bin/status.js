const base = require("../utils/base")
const dbClass = require("sap-hdbext-promisfied")

exports.command = 'status'
exports.aliases = ['s', 'whoami']
exports.describe = base.bundle.getText("status")

exports.builder = base.getBuilder({
  priv: {
    alias: ['p', 'privileges'],
    type: 'boolean',
    default: false,
    desc: base.bundle.getText("privileges")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, dbStatus, {
    priv: {
      description: base.bundle.getText("privileges"),
      type: 'boolean',
      required: true,
      ask: base.askFalse
    }
  })
}

async function dbStatus(prompts) {

  try {
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))

    let results = await dbStatus.execSQL(`SELECT CURRENT_USER AS "Current User", CURRENT_SCHEMA AS "Current Schema" FROM DUMMY`)
    console.table(results)

    let resultsSession = await dbStatus.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`)
    console.table(resultsSession)

    console.log(base.bundle.getText("grantedRoles"))
    let resultsRoles = await dbStatus.execSQL(`SELECT ROLE_SCHEMA_NAME, ROLE_NAME, GRANTOR, IS_GRANTABLE
                                                  FROM  GRANTED_ROLES
                                                  WHERE GRANTEE = (SELECT CURRENT_USER FROM "DUMMY")`)
    console.table(resultsRoles)

    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'priv') && prompts.priv) {
      console.log(base.bundle.getText("grantedPrivs"))
      let resultsPrivs = await dbStatus.execSQL(`SELECT PRIVILEGE, OBJECT_TYPE, GRANTOR, IS_GRANTABLE
                                                    FROM  GRANTED_PRIVILEGES
                                                    WHERE GRANTEE = (SELECT CURRENT_USER FROM "DUMMY")`)
      console.table(resultsPrivs)
    }

    return base.end()    
  } catch (error) {
    base.error(error)
  }

}