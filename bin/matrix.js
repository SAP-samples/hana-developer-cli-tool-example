const base = require("../utils/base")

exports.command = 'matrix'
exports.describe = base.bundle.getText("matrix")
exports.builder = base.getBuilder({}, false, false)
exports.handler = async function () { 
  try {
    const tools = require("terminaltools")
    tools.fun.matrix()
  } catch (err) {
    return console.error(err)
  }
}