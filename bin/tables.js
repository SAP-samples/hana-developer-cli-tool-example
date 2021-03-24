const colors = require('colors/safe');
const bundle = global.__bundle;
const TableReader = require('./lib/tableReader');

exports.command = 'tables [schema] [table]';
exports.aliases = ['t', 'listTables', 'listtables'];
exports.describe = bundle.getText('tables');

exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText('admin'),
  },
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: '*',
    desc: bundle.getText('table'),
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: bundle.getText('schema'),
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: bundle.getText('limit'),
  },
};

exports.handler = function (argv) {
  const prompt = require('prompt');
  prompt.override = argv;
  prompt.message = colors.green(bundle.getText('input'));
  prompt.start();

  var schema = {
    properties: {
      admin: {
        description: bundle.getText('admin'),
        type: 'boolean',
        required: true,
        ask: () => {
          return false;
        },
      },
      table: {
        description: bundle.getText('table'),
        type: 'string',
        required: true,
      },
      schema: {
        description: bundle.getText('schema'),
        type: 'string',
        required: true,
      },
      limit: {
        description: bundle.getText('limit'),
        type: 'number',
        required: true,
      },
    },
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner();
    getTables(result);
  });
};

async function getTables(result) {
  let results = await TableReader.getTables(result);
  console.table(results);
  global.__spinner.stop();
  return;
}
