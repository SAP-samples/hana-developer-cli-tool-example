// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'inspectLibrary [schema] [library]'
export const aliases = ['il', 'library', 'insLib', 'inspectlibrary']
export const describe = baseLite.bundle.getText("inspectLibrary")

export const builder = baseLite.getBuilder({
  library: {
    alias: ["lib", 'Library'],
    type: 'string',
    desc: baseLite.bundle.getText("library")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql"],
    default: "tbl",
    type: 'string',
    desc: baseLite.bundle.getText("outputType")
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
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



export async function libraryInspect(prompts) {
  const base = await import('../utils/base.js')
  base.debug('libraryInspect')
  const { highlight } = await import('cli-highlight')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("library")}: ${prompts.library}`)

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
      console.log(libResults)
      console.log("\n")
      base.outputTableFancy(libMembers)
    } else if (prompts.output === 'sql') {
      let query =
        `SELECT DEFINITION from LIBRARIES 
    WHERE SCHEMA_NAME LIKE ? 
      AND LIBRARY_NAME = ? 
    ORDER BY LIBRARY_NAME `
      let definition = await db.statementExecPromisified(await db.preparePromisified(query), [schema, prompts.library])
      let output = definition[0].DEFINITION.toString()
      output = output.replace(new RegExp(" ,", "g"), ",\n")
      console.log(highlight(output))
    }
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}