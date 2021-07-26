const base = require("../utils/base")

exports.command = 'indexes [schema] [indexes]'
exports.aliases = ['ind', 'listIndexes', 'ListInd', 'listind', 'Listind', "listfindexes"]
exports.describe = base.bundle.getText("indexes")

exports.builder = base.getBuilder({
  indexes: {
    alias: ['i', 'Indexes'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("function")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, getIndexes, {
    indexes: {
      description: base.bundle.getText("indexes"),
      type: 'string',
      required: true
    },
    schema: {
      description: base.bundle.getText("schema"),
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

async function getIndexes(prompts) {
  base.debug('getIndexes')
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const db = await base.createDBConnection()

    let schema = await dbClass.schemaCalc(prompts, db)
    base.output(`Schema: ${schema}, Index: ${prompts.indexes}`)

    let results = await getIndexesInt(schema, prompts.indexes, db, prompts.limit)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
module.exports.getIndexes = getIndexes


async function getIndexesInt(schema, indexes, client, limit) {
  base.debug(`getIndexesInt ${schema} ${indexes} ${limit}`)
  const dbClass = require("sap-hdbext-promisfied")
  indexes = dbClass.objectName(indexes)

  let query =
    `SELECT SCHEMA_NAME, TABLE_NAME, INDEX_NAME, INDEX_TYPE, CONSTRAINT, CREATE_TIME from INDEXES 
  WHERE SCHEMA_NAME LIKE ? 
    AND INDEX_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, TABLE_NAME, INDEX_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, indexes])
}