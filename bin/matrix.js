const bundle = global.__bundle;

exports.command = 'matrix';
exports.describe = bundle.getText("matrix");

exports.builder = {
}

exports.handler = async function () {
 
  try {
    const tools = require("terminaltools")
    tools.fun.matrix()

  } catch (err) {
    console.error(err)
  }
}