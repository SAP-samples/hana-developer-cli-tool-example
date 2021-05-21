const base = require("../utils/base")

exports.command = 'traceContents [host] [file]'
exports.aliases = ['tc', 'traceContents', 'traceContent', 'tracecontent']
exports.describe = base.bundle.getText("traceContents")

exports.builder = base.getBuilder({
  host: {
    alias: ['ho', 'Host'],
    type: 'string',
    desc: base.bundle.getText("host")
  },
  file: {
    alias: ['f', 'File'],
    type: 'string',
    desc: base.bundle.getText("file")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 2000,
    desc: base.bundle.getText("limit")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, traceContents, {
    host: {
      description: base.bundle.getText("host"),
      type: 'string',
      required: true
    },
    file: {
      description: base.bundle.getText("file"),
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

async function traceContents(prompts) {
  base.debug('traceContents')
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let query =
      `SELECT MAX(OFFSET) AS OFFSET FROM  M_TRACEFILE_CONTENTS WHERE HOST = ?
      AND FILE_NAME = ?`
    let max = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.host, prompts.file])
    let maxOffset = max[0].OFFSET - prompts.limit * 10
    base.output(maxOffset)

    query =
      `SELECT CONTENT FROM  M_TRACEFILE_CONTENTS WHERE HOST = ?
      AND FILE_NAME = ?
      AND OFFSET >= ?
    ORDER BY OFFSET `
    let results = await db.statementExecPromisified(await db.preparePromisified(query), [prompts.host, prompts.file, maxOffset])
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}