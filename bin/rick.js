const base = require("../utils/base")

exports.command = 'rick'
exports.describe = base.bundle.getText("rick")
exports.builder = base.getBuilder({}, false, false)
exports.handler = async function () {
  const prompt = require('prompt')
  prompt.start()
  var property = {
    name: 'yesno',
    message: 'Are you sure?',
    validator: /y[es]*|n[o]?/,
    warning: 'Must respond yes or no',
    default: 'no'
  }
  prompt.get(property, function (err, result) {

    if (result.yesno === `yes`) {

      const prompt2 = require('prompt')
      prompt2.start()
      var property2 = {
        name: 'yesno',
        message: 'Are you REALLY sure?',
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'no'
      }
      prompt2.get(property2, function (err, result) {
        if (result.yesno === `yes`) {
          try {
            const open = require('open')
            const helpVideoURL = `https://www.youtube.com/watch?v=j5a0jTc9S10&list=PL3KnTfyhrIlcudeMemKd6rZFGDWy`
            open(helpVideoURL)

          } catch (err) {
            console.error(err)
          }
        }
      })
    }
  })
}