// @ts-check
import * as baseLite from '../utils/base-lite.js'
// massConvert needs special builder from base.js
import { getMassConvertBuilder } from '../utils/base.js'
global.__xRef = []

export const command = 'massConvert [schema] [table] [view]'
export const aliases = ['mc', 'massconvert', 'massConv', 'massconv']
export const describe = baseLite.bundle.getText("massConvert")

export const builder = getMassConvertBuilder(false)

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

