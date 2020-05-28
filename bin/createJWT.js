const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'createJWT [name]';
exports.aliases = ['cJWT', 'cjwt', 'cJwt'];
exports.describe = bundle.getText("createJWT");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: true,
    desc: bundle.getText("admin")
  },
  name: {
    alias: ['c', 'Name'],
    type: 'string',
    desc: bundle.getText("jwtName")
  },
  certificate: {
    alias: ['c', 'Certificate'],
    type: 'string',
    desc: bundle.getText("certificate")
  },
  issuer: {
    alias: ['i', 'Issuer'],
    desc: bundle.getText("issuer"),
    type: 'string'
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
      name: {
        description: bundle.getText("jwtName"),
        required: true
      },      
      certificate: {
        description: bundle.getText("certificate"),
        required: true
      },
      issuer: {
        description: bundle.getText("issuer"),
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
  let envFile = dbClass.resolveEnv(result);
  const db = new dbClass(await dbClass.createConnectionFromEnv(envFile));

  let results = await db.execSQL(
    `CREATE certificate from '${result.certificate}';`);
  console.table(results);

  results = await db.execSQL(
    `CALL SYSTEM.CREATE_JWT_PROVIDER('${result.name}', '${result.issuer}', 'user_name', true);`);
  console.table(results);

  results = await db.execSQL(
    `CREATE pse ${result.name};`);
  console.table(results);
 
  let cert = await db.execSQL(
    `SELECT CERTIFICATE_ID FROM CERTIFICATES WHERE ISSUER_COMMON_NAME = '${result.issuer}'`);

  results = await db.execSQL(
    `ALTER pse ${result.name} ADD certificate ${cert[0].CERTIFICATE_ID};`);
  console.table(results);

  results = await db.execSQL(
    `CALL SYSTEM.SET_PSE_PURPOSE('${result.name}', 'JWT', ARRAY('${result.name}'));`);
  console.table(results);

  global.__spinner.stop()
  return;
}


