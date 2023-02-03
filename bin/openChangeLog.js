// @ts-check
import * as base from '../utils/base.js'

export const command = 'changelog'
export const aliases = ['openrchangelog', 'openChangeLog', 'openChangelog', 'ChangeLog', 'Changelog', 'changes', 'Changes']
export const describe = base.bundle.getText("changelog")
export const builder = base.getBuilder({}, false)
export function handler (argv) {
    base.promptHandler(argv, getChangeLog, {}, false)
}

export async function getChangeLog() {
    base.debug('getChangeLog')
    const { default:open } = await import('open')
    let dbxReadmeURL = 'https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/CHANGELOG.md'
    console.log(dbxReadmeURL)
    open(dbxReadmeURL)
    return base.end()
}

