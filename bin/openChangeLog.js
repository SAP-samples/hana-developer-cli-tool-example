// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'changelog'
export const aliases = ['openrchangelog', 'openChangeLog', 'openChangelog', 'ChangeLog', 'Changelog', 'changes', 'Changes']
export const describe = baseLite.bundle.getText("changelog")
export const builder = baseLite.getBuilder({}, false)
export async function handler (argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, getChangeLog, {}, false)
}

export async function getChangeLog() {
  const base = await import('../utils/base.js')
    base.debug('getChangeLog')
    const { default:open } = await import('open')
    let dbxReadmeURL = 'https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/CHANGELOG.md'
    console.log(dbxReadmeURL)
    await open(dbxReadmeURL, {wait: true})
    return base.end()
}

