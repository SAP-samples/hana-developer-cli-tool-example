// @ts-check
import * as base from '../utils/base.js'
import * as btp from '../utils/btp.js'

import open from 'open'

export const command = 'openbas'
export const aliases = ['openBAS', 'openBas', 'openBusinessApplicationStudio', 'bas', 'BAS']
export const describe = base.bundle.getText("openbas")
export const builder = base.getBuilder({}, false)
export function handler (argv) {
    base.promptHandler(argv, getBAS, {})
}

export async function getBAS() {
    base.debug('openBAS')
    try {       
        let basURL = await btp.getBASSubURL()       
        console.log(basURL)
        open(basURL)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}

