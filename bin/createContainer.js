// @ts-check
import * as base from '../utils/base.js'
import * as conn from "../utils/connections.js"
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as xsenv from '@sap/xsenv'

export const command = 'createContainer [container] [group]'
export const aliases = ['cc', 'cCont']
export const describe = base.bundle.getText("createContainer")

export const builder = base.getBuilder({
  container: {
    alias: ['c', 'Container'],
    type: 'string',
    desc: base.bundle.getText("container")
  },
  group: {
    alias: ['g', 'Group'],
    type: 'string',
    default: '',
    desc: base.bundle.getText("group")
  },
  save: {
    alias: ['s', 'Save'],
    desc: base.bundle.getText("saveHDI"),
    type: 'boolean',
    default: true
  },
  encrypt: {
    alias: ['e', 'Encrypt', 'ssl'],
    desc: base.bundle.getText("encrypt"),
    type: 'boolean',
    default: false
  }
})

export function handler (argv) {
  base.promptHandler(argv, activate, {
    container: {
      description: base.bundle.getText("container"),
      required: true
    },
    group: {
      description: base.bundle.getText("group"),
      required: false
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
  base.debug('activate')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let envFile = conn.resolveEnv()

    let apiSchema = ''
    if (prompts.group.length == 0)
      apiSchema = '_SYS_DI'
    else
      apiSchema = '_SYS_DI#' + prompts.group

    let rolePrefix = ''
    if (prompts.group.length == 0)
      rolePrefix = prompts.container
    else
      rolePrefix = prompts.group + '::' + prompts.container

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

    let results = await db.execSQL(
      `CALL ${apiSchema}.CREATE_CONTAINER('${prompts.container}', _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`)
    console.table(results)

    //SCHEMA_PRIV = SELECT PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, (SELECT :userRT FROM DUMMY) AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_USER_PRIVILEGES;

    let userGroup = await db.execSQL(
      `SELECT * FROM SYS.USERGROUPS WHERE USERGROUP_NAME = 'DEFAULT'`)
    let useGroup = false
    if (userGroup.length > 0) {
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
    EXEC 'CREATE USER ' || :userDT || ' PASSWORD "${passwordDT}" NO FORCE_FIRST_PASSWORD_CHANGE ${useGroup ? ` SET USERGROUP DEFAULT ` : ''}';
    EXEC 'CREATE USER ' || :userRT || ' PASSWORD "${passwordRT}" NO FORCE_FIRST_PASSWORD_CHANGE ${useGroup ? ` SET USERGROUP DEFAULT ` : ''}';

    COMMIT;

    PRIVILEGES = SELECT PRIVILEGE_NAME, OBJECT_NAME, PRINCIPAL_SCHEMA_NAME, (SELECT :userDT FROM DUMMY) AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_ADMIN_PRIVILEGES;
    CALL ${apiSchema}.GRANT_CONTAINER_API_PRIVILEGES('${prompts.container}', :PRIVILEGES, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, (SELECT :userRT FROM DUMMY) AS PRINCIPAL_NAME FROM _SYS_DI.T_DEFAULT_CONTAINER_USER_PRIVILEGES;
    CALL ${apiSchema}.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'INSERT' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;
    CALL ${apiSchema}.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'CREATE TEMPORARY TABLE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;
    CALL ${apiSchema}.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'DELETE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;
    CALL ${apiSchema}.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'EXECUTE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;
    CALL ${apiSchema}.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'UPDATE' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;
    CALL ${apiSchema}.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    SCHEMA_PRIV = SELECT 'SELECT CDS METADATA' AS PRIVILEGE_NAME, '' AS PRINCIPAL_SCHEMA_NAME, :userRT AS PRINCIPAL_NAME FROM DUMMY;
    CALL ${apiSchema}.GRANT_CONTAINER_SCHEMA_PRIVILEGES('${prompts.container}', :SCHEMA_PRIV, :no_params, :return_code, :request_id, :MESSAGES);
    select * from :MESSAGES;

    default = SELECT * FROM _SYS_DI.T_DEFAULT_LIBRARIES;
    CALL ${apiSchema}.CONFIGURE_LIBRARIES('${prompts.container}', :default, :no_params, :return_code, :request_id, :MESSAGES);
    SELECT :userDT as "Object Owner", :userRT as "Application User" from DUMMY;

    EXEC 'CREATE ROLE "${rolePrefix}::access_role"';
    EXEC 'CREATE ROLE "${rolePrefix}::external_privileges_role"';

    EXEC 'GRANT  "${rolePrefix}::access_role" TO ${userRT} ';
    EXEC 'GRANT  "${rolePrefix}::external_privileges_role" TO ${userRT} ';
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
    base.error(error)
  }
}


export async function saveEnv(options, container, userDT, userRT, passwordDT, passwordRT, encrypt) {
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
  fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), (err) => {
    if (err) {
      throw new Error(`${base.bundle.getText('errDefaultEnv')}: ${JSON.stringify(err)}`)
    }
    console.log(base.bundle.getText("containerSaved"))
  })
}
