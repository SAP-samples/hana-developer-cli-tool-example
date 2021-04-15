const colors = require("colors/safe");   
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'status';
exports.aliases = ['s', 'whoami'];
exports.describe = bundle.getText("status");


exports.builder = {
    admin: {
      alias:  ['a', 'Admin'],
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

    try {
      const dbStatus = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)))

      let results = await dbStatus.execSQL(`SELECT CURRENT_USER AS "Current User", CURRENT_SCHEMA AS "Current Schema" FROM DUMMY`)
      console.table(results)
   
      let resultsSession = await dbStatus.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`)
      console.table(resultsSession)
  
      console.log(bundle.getText("grantedRoles"))
      let resultsRoles = await dbStatus.execSQL(`SELECT ROLE_SCHEMA_NAME, ROLE_NAME, GRANTOR, IS_GRANTABLE
                                                  FROM  GRANTED_ROLES
                                                  WHERE GRANTEE = (SELECT CURRENT_USER FROM "DUMMY")`)
      console.table(resultsRoles)
  
      console.log(bundle.getText("grantedPrivs"))
      let resultsPrivs = await dbStatus.execSQL(`SELECT PRIVILEGE, OBJECT_TYPE, GRANTOR, IS_GRANTABLE
                                                  FROM  GRANTED_PRIVILEGES
                                                  WHERE GRANTEE = (SELECT CURRENT_USER FROM "DUMMY")`)
      console.table(resultsPrivs)
      global.__spinner.stop()
      return
    } catch (error) {
      global.__spinner.stop()
      console.error(`Connection Problem ${error}`)
      
    }

}