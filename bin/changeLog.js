const base = require("../utils/base")

exports.command = 'changes'
exports.aliases = ['chg', 'changeLog', 'changelog']
exports.describe = base.bundle.getText("changes");

exports.handler = () => {
  getChangeLog()
}

function getChangeLog() {
  import fs from 'fs'
  import path from 'path'

  import marked from 'marked'
  import TerminalRenderer from 'marked-terminal'

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