const base = require("../utils/base")

exports.command = 'iniContents [file] [section]'
exports.aliases = ['if', 'inifiles', 'ini']
exports.describe = base.bundle.getText("iniContents")

exports.builder = base.getBuilder({
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

exports.handler = (argv) => {
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

async function iniContents(prompts) {
  base.debug('iniContents')
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let iniFile = dbClass.objectName(prompts.file)
    let section = dbClass.objectName(prompts.section)

    var query =
      `SELECT *  from M_INIFILE_CONTENTS 
    WHERE FILE_NAME LIKE ? 
      AND SECTION LIKE ?
    ORDER BY FILE_NAME, SECTION, KEY `
    if (prompts.limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(prompts.limit)) {
      query += `LIMIT ${prompts.limit.toString()}`
    }
    let results = await db.statementExecPromisified(await db.preparePromisified(query), [iniFile, section])
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}