// @ts-check
import * as base from '../utils/base.js'
import * as btp from '../utils/btp.js'
import { select } from '@inquirer/prompts'
const colors = base.colors

export const command = 'btp [directory] [subaccount]'
export const aliases = ['btpTarget', 'btptarget', 'btp']
export const describe = base.bundle.getText("btpCmd")

export const builder = base.getBuilder({
    subaccount: {
        alias: ['sa'],
        type: 'string',
        desc: base.bundle.getText("btpSa")
    }
}, false)


export async function handler(argv) {
    let schema = {
        subaccount: {
            description: base.bundle.getText("btpSa"),
            type: 'string',
            required: false
        }
    }

    base.debug(`build inquirer prompts`)

    try {
        base.debug(`GetBTPGlobalAccount`)
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
                        ? 'Select a folder or subaccount:' 
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
                            message: `Select subaccount from ${selectedFolder.name.replace('📁 ', '')}:`,
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
                base.error('No subaccount selected')
                base.end()
            }
        } catch (error) {
            base.error(error)
        }
    } catch (error) {
        base.error(base.bundle.getText("err.BTPNoTarget"))
        base.end()
    }
}


export async function callBTP(prompts) {
    base.debug('callBTP')
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
