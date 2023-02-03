// @ts-check
import * as base from '../utils/base.js'

export const command = 'issue'
export const aliases = ['Issue', 'openIssue', 'openissue', 'reportIssue', 'reportissue']
export const describe = base.bundle.getText("issue")
export const builder = base.getBuilder({}, false)
export function handler(argv) {
    base.promptHandler(argv, createIssue, {})
}

export async function createIssue() {
    base.debug('createIssue')
    base.startSpinnerInt()
    const { default: open } = await import('open')
    const { getVersion } = await import('./version.js')
    try {
        const ver = await getVersion()
        let verString = ``
        Object.keys(ver).forEach(key => verString += `${key}: ${ver[key]}\n`)
        const encoded = encodeURI(verString)
        let issueURL =
            `https://github.com/SAP-samples/hana-developer-cli-tool-example/issues/new?` +
            `title=<Please+Describe+Your+Issue>` +
            `&labels=bug` +
            `&body=${encoded}`
        base.debug(issueURL)
        open(issueURL)
        base.stopSpinnerInt()
        return base.end()
    } catch (error) {
        base.error(error)
    }
}

