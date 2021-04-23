const base = require("../utils/base")

exports.command = 'inspectProcedure [schema] [procedure]'
exports.aliases = ['ip', 'procedure', 'insProc', 'inspectprocedure', 'inspectsp']
exports.describe = base.bundle.getText("inspectProcedure")

exports.builder = base.getBuilder({
  procedure: {
    alias: ['p', 'Procedure', 'sp'],
    type: 'string',
    desc: base.bundle.getText("procedure")
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
  base.promptHandler(argv, procedureInspect, {
    procedure: {
      description: base.bundle.getText("procedure"),
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

async function procedureInspect(prompts) {
  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))
    const dbInspect = require("../utils/dbInspect")

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("procedure")}: ${prompts.procedure}`)

    let proc = await dbInspect.getProcedure(db, schema, prompts.procedure)
    let parameters = await dbInspect.getProcedurePrams(db, proc[0].PROCEDURE_OID)
    let columns = await dbInspect.getProcedurePramCols(db, proc[0].PROCEDURE_OID)


    if (prompts.output === 'tbl') {
      console.log(proc[0])
      console.log("\n")
      console.table(parameters)
      console.table(columns)
    } else if (prompts.output === 'sql') {
      let definition = await dbInspect.getDef(db, schema, prompts.procedure)
      const highlight = require('cli-highlight').highlight
      console.log(highlight(definition))
    }
    return base.end()
  } catch (error) {
    base.error(error)
  }
}