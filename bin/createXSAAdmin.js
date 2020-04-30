const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'createXSAAdmin [user] [password]';
exports.aliases = ['cXSAAdmin', 'cXSAA', 'cxsaadmin', 'cxsaa'];
exports.describe = bundle.getText("createXSAAdmin");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: true,
    desc: bundle.getText("admin")
  },
  user: {
    alias: ['u', 'User'],
    desc: bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: bundle.getText("password")
  },
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
        required: true
      },
      password: {
        description: bundle.getText("password"),
        hidden: true,
        replace: '*',
        required: true
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    activate(result);
  });
}


async function activate(result) {
  const dbStatus = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));
  let results = await dbStatus.execSQL(`CREATE USER ${result.user} PASSWORD "${result.password}" NO FORCE_FIRST_PASSWORD_CHANGE;`);
  console.table(results);

  let resultsGrant = await dbStatus.execSQL(
    `ALTER USER ${result.user} DISABLE PASSWORD LIFETIME;`);
  console.table(resultsGrant);
  resultsGrant = await dbStatus.execSQL(
    `ALTER USER ${result.user} SET PARAMETER EMAIL ADDRESS = '${result.user}@sap.com';`);
  console.table(resultsGrant);
  resultsGrant = await dbStatus.execSQL(
    `ALTER USER ${result.user} SET PARAMETER XS_RC_XS_CONTROLLER_ADMIN = 'XS_CONTROLLER_ADMIN';`);
  console.table(resultsGrant);  
  global.__spinner.stop()  
  return;
}