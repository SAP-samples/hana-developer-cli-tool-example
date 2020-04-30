const colors = require("colors/safe");   
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'iniContents [file] [section]';
exports.aliases = ['if', 'inifiles', 'ini'];
exports.describe = bundle.getText("iniContents");


exports.builder = {
    admin: {
      alias:  ['a', 'Admin'],
      type: 'boolean',
      default: false,
      desc: bundle.getText("admin")
    },
    file: {
      alias: ['f', 'File'],
      type: 'string',
      default: "*",    
      desc: bundle.getText("file")
    }, 
    section: {
      alias: ['s', 'Section'],
      type: 'string',
      default: "*",    
      desc: bundle.getText("section")
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
          ask: () =>{
            return false;
        }
        },
        file: {
          description: bundle.getText("file"),
          type: 'string',
          required: true
        },
        section: {
          description: bundle.getText("section"),
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
         if(err){
             return console.log(err.message);
         }
         global.startSpinner()
         dbStatus(result);
    });
  }
  

  async function dbStatus(result) {
    const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

    let iniFile = dbClass.objectName(result.file);
    let section = dbClass.objectName(result.section);

    var query =
    `SELECT *  from M_INIFILE_CONTENTS 
    WHERE FILE_NAME LIKE ? 
      AND SECTION LIKE ?
    ORDER BY FILE_NAME, SECTION, KEY `;
    if (result.limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(result.limit)) {
      query += `LIMIT ${result.limit.toString()}`;
    }
    let results =  await db.statementExecPromisified(await db.preparePromisified(query), [iniFile, section]);
    console.table(results);
    global.__spinner.stop()
    return;
}