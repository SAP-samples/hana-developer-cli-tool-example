// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'dropGroup [group]'
export const aliases = ['dg', 'dropG']
export const describe = baseLite.bundle.getText("dropGroup")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  group: {
    alias: ['g'],
    type: 'string',
    desc: baseLite.bundle.getText("group")
  }
})).wrap(160).example('hana-cli dropGroup --group myGroup', baseLite.bundle.getText("dropGroupExample")).wrap(160).epilog(buildDocEpilogue('dropGroup', 'security', ['createGroup', 'users', 'roles']))

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
