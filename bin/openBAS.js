// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as btp from '../utils/btp.js'

export const command = 'openbas'
export const aliases = ['openBAS', 'openBas', 'openBusinessApplicationStudio', 'bas', 'BAS']
export const describe = baseLite.bundle.getText("openbas")
export const builder = baseLite.getBuilder({}, false)
export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, getBAS, {})
}

export async function getBAS() {
  const base = await import('../utils/base.js')
    base.startSpinnerInt()
    base.debug('openBAS')
    const { default:open } = await import('open')
    try {       
        let basURL = await btp.getBASSubURL()
        await open(basURL, {wait: true})
        base.stopSpinnerInt()       
        console.log(basURL)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}

