// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'helpDocu'
export const aliases = ['openDocu', 'openDocumentation', 'documentation', 'docs', 'docu']
export const describe = baseLite.bundle.getText("helpDocu")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({}, false)).example(
  'hana-cli helpDocu',
  baseLite.bundle.getText("helpDocuExample")
)
export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, getHelpDocu, {}, false)
}

export async function getHelpDocu() {
  const base = await import('../utils/base.js')
    base.debug('getHelpDocu')
    const { default:open } = await import('open')
    let docsURL = 'https://sap-samples.github.io/hana-developer-cli-tool-example/'
    console.log(docsURL)
    await open(docsURL, {wait: true})
    return base.end()
}
