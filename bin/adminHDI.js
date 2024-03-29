// @ts-check
import * as base from '../utils/base.js'

export const command = 'adminHDI [user] [password]'
export const aliases = ['adHDI', 'adhdi']
export const describe = base.bundle.getText("adminHDI")

export const builder = base.getBuilder({
  user: {
    alias: ['u', 'User'],
    desc: base.bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: base.bundle.getText("password")
  },
  create: {
    alias: ['c', 'Create'],
    desc: base.bundle.getText("createUser"),
    type: 'boolean',
    default: true
  }
})

export function handler (argv) {
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

export async function activate(prompts) {
  base.debug('activate')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    if (prompts.create) {
      let results = await dbStatus.execSQL(`CREATE USER ${prompts.user} PASSWORD "${prompts.password}" NO FORCE_FIRST_PASSWORD_CHANGE;`)
      console.table(results)
    }
    else
      base.debug('do not create a new database user')

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

    if (base.getUserName() != prompts.user) {
      resultsGrant = await dbStatus.execSQL(
        `GRANT USER ADMIN TO ${prompts.user}`)
      console.table(resultsGrant)

      resultsGrant = await dbStatus.execSQL(
        `GRANT ROLE ADMIN TO ${prompts.user}`)
      console.table(resultsGrant)
    }
    else
      base.debug('Do not grant privieges to ' + prompts.user)

    return base.end()

  } catch (error) {
    base.error(error)
  }

}