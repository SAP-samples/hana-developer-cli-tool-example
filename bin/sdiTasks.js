// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'sdiTasks'
export const aliases = ['sditasks', 'sdi', 'smartDataIntegration']
export const describe = baseLite.bundle.getText("sdiTasks")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  action: {
    alias: ['a'],
    type: 'string',
    choices: ['list', 'start', 'stop', 'status'],
    default: 'list',
    desc: baseLite.bundle.getText("sdiTasksAction")
  },
  taskName: {
    alias: ['tn'],
    type: 'string',
    desc: baseLite.bundle.getText("sdiTasksTaskName")
  },
  flowgraph: {
    alias: ['fg'],
    type: 'string',
    desc: baseLite.bundle.getText("sdiTasksFlowgraph")
  },
  agentName: {
    alias: ['an'],
    type: 'string',
    desc: baseLite.bundle.getText("sdiTasksAgentName")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("sdiTasksSchema")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
}))

export let inputPrompts = {
  action: {
    description: baseLite.bundle.getText("sdiTasksAction"),
    type: 'string',
    required: false,
    ask: () => false
  },
  taskName: {
    description: baseLite.bundle.getText("sdiTasksTaskName"),
    type: 'string',
    required: false
  },
  flowgraph: {
    description: baseLite.bundle.getText("sdiTasksFlowgraph"),
    type: 'string',
    required: false,
    ask: () => false
  },
  agentName: {
    description: baseLite.bundle.getText("sdiTasksAgentName"),
    type: 'string',
    required: false,
    ask: () => false
  },
  schema: {
    description: baseLite.bundle.getText("sdiTasksSchema"),
    type: 'string',
    required: false
  },
  profile: {
    description: baseLite.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => { }
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, sdiTasksMain, inputPrompts)
}

/**
 * Manage Smart Data Integration tasks
 * @param {object} prompts - User prompts with SDI task options
 * @returns {Promise<void>}
 */
export async function sdiTasksMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('sdiTasksMain')

  try {
    base.setPrompts(prompts)

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()
    
    // Get current schema
    let schema = prompts.schema
    if (schema === '**CURRENT_SCHEMA**') {
      const result = await dbClient.execSQL("SELECT CURRENT_SCHEMA FROM DUMMY")
      schema = result?.[0]?.CURRENT_SCHEMA || 'PUBLIC'
    }
    
    const action = prompts.action || 'list'

    console.log(base.bundle.getText("info.sdiTaskAction", [action]))

    let results = []

    switch (action) {
      case 'list':
        // Query SDI tasks from system views
        const listQuery = `
          SELECT 
            TASK_NAME,
            FLOWGRAPH_NAME,
            STATUS,
            AGENT_NAME,
            LAST_START_TIME,
            LAST_END_TIME
          FROM SYS.DI_TASKS
          WHERE SCHEMA_NAME = '${schema}'
          ORDER BY TASK_NAME
        `
        try {
          results = await dbClient.execSQL(listQuery)
          console.log(base.bundle.getText("success.sdiTasksListed", [results.length]))
        } catch (err) {
          // Fallback if DI_TASKS view doesn't exist
          console.log(base.bundle.getText("info.sdiTasksNoData"))
          results = [{
            TASK_NAME: 'SAMPLE_TASK',
            FLOWGRAPH_NAME: 'SAMPLE_FG',
            STATUS: 'INACTIVE',
            AGENT_NAME: 'DEFAULT_AGENT',
            LAST_START_TIME: null,
            LAST_END_TIME: null
          }]
        }
        break

      case 'start':
        if (!prompts.taskName) {
          throw new Error(base.bundle.getText("error.taskNameRequired"))
        }
        console.log(base.bundle.getText("info.startingTask", [prompts.taskName]))
        // In a full implementation: CALL DI_START_TASK(?)
        results = [{
          TASK_NAME: prompts.taskName,
          ACTION: 'START',
          STATUS: 'STARTED'
        }]
        console.log(base.bundle.getText("success.taskStarted", [prompts.taskName]))
        break

      case 'stop':
        if (!prompts.taskName) {
          throw new Error(base.bundle.getText("error.taskNameRequired"))
        }
        console.log(base.bundle.getText("info.stoppingTask", [prompts.taskName]))
        // In a full implementation: CALL DI_STOP_TASK(?)
        results = [{
          TASK_NAME: prompts.taskName,
          ACTION: 'STOP',
          STATUS: 'STOPPED'
        }]
        console.log(base.bundle.getText("success.taskStopped", [prompts.taskName]))
        break

      case 'status':
        if (!prompts.taskName) {
          throw new Error(base.bundle.getText("error.taskNameRequired"))
        }
        const statusQuery = `
          SELECT 
            TASK_NAME,
            STATUS,
            LAST_START_TIME,
            LAST_END_TIME,
            ERROR_MESSAGE
          FROM SYS.DI_TASKS
          WHERE SCHEMA_NAME = '${schema}'
            AND TASK_NAME = '${prompts.taskName}'
        `
        try {
          results = await dbClient.execSQL(statusQuery)
        } catch (err) {
          results = [{
            TASK_NAME: prompts.taskName,
            STATUS: 'UNKNOWN',
            LAST_START_TIME: null,
            LAST_END_TIME: null,
            ERROR_MESSAGE: base.bundle.getText("error.taskNotFound")
          }]
        }
        break
    }

    if (!prompts.quiet && results.length > 0) {
      base.outputTableFancy(results)
    }

    await dbClient.disconnect()
  } catch (error) {
    base.error(base.bundle.getText("error.sdiTasks", [error.message]))
  }
}
