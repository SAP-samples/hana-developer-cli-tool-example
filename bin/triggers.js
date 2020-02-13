const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'triggers [schema] [trigger] [target]';
exports.aliases = ['trig', 'listTriggers', 'ListTrigs', 'listtrigs', 'Listtrig', "listrig"];
exports.describe = bundle.getText("triggers");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  trigger: {
    alias: ['t', 'Trigger'],
    type: 'string',
    default: "*",    
    desc: bundle.getText("sequence")
  },
  target: {
    alias: ['to', 'Target'],
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
      trigger: {
        description: bundle.getText("trigger"),
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
    getTriggers(result);
  });
}


async function getTriggers(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Trigger: ${result.trigger}, Target: ${result.target}`);

  let results = await getTriggersInt(schema, result.trigger, result.target, db, result.limit);
  console.table(results);

  global.__spinner.stop()
  return;
}


async function getTriggersInt(schema, trigger, target, client, limit) {
  trigger = dbClass.objectName(trigger);
  target = dbClass.objectName(target)

  let query =
  `SELECT SCHEMA_NAME, TRIGGER_NAME, OWNER_NAME, SUBJECT_TABLE_SCHEMA, SUBJECT_TABLE_NAME, TRIGGER_ACTION_TIME,
          TRIGGER_EVENT, TRIGGERED_ACTION_LEVEL
  FROM TRIGGERS
  WHERE SCHEMA_NAME LIKE ? 
    AND TRIGGER_NAME LIKE ? 
    AND SUBJECT_TABLE_NAME LIKE ?
  ORDER BY SCHEMA_NAME, TRIGGER_NAME `;
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, trigger, target]);
}