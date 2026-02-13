// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'rick'

export const describe = baseLite.bundle.getText("rick")
export const builder = baseLite.getBuilder({}, false, false)
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getRick, {}, false)
}

export async function getRick() {
  const base = await import('../utils/base.js')
  const { confirm } = await import('@inquirer/prompts')
  
  const firstAnswer = await confirm({
    message: baseLite.bundle.getText("rick.confirm.first"),
    default: false
  })

  if (firstAnswer) {
    const secondAnswer = await confirm({
      message: baseLite.bundle.getText("rick.confirm.second"),
      default: false
    })

    if (secondAnswer) {
      try {
        const { default: open } = await import('open')
        const helpVideoURL = baseLite.bundle.getText("rick.helpVideoURL")
        await open(helpVideoURL, {wait: true})
      } catch (err) {
        console.error(err)
      }
    }
  }
  return base.end()
}