const base = require("../utils/base")

exports.command = 'inspectFunction [schema] [function]'
exports.aliases = ['if', 'function', 'insFunc', 'inspectfunction']
exports.describe = base.bundle.getText("inspectFunction")

exports.builder = base.getBuilder({
  function: {
    alias: ['f', 'Function'],
    type: 'string',
    desc: base.bundle.getText("function")
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
  base.promptHandler(argv, functionInspect, {
    function: {
      description: base.bundle.getText("function"),
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

async function functionInspect(prompts) {
  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))
    const dbInspect = require("../utils/dbInspect")

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("function")}: ${prompts.function}`);

    let proc = await dbInspect.getFunction(db, schema, prompts.function);
    let parameters = await dbInspect.getFunctionPrams(db, proc[0].FUNCTION_OID)
    let columns = await dbInspect.getFunctionPramCols(db, proc[0].FUNCTION_OID)


    if (prompts.output === 'tbl') {
      console.log(proc[0]);
      console.log("\n")
      console.table(parameters);
      console.table(columns);
    } else if (prompts.output === 'sql') {
      let definition = await dbInspect.getDef(db, schema, prompts.function);
      const highlight = require('cli-highlight').highlight
      console.log(highlight(definition))
    }
    return base.end()
  } catch (error) {
    base.error(error)
  }
}