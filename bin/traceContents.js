const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'traceContents [host] [file]';
exports.aliases = ['tc', 'traceContents', 'traceContent', 'tracecontent'];
exports.describe = bundle.getText("traceContents");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  host: {
    alias: ['ho', 'Host'],
    type: 'string',
    desc: bundle.getText("host")
  },
  file: {
    alias: ['f', 'File'],
    type: 'string',
    desc: bundle.getText("file")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 2000,
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
      host: {
        description: bundle.getText("host"),
        type: 'string',
        required: true
      },
      file: {
        description: bundle.getText("file"),
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
    dbStatus(result);
  });
}


async function dbStatus(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let query =
    `SELECT MAX(OFFSET) AS OFFSET FROM  M_TRACEFILE_CONTENTS WHERE HOST = ?
      AND FILE_NAME = ?`;
  let max = await db.statementExecPromisified(await db.preparePromisified(query), [result.host, result.file]);
  let maxOffset = max[0].OFFSET  - result.limit * 10;
  console.log(maxOffset);

  query =
    `SELECT CONTENT FROM  M_TRACEFILE_CONTENTS WHERE HOST = ?
      AND FILE_NAME = ?
      AND OFFSET >= ?
    ORDER BY OFFSET `;
  let results = await db.statementExecPromisified(await db.preparePromisified(query), [result.host, result.file, maxOffset]);
  console.table(results);

  global.__spinner.stop()
  return;
}