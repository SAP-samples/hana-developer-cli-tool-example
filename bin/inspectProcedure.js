const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");
const dbInspect = require("../utils/dbInspect");

exports.command = 'inspectProcedure [schema] [procedure]';
exports.aliases = ['ip', 'procedure', 'insProc', 'inspectprocedure', 'inspectsp'];
exports.describe = bundle.getText("inspectProcedure");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  procedure: {
    alias: ['p', 'Procedure', 'sp'],
    type: 'string',
    desc: bundle.getText("procedure")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: bundle.getText("schema")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql"],
    default: "tbl",
    type: 'string',
    desc: bundle.getText("outputType")
  }
};

exports.handler = function (argv) {
  const prompt = require('prompt');
  prompt.override = argv;
  prompt.message = colors.green(bundle.getText("input"));
  prompt.start();

  var schema = {
    properties: {
      admin: {
        description: bundle.getText("admin"),
        type: 'boolean',
        required: true,
        ask: () => {
          return false;
        }
      },
      procedure: {
        description: bundle.getText("procedure"),
        type: 'string',
        required: true
      },
      schema: {
        description: bundle.getText("schema"),
        type: 'string',
        required: true
      },
      output: {
        description: bundle.getText("outputType"),
        type: 'string',
        validator: /t[bl]*|s[ql]?/,
        required: true
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    procedureInspect(result);
  });
}


async function procedureInspect(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Procedure: ${result.procedure}`);

  let proc = await dbInspect.getProcedure(db, schema, result.procedure);
  let parameters = await dbInspect.getProcedurePrams(db, proc[0].PROCEDURE_OID);
  let columns = await dbInspect.getProcedurePramCols(db, proc[0].PROCEDURE_OID);


  if(result.output === 'tbl'){
    console.log(proc[0]);
    console.log("\n")
    console.table(parameters);
    console.table(columns);
  }else if(result.output === 'sql'){
    let definition = await dbInspect.getDef(db, schema, result.procedure);    
    console.log(definition);     
  }
  global.__spinner.stop()
  return;
}