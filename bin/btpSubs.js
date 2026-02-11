// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as btp from '../utils/btp.js'
const colors = baseLite.colors

export const command = 'sub'
export const aliases = ['subs', 'Sub', 'Subs', 'btpsub', 'btpsubs', 'btpSub', 'btpSubs', 'btpsubscriptions', 'btpSubscriptions']
export const describe = baseLite.bundle.getText("btpSub")

export const builder = baseLite.getBuilder({}, false)

const SUBSCRIBED_STATE = 'SUBSCRIBED'

function getSubscribedApps(subs) {
    if (!subs || !subs.applications) {
        return []
    }
    return subs.applications
        .filter(item => item.state === SUBSCRIBED_STATE)
        .map(item => ({
            DisplayName: item.displayName,
            SubscriptionUrl: item.subscriptionUrl
        }))
}

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
        const subscribedApps = getSubscribedApps(subs)
        for (let item of subscribedApps) {
            console.log(item.DisplayName)
            if (item.SubscriptionUrl) {
                console.log(colors.blue(item.SubscriptionUrl))
            }
        }

        return base.end()
    } catch (error) {
        base.error(error)
    }
}

export async function getSubsUI(prompts) {
    const base = await import('../utils/base.js')
    base.debug('getSubsUI')
    try {
        base.setPrompts(prompts)
        const subs = await btp.getBTPSubscriptions()
        return getSubscribedApps(subs)
    } catch (error) {
        base.error(error)
    }
}