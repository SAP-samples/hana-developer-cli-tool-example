// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'triggers [schema] [trigger] [target]'
export const aliases = ['trig', 'listTriggers', 'ListTrigs', 'listtrigs', 'Listtrig', "listrig"]
export const describe = baseLite.bundle.getText("triggers")

export const builder = baseLite.getBuilder({
  trigger: {
    alias: ['t', 'Trigger'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("sequence")
  },
  target: {
    alias: ['to', 'Target'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("target")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {void}
 */
export async function handler (argv) {
  const base = await import('../utils/base.js')
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

/**
 * Get list of database triggers
 * @param {object} prompts - Input prompts with schema, trigger pattern, target, and limit
 * @returns {Promise<Array>} - Array of trigger objects
 */
export async function getTriggers(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getTriggers')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("trigger")}: ${prompts.trigger}, ${baseLite.bundle.getText("target")}: ${prompts.target}`)

    let results = await getTriggersInt(schema, prompts.trigger, prompts.target, db, prompts.limit)
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get triggers with filters
 * @param {string} schema - Schema name
 * @param {string} trigger - Trigger name pattern
 * @param {string} target - Target object name pattern
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of trigger objects
 */
async function getTriggersInt(schema, trigger, target, client, limit) {
  const base = await import('../utils/base.js')
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
  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }
  return await client.statementExecPromisified(await client.preparePromisified(query), [schema, trigger, target])
}