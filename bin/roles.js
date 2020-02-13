const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'roles [schema] [role]';
exports.aliases = ['r', 'listRoles', 'listroles'];
exports.describe = bundle.getText("roles");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  role: {
    alias: ['r', 'Role'],
    type: 'string',
    default: "*",
    desc: bundle.getText("role")
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
      role: {
        description: bundle.getText("role"),
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
    getRoles(result);
  });
}


async function getRoles(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Role: ${result.role}`);

  let results = await getRolesInt(schema, result.role, db, result.limit);
  console.table(results);

  global.__spinner.stop()
  return;
}


async function getRolesInt(schema, role, client, limit) {
  role = dbClass.objectName(role);

  let query = '';
  if (schema === '%') {
    query =
      `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, CREATOR, CREATE_TIME  from ROLES 
    WHERE (ROLE_SCHEMA_NAME LIKE ? OR ROLE_SCHEMA_NAME IS NULL)
      AND ROLE_NAME LIKE ? 
    ORDER BY ROLE_SCHEMA_NAME, ROLE_NAME `;
  } else if (schema === 'null') {
    query =
      `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, CREATOR, CREATE_TIME  from ROLES 
  WHERE (ROLE_SCHEMA_NAME IS NULL or ROLE_SCHEMA_NAME = ?)
    AND ROLE_NAME LIKE ? 
  ORDER BY ROLE_SCHEMA_NAME, ROLE_NAME `;
  } else {
    query =
      `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, CREATOR, CREATE_TIME  from ROLES 
    WHERE ROLE_SCHEMA_NAME LIKE ? 
      AND ROLE_NAME LIKE ? 
    ORDER BY ROLE_SCHEMA_NAME, ROLE_NAME `;
  }

  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, role]);
}