const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'dropContainer [container]';
exports.aliases = ['dc', 'dropC'];
exports.describe = bundle.getText("dropContainer");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: true,
    desc: bundle.getText("admin")
  },
  container: {
    alias: ['c', 'Container'],
    type: 'string',
    desc: bundle.getText("container")
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
      container: {
        description: bundle.getText("container"),
        required: true
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    drop(result);
  });
}


async function drop(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

   let results = await db.execSQL(
    `CREATE LOCAL TEMPORARY COLUMN TABLE #PARAMETERS LIKE _SYS_DI.TT_PARAMETERS;`);
  console.table(results);
  results = await db.execSQL(
    `INSERT INTO #PARAMETERS ( KEY, VALUE ) VALUES ( 'IGNORE_WORK', true );`);
  console.table(results);
  results = await db.execSQL(
    `INSERT INTO #PARAMETERS ( KEY, VALUE ) VALUES ( 'IGNORE_DEPLOYED', true );`);
  console.table(results);
  results = await db.execSQL(
    `CALL _SYS_DI.DROP_CONTAINER('${result.container}', #PARAMETERS, ?, ?, ?);`);
  console.table(results);
  results = await db.execSQL(
    `DROP TABLE #PARAMETERS;`);
  console.table(results); 

  let path = require("path");
  let hdiFile = path.resolve(process.cwd(), 'default-env.json');
  const fs = require("fs");
  var hdi = JSON.parse(fs.readFileSync(hdiFile, "utf8"));

  results = await db.execSQL(
    `DROP ROLE "${result.container}::access_role"`);
  console.table(results);

  results = await db.execSQL(
    `DROP ROLE "${result.container}::external_privileges_role"`);
  console.table(results);

  results = await db.execSQL(
    `DROP USER ${hdi.VCAP_SERVICES.hana[0].credentials.user} CASCADE`);
  console.table(results);

  results = await db.execSQL(
    `DROP USER ${hdi.VCAP_SERVICES.hana[0].credentials.hdi_user} CASCADE`);
  console.table(results); 
  global.__spinner.stop()
  return;
}

