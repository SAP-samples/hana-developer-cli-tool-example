// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'adminHDIGroup [user] [group]'
export const aliases = ['adHDIG', 'adhdig']
export const describe = baseLite.bundle.getText("adminHDIGroup")

export const builder = baseLite.getBuilder({
  user: {
    alias: ['u', 'User'],
    desc: baseLite.bundle.getText("user")
  },
  group: {
    alias: ['g', 'Group'],
    type: 'string',
    default: 'SYS_XS_HANA_BROKER',
    desc: baseLite.bundle.getText("group")
  }
})

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
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

/**
 * Add a user as an HDI group admin
 * @param {object} prompts - Input prompts with user and group
 * @returns {Promise<void>}
 */
export async function activate(prompts) {
  const base = await import('../utils/base.js')
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

    if (await base.getUserName() != prompts.user) {
      resultsGrant = await dbStatus.execSQL(
        `GRANT USER ADMIN TO ${prompts.user}`)
      console.table(resultsGrant)

      resultsGrant = await dbStatus.execSQL(
        `GRANT ROLE ADMIN TO ${prompts.user}`)
      console.table(resultsGrant)
    }
    else
      base.debug('Do not grant privileges to ' + prompts.user)

    return base.end()
  } catch (error) {
    await base.error(error)
  }
}