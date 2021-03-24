const colors = require('colors/safe');
const bundle = global.__bundle;
const TableReader = require('./lib/tableReader');
const dbInspect = require('../utils/dbInspect');
const dbClass = require('sap-hdbext-promisfied');
const fs = require('fs');

exports.command = 'inspect:schema:tables [schema] [save]';
exports.describe = bundle.getText('inspect_tables');

exports.builder = {
  schema: {
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
  save: {
    type: 'boolean',
    default: false,
    desc: bundle.getText('save_output'),
  },
  silent: {
    type: 'boolean',
    default: false,
  },
};

exports.handler = function (argv) {
  const prompt = require('prompt');
  prompt.override = argv;
  prompt.message = colors.green(bundle.getText('input'));
  prompt.start();

  var schema = {
    properties: {
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
      save: {
        type: 'boolean',
        description: bundle.getText('save_output'),
      },
      silent: {
        type: 'boolean',
      },
    },
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    // global.startSpinner();
    getTables(result);
  });
};

async function getTables({ schema, limit, save, silent, admin = true }) {
  const db = new dbClass(
    await dbClass.createConnectionFromEnv(dbClass.resolveEnv({ admin }))
  );

  let tables = await TableReader.getTables({ schema, limit, admin });

  let content = '';

  for (const { SCHEMA_NAME, TABLE_NAME, TABLE_OID } of tables) {
    let object = await dbInspect.getTable(db, SCHEMA_NAME, TABLE_NAME);
    let fields = await dbInspect.getTableFields(db, TABLE_OID);
    let constraints = await dbInspect.getConstraints(db, object);
    let cdsSource = await dbInspect.formatCDS(
      object,
      fields,
      constraints,
      'table'
    );
    silent || console.log(cdsSource);    
    save && (content = `${content}\n${cdsSource}`) ;
  }
  content && fs.writeFileSync(`${schema}.cds`, content);  
  // global.__spinner.stop();

}
