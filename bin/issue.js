// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'issue'
export const aliases = ['Issue', 'openIssue', 'openissue', 'reportIssue', 'reportissue']
export const describe = baseLite.bundle.getText("issue")
export const builder = baseLite.getBuilder({}, false)
export async function handler(argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, createIssue, {})
}

export async function createIssue() {
  const base = await import('../utils/base.js')
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
        await open(issueURL, {wait: true})
        base.stopSpinnerInt()
        return base.end()
    } catch (error) {
        base.error(error)
    }
}

