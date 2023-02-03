// @ts-check
import * as base from '../utils/base.js'

export const command = 'readme'
export const aliases = ['openreadme', 'openReadme', 'openReadMe', 'openHelp', 'openhelp']
export const describe = base.bundle.getText("readme")
export const builder = base.getBuilder({}, false)
export function handler (argv) {
    base.promptHandler(argv, getReadMe, {}, false)
}

export async function getReadMe() {
    base.debug('getReadMe')
    const { default:open } = await import('open')
    let dbxReadmeURL = 'https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/README.md'
    console.log(dbxReadmeURL)
    open(dbxReadmeURL)
    return base.end()
}

