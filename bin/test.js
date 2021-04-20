const colors = require("colors/safe")
const bundle = global.__bundle

exports.command = 'test'
exports.describe = bundle.getText("test")


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  conn: {
    alias: ['connFile', 'connectionFile', 'connfile', 'connectionFile'],
    desc: bundle.getText("connFile")
  }
}

exports.handler = function (argv) {
  const prompt = require('prompt')
  prompt.override = argv
  prompt.message = colors.green(bundle.getText("input"))
  prompt.start()

  var schema = {
    properties: {
      admin: {
        description: bundle.getText("admin"),
        type: 'boolean',
        required: true,
        ask: () => {
          return false
        }
      },
      conn: {
        description: bundle.getText("connFile"),
        type: 'string',
        required: false,
        ask: () => {
          return false
        }
      }
    }
  }

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message)
    }
//    global.startSpinner()
    test(result)
  });
}


async function test(result) {
  try {
    const conn = require("../utils/connections")
    console.log( await conn.createConnection(result))

//    await global.__spinner.stop()
 //   return
  } catch (error) {
//    global.__spinner.stop()
    console.error(`Test Problem ${error}`)

  }
}