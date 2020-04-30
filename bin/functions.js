const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'functions [schema] [function]';
exports.aliases = ['f', 'listFuncs', 'ListFunc', 'listfuncs', 'Listfunc', "listFunctions", "listfunctions"];
exports.describe = bundle.getText("functions");


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
    default: "*",    
    desc: bundle.getText("function")
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
    getFunctions(result);
  });
}


async function getFunctions(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Function: ${result.function}`);

  let results = await getFunctionsInt(schema, result.function, db, result.limit);
  console.table(results);
  global.__spinner.stop()
  return;
}


async function getFunctionsInt(schema, functionName, client, limit) {
  functionName = dbClass.objectName(functionName);

  var query =
  `SELECT SCHEMA_NAME, FUNCTION_NAME, SQL_SECURITY, CREATE_TIME from FUNCTIONS 
  WHERE SCHEMA_NAME LIKE ? 
    AND FUNCTION_NAME LIKE ? 
  ORDER BY FUNCTION_NAME `;
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, functionName]);
}