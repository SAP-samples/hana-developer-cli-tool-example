const base = require("../utils/base")

exports.command = 'inspectIndex [schema] [index]'
exports.aliases = ['ii', 'index', 'insIndex', 'inspectindex']
exports.describe = base.bundle.getText("inspectIndex")

exports.builder = base.getBuilder({
  index: {
    alias: ['i', 'Index'],
    type: 'string',
    desc: base.bundle.getText("index")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, indexInspect, {
    schema: {
      description: base.bundle.getText("schema"),
      type: 'string',
      required: true
    },
    index: {
      description: base.bundle.getText("index"),
      type: 'string',
      required: true
    }
  })
}

async function indexInspect(prompts) {

  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))
    let schema = await dbClass.schemaCalc(prompts, db)
    console.log(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("index")}: ${prompts.index}`)

    let query =
      `SELECT *  
  FROM INDEXES 
  WHERE SCHEMA_NAME = ? 
    AND INDEX_NAME = ?`
    let indexDetails = (await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.index]))
    console.log(indexDetails)

    console.log(base.bundle.getText("indexColumns"))
    query =
      `SELECT *
  FROM  INDEX_COLUMNS
  WHERE SCHEMA_NAME = ? 
  AND INDEX_NAME = ?`
    let resultsColumns = await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.index])
    console.table(resultsColumns)

    return base.end()
  } catch (error) {
    base.error(error)
  }
}