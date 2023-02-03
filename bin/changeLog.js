// @ts-check
import * as base from '../utils/base.js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const command = 'changes'
export const aliases = ['chg', 'changeLog', 'changelog']
export const describe = base.bundle.getText("changes")

export function handler() {
  getChangeLog()
}

export async function getChangeLog() {
  const [{ marked }, { default: TerminalRenderer }] = await
    Promise.all([
      import('marked'),
      import('marked-terminal')
    ])

  marked.setOptions({
    // Define custom renderer
    renderer: new TerminalRenderer({
      showSectionPrefix: false
    })
  })

  try {
    const data = fs.readFileSync(path.join(__dirname, '..', '/CHANGELOG.md'), 'utf8')
    console.log(marked(data))
  } catch (err) {
    console.error(err)
  }
}