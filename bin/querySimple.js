// @ts-check
import * as base from '../utils/base.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'querySimple'
export const aliases = ['qs', "querysimple"]
export const describe = base.bundle.getText("querySimple")

export const builder = base.getBuilder({
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
  },
  profile: {
    alias: ['p', 'Profile'],
    type: 'string',
    desc: base.bundle.getText("profile")
  }
})

export let inputPrompts = {
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
  },
  profile: {
    description: base.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => { }
  }
}

export function handler(argv) {
  base.promptHandler(argv, dbQuery, inputPrompts)
}

export function removeNewlineCharacter(dataRow) {

  let newDataRow = {}
  Object.keys(dataRow).forEach((key) => {
    if (typeof dataRow[key] === "string") {
      newDataRow[key] = dataRow[key].replace(/[\n\r]+/g, ' ')
    } else {
      newDataRow[key] = dataRow[key];
    }
  })
  return newDataRow
}

export async function dbQuery(prompts) {
  base.debug('dbQuery')
  const [{ highlight }, { AsyncParser }, { default: Table }]= await Promise.all([ //, { default: excel }, { default: Table }] = await Promise.all([
    import('cli-highlight'),
    import('@json2csv/node'),
  //  import('node-xlsx'),
    import('easy-table')
  ])

  const opts = { delimiter: ";", transforms: [removeNewlineCharacter] }
  const transformOpts = {}
  const asyncOpts = {}
  // @ts-ignore
  const parser = new AsyncParser(opts, transformOpts, asyncOpts)
  try {
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()
    let results = await dbClient.execSQL(prompts.query)

    if (!results[0]) {
      return base.error(base.bundle.getText("errNoResults"))
    }

    switch (prompts.output) {
      case 'excel':
        if (prompts.filename) {
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
          // @ts-ignore
/*           let excelOutput = excel.build([{
            name: "Query Results",
            data: out
          }]) */
          throw new Error(`Excel Export temporarily disabled due to issue with install of required module in Business Application Studio`)
          //await toFile(prompts.folder, prompts.filename, 'xlsx', excelOutput)
        } else {
          base.error(base.bundle.getText("errExcel"))
          dbClient.disconnect()
          return
        }
        break
      case 'json':
        if (prompts.filename) {
          await toFile(prompts.folder, prompts.filename, 'json', JSON.stringify(results, null, 2))
        } else {
          console.log(highlight(JSON.stringify(results, null, 2)))
          dbClient.disconnect()
          return JSON.stringify(results, null, 2)
        }
        break
      case 'csv':
        if (prompts.filename) {
          const csv = await parser.parse(results).promise()
          await toFile(prompts.folder, prompts.filename, 'csv', csv)
        } else {
          const csv = await parser.parse(results).promise()
          console.log(highlight(csv))
          dbClient.disconnect()
          return csv
        }
        break
      default:
        if (prompts.filename) {
          await toFile(prompts.folder, prompts.filename, 'txt', Table.print(results))
        } else {
          base.outputTableFancy(results)
        }
        break
    }
    dbClient.disconnect()
    return results
  } catch (error) {
    base.error(error)
  }
}

async function toFile(folder, file, ext, content) {
  base.debug('toFile')
  const [{ default: fs }, { default: path }] = await Promise.all([
    import('fs'),
    import('path')
  ])
  let dir = folder
  !fs.existsSync(dir) && fs.mkdirSync(dir)
  file = `${file}.${ext}`
  let fileLocal = path.join(dir, file)
  fs.writeFileSync(fileLocal, content)
  console.log(`${base.bundle.getText("contentWritten")}: ${fileLocal}`)
}