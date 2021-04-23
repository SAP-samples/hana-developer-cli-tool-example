const base = require("../utils/base")

exports.command = 'containers [containerGroup] [container]'
exports.aliases = ['cont', 'listContainers', 'listcontainers']
exports.describe = base.bundle.getText("containers")

exports.builder = base.getBuilder({
  container: {
    alias: ['c', 'Container'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("container")
  },
  containerGroup: {
    alias: ['g', 'Group', 'group', 'containergroup'],
    type: 'string',
    default: '*',
    desc: base.bundle.getText("containerGroup")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, getContainers, {
    container: {
      description: base.bundle.getText("container"),
      type: 'string',
      required: true
    },
    containerGroup: {
      description: base.bundle.getText("containerGroup"),
      type: 'string',
      required: true
    },
    limit: {
      description: base.bundle.getText("limit"),
      type: 'number',
      required: true
    }
  })
}

async function getContainers(prompts) {

  try {
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    base.debug(`${base.bundle.getText("containerGroup")}: ${prompts.containerGroup}, ${base.bundle.getText("container")}: ${prompts.container}`)

    let results = await getContainersInt(prompts.containerGroup, prompts.container, db, prompts.limit)
    console.table(results)

    return base.end()
  } catch (error) {
    base.error(error)
  }
}

async function getContainersInt(containerGroup, container, client, limit) {
  const dbClass = require("sap-hdbext-promisfied")
  let query =
    `SELECT A.CONTAINER_NAME, A.CONTAINER_GROUP_NAME, B.SCHEMA_NAME, A.CREATE_USER_NAME, A.CREATE_TIMESTAMP_UTC
        FROM ( _SYS_DI.M_ALL_CONTAINERS AS A
               INNER JOIN _SYS_DI.M_ALL_CONTAINER_SCHEMAS AS B
               ON ( A.CONTAINER_NAME = B.CONTAINER_NAME 
               AND  B.SCHEMA_TYPE = 'com.sap.hana.runtime.db.target/*' ) )
         WHERE A.CONTAINER_NAME LIKE ? 
           AND A.CONTAINER_GROUP_NAME LIKE ?
         ORDER BY A.CONTAINER_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [dbClass.objectName(container), dbClass.objectName(containerGroup)])
}

