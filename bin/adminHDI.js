// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'adminHDI [user] [password]'
export const aliases = ['adHDI', 'adhdi']
export const describe = baseLite.bundle.getText("adminHDI")

export const builder = baseLite.getBuilder({
  user: {
    alias: ['u', 'User'],
    desc: baseLite.bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: baseLite.bundle.getText("password")
  },
  create: {
    alias: ['c', 'Create'],
    desc: baseLite.bundle.getText("createUser"),
    type: 'boolean',
    default: true
  }
})

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
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
    },
    create: {
      description: base.bundle.getText("createUser"),
      required: false
    }
  })
}

/**
 * Create HDI admin user or assign HDI admin privileges to existing user
 * @param {object} prompts - Input prompts with user, password, and create flag
 * @returns {Promise<void>}
 */
export async function activate(prompts) {
  const base = await import('../utils/base.js')
  base.debug('activate')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    if (prompts.create) {
      let results = await dbStatus.execSQL(`CREATE USER ${prompts.user} PASSWORD "${prompts.password}" NO FORCE_FIRST_PASSWORD_CHANGE;`)
      console.table(results)
    }
    else
      base.debug(base.bundle.getText("debug.adminHDI.skipCreate"))

    let resultsGrant = await dbStatus.execSQL(
      `CREATE LOCAL TEMPORARY TABLE #PRIVILEGES LIKE _SYS_DI.TT_API_PRIVILEGES;`)
    console.table(resultsGrant)
    resultsGrant = await dbStatus.execSQL(
      `INSERT INTO #PRIVILEGES (PRINCIPAL_NAME, PRIVILEGE_NAME, OBJECT_NAME) SELECT '${prompts.user}', PRIVILEGE_NAME, OBJECT_NAME FROM _SYS_DI.T_DEFAULT_DI_ADMIN_PRIVILEGES;`)
    console.table(resultsGrant)
    resultsGrant = await dbStatus.execSQL(
      `CALL _SYS_DI.GRANT_CONTAINER_GROUP_API_PRIVILEGES('_SYS_DI', #PRIVILEGES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`)
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
      base.debug(base.bundle.getText("debug.adminHDI.skipGrant", [prompts.user]))

    return base.end()

  } catch (error) {
    await base.error(error)
  }

}