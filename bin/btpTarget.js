// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as btp from '../utils/btp.js'

export const command = 'btpTarget'
export const aliases = ['btp-ui']
export const describe = baseLite.bundle.getText("btpTargetCmd")

export const builder = baseLite.getBuilder({}, false)

/**
 * Get BTP hierarchy data for UI
 * @returns {Promise<object>}
 */
export async function getBTPTargetUI() {
    const base = await import('../utils/base.js')
    base.debug('getBTPTargetUI')
    
    try {
        // Get global account info
        const account = await btp.getBTPGlobalAccount()
        
        // Get hierarchy with folders and subaccounts
        const hierarchy = await btp.getBTPHierarchy()
        
        // Get current target
        let currentTarget = null
        try {
            const subAccount = await btp.getBTPSubAccount()
            // @ts-ignore
            currentTarget = {
                // @ts-ignore
                displayName: subAccount.DisplayName,
                // @ts-ignore
                guid: subAccount.ID
            }
        } catch (e) {
            // No current target set
            base.debug('No current subaccount target')
        }
        
        return {
            globalAccount: {
                guid: account.ID,
                displayName: account.DisplayName
            },
            hierarchy: hierarchy,
            currentTarget: currentTarget
        }
    } catch (error) {
        base.error(error)
        throw error
    }
}

/**
 * Handler function for setting BTP target from UI
 * @param {object} argv - Command line arguments
 * @returns {Promise<void>}
 */
export async function handler(argv) {
    const base = await import('../utils/base.js')
    base.debug('btpTarget handler')
    
    try {
        const data = await getBTPTargetUI()
        console.log(JSON.stringify(data, null, 2))
        return base.end()
    } catch (error) {
        base.error(error)
    }
}
