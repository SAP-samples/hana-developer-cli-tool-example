const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'inspectLibMember [schema] [library] [libraryMem]';
exports.aliases = ['ilm', 'libraryMember', 'librarymember', 'insLibMem', 'inspectlibrarymember'];
exports.describe = bundle.getText("inspectLibMember");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  library: {
    alias: ["lib", 'Library'],
    type: 'string',
    desc: bundle.getText("library")
  },
  libraryMem: {
    alias: ["m", "libMem", 'LibraryMember'],
    type: 'string',
    desc: bundle.getText("libMember")
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
      library: {
        description: bundle.getText("library"),
        type: 'string',
        required: true
      },
      libraryMem: {
        description: bundle.getText("libMember"),
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
    libraryMemInspect(result);
  });
}


async function libraryMemInspect(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, Library: ${result.library}, Member: ${result.libraryMem}`);

  let query =
  `SELECT SCHEMA_NAME, LIBRARY_NAME, OWNER_NAME, LIBRARY_TYPE, IS_VALID, CREATE_TIME from LIBRARIES 
  WHERE SCHEMA_NAME LIKE ? 
    AND LIBRARY_NAME = ? 
  ORDER BY LIBRARY_NAME `;
  let libResults = await db.statementExecPromisified(await db.preparePromisified(query), [schema, result.library]);

  query =
  `SELECT SCHEMA_NAME, LIBRARY_NAME, MEMBER_NAME, ACCESS_MODE, PRAGMAS, COMMENTS FROM LIBRARY_MEMBERS
  WHERE SCHEMA_NAME LIKE ? 
    AND LIBRARY_NAME = ? 
    AND MEMBER_NAME = ?
  ORDER BY LIBRARY_NAME, MEMBER_NAME `;
  let libMembers = await db.statementExecPromisified(await db.preparePromisified(query), [schema, result.library, result.libraryMem]);

  if(result.output === 'tbl'){
    console.log(libResults);
    console.log("\n")
    console.log(libMembers);
  }else if(result.output === 'sql'){
    let query =
    `SELECT DEFINITION from LIBRARY_MEMBERS
    WHERE SCHEMA_NAME LIKE ? 
      AND LIBRARY_NAME = ? 
      AND MEMBER_NAME = ?      
    ORDER BY LIBRARY_NAME `;
    let definition = await db.statementExecPromisified(await db.preparePromisified(query), [schema, result.library, result.libraryMem]);
    let output = definition[0].DEFINITION.toString();
    output = output.replace(new RegExp(" ,", "g"), ",\n");	    
    console.log(output);     
  }
  global.__spinner.stop()
  return;
}