const base = require("../utils/base")

exports.command = 'adminHDIGroup [user] [group]'
exports.aliases = ['adHDIG', 'adhdig']
exports.describe = base.bundle.getText("adminHDIGroup")

exports.builder = base.getBuilder({
  user: {
    alias: ['u', 'User'],
    desc: base.bundle.getText("user")
  },
  group: {
    alias: ['g', 'Group'],
    type: 'string',
    default: 'SYS_XS_HANA_BROKER',
    desc: base.bundle.getText("group")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, activate, {
    user: {
      description: base.bundle.getText("user"),
      required: true
    },
    group: {
      description: base.bundle.getText("group"),
      required: true
    }
  })
}

async function activate(prompts) {

  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const dbStatus = new dbClass(await conn.createConnection(prompts))

    let resultsGrant = await dbStatus.execSQL(
      `CREATE LOCAL TEMPORARY COLUMN TABLE #PRIVILEGES LIKE _SYS_DI.TT_API_PRIVILEGES;`)
    console.table(resultsGrant)
    resultsGrant = await dbStatus.execSQL(
      `INSERT INTO #PRIVILEGES (PRINCIPAL_NAME, PRIVILEGE_NAME, OBJECT_NAME) SELECT 'SYSTEM', PRIVILEGE_NAME, OBJECT_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_GROUP_ADMIN_PRIVILEGES;`)
    console.table(resultsGrant)
    resultsGrant = await dbStatus.execSQL(
      `INSERT INTO #PRIVILEGES (PRINCIPAL_NAME, PRIVILEGE_NAME, OBJECT_NAME) SELECT '${prompts.user}', PRIVILEGE_NAME, OBJECT_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_GROUP_ADMIN_PRIVILEGES;`)
    console.table(resultsGrant)
    resultsGrant = await dbStatus.execSQL(
      `CALL _SYS_DI.GRANT_CONTAINER_GROUP_API_PRIVILEGES('${prompts.group}', #PRIVILEGES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`)
    console.table(resultsGrant)
    resultsGrant = await dbStatus.execSQL(
      `DROP TABLE #PRIVILEGES;`)
    console.table(resultsGrant)

    return base.end()
  } catch (error) {
    base.error(error)
  }
}