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
    message: 'Are you sure?',
    default: false
  })

  if (firstAnswer) {
    const secondAnswer = await confirm({
      message: 'Are you REALLY sure?',
      default: false
    })

    if (secondAnswer) {
      try {
        const { default: open } = await import('open')
        const helpVideoURL = `https://www.youtube.com/watch?v=j5a0jTc9S10&list=PL3KnTfyhrIlcudeMemKd6rZFGDWy`
        await open(helpVideoURL, {wait: true})
      } catch (err) {
        console.error(err)
      }
    }
  }
  return base.end()
}