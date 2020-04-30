const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");
const dbInspect = require("../utils/dbInspect");

exports.command = 'inspectFunction [schema] [function]';
exports.aliases = ['if', 'function', 'insFunc', 'inspectfunction'];
exports.describe = bundle.getText("inspectFunction");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  function: {
    alias: ['f', 'Function'],
    type: 'string',
    desc: bundle.getText("function")
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
      function: {
        description: bundle.getText("function"),
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
    functionInspect(result);
  });
}


async function functionInspect(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Function: ${result.function}`);

  let proc = await dbInspect.getFunction(db, schema, result.function);
  let parameters = await dbInspect.getFunctionPrams(db, proc[0].FUNCTION_OID);
  let columns = await dbInspect.getFunctionPramCols(db, proc[0].FUNCTION_OID);


  if(result.output === 'tbl'){
    console.log(proc[0]);
    console.log("\n")
    console.table(parameters);
    console.table(columns);
  }else if(result.output === 'sql'){
    let definition = await dbInspect.getDef(db, schema, result.function);    
    console.log(definition);     
  }
  global.__spinner.stop()
  return;
}