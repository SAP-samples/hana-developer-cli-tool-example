// @ts-check
import * as base from '../utils/base.js'
import * as fs from 'fs'
import * as path from 'path'

export const command = 'dropContainer [container] [group]'
export const aliases = ['dc', 'dropC']
export const describe = base.bundle.getText("dropContainer")

export const builder = base.getBuilder({
  container: {
    alias: ['c', 'Container'],
    type: 'string',
    desc: base.bundle.getText("container")
  },
  group: {
    alias: ['g', 'Group'],
    type: 'string',
    default: '',
    desc: base.bundle.getText("group")
  }
})

export function handler (argv) {
  base.promptHandler(argv, drop, {
    container: {
      description: base.bundle.getText("container"),
      required: true
    },
    group: {
      description: base.bundle.getText("group"),
      required: false
    }
  })
}

export async function drop(prompts) {
  base.debug('drop')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let apiSchema = ''
    if (prompts.group.length == 0)
      apiSchema = '_SYS_DI'
    else
      apiSchema = '_SYS_DI#' + prompts.group

    let rolePrefix = ''
    if (prompts.group.length == 0)
      rolePrefix = prompts.container
    else
      rolePrefix = prompts.group + '::' + prompts.container

    let results = await db.execSQL(
      `CREATE LOCAL TEMPORARY COLUMN TABLE #PARAMETERS LIKE _SYS_DI.TT_PARAMETERS;`)
    console.table(results)
    results = await db.execSQL(
      `INSERT INTO #PARAMETERS ( KEY, VALUE ) VALUES ( 'IGNORE_WORK', true );`)
    console.table(results)
    results = await db.execSQL(
      `INSERT INTO #PARAMETERS ( KEY, VALUE ) VALUES ( 'IGNORE_DEPLOYED', true );`)
    console.table(results)
    results = await db.execSQL(
      `CALL ${apiSchema}.DROP_CONTAINER('${prompts.container}', #PARAMETERS, ?, ?, ?);`)
    console.table(results)
    results = await db.execSQL(
      `DROP TABLE #PARAMETERS;`)
    console.table(results)

    let hdiFile = path.resolve(process.cwd(), 'default-env.json')
    let hdi = JSON.parse(fs.readFileSync(hdiFile, "utf8"))

    results = await db.execSQL(
      `DROP USER ${hdi.VCAP_SERVICES.hana[0].credentials.user} CASCADE`)
    console.table(results)

    results = await db.execSQL(
      `DROP USER ${hdi.VCAP_SERVICES.hana[0].credentials.hdi_user} CASCADE`)
    console.table(results)

    results = await db.execSQL(
      `DROP ROLE "${rolePrefix}::access_role"`)
    console.table(results)

    results = await db.execSQL(
      `DROP ROLE "${rolePrefix}::external_privileges_role"`)
    console.table(results)

    return base.end()
  } catch (error) {
    base.error(error)
  }

}
