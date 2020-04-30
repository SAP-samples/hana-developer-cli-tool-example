const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'inspectIndex [schema] [index]';
exports.aliases = ['ii', 'index', 'insIndex', 'inspectindex'];
exports.describe = bundle.getText("inspectIndex");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  index: {
    alias: ['i', 'Index'],
    type: 'string',
    desc: bundle.getText("index")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: bundle.getText("schema")
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
      schema: {
        description: bundle.getText("schema"),
        type: 'string',
        required: true
      },      
      index: {
        description: bundle.getText("index"),
        type: 'string',
        required: true
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    indexInspect(result);
  });
}


async function indexInspect(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));
  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Index: ${result.index}`);

  let query =
    `SELECT *  
  FROM INDEXES 
  WHERE SCHEMA_NAME = ? 
    AND INDEX_NAME = ?`;
  let indexDetails = (await db.statementExecPromisified(await db.preparePromisified(query), [schema, result.index]));
  console.log(indexDetails);

  console.log(bundle.getText("indexColumns"));
  query =
    `SELECT *
  FROM  INDEX_COLUMNS
  WHERE SCHEMA_NAME = ? 
  AND INDEX_NAME = ?`;
  let resultsColumns = await db.statementExecPromisified(await db.preparePromisified(query), [schema, result.index]);
  console.table(resultsColumns);
  global.__spinner.stop()
  return;
}