// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'dropGroup [group]'
export const aliases = ['dg', 'dropG']
export const describe = baseLite.bundle.getText("dropGroup")

export const builder = baseLite.getBuilder({
  group: {
    alias: ['g', 'Group'],
    type: 'string',
    desc: baseLite.bundle.getText("group")
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, drop, {
    group: {
      description: base.bundle.getText("group"),
      required: true
    }
  })
}

export async function drop(prompts) {
  const base = await import('../utils/base.js')
  base.debug('drop')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let results = await db.execSQL(
      `CALL _SYS_DI.DROP_CONTAINER_GROUP('${prompts.group}', _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`)
    console.table(results)

    return base.end()
  } catch (error) {
    await base.error(error)
  }

}
