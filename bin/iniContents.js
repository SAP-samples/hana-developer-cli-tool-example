// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'iniContents [file] [section]'
export const aliases = ['if', 'inifiles', 'ini']
export const describe = baseLite.bundle.getText("iniContents")

export const builder = baseLite.getBuilder({
  file: {
    alias: ['f', 'File'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("file")
  },
  section: {
    alias: ['s', 'Section'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("section")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
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
  const base = await import('../utils/base.js')
  base.debug('iniContents')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let iniFile = base.dbClass.objectName(prompts.file)
    let section = base.dbClass.objectName(prompts.section)

    var query =
      `SELECT *  from M_INIFILE_CONTENTS 
    WHERE FILE_NAME LIKE ? 
      AND SECTION LIKE ?
    ORDER BY FILE_NAME, SECTION, KEY `
    if (prompts.limit || base.sqlInjectionUtils.isAcceptableParameter(prompts.limit.toString())) {
      query += `LIMIT ${prompts.limit.toString()}`
    }
    let results = await db.statementExecPromisified(await db.preparePromisified(query), [iniFile, section])
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
