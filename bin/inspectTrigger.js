const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'inspectTrigger [schema] [trigger]';
exports.aliases = ['itrig', 'trigger', 'insTrig', 'inspecttrigger', 'inspectrigger'];
exports.describe = bundle.getText("inspectTrigger");


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
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: bundle.getText("schema")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql"],
    default: "tbl",
    type: 'string',
    desc: bundle.getText("outputType")
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
      schema: {
        description: bundle.getText("schema"),
        type: 'string',
        required: true
      },
      output: {
        description: bundle.getText("outputType"),
        type: 'string',
        validator: /t[bl]*|s[ql]?/,
        required: true
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    triggerInspect(result);
  });
}


async function triggerInspect(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Trigger: ${result.trigger}`);

  let query =
  `SELECT *
  FROM TRIGGERS
  WHERE SCHEMA_NAME LIKE ? 
    AND TRIGGER_NAME = ? `;

  let libResults = await db.statementExecPromisified(await db.preparePromisified(query), [schema, result.trigger]);
  if(result.output === 'tbl'){
    console.log(libResults);
  }else if(result.output === 'sql'){
    let query =
    `SELECT DEFINITION from TRIGGERS
    WHERE SCHEMA_NAME LIKE ? 
      AND TRIGGER_NAME = ? `;
    let definition = await db.statementExecPromisified(await db.preparePromisified(query), [schema, result.trigger]);
    let output = definition[0].DEFINITION.toString();
    output = output.replace(new RegExp(" ,", "g"), ",\n");	    
    console.log(output);     
  }
  global.__spinner.stop()
  return;
}