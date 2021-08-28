// @ts-check
import * as base from '../utils/base.js'
import * as fs from 'fs'
import * as path from 'path'
import marked from 'marked'
import TerminalRenderer from 'marked-terminal'
import { fileURLToPath } from 'url'
import { URL } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const command = 'readMe'
export const aliases = ['readme']
export const describe = base.bundle.getText("readMe")
export const builder = base.getBuilder({}, false)

export const handler = async function () {
  marked.setOptions({
    // Define custom renderer
    renderer: new TerminalRenderer({
      showSectionPrefix: false,
    })
  })

  try {
    const data = fs.readFileSync(path.join(__dirname, '..', '/README.md'), 'utf8')
    console.log(marked(data))

  } catch (err) {
    console.error(err)
  }
}