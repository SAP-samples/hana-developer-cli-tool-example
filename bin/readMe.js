const bundle = global.__bundle;

exports.command = 'readMe';
exports.describe = bundle.getText("readMe");

exports.builder = {
}

exports.handler = async function () {
  const fs = require('fs')
  const path = require('path')

  const marked = require('marked')
  const TerminalRenderer = require('marked-terminal')

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