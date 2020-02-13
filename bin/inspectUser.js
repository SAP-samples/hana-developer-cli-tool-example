const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'inspectUser [user]';
exports.aliases = ['iu', 'user', 'insUser', 'inspectuser'];
exports.describe = bundle.getText("inspectUser");


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
    desc: bundle.getText("user")
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
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    userInspect(result);
  });
}


async function userInspect(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  console.log(`User: ${result.user}`);

  let query =
  `SELECT *  
  FROM USERS 
  WHERE USER_NAME = ? `;
  let userDetails = (await db.statementExecPromisified(await db.preparePromisified(query), [result.user]));
  console.log(userDetails);

  console.log(bundle.getText("userParams"));
  query = 
  `SELECT *
  FROM  USER_PARAMETERS
  WHERE USER_NAME = ?`
  let resultsParams = await db.statementExecPromisified(await db.preparePromisified(query), [result.user]);
  console.table(resultsParams);

  console.log(bundle.getText("grantedRoles"));
  query = 
  `SELECT ROLE_SCHEMA_NAME, ROLE_NAME, GRANTOR, IS_GRANTABLE
  FROM  GRANTED_ROLES
  WHERE GRANTEE = ?`
  let resultsRoles = await db.statementExecPromisified(await db.preparePromisified(query), [result.user]);
  console.table(resultsRoles);

  console.log(bundle.getText("grantedPrivs"));
  query = 
  `SELECT PRIVILEGE, OBJECT_TYPE, GRANTOR, IS_GRANTABLE
  FROM  GRANTED_PRIVILEGES
  WHERE GRANTEE = ?`  
  let resultsPrivs = await db.statementExecPromisified(await db.preparePromisified(query), [result.user]);
  console.table(resultsPrivs);
  global.__spinner.stop()
  return;
}