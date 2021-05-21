const base = require("../utils/base")

exports.command = 'libraries [schema] [library]'
exports.aliases = ['l', 'listLibs', 'ListLibs', 'listlibs', 'ListLib', "listLibraries", "listlibraries"]
exports.describe = base.bundle.getText("libraries")

exports.builder = base.getBuilder({
  library: {
    alias: ['lib', 'Library'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("library")
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
  base.promptHandler(argv, getLibraries, {
    library: {
      description: base.bundle.getText("library"),
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

async function getLibraries(prompts) {
  base.debug('getLibraries')
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("library")}: ${prompts.library}`)

    let results = await getLibrariesInt(schema, prompts.library, db, prompts.limit)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}

async function getLibrariesInt(schema, library, client, limit) {
  base.debug(`getLibrariesInt ${schema} ${library} ${limit}`)
  const dbClass = require("sap-hdbext-promisfied")
  library = dbClass.objectName(library)
  let query =
    `SELECT SCHEMA_NAME, LIBRARY_NAME, OWNER_NAME, LIBRARY_TYPE, IS_VALID, CREATE_TIME from LIBRARIES 
  WHERE SCHEMA_NAME LIKE ? 
    AND LIBRARY_NAME LIKE ? 
  ORDER BY LIBRARY_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, library])
}