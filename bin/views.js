const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'views [schema] [view]';
exports.aliases = ['v', 'listViews', 'listviews'];
exports.describe = bundle.getText("views");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  view: {
    alias: ['v', 'View'],
    type: 'string',
    default: "*",    
    desc: bundle.getText("view")
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
      view: {
        description: bundle.getText("view"),
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
    getViews(result);
  });
}


async function getViews(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, View: ${result.view}`);

  let results = await getViewsInt(schema, result.view, db, result.limit);
  console.table(results);

  global.__spinner.stop()  
  return;
}


async function getViewsInt(schema, view, client, limit) {
  view = dbClass.objectName(view);

  let query =
  `SELECT SCHEMA_NAME, VIEW_NAME, TO_NVARCHAR(VIEW_OID) AS VIEW_OID, COMMENTS  from VIEWS 
  WHERE SCHEMA_NAME LIKE ? 
    AND VIEW_NAME LIKE ? 
  ORDER BY VIEW_NAME `;
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, view]);
}