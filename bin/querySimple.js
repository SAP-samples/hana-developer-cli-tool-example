// @ts-check
import * as base from '../utils/base.js'
import { parse as  parseToCsv } from 'json2csv'
import * as fs from 'fs'
import * as path from 'path'
import {highlight} from 'cli-highlight'
import * as excel from 'node-xlsx'
// @ts-ignore
import * as Table from 'easy-table'

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
  }
}

export function handler (argv) {
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
          let excelOutput = excel.build([{
            name: "Query Results",
            data: out
          }])
          await toFile(prompts.folder, prompts.filename, 'xlsx', excelOutput)
        } else {
          base.end()
          return base.error(base.bundle.getText("errExcel"))
        }
        break
      case 'json':
        if (prompts.filename) {
          await toFile(prompts.folder, prompts.filename, 'json', JSON.stringify(results, null, 2))
        } else {
          console.log(highlight(JSON.stringify(results, null, 2)))
          base.end()
          return JSON.stringify(results, null, 2)
        }
        break
      case 'csv':
        if (prompts.filename) {
          await toFile(prompts.folder, prompts.filename, 'csv', parseToCsv(results, {delimiter : ";", transforms : [removeNewlineCharacter]}))
        } else {
          console.log(highlight(parseToCsv(results)))
          base.end()
          return parseToCsv(results)
        }
        break
      default:
        if (prompts.filename) {
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

async function toFile(folder, file, ext, content) {
  base.debug('toFile')
  let dir = folder
  !fs.existsSync(dir) && fs.mkdirSync(dir)
  file = `${file}.${ext}`
  let fileLocal = path.join(dir, file)
  fs.writeFileSync(fileLocal, content)
  console.log(`${base.bundle.getText("contentWritten")}: ${fileLocal}`)
}