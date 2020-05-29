const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'createContainer [container]';
exports.aliases = ['cc', 'cCont'];
exports.describe = bundle.getText("createContainer");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: true,
    desc: bundle.getText("admin")
  },
  container: {
    alias: ['c', 'Container'],
    type: 'string',
    desc: bundle.getText("container")
  },
  save: {
    alias: ['s', 'Save'],
    desc: bundle.getText("saveHDI"),
    type: 'boolean',
    default: true
  },
  encrypt: {
    alias: ['e', 'Encrypt', 'ssl'],
    desc: bundle.getText("encrypt"),
    type: 'boolean',
    default: false
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
      container: {
        description: bundle.getText("container"),
        required: true
      },
      save: {
        description: bundle.getText("saveHDI"),
        type: 'boolean',
        required: true
      },
      encrypt: {
        description: bundle.getText("encrypt"),   
        type: 'boolean',       
        required: true
      }      
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    activate(result);
  });
}


async function activate(result) {
  let envFile = dbClass.resolveEnv(result);
  const db = new dbClass(await dbClass.createConnectionFromEnv(envFile));

  const { v4: uuidv4 } = require('uuid');
  let passwordDT = uuidv4();
  passwordDT = passwordDT.replace(/-/g, "A");
  let passwordRT = uuidv4();
  passwordRT = passwordRT.replace(/-/g, "A");
  let user = uuidv4();
  user = user.replace(/-/g, "");
  let userDT = result.container + '_' + user + '_DT';
  userDT = userDT.toUpperCase();
  let userRT = result.container + '_' + user + '_RT';
  userRT = userRT.toUpperCase();

  let results = await db.execSQL(
    `CALL _SYS_DI.CREATE_CONTAINER('${result.container}', _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`);
  console.table(results);

  //SCHEMA_PRIV = SELECT PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, (SELECT :userRT FROM DUMMY) AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_USER_PRIVILEGES;

  let userGroup = await db.execSQL(
    `SELECT * FROM SYS.USERGROUPS WHERE USERGROUP_NAME = 'DEFAULT'`);
  let useGroup = false
  if(userGroup.length > 0){
    useGroup = true
  }

  results = await db.execSQL(
    `DO
  BEGIN
    DECLARE userName NVARCHAR(100); 
    DECLARE userDT NVARCHAR(100); 
    DECLARE userRT NVARCHAR(100);   
    declare return_code int;
    declare request_id bigint;
    declare MESSAGES _SYS_DI.TT_MESSAGES;
    declare PRIVILEGES _SYS_DI.TT_API_PRIVILEGES;
    declare SCHEMA_PRIV _SYS_DI.TT_SCHEMA_PRIVILEGES;
  
    no_params = SELECT * FROM _SYS_DI.T_NO_PARAMETERS;
  
    SELECT SYSUUID INTO userName FROM DUMMY; 
    SELECT '${userDT}' into userDT FROM DUMMY;
    SELECT '${userRT}' into userRT FROM DUMMY;  
    EXEC 'CREATE USER ' || :userDT || ' PASSWORD "${passwordDT}" NO FORCE_FIRST_PASSWORD_CHANGE ${ useGroup ? ` SET USERGROUP DEFAULT ` : '' }';
    EXEC 'CREATE USER ' || :userRT || ' PASSWORD "${passwordRT}" NO FORCE_FIRST_PASSWORD_CHANGE ${ useGroup ? ` SET USERGROUP DEFAULT ` : '' }';
  
    COMMIT;

    PRIVILEGES = SELECT PRIVILEGE_NAME, OBJECT_NAME, PRINCIPAL_SCHEMA_NAME, (SELECT :userDT FROM DUMMY) AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_ADMIN_PRIVILEGES;
    CALL _SYS_DI.GRANT_CONTAINER_API_PRIVILEGES('${result.container}', :PRIVILEGES, :no_params, :return_code, :request_id, :MESSAGES); 
    select * from :MESSAGES;
  
    SCHEMA_PRIV = SELECT PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, (SELECT :userRT FROM DUMMY) AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_USER_PRIVILEGES;
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${result.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'INSERT' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${result.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;
  
    SCHEMA_PRIV = SELECT 'CREATE TEMPORARY TABLE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${result.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'DELETE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${result.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'EXECUTE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${result.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;    

    SCHEMA_PRIV = SELECT 'UPDATE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${result.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES; 

    SCHEMA_PRIV = SELECT 'SELECT CDS METADATA' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${result.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    default = SELECT * FROM _SYS_DI.T_DEFAULT_LIBRARIES;
    CALL _SYS_DI.CONFIGURE_LIBRARIES('${result.container}', :default, :no_params, :return_code, :request_id, :MESSAGES);
    SELECT :userDT as "Object Owner", :userRT as "Application User" from DUMMY;

    EXEC 'CREATE ROLE "${result.container}::access_role"';
    EXEC 'CREATE ROLE "${result.container}::external_privileges_role"';

    EXEC 'GRANT  "${result.container}::access_role" TO ${userRT} ';
    EXEC 'GRANT  "${result.container}::external_privileges_role" TO ${userRT} ';    
  END;`);
  console.table(results);

  if (result.save) {
    const xsenv = require("@sap/xsenv");
    xsenv.loadEnv(envFile);
    let options = xsenv.getServices({ hana: { tag: 'hana' }, });    
    await saveEnv(options, result.container, userDT, userRT, passwordDT, passwordRT, result.encrypt);
  }
  global.__spinner.stop()
  return;
}


async function saveEnv(options, container, userDT, userRT, passwordDT, passwordRT, encrypt) {
  //  let parts = options.serverNode.split(':');
  let defaultEnv = {};
  defaultEnv.TARGET_CONTAINER = container;
  defaultEnv.VCAP_SERVICES = {};
  defaultEnv.VCAP_SERVICES.hana = [{
    name: container,
    label: "hana",
    tags: [
      "hana",
      "database",
      "relational"
    ],
    plan: "hdi-shared",
    credentials: {
      schema: container,
      password: passwordRT,
      hdi_password: passwordDT,
      port: options.hana.port,
      encrypt: encrypt,      
      db_hosts: [
        {
          port: options.hana.port,
          host: options.hana.host
        }
      ],
      host: options.hana.host,
      user: userRT,
      hdi_user: userDT
    }
  }];

  const fs = require('fs');
  fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), function (err) {
    if (err) {
      throw new Error(`default-env.json saving problem: ${JSON.stringify(err)}`);
    }
    console.log(bundle.getText("containerSaved"));
  });
}
