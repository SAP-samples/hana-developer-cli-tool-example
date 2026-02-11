// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'traceContents [host] [file]'
export const aliases = ['tc', 'traceContents', 'traceContent', 'tracecontent']
export const describe = baseLite.bundle.getText("traceContents")

export const builder = baseLite.getBuilder({
  host: {
    alias: ['ho', 'Host'],
    type: 'string',
    desc: baseLite.bundle.getText("host")
  },
  file: {
    alias: ['f', 'File'],
    type: 'string',
    desc: baseLite.bundle.getText("file")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 2000,
    desc: baseLite.bundle.getText("limit")
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
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

export async function traceContents(prompts) {
  const base = await import('../utils/base.js')
  base.debug('traceContents')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    prompts.limit = base.validateLimit(prompts.limit)
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
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
