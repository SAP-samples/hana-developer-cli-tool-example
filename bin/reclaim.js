const colors = require("colors/safe");   
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'reclaim';
exports.aliases = 're';
exports.describe = bundle.getText("reclaim");


exports.builder = {
    admin: {
      alias:  ['a', 'Admin'],
      type: 'boolean',
      default: true,
      desc: bundle.getText("admin")
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
    const dbStatus = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

    let results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM LOB SPACE;`);
    console.table(results);

    results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM LOG;`);
    console.table(results);

    results = await dbStatus.execSQL(`ALTER SYSTEM RECLAIM DATAVOLUME 105 DEFRAGMENT;`);
    console.table(results);

    global.__spinner.stop()
    return;
}