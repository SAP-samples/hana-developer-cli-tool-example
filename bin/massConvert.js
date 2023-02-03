// @ts-check
import * as base from '../utils/base.js'
global.__xRef = []

export const command = 'massConvert [schema] [table]'
export const aliases = ['mc', 'massconvert', 'massConv', 'massconv']
export const describe = base.bundle.getText("massConvert")

export const builder = base.getMassConvertBuilder(false)

export function handler (argv) {
    base.promptHandler(argv, getTables, base.getMassConvertPrompts(false))
}

export async function getTables(prompts) {
    base.debug('getTables')
    const massConvertLib = await import('../utils/massConvert.js')
    base.setPrompts(prompts)
    await massConvertLib.convert()
    return base.end()
}

