const base = require("../utils/base")

exports.command = 'views [schema] [view]'
exports.aliases = ['v', 'listViews', 'listviews']
exports.describe = base.bundle.getText("views")

exports.builder = base.getBuilder({
  view: {
    alias: ['v', 'View'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("view")
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
  base.promptHandler(argv, getViews, {
    view: {
      description: base.bundle.getText("view"),
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

async function getViews(prompts) {
  base.debug('getViews')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    const dbClass = require("sap-hdbext-promisfied")

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("view")}: ${prompts.view}`)

    let results = await getViewsInt(schema, prompts.view, db, prompts.limit)
    base.outputTable(results)
    base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
module.exports.getViews = getViews

async function getViewsInt(schema, view, client, limit) {
  base.debug(`getViewsInt ${schema} ${view} ${limit}`)
  const dbClass = require("sap-hdbext-promisfied")  
  view = dbClass.objectName(view)
  let query =
    `SELECT SCHEMA_NAME, VIEW_NAME, TO_NVARCHAR(VIEW_OID) AS VIEW_OID, COMMENTS  from VIEWS 
  WHERE SCHEMA_NAME LIKE ? 
    AND VIEW_NAME LIKE ? 
  ORDER BY VIEW_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, view])
}