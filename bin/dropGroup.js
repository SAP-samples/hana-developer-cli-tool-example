// @ts-check
import * as base from '../utils/base.js'

export const command = 'dropGroup [group]'
export const aliases = ['dg', 'dropG']
export const describe = base.bundle.getText("dropGroup")

export const builder = base.getBuilder({
  group: {
    alias: ['g', 'Group'],
    type: 'string',
    desc: base.bundle.getText("group")
  }
})

export function handler (argv) {
  base.promptHandler(argv, drop, {
    group: {
      description: base.bundle.getText("group"),
      required: true
    }
  })
}

export async function drop(prompts) {
  base.debug('drop')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let results = await db.execSQL(
      `CALL _SYS_DI.DROP_CONTAINER_GROUP('${prompts.group}', _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`)
    console.table(results)

    return base.end()
  } catch (error) {
    base.error(error)
  }

}
