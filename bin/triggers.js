const base = require("../utils/base")

exports.command = 'triggers [schema] [trigger] [target]'
exports.aliases = ['trig', 'listTriggers', 'ListTrigs', 'listtrigs', 'Listtrig', "listrig"]
exports.describe = base.bundle.getText("triggers")

exports.builder = base.getBuilder({
  trigger: {
    alias: ['t', 'Trigger'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("sequence")
  },
  target: {
    alias: ['to', 'Target'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("target")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, getTriggers, {
    trigger: {
      description: base.bundle.getText("trigger"),
      type: 'string',
      required: true
    },
    target: {
      description: base.bundle.getText("target"),
      type: 'string',
      required: true
    },
    schema: {
      description: base.bundle.getText("schema"),
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

async function getTriggers(prompts) {
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const conn = require("../utils/connections")
    const db = new dbClass(await conn.createConnection(prompts))

    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("trigger")}: ${prompts.trigger}, ${base.bundle.getText("target")}: ${prompts.target}`)

    let results = await getTriggersInt(schema, prompts.trigger, prompts.target, db, prompts.limit)
    base.outputTable(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}

async function getTriggersInt(schema, trigger, target, client, limit) {
  const dbClass = require("sap-hdbext-promisfied")  
  trigger = dbClass.objectName(trigger)
  target = dbClass.objectName(target)

  let query =
    `SELECT SCHEMA_NAME, TRIGGER_NAME, OWNER_NAME, SUBJECT_TABLE_SCHEMA, SUBJECT_TABLE_NAME, TRIGGER_ACTION_TIME,
          TRIGGER_EVENT, TRIGGERED_ACTION_LEVEL
  FROM TRIGGERS
  WHERE SCHEMA_NAME LIKE ? 
    AND TRIGGER_NAME LIKE ? 
    AND SUBJECT_TABLE_NAME LIKE ?
  ORDER BY SCHEMA_NAME, TRIGGER_NAME `
  if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, trigger, target])
}