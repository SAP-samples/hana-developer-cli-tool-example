// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'readme'
export const aliases = ['openreadme', 'openReadme', 'openReadMe', 'openHelp', 'openhelp']
export const describe = baseLite.bundle.getText("readme")
export const builder = baseLite.getBuilder({}, false)
export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, getReadMe, {}, false)
}

export async function getReadMe() {
  const base = await import('../utils/base.js')
    base.debug('getReadMe')
    const { default:open } = await import('open')
    let dbxReadmeURL = 'https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/README.md'
    console.log(dbxReadmeURL)
    await open(dbxReadmeURL, {wait: true})
    return base.end()
}

