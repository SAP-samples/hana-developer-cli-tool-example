// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'readme'
export const aliases = ['openreadme', 'openReadme', 'openReadMe', 'openHelp', 'openhelp']
export const describe = baseLite.bundle.getText("readme")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({}, false)).wrap(160).example(
  'hana-cli readme',
  baseLite.bundle.getText("readmeExample")
).epilog(buildDocEpilogue('openReadMe', 'developer-tools', ['readMe', 'helpDocu']))
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

