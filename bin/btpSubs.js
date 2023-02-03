// @ts-check
import * as base from '../utils/base.js'
import * as btp from '../utils/btp.js'
const colors = base.colors

export const command = 'sub'
export const aliases = ['subs', 'Sub', 'Subs', 'btpsub', 'btpsubs', 'btpSub', 'btpSubs', 'btpsubscriptions', 'btpSubscriptions']
export const describe = base.bundle.getText("btpSub")

export const builder = base.getBuilder({}, false)


export async function handler(argv) {
    base.promptHandler(argv, getSubs, {})
}

export async function getSubs(prompts) {
    base.debug('getSubs')
    base.startSpinnerInt()
    base.debug(prompts)
    try {
        base.setPrompts(prompts)

        let subs = await btp.getBTPSubscriptions()
        base.stopSpinnerInt()
        const subscribed = 'SUBSCRIBED'
        for (let item of subs.applications) {
            if (item.state === subscribed) {
                console.log(item.displayName)
                if (item.subscriptionUrl) {
                    console.log(colors.blue(item.subscriptionUrl))
                }
            }
        }

        return base.end()
    } catch (error) {
        base.error(error)
    }
}