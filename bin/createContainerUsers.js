// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as conn from "../utils/connections.js"
import * as xsenv from '@sap/xsenv'

export const command = 'createContainerUsers [container]'
export const aliases = ['ccu', 'cContU']
export const describe = baseLite.bundle.getText("createContainerUsers")

export const builder = baseLite.getBuilder({
  container: {
    alias: ['c', 'Container'],
    type: 'string',
    desc: baseLite.bundle.getText("container")
  },
  save: {
    alias: ['s', 'Save'],
    desc: baseLite.bundle.getText("saveHDI"),
    type: 'boolean',
    default: true
  },
  encrypt: {
    alias: ['e', 'Encrypt', 'ssl'],
    desc: baseLite.bundle.getText("encrypt"),
    type: 'boolean',
    default: false
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, activate, {
    container: {
      description: base.bundle.getText("container"),
      required: true
    },
    save: {
      description: base.bundle.getText("saveHDI"),
      type: 'boolean',
      required: true
    },
    encrypt: {
      description: base.bundle.getText("encrypt"),
      type: 'boolean',
      required: true
    }
  })
}

export async function activate(prompts) {
  const base = await import('../utils/base.js')
  base.debug('activate')
  const { v4: uuidv4 } = base.require('uuid')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    let envFile = conn.resolveEnv()


    let passwordDT = uuidv4()
    passwordDT = passwordDT.replace(/-/g, "A")
    let passwordRT = uuidv4()
    passwordRT = passwordRT.replace(/-/g, "A")
    let user = uuidv4()
    user = user.replace(/-/g, "")
    let userDT = prompts.container + '_' + user + '_DT'
    userDT = userDT.toUpperCase()
    let userRT = prompts.container + '_' + user + '_RT'
    userRT = userRT.toUpperCase()

    let userGroup = await db.execSQL(
      `SELECT * FROM SYS.USERGROUPS WHERE USERGROUP_NAME = 'DEFAULT'`)
    let useGroup = false
    if (userGroup.length > 0) {
      useGroup = true
    }

    let results = await db.execSQL(
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
    EXEC 'CREATE USER ' || :userDT || ' PASSWORD "${passwordDT}" NO FORCE_FIRST_PASSWORD_CHANGE ${useGroup ? ` SET USERGROUP DEFAULT ` : ''}';
    EXEC 'CREATE USER ' || :userRT || ' PASSWORD "${passwordRT}" NO FORCE_FIRST_PASSWORD_CHANGE ${useGroup ? ` SET USERGROUP DEFAULT ` : ''}';
  
    COMMIT;

    PRIVILEGES = SELECT PRIVILEGE_NAME, OBJECT_NAME, PRINCIPAL_SCHEMA_NAME, (SELECT :userDT FROM DUMMY) AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_ADMIN_PRIVILEGES;
    CALL _SYS_DI.GRANT_CONTAINER_API_PRIVILEGES('${prompts.container}', :PRIVILEGES, :no_params, :return_code, :request_id, :MESSAGES); 
    select * from :MESSAGES;
  
    SCHEMA_PRIV = SELECT PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, (SELECT :userRT FROM DUMMY) AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_USER_PRIVILEGES;
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'INSERT' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;
  
    SCHEMA_PRIV = SELECT 'CREATE TEMPORARY TABLE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'DELETE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'EXECUTE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;    

    SCHEMA_PRIV = SELECT 'UPDATE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES; 

    SCHEMA_PRIV = SELECT 'SELECT CDS METADATA' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;  
    CALL _SYS_DI.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    EXEC 'GRANT  "${prompts.container}::access_role" TO ${userRT} ';
    EXEC 'GRANT  "${prompts.container}::external_privileges_role" TO ${userRT} ';    
  END;`)
    console.table(results)

    if (prompts.save) {
      xsenv.loadEnv(envFile)
      let options = xsenv.getServices({ hana: { tag: 'hana' }, })
      base.debug(options)
      await saveEnv(options, prompts.container, userDT, userRT, passwordDT, passwordRT, prompts.encrypt)
    }
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}


async function saveEnv(options, container, userDT, userRT, passwordDT, passwordRT, encrypt) {
  const base = await import('../utils/base.js')
  base.debug('saveEnv')
  //  let parts = options.serverNode.split(':');
  let defaultEnv = {}
  defaultEnv.TARGET_CONTAINER = container
  defaultEnv.VCAP_SERVICES = {}
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
  }]

  base.debug(defaultEnv)
  const {default:fs} = await import('fs')
  fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), (err) => {
    if (err) {
      throw new Error(`${baseLite.bundle.getText('errDefaultEnv')}: ${JSON.stringify(err)}`)
    }
    console.log(baseLite.bundle.getText("containerSaved"))
  })
}
