const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'users [user]';
exports.aliases = ['u', 'listUsers', 'listusers'];
exports.describe = bundle.getText("users");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  user: {
    alias: ['u', 'User'],
    type: 'string',
    default: "*",
    desc: bundle.getText("user")
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
      user: {
        description: bundle.getText("user"),
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
    getUsers(result);
  });
}


async function getUsers(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  console.log(`User: ${result.user}`);

  let results = await getUsersInt(result.user, db, result.limit);
  console.table(results);

  global.__spinner.stop()  
  return;
}


async function getUsersInt(user, client, limit) {
  user = dbClass.objectName(user);
  let query =
    `SELECT USER_NAME, USERGROUP_NAME, CREATOR, CREATE_TIME  
  FROM USERS 
  WHERE USER_NAME LIKE ? 
  ORDER BY USER_NAME `;
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [user]);
}