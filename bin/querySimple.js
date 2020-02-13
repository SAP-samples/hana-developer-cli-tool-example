const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'querySimple';
exports.aliases = ['qs', "querysimple"];
exports.describe = bundle.getText("querySimple");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  query: {
    alias: ['q', 'Query'],
    type: 'string',
    desc: bundle.getText("query")
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
      query: {
        description: bundle.getText("query"),
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
    dbQuery(result);
  });
}

async function dbQuery(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));
  let results = await db.execSQL(result.query);
  console.table(results);

  global.__spinner.stop()  
  return;
}