const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'objects [schema] [object]';
exports.aliases = ['o', 'listObjects', 'listobjects'];
exports.describe = bundle.getText("objects");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  object: {
    alias: ['o', 'Object'],
    type: 'string',
    default: "*",    
    desc: bundle.getText("object")
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
      object: {
        description: bundle.getText("object"),
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
    getObjects(result);
  });
}


async function getObjects(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Object: ${result.object}`);

  let results = await getObjectsInt(schema, result.object, db, result.limit);
  console.table(results);

  global.__spinner.stop()
  return;
}


async function getObjectsInt(schema, object, client, limit) {
  object = dbClass.objectName(object);

  var query =
  `SELECT OBJECT_CATEGORY, SCHEMA_NAME, OBJECT_NAME, OBJECT_TYPE, TO_NVARCHAR(OBJECT_OID) AS OBJECT_OID  from OBJECTS 
  WHERE SCHEMA_NAME LIKE ? 
    AND OBJECT_NAME LIKE ? 
  ORDER BY OBJECT_TYPE, OBJECT_NAME `;
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, object]);
}