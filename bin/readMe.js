// @ts-check
import * as base from '../utils/base.js'

export const command = 'readMe'
export const aliases = ['readme']
export const describe = base.bundle.getText("readMe")
export const builder = base.getBuilder({}, false)

export const handler = async function () {

  const [{ marked }, { default: fs }, { default: path }, { fileURLToPath }, { URL }, { markedTerminal }] = await Promise.all([
    import('marked'),
    import('fs'),
    import('path'),
    import('url'),
    import('url'),
    import('marked-terminal')
  ])
  const __dirname = fileURLToPath(new URL('.', import.meta.url))

  marked.use(markedTerminal({
    showSectionPrefix: false,
  }))

  try {
    const data = fs.readFileSync(path.join(__dirname, '..', '/README.md'), 'utf8')
    console.log(marked(data))

  } catch (err) {
    console.error(err)
  }
}