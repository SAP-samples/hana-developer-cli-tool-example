// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'status'
export const aliases = ['s', 'whoami']
export const describe = baseLite.bundle.getText("status")

export const builder = baseLite.getBuilder({
  priv: {
    alias: ['p', 'privileges'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("privileges")
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dbStatus, {
    priv: {
      description: base.bundle.getText("privileges"),
      type: 'boolean',
      required: true,
      ask: base.askFalse
    }
  })
}

export async function dbStatus(prompts) {
  const base = await import('../utils/base.js')
  base.debug('dbStatus')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(`SELECT CURRENT_USER AS "Current User", CURRENT_SCHEMA AS "Current Schema" FROM DUMMY`)
    base.outputTableFancy(results)

    let resultsSession = await dbStatus.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`)
    base.outputTableFancy(resultsSession)

    base.output(baseLite.bundle.getText("grantedRoles"))
    let resultsRoles = await dbStatus.execSQL(`SELECT ROLE_SCHEMA_NAME, ROLE_NAME, GRANTOR, IS_GRANTABLE
                                                  FROM  GRANTED_ROLES
                                                  WHERE GRANTEE = (SELECT CURRENT_USER FROM "DUMMY")`)
    base.outputTableFancy(resultsRoles)

    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'priv') && prompts.priv) {
      base.output(baseLite.bundle.getText("grantedPrivs"))
      let resultsPrivs = await dbStatus.execSQL(`SELECT PRIVILEGE, OBJECT_TYPE, GRANTOR, IS_GRANTABLE
                                                    FROM  GRANTED_PRIVILEGES
                                                    WHERE GRANTEE = (SELECT CURRENT_USER FROM "DUMMY")`)
      base.outputTableFancy(resultsPrivs)
    }

    return base.end()
  } catch (error) {
    await base.error(error)
  }

}