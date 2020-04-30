const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'synonyms [schema] [synonym] [target]';
exports.aliases = ['syn', 'listSynonyms', 'listsynonyms'];
exports.describe = bundle.getText("synonyms");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  synonym: {
    alias: ['syn', 'Synonym'],
    type: 'string',
    default: "*",
    desc: bundle.getText("synonym")
  },
  target: {
    alias: ['t', 'Target'],
    type: 'string',
    default: "*",
    desc: bundle.getText("target")
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
      synonym: {
        description: bundle.getText("synonym"),
        type: 'string',
        required: true
      },
      target: {
        description: bundle.getText("target"),
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
    getSynonyms(result);
  });
}


async function getSynonyms(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Synonym: ${result.synonym}, Target: ${result.target}`);

  let results = await getSynonymsInt(schema, result.synonym, result.target, db, result.limit);
  console.table(results);

  global.__spinner.stop()  
  return;
}


async function getSynonymsInt(schema, synonym, target, client, limit) {
  synonym = dbClass.objectName(synonym);
  target = dbClass.objectName(target);  



  let query =
      `SELECT SCHEMA_NAME, SYNONYM_NAME, OBJECT_SCHEMA, OBJECT_NAME, OBJECT_TYPE, CREATE_TIME  from SYNONYMS 
    WHERE SCHEMA_NAME LIKE ? 
      AND SYNONYM_NAME LIKE ? 
      AND OBJECT_NAME LIKE ?
    ORDER BY SCHEMA_NAME, SYNONYM_NAME `;
 
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, synonym, target]);
}