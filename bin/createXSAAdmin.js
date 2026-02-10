// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'createXSAAdmin [user] [password]'
export const aliases = ['cXSAAdmin', 'cXSAA', 'cxsaadmin', 'cxsaa']
export const describe = baseLite.bundle.getText("createXSAAdmin")

export const builder = baseLite.getBuilder({
  user: {
    alias: ['u', 'User'],
    desc: baseLite.bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: baseLite.bundle.getText("password")
  }
})

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
    }
  })
}

export async function activate(prompts) {
  const base = await import('../utils/base.js')
  base.debug('activate')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

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
    await base.error(error)
  }
}