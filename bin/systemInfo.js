const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'systemInfo';
exports.aliases = ['sys', 'sysinfo', 'sysInfo', 'systeminfo'];
exports.describe = bundle.getText("systemInfo");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
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
  try {
    const dbStatus = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));
    const dbInspect = require("../utils/dbInspect")
    console.table(await dbInspect.getHANAVersion(dbStatus))

    let results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SYSTEM_OVERVIEW"`)

    console.table(results)

    results = await dbStatus.execSQL(`SELECT TOP 100 * FROM "M_SERVICES"`)
    console.table(results)

    global.__spinner.stop()
    return
  } catch (error) {
    global.__spinner.stop()
    console.error(`Connection Problem ${error}`)

  }
}