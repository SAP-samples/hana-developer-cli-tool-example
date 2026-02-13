// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as btp from '../utils/btp.js'
import { select } from '@inquirer/prompts'
const colors = baseLite.colors

export const command = 'btp [directory] [subaccount]'
export const aliases = ['btpTarget', 'btptarget', 'btp']
export const describe = baseLite.bundle.getText("btpCmd")

export const builder = baseLite.getBuilder({
    subaccount: {
        alias: ['sa'],
        type: 'string',
        desc: baseLite.bundle.getText("btpSa")
    }
}, false)


/**
 * Command handler function to set BTP target (directory and subaccount)
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
    let schema = {
        subaccount: {
            description: base.bundle.getText("btpSa"),
            type: 'string',
            required: false
        }
    }

    base.debug(base.bundle.getText("debug.btp.buildPrompts"))

    try {
        base.debug(base.bundle.getText("debug.btp.getGlobalAccount"))
        base.startSpinnerInt()
        var account = await btp.getBTPGlobalAccount()
        base.debug(account)
        try {
            let hierarchy = await btp.getBTPHierarchy()
            base.debug(hierarchy)
            base.stopSpinnerInt()
            console.log(`${base.bundle.getText("btpGlobal")}: ${colors.green(account.DisplayName)}`)

            // Build hierarchical structure for BTP subaccounts
            let folders = []
            let rootSubaccounts = []
            
            if(hierarchy.children){
                for (let item of hierarchy.children) {
                    if(item.subaccounts){
                        folders.push({
                            name: `📁 ${item.displayName}`,
                            value: item.guid,
                            subaccounts: item.subaccounts
                        })
                    }
                }
            }
            
            if(hierarchy.subaccounts){
                for (let item of hierarchy.subaccounts) {
                    rootSubaccounts.push({
                        name: `🧾 ${item.displayName}`,
                        value: item.guid
                    })
                }
            }

            let selectedSubaccountGuid = null

            // If there are folders, show folder selection first
            if (folders.length > 0) {
                let choices = []
                
                // Add folders to choices
                for (let folder of folders) {
                    choices.push({
                        name: folder.name,
                        value: folder.value,
                        type: 'folder'
                    })
                }
                
                // Add root-level subaccounts to choices
                for (let subaccount of rootSubaccounts) {
                    choices.push({
                        name: subaccount.name,
                        value: subaccount.value,
                        type: 'subaccount'
                    })
                }

                const firstSelection = await select({
                    message: folders.length > 0 && rootSubaccounts.length > 0 
                        ? base.bundle.getText("btp.selectFolderOrSubaccount") 
                        : base.bundle.getText("btpSa"),
                    choices: choices.map(choice => ({
                        name: choice.name,
                        value: JSON.stringify({ guid: choice.value, type: choice.type })
                    }))
                })

                const selection = JSON.parse(firstSelection)
                
                if (selection.type === 'folder') {
                    // Find the selected folder and show its subaccounts
                    const selectedFolder = folders.find(f => f.value === selection.guid)
                    if (selectedFolder && selectedFolder.subaccounts) {
                        const subaccountChoices = selectedFolder.subaccounts.map(sub => ({
                            name: `🧾 ${sub.displayName}`,
                            value: sub.guid
                        }))

                        selectedSubaccountGuid = await select({
                            message: base.bundle.getText("btp.selectSubaccountFromFolder", [selectedFolder.name.replace('📁 ', '')]),
                            choices: subaccountChoices
                        })
                    }
                } else {
                    // Direct subaccount selection
                    selectedSubaccountGuid = selection.guid
                }
            } else if (rootSubaccounts.length > 0) {
                // Only root subaccounts, show them directly
                selectedSubaccountGuid = await select({
                    message: base.bundle.getText("btpSa"),
                    choices: rootSubaccounts
                })
            }

            if (selectedSubaccountGuid) {
                schema.subaccount.default = selectedSubaccountGuid
                base.debug(schema)
                base.promptHandler(argv, callBTP, schema)
            } else {
                base.error(base.bundle.getText("btp.noSubaccountSelected"))
            }
        } catch (error) {
            base.error(error)
        }
    } catch (error) {
        base.error(base.bundle.getText("err.BTPNoTarget"))
    }
}


export async function callBTP(prompts) {
  const base = await import('../utils/base.js')
        base.debug(base.bundle.getText("debug.btp.callBTP"))
    base.startSpinnerInt()
    base.debug(prompts)
    try {
        base.setPrompts(prompts)
        let targetOutput = await btp.setBTPSubAccount(prompts.subaccount)
        base.stopSpinnerInt()
        console.log(targetOutput)

        return base.end()
    } catch (error) {
        base.error(error)
    }
}
