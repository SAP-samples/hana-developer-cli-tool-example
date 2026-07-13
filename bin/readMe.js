// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'readMe'
export const aliases = ['readme']
export const describe = baseLite.bundle.getText("readMe")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({}, false)).wrap(160).example('hana-cli readMe', baseLite.bundle.getText('readMeExample')).wrap(160).epilog(buildDocEpilogue('readMe', 'developer-tools', ['readMeUI', 'helpDocu', 'openReadMe']))

export const handler = async function () {

  const [{ marked }, { default: fs }, { default: path }, { markedTerminal }] = await Promise.all([
    import('marked'),
    import('fs'),
    import('path'),
    import('marked-terminal')
  ])
  const __dirname = import.meta.dirname

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