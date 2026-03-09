// @ts-check
import * as baseLite from '../utils/base-lite.js'
// massConvert needs special builder from base.js
import { getMassConvertBuilder } from '../utils/base.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
global.__xRef = []

export const command = 'massConvert [schema] [table] [view]'
export const aliases = ['mc', 'massconvert', 'massConv', 'massconv']
export const describe = baseLite.bundle.getText("massConvert")

export const builder = (yargs) => {
  const baseBuilder = getMassConvertBuilder(false)
  return yargs.options(baseBuilder)
    .wrap(160)
    .example('hana-cli massConvert --schema MYSCHEMA --table MYTABLE', baseLite.bundle.getText("massConvertExample"))
    .wrap(160)
    .epilog(buildDocEpilogue('massConvert', 'data-tools', ['massConvertUI', 'convertToHdbTable']))
}

export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, getTables, base.getMassConvertPrompts(false))
}

export async function getTables(prompts) {
  const base = await import('../utils/base.js')
    base.debug('getTables')
    const massConvertLib = await import('../utils/massConvert.js')
    base.setPrompts(prompts)
    await massConvertLib.convert()
    return base.end()
}

