// @ts-check
import * as base from '../utils/base.js'
export const command = 'rick'

export const describe = base.bundle.getText("rick")
export const builder = base.getBuilder({}, false, false)
export const handler = async () => {
  const { default:prompt } = await import('prompt')
  prompt.start()
  var property = {
    name: 'yesno',
    message: 'Are you sure?',
    validator: /y[es]*|n[o]?/,
    warning: 'Must respond yes or no',
    default: 'no'
  }
  prompt.get(property, (err, result) => {

    if (result.yesno === `yes`) {
      prompt.start()
      var property2 = {
        name: 'yesno',
        message: 'Are you REALLY sure?',
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'no'
      }
      prompt.get(property2, async (err, result) => {
        if (result.yesno === `yes`) {
          const { default:open } = await import('open')
          try {
            const helpVideoURL = `https://www.youtube.com/watch?v=j5a0jTc9S10&list=PL3KnTfyhrIlcudeMemKd6rZFGDWy`
            open(helpVideoURL)
          } catch (err) {
            console.error(err)
          }
        }
      })
    }
  })
}