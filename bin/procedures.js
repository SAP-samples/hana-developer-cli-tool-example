const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'procedures [schema] [procedure]';
exports.aliases = ['p', 'listProcs', 'ListProc', 'listprocs', 'Listproc', "listProcedures", "listprocedures"];
exports.describe = bundle.getText("procedures");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  procedure: {
    alias: ['p', 'Procedure'],
    type: 'string',
    default: "*",    
    desc: bundle.getText("procedure")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: bundle.getText("limit")
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
      limit: {
        description: bundle.getText("limit"),
        type: 'number',
        required: true
      }      
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    getProcedures(result);
  });
}


async function getProcedures(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Procedure: ${result.procedure}`);

  let results = await getProceduresInt(schema, result.procedure, db, result.limit);
  console.table(results);
  global.__spinner.stop()
  return;
}


async function getProceduresInt(schema, procedure, client, limit) {
  procedure = dbClass.objectName(procedure);
  let query =
  `SELECT SCHEMA_NAME, PROCEDURE_NAME, SQL_SECURITY, CREATE_TIME from PROCEDURES 
  WHERE SCHEMA_NAME LIKE ? 
    AND PROCEDURE_NAME LIKE ? 
  ORDER BY PROCEDURE_NAME `;
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, procedure]);
}