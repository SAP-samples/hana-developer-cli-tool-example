// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'createGroup [group]'
export const aliases = ['cg', 'cGrp']
export const describe = baseLite.bundle.getText("createGroup")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  group: {
    alias: ['g'],
    type: 'string',
    desc: baseLite.bundle.getText("group")
  }
})).example('hana-cli createGroup --group myGroup', baseLite.bundle.getText("createGroupExample"))

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, activate, {
    group: {
      description: base.bundle.getText("group"),
      required: true
    }
  })
}

export async function activate(prompts) {
  const base = await import('../utils/base.js')
  base.debug('activate')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let results = await db.execSQL(
      `CALL _SYS_DI.CREATE_CONTAINER_GROUP('${prompts.group}', _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`)
    console.table(results)

    return base.end()
  } catch (error) {
    await base.error(error)
  }
}
