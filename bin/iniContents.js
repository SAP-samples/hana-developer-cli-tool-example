// @ts-check
import * as base from '../utils/base.js'
import dbClass from 'sap-hdbext-promisfied'
import * as hdbext from '@sap/hdbext'

export const command = 'iniContents [file] [section]'
export const aliases = ['if', 'inifiles', 'ini']
export const describe = base.bundle.getText("iniContents")

export const builder = base.getBuilder({
  file: {
    alias: ['f', 'File'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("file")
  },
  section: {
    alias: ['s', 'Section'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("section")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  }
})

export function handler (argv) {
  base.promptHandler(argv, iniContents, {
    file: {
      description: base.bundle.getText("file"),
      type: 'string',
      required: true
    },
    section: {
      description: base.bundle.getText("section"),
      type: 'string',
      required: true
    },
    limit: {
      description: base.bundle.getText("limit"),
      type: 'number',
      required: true
    }
  })
}

export async function iniContents(prompts) {
  base.debug('iniContents')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let iniFile = dbClass.objectName(prompts.file)
    let section = dbClass.objectName(prompts.section)

    var query =
      `SELECT *  from M_INIFILE_CONTENTS 
    WHERE FILE_NAME LIKE ? 
      AND SECTION LIKE ?
    ORDER BY FILE_NAME, SECTION, KEY `
    if (prompts.limit | hdbext.sqlInjectionUtils.isAcceptableParameter(prompts.limit)) {
      query += `LIMIT ${prompts.limit.toString()}`
    }
    let results = await db.statementExecPromisified(await db.preparePromisified(query), [iniFile, section])
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
