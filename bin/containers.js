const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'containers [containerGroup] [container]';
exports.aliases = ['cont', 'listContainers', 'listcontainers'];
exports.describe = bundle.getText("containers");


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
    default: "*",
    desc: bundle.getText("container")
  },
  containerGroup: {
    alias: ['g', 'Group', 'group', 'containergroup'],
    type: 'string',
    default: '*',
    desc: bundle.getText("containerGroup")
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
      container: {
        description: bundle.getText("container"),
        type: 'string',
        required: true
      },
      containerGroup: {
        description: bundle.getText("containerGroup"),
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
    getContainers(result);
  });
}


async function getContainers(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  console.log(`Group: ${result.containerGroup}, Container: ${result.container}`);

  let results = await getContainersInt(result.containerGroup, result.container, db, result.limit);
  console.table(results);

  await global.__spinner.stop()
  return;
}

async function getContainersInt(containerGroup, container, client, limit){

  let query =
    `SELECT A.CONTAINER_NAME, A.CONTAINER_GROUP_NAME, B.SCHEMA_NAME, A.CREATE_USER_NAME, A.CREATE_TIMESTAMP_UTC
        FROM ( _SYS_DI.M_ALL_CONTAINERS AS A
               INNER JOIN _SYS_DI.M_ALL_CONTAINER_SCHEMAS AS B
               ON ( A.CONTAINER_NAME = B.CONTAINER_NAME 
               AND  B.SCHEMA_TYPE = 'com.sap.hana.runtime.db.target/*' ) )
         WHERE A.CONTAINER_NAME LIKE ? 
           AND A.CONTAINER_GROUP_NAME LIKE ?
         ORDER BY A.CONTAINER_NAME `;
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [dbClass.objectName(container), dbClass.objectName(containerGroup)]);
}

