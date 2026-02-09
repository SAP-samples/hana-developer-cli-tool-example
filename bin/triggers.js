// @ts-check
import * as base from '../utils/base.js'

export const command = 'triggers [schema] [trigger] [target]'
export const aliases = ['trig', 'listTriggers', 'ListTrigs', 'listtrigs', 'Listtrig', "listrig"]
export const describe = base.bundle.getText("triggers")

export const builder = base.getBuilder({
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

export function handler (argv) {
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

export async function getTriggers(prompts) {
  base.debug('getTriggers')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("trigger")}: ${prompts.trigger}, ${base.bundle.getText("target")}: ${prompts.target}`)

    let results = await getTriggersInt(schema, prompts.trigger, prompts.target, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

async function getTriggersInt(schema, trigger, target, client, limit) {
  base.debug(`getTriggersInt ${schema} ${trigger} ${target} ${limit}`)
  trigger = base.dbClass.objectName(trigger)
  target = base.dbClass.objectName(target)

  let query =
    `SELECT SCHEMA_NAME, TRIGGER_NAME, OWNER_NAME, SUBJECT_TABLE_SCHEMA, SUBJECT_TABLE_NAME, TRIGGER_ACTION_TIME,
          TRIGGER_EVENT, TRIGGERED_ACTION_LEVEL
  FROM TRIGGERS
  WHERE SCHEMA_NAME LIKE ? 
    AND TRIGGER_NAME LIKE ? 
    AND SUBJECT_TABLE_NAME LIKE ?
  ORDER BY SCHEMA_NAME, TRIGGER_NAME `
  if (limit | base.sqlInjectionUtils.isAcceptableParameter(limit)) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, trigger, target])
}