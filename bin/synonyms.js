const base = require("../utils/base")

exports.command = 'synonyms [schema] [synonym] [target]'
exports.aliases = ['syn', 'listSynonyms', 'listsynonyms']
exports.describe = base.bundle.getText("synonyms")

exports.builder = base.getBuilder({
  synonym: {
    alias: ['syn', 'Synonym'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("synonym")
  },
  target: {
    alias: ['t', 'Target'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("target")
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
  base.promptHandler(argv, getSynonyms, {
    synonym: {
      description: base.bundle.getText("synonym"),
      type: 'string',
      required: true
    },
    target: {
      description: base.bundle.getText("target"),
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

async function getSynonyms(prompts) {
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("synonym")}: ${prompts.synonym}, ${base.bundle.getText("target")}: ${prompts.target}`)

    let results = await getSynonymsInt(schema, prompts.synonym, prompts.target, db, prompts.limit)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}

async function getSynonymsInt(schema, synonym, target, client, limit) {
  const dbClass = require("sap-hdbext-promisfied")  
  synonym = dbClass.objectName(synonym)
  target = dbClass.objectName(target)
  let query =
    `SELECT SCHEMA_NAME, SYNONYM_NAME, OBJECT_SCHEMA, OBJECT_NAME, OBJECT_TYPE, CREATE_TIME  from SYNONYMS 
    WHERE SCHEMA_NAME LIKE ? 
      AND SYNONYM_NAME LIKE ? 
      AND OBJECT_NAME LIKE ?
    ORDER BY SCHEMA_NAME, SYNONYM_NAME `

  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, synonym, target])
}