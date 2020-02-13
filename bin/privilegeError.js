const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'privilegeError [guid]';
exports.aliases = ['pe', 'privilegeerror', 'privilegerror', 'getInsuffficientPrivilegeErrorDetails'];
exports.describe = bundle.getText("privilegeError");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  guid: {
    alias: ['g', 'error'],
    type: 'string',
    desc: bundle.getText("errorGuid")
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
      guid: {
        description: bundle.getText("errorGuid"),
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
    dbCall(result);
  });
}


async function dbCall(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));
  var inputParams = {
    GUID: result.guid
  };
  let hdbext = require("@sap/hdbext");
  let sp = await db.loadProcedurePromisified(hdbext, "SYS", "GET_INSUFFICIENT_PRIVILEGE_ERROR_DETAILS");
  let object = await db.callProcedurePromisified(sp, inputParams);
  if (object.results < 1) {
    throw new Error("Invalid Error GUID");
  }
  console.log(object.results[0]);
  global.__spinner.stop()  
  return;
}