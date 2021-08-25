const base = require("../utils/base")
const { parse: parseToCsv } = require('json2csv');

exports.command = 'querySimple'
exports.aliases = ['qs', "querysimple"]
exports.describe = base.bundle.getText("querySimple")

exports.builder = base.getBuilder({
  query: {
    alias: ['q', 'Query'],
    type: 'string',
    desc: base.bundle.getText("query")
  },
  folder: {
    alias: ['f', 'Folder'],
    type: 'string',
    default: './',
    desc: base.bundle.getText("folder")
  },
  filename: {
    alias: ['n', 'Filename'],
    type: 'string',
    desc: base.bundle.getText("filename")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["table", "json", "excel", "csv"],
    default: "table",
    type: 'string',
    desc: base.bundle.getText("outputTypeQuery")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, dbQuery, {
    query: {
      description: base.bundle.getText("query"),
      type: 'string',
      required: true
    },
    folder: {
      description: base.bundle.getText("folder"),
      type: 'string',
      required: true
    },
    filename: {
      description: base.bundle.getText("filename"),
      type: 'string',
      required: true,
      ask: () => {
        return false
      }
    },
    output: {
      description: base.bundle.getText("outputTypeQuery"),
      type: 'string',
      required: true
    }
  })
}

function removeNewlineCharacter(dataRow) {
  
  let newDataRow = {};

  Object.keys(dataRow).forEach((key) => {

    if (typeof dataRow[key] === "string") {
      newDataRow[key] = dataRow[key].replace(/[\n\r]+/g, ' ');
    } else {
      newDataRow[key] = dataRow[key];
    }

  });

  return newDataRow;
}

async function dbQuery(prompts) {
  base.debug('dbQuery')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let results = await db.execSQL(prompts.query)
    if (!results[0]) {
      return base.error(base.bundle.getText("errNoResults"))
    }

    switch (prompts.output) {
      case 'excel':
        if (prompts.filename) {
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
          await toFile(prompts.folder, prompts.filename, 'xlsx', excelOutput)
        } else {
          return base.error(base.bundle.getText("errExcel"))
        }
        break
      case 'json':
        if (prompts.filename) {
          await toFile(prompts.folder, prompts.filename, 'json', JSON.stringify(results, null, 2))
        } else {
          const highlight = require('cli-highlight').highlight
          console.log(highlight(JSON.stringify(results, null, 2)))
        }
        break
      case 'csv':
        if (prompts.filename) {
          await toFile(prompts.folder, prompts.filename, 'csv', parseToCsv(results, {delimiter : ";", transforms : [removeNewlineCharacter]}))
        } else {
          const highlight = require('cli-highlight').highlight
          console.log(highlight(parseToCsv(results)))
        }
        break
      default:
        if (prompts.filename) {
          const Table = require('easy-table')
          await toFile(prompts.folder, prompts.filename, 'txt', Table.print(results))
        } else {
          console.table(results)
        }
        break
    }
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
module.exports.dbQuery  = dbQuery

async function toFile(folder, file, ext, content) {
  base.debug('toFile')
  let fs = require('fs')
  let path = require('path')
  let dir = folder
  !fs.existsSync(dir) && fs.mkdirSync(dir)
  file = `${file}.${ext}`
  let fileLocal = path.join(dir, file)
  fs.writeFileSync(fileLocal, content)
  console.log(`${base.bundle.getText("contentWritten")}: ${fileLocal}`)
}