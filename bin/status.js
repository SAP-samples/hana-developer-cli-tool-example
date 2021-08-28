// @ts-check
import * as base from '../utils/base.js'

export const command = 'status'
export const aliases = ['s', 'whoami']
export const describe = base.bundle.getText("status")

export const builder = base.getBuilder({
  priv: {
    alias: ['p', 'privileges'],
    type: 'boolean',
    default: false,
    desc: base.bundle.getText("privileges")
  }
})

export function handler (argv) {
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
  base.debug('dbStatus')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(`SELECT CURRENT_USER AS "Current User", CURRENT_SCHEMA AS "Current Schema" FROM DUMMY`)
    base.outputTable(results)

    let resultsSession = await dbStatus.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`)
    base.outputTable(resultsSession)

    base.output(base.bundle.getText("grantedRoles"))
    let resultsRoles = await dbStatus.execSQL(`SELECT ROLE_SCHEMA_NAME, ROLE_NAME, GRANTOR, IS_GRANTABLE
                                                  FROM  GRANTED_ROLES
                                                  WHERE GRANTEE = (SELECT CURRENT_USER FROM "DUMMY")`)
    base.outputTable(resultsRoles)

    if (prompts && Object.prototype.hasOwnProperty.call(prompts, 'priv') && prompts.priv) {
      base.output(base.bundle.getText("grantedPrivs"))
      let resultsPrivs = await dbStatus.execSQL(`SELECT PRIVILEGE, OBJECT_TYPE, GRANTOR, IS_GRANTABLE
                                                    FROM  GRANTED_PRIVILEGES
                                                    WHERE GRANTEE = (SELECT CURRENT_USER FROM "DUMMY")`)
      base.outputTable(resultsPrivs)
    }

    return base.end()
  } catch (error) {
    base.error(error)
  }

}