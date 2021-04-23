const base = require("../utils/base")

exports.command = 'test'
exports.describe = base.bundle.getText("test")

exports.builder = base.getBuilder({  
})

exports.handler = (argv) => {
  base.promptHandler(argv, test, {})
}

async function test(result) {
  try {
    const conn = require("../utils/connections")
    console.log( await conn.createConnection(result))
    return base.end()
  } catch (error) {
    base.error(error)
  }
}