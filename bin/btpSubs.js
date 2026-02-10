// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as btp from '../utils/btp.js'
const colors = baseLite.colors

export const command = 'sub'
export const aliases = ['subs', 'Sub', 'Subs', 'btpsub', 'btpsubs', 'btpSub', 'btpSubs', 'btpsubscriptions', 'btpSubscriptions']
export const describe = baseLite.bundle.getText("btpSub")

export const builder = baseLite.getBuilder({}, false)


export async function handler(argv) {
  const base = await import('../utils/base.js')
    base.promptHandler(argv, getSubs, {})
}

export async function getSubs(prompts) {
    const base = await import('../utils/base.js')
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