const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'activateHDI [tenant]';
exports.aliases = ['ahdi', 'ah'];
exports.group = 'Test:'
exports.describe = bundle.getText("activateHDI");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: true,
    desc: bundle.getText("admin")
  },
  tenant: {
    alias: ['t', 'Tenant'],
    type: 'string',
    desc: bundle.getText("tenant")
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
      tenant: {
        description: bundle.getText("tenant"),
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
    activate(result);
  });
}


async function activate(result) {
  const dbStatus = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));
  let results = await dbStatus.execSQL(
    `DO
      BEGIN
        DECLARE dbName NVARCHAR(25) = '${result.tenant}'; 
        -- Start diserver
        DECLARE diserverCount INT = 0;
        SELECT COUNT(*) INTO diserverCount FROM SYS_DATABASES.M_SERVICES WHERE SERVICE_NAME = 'diserver' AND DATABASE_NAME = :dbName AND ACTIVE_STATUS = 'YES';
        IF diserverCount = 0 THEN
          EXEC 'ALTER DATABASE ' || :dbName || ' ADD ''diserver''';
        END IF;           
      END;`);
  console.table(results);
  global.__spinner.stop()
  return;
}