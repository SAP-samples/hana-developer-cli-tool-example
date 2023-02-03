// @ts-check
import * as base from '../utils/base.js'
import * as btp from '../utils/btp.js'

export const command = 'openbas'
export const aliases = ['openBAS', 'openBas', 'openBusinessApplicationStudio', 'bas', 'BAS']
export const describe = base.bundle.getText("openbas")
export const builder = base.getBuilder({}, false)
export function handler (argv) {
    base.promptHandler(argv, getBAS, {})
}

export async function getBAS() {
    base.startSpinnerInt()
    base.debug('openBAS')
    const { default:open } = await import('open')
    try {       
        let basURL = await btp.getBASSubURL()
        open(basURL)
        base.stopSpinnerInt()       
        console.log(basURL)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}

