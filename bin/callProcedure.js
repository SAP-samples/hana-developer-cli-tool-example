const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");
const dbInspect = require("../utils/dbInspect");

exports.command = 'callProcedure [schema] [procedure]';
exports.aliases = ['cp', 'callprocedure', 'callProc', 'callproc', 'callSP', 'callsp'];
exports.describe = bundle.getText("callProcedure");


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
  }
};

exports.handler = async function (argv) {
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
      }
    }
  };

  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(argv)));
  let procSchema = await dbClass.schemaCalc(argv, db);
  console.log(`Schema: ${procSchema}, Procedure: ${argv.procedure}`);
  let proc = await dbInspect.getProcedure(db, procSchema, argv.procedure);
  let parameters = await dbInspect.getProcedurePrams(db, proc[0].PROCEDURE_OID);
  for (let parameter of parameters) {
    if (!parameter.TABLE_TYPE_NAME && parameter.PARAMETER_TYPE === 'IN') {
      let type = 'string';
      switch (parameter.DATA_TYPE_NAME) {
        case 'TINYINT':
        case 'SMALLINT':
        case 'INTEGER':
        case 'BIGINIT':
          type = 'integer';
          break;
        case 'DECIMAL':
        case 'REAL':
        case 'DOUBLE':
        case 'SMALLDECIMAL':
          type = 'decimal';
          break;
        case 'BOOLEAN':
          type = 'boolean';
          break;
        default:
          type = 'string';
      }
      schema.properties[parameter.PARAMETER_NAME] = {
        description: parameter.PARAMETER_NAME,
        type: type
      }
    }
  }

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    callProc(result);
  });
}


async function callProc(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  let proc = await dbInspect.getProcedure(db, schema, result.procedure);
  let parameters = await dbInspect.getProcedurePrams(db, proc[0].PROCEDURE_OID);
  var inputParams = {
  };
  for (let parameter of parameters) {
    if (!parameter.TABLE_TYPE_NAME && parameter.PARAMETER_TYPE === 'IN') {
      inputParams[parameter.PARAMETER_NAME] = result[parameter.PARAMETER_NAME]
    }
  }
  let hdbext = require("@sap/hdbext");
  let sp = await db.loadProcedurePromisified(hdbext, proc[0].SCHEMA_NAME, result.procedure);
  
  let output = await db.callProcedurePromisified(sp, inputParams);
  console.log(output.outputScalar);
  switch(Object.keys(output).length){
    case 0:
    case 1:
      break;
    case 2:
      console.table(output.results);
      break;
    default:
        for (let i = 1; i < Object.keys(output).length; i++) {
          console.table(output[`results${i}`]);
        }
        break;    
  }
  global.__spinner.stop()
  return;
}