const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'schemas [schema]';
exports.aliases = ['sch', 'getSchemas', 'listSchemas'];
exports.describe = bundle.getText("schemas");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  schema: {
    alias: ['s', 'schemas'],
    type: 'string',
    default: "*",
    desc: bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: bundle.getText("limit")
  },
  all: {
    alias: ['al', 'allSchemas'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("allSchemas")
  },
};

exports.handler = function (argv) {
  const prompt = require('prompt');
  prompt.override = argv;
  prompt.message = colors.green(bundle.getText("input"));
  prompt.start();

  var schema = {
    properties: {
      schema: {
        description: bundle.getText("schema"),
        type: 'string',
        required: true
      },
      admin: {
        description: bundle.getText("admin"),
        type: 'boolean',
        required: true,
        ask: () => {
          return false;
        }
      },
      all: {
        description: bundle.getText("allSchemas"),
        type: 'boolean',
        required: true,
        ask: () => {
          return false;
        }
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
    dbStatus(result);
  });
}


async function dbStatus(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let results = await getSchemasInt(result.schema, db, result.limit, result.all);
  console.table(results);

  global.__spinner.stop()
  return;
}

async function getSchemasInt(schema, client, limit, all) {
  schema = dbClass.objectName(schema);
  let hasPrivileges = 'FALSE';
  if(!all){hasPrivileges = 'TRUE'}
  console.log(schema);
  var query =
    `SELECT * from SCHEMAS 
        WHERE SCHEMA_NAME LIKE ? 
          AND HAS_PRIVILEGES = ?
	      ORDER BY SCHEMA_NAME `;
  if (limit !== null) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, hasPrivileges]);
}