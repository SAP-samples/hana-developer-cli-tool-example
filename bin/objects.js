const base = require("../utils/base")

exports.command = 'objects [schema] [object]'
exports.aliases = ['o', 'listObjects', 'listobjects']
exports.describe = base.bundle.getText("objects")

exports.builder = base.getBuilder({
  object: {
    alias: ['o', 'Object'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("object")
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
  base.promptHandler(argv, getObjects, {
    object: {
      description: base.bundle.getText("object"),
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

async function getObjects(prompts) {
  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("object")}: ${prompts.object}`)

    let results = await getObjectsInt(schema, prompts.object, db, prompts.limit)
    console.table(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}

async function getObjectsInt(schema, object, client, limit) {
  const dbClass = require("sap-hdbext-promisfied")
  object = dbClass.objectName(object)

  var query =
    `SELECT OBJECT_CATEGORY, SCHEMA_NAME, OBJECT_NAME, OBJECT_TYPE, TO_NVARCHAR(OBJECT_OID) AS OBJECT_OID  from OBJECTS 
  WHERE SCHEMA_NAME LIKE ? 
    AND OBJECT_NAME LIKE ? 
  ORDER BY OBJECT_TYPE, OBJECT_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, object])
}