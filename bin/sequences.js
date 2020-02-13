const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'sequences [schema] [sequence]';
exports.aliases = ['seq', 'listSeqs', 'ListSeqs', 'listseqs', 'Listseq', "listSequences"];
exports.describe = bundle.getText("sequences");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  sequence: {
    alias: ['seq', 'Sequence'],
    type: 'string',
    default: "*",    
    desc: bundle.getText("sequence")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
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
      sequence: {
        description: bundle.getText("sequence"),
        type: 'string',
        required: true
      },
      schema: {
        description: bundle.getText("schema"),
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
    getSequences(result);
  });
}


async function getSequences(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Sequence: ${result.sequence}`);

  let results = await getSequencesInt(schema, result.sequence, db, result.limit);
  console.table(results);

  global.__spinner.stop()  
  return;
}


async function getSequencesInt(schema, sequence, client, limit) {
  sequence = dbClass.objectName(sequence);

  var query =
  `SELECT SCHEMA_NAME, SEQUENCE_NAME, CACHE_SIZE, START_VALUE, END_VALUE, CURRENT_VALUE from M_SEQUENCES 
  WHERE SCHEMA_NAME LIKE ? 
    AND SEQUENCE_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, SEQUENCE_NAME `;
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, sequence]);
}