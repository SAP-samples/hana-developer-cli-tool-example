import * as base from '../utils/base.js'

export const command = 'adminHDIGroup [user] [group]'
export const aliases = ['adHDIG', 'adhdig']
export const describe = base.bundle.getText("adminHDIGroup")

export const builder = base.getBuilder({
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

export function handler (argv) {
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

export async function activate(prompts) {
  base.debug('activate')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

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

    resultsGrant = await dbStatus.execSQL(
      `GRANT USER ADMIN TO ${prompts.user}`)
    console.table(resultsGrant)

    resultsGrant = await dbStatus.execSQL(
      `GRANT ROLE ADMIN TO ${prompts.user}`)
    console.table(resultsGrant)
        
    return base.end()
  } catch (error) {
    base.error(error)
  }
}