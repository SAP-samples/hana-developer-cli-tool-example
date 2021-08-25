const base = require("../utils/base")

exports.command = 'readMe'
exports.aliases = ['readme']
exports.describe = base.bundle.getText("readMe")
exports.builder = base.getBuilder({}, false)

exports.handler = async function () {
  import fs from 'fs'
  import path from 'path'

  import marked from 'marked'
  import TerminalRenderer from 'marked-terminal'

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