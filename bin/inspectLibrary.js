const base = require("../utils/base")

exports.command = 'inspectLibrary [schema] [library]'
exports.aliases = ['il', 'library', 'insLib', 'inspectlibrary']
exports.describe = base.bundle.getText("inspectLibrary")

exports.builder = base.getBuilder({
  library: {
    alias: ["lib", 'Library'],
    type: 'string',
    desc: base.bundle.getText("library")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql"],
    default: "tbl",
    type: 'string',
    desc: base.bundle.getText("outputType")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, libraryInspect, {
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
    output: {
      description: base.bundle.getText("outputType"),
      type: 'string',
      validator: /t[bl]*|s[ql]?/,
      required: true
    }
  })
}



async function libraryInspect(prompts) {
  base.debug('libraryInspect')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    const dbClass = require("sap-hdbext-promisfied")

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("library")}: ${prompts.library}`)

    let query =
      `SELECT SCHEMA_NAME, LIBRARY_NAME, OWNER_NAME, LIBRARY_TYPE, IS_VALID, CREATE_TIME from LIBRARIES 
  WHERE SCHEMA_NAME LIKE ? 
    AND LIBRARY_NAME = ? 
  ORDER BY LIBRARY_NAME `
    let libResults = await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.library])

    query =
      `SELECT SCHEMA_NAME, LIBRARY_NAME, MEMBER_NAME, ACCESS_MODE FROM LIBRARY_MEMBERS
  WHERE SCHEMA_NAME LIKE ? 
    AND LIBRARY_NAME = ? 
  ORDER BY LIBRARY_NAME, MEMBER_NAME `
    let libMembers = await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.library])

    if (prompts.output === 'tbl') {
      console.log(libResults);
      console.log("\n")
      console.table(libMembers);
    } else if (prompts.output === 'sql') {
      let query =
        `SELECT DEFINITION from LIBRARIES 
    WHERE SCHEMA_NAME LIKE ? 
      AND LIBRARY_NAME = ? 
    ORDER BY LIBRARY_NAME `
      let definition = await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.library])
      let output = definition[0].DEFINITION.toString()
      output = output.replace(new RegExp(" ,", "g"), ",\n")
      const highlight = require('cli-highlight').highlight
      console.log(highlight(output))
    }
    return base.end()
  } catch (error) {
    base.error(error)
  }
}