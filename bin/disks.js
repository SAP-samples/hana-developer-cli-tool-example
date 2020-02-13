const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'disks';
exports.aliases = ['di', 'Disks'];
exports.describe = bundle.getText("disks");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
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

  let results = await dbStatus.execSQL(
    `SELECT * FROM M_DISKS`);
  console.table(results);

  results = await dbStatus.execSQL(
    `SELECT * FROM M_DISK_USAGE`);
  console.table(results);
  global.__spinner.stop()
  return;
}