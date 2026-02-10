// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as btp from '../utils/btp.js'
const colors = baseLite.colors

export const command = 'btpInfo'
export const aliases = ['btpinfo']
export const describe = baseLite.bundle.getText("btpInfo")

export const builder = baseLite.getBuilder({
    output: {
        alias: ['o', 'Output'],
        choices: ["tbl", "json"],
        default: "tbl",
        type: 'string',
        desc: baseLite.bundle.getText("outputType")
      }
}, false)


export async function handler(argv) {
  const base = await import('../utils/base.js')
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
    const base = await import('../utils/base.js')
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
            console.log(`${baseLite.bundle.getText("dbx.user")}: ${colors.green(data.UserName)}`)
            console.log(`${baseLite.bundle.getText("btp.ServerURL")}: ${colors.blue(data.ServerURL)}`)
            console.log(`${baseLite.bundle.getText("btp.version")}: ${colors.green(data.Version)}`)
            for (let item of data.TargetHierarchy) {
                let output = ''
                if(item.Type === 'globalaccount'){
                    output = baseLite.bundle.getText("btp.globalaccount")
                }else if(item.Type === 'directory'){
                    output = baseLite.bundle.getText("btp.folder")
                }else if(item.Type === 'subaccount'){
                    output = baseLite.bundle.getText("btp.subaccount")
                }
                console.log(`${output}: ${colors.green(item.DisplayName)} ${colors.red(item.ID)}`)
            }
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}