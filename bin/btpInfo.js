// @ts-check
import * as base from '../utils/base.js'
import * as btp from '../utils/btp.js'
const colors = base.colors

export const command = 'btpInfo'
export const aliases = ['btpinfo']
export const describe = base.bundle.getText("btpInfo")

export const builder = base.getBuilder({
    output: {
        alias: ['o', 'Output'],
        choices: ["tbl", "json"],
        default: "tbl",
        type: 'string',
        desc: base.bundle.getText("outputType")
      }
}, false)


export async function handler(argv) {
    base.promptHandler(argv, getBTPInfo, {
        output: {
          description: base.bundle.getText("outputType"),
          type: 'string',
          //       validator: /t[bl]*|s[ql]*|c[ds]?/,
          required: true
        }
    })
}

export async function getBTPInfo(prompts) {
    base.debug('getBTPInfo')
    base.startSpinnerInt()
    base.debug(prompts)
    try {
        base.setPrompts(prompts)

        let data = await btp.getBTPConfig()
        base.stopSpinnerInt()
        if(prompts.output === 'json'){
            console.log(data)
        }else{
            console.log(`${base.bundle.getText("dbx.user")}: ${colors.green(data.UserName)}`)
            console.log(`${base.bundle.getText("btp.ServerURL")}: ${colors.blue(data.ServerURL)}`)
            console.log(`${base.bundle.getText("btp.version")}: ${colors.green(data.Version)}`)
            for (let item of data.TargetHierarchy) {
                let output = ''
                if(item.Type === 'globalaccount'){
                    output = base.bundle.getText("btp.globalaccount")
                }else if(item.Type === 'directory'){
                    output = base.bundle.getText("btp.folder")
                }else if(item.Type === 'subaccount'){
                    output = base.bundle.getText("btp.subaccount")
                }
                console.log(`${output}: ${colors.green(item.DisplayName)} ${colors.red(item.ID)}`)
            }
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}