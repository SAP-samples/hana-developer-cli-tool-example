// @ts-check
import * as base from '../utils/base.js'

export const command = 'createGroup [group]'
export const aliases = ['cg', 'cGrp']
export const describe = base.bundle.getText("createGroup")

export const builder = base.getBuilder({
  group: {
    alias: ['g', 'Group'],
    type: 'string',
    desc: base.bundle.getText("group")
  }
})

export function handler (argv) {
  base.promptHandler(argv, activate, {
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
    const db = await base.createDBConnection()

    let results = await db.execSQL(
      `CALL _SYS_DI.CREATE_CONTAINER_GROUP('${prompts.group}', _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`)
    console.table(results)

    return base.end()
  } catch (error) {
    base.error(error)
  }
}
