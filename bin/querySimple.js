const colors = require("colors/safe")
const bundle = global.__bundle
const dbClass = require("sap-hdbext-promisfied")

exports.command = 'querySimple'
exports.aliases = ['qs', "querysimple"]
exports.describe = bundle.getText("querySimple")


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  query: {
    alias: ['q', 'Query'],
    type: 'string',
    desc: bundle.getText("query")
  },
  folder: {
    alias: ['f', 'Folder'],
    type: 'string',
    default: './',
    desc: bundle.getText("folder")
  },
  filename: {
    alias: ['n', 'Filename'],
    type: 'string',
    desc: bundle.getText("filename")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["table", "json", "excel"],
    default: "table",
    type: 'string',
    desc: bundle.getText("outputTypeQuery")
  }
}

exports.handler = function (argv) {
  const prompt = require('prompt')
  prompt.override = argv
  prompt.message = colors.green(bundle.getText("input"))
  prompt.start()

  let schema = {
    properties: {
      admin: {
        description: bundle.getText("admin"),
        type: 'boolean',
        required: true,
        ask: () => {
          return false
        }
      },
      query: {
        description: bundle.getText("query"),
        type: 'string',
        required: true
      },
      folder: {
        description: bundle.getText("folder"),
        type: 'string',
        required: true
      },
      filename: {
        description: bundle.getText("filename"),
        type: 'string',
        required: true,
        ask: () => {
          return false
        }
      },
      output: {
        description: bundle.getText("outputTypeQuery"),
        type: 'string',
        required: true
      }
    }
  }

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message)
    }
    global.startSpinner()
    dbQuery(result)
  })
}

async function dbQuery(result) {
  try {
    const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)))
    let results = await db.execSQL(result.query)
    if(!results[0]){
      global.__spinner.stop()
      console.log(`No Query Results`)
      return      
    }

    switch (result.output) {

      case 'excel':
        if (result.filename) {
          const excel = require("node-xlsx")
          let out = []

          
          //Column Headers
          let header = []
          for (const [key] of Object.entries(results[0])) {
            header.push(key)
          }
          out.push(header)

          for (let item of results) {
            let innerItem = []
            for (const [key] of Object.entries(item)) {
              innerItem.push(item[key])
            }
            out.push(innerItem)
          }
          let excelOutput = excel.build([{
            name: "Query Results",
            data: out
          }])
          await toFile(result.folder, result.filename, 'xlsx', excelOutput)
        } else {
          global.__spinner.stop()
          console.error(`Excel output only supported when sending content to a file directly`)
        }
        break
      case 'json':
        if (result.filename) {
          await toFile(result.folder, result.filename, 'json', JSON.stringify(results, null, 2))
        } else {
          global.__spinner.stop()
          const highlight = require('cli-highlight').highlight 
          console.log(highlight(JSON.stringify(results, null, 2)))
        }
        break
      default:
        if (result.filename) {
          const Table = require('easy-table')
          await toFile(result.folder, result.filename, 'txt', Table.print(results))
        } else {
          global.__spinner.stop()
          console.table(results)
        }
        break
    }



    return
  } catch (error) {
    global.__spinner.stop()
    console.error(error.toString())
    return

  }
}

async function toFile(folder, file, ext, content) {
  let fs = require('fs')
  let path = require('path')
  let dir = folder
  !fs.existsSync(dir) && fs.mkdirSync(dir)
  file = `${file}.${ext}`
  let fileLocal = path.join(dir, file)
  fs.writeFileSync(fileLocal, content)
  global.__spinner.stop()
  console.log(`\n Content written to: ${fileLocal}`)
}