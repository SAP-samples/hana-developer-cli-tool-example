const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'indexes [schema] [indexes]';
exports.aliases = ['ind', 'listIndexes', 'ListInd', 'listind', 'Listind', "listfindexes"];
exports.describe = bundle.getText("indexes");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  indexes: {
    alias: ['i', 'Indexes'],
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
      indexes: {
        description: bundle.getText("indexes"),
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
    getIndexes(result);
  });
}


async function getIndexes(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));
  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Index: ${result.indexes}`);

  let results = await getIndexesInt(schema, result.indexes, db, result.limit);
  console.table(results);
  global.__spinner.stop()  
  return;
}


async function getIndexesInt(schema, indexes, client, limit) {
  indexes = dbClass.objectName(indexes);

  let query =
  `SELECT SCHEMA_NAME, TABLE_NAME, INDEX_NAME, INDEX_TYPE, CONSTRAINT, CREATE_TIME from INDEXES 
  WHERE SCHEMA_NAME LIKE ? 
    AND INDEX_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, TABLE_NAME, INDEX_NAME `;
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, indexes]);
}