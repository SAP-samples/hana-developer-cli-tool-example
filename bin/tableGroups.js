// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'tableGroups [action] [groupName]'
export const aliases = ['tg', 'tablegroup', 'groups', 'groups-tables']
export const describe = baseLite.bundle.getText("tableGroups")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  action: {
    alias: ['a'],
    type: 'string',
    default: 'list',
    desc: baseLite.bundle.getText("tableGroupAction")
  },
  groupName: {
    alias: ['g', 'group'],
    type: 'string',
    desc: baseLite.bundle.getText("tableGroupName")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("tableGroupSchema")
  },
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("tableGroupTable")
  },
  type: {
    type: 'string',
    desc: 'Table group type'
  },
  subtype: {
    type: 'string',
    desc: 'Table group subtype'
  },
  matchSchema: {
    type: 'string',
    desc: 'Match schema pattern'
  },
  matchTable: {
    type: 'string',
    desc: 'Match table pattern'
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).wrap(160).example('hana-cli tableGroups --action list --schema MYSCHEMA', baseLite.bundle.getText('tableGroupsExample')).wrap(160).epilog(buildDocEpilogue('tableGroups', 'schema-tools', ['tables', 'objects']))

export let inputPrompts = {
  action: {
    description: baseLite.bundle.getText("tableGroupAction"),
    type: 'string',
    required: false
  },
  groupName: {
    description: baseLite.bundle.getText("tableGroupName"),
    type: 'string',
    required: false
  },
  schema: {
    description: baseLite.bundle.getText("tableGroupSchema"),
    type: 'string',
    required: false
  },
  table: {
    description: baseLite.bundle.getText("tableGroupTable"),
    type: 'string',
    required: false
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: false
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, handleTableGroups, inputPrompts)
}

/**
 * Route to appropriate table group action
 * @param {object} prompts - Input prompts with action and parameters
 * @returns {Promise<void>}
 */
export async function handleTableGroups(prompts) {
  const base = await import('../utils/base.js')
  base.debug('handleTableGroups')
  
  const action = (prompts.action || 'list').toLowerCase()
  
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()
    
    switch (action) {
      case 'list':
        await listTableGroups(db, prompts)
        break
      case 'create':
        await createTableGroupAction(db, prompts)
        break
      case 'drop':
        await dropTableGroupAction(db, prompts)
        break
      case 'add_table':
      case 'addtable':
        await addTableToGroup(db, prompts)
        break
      case 'remove_table':
      case 'removetable':
        await removeTableFromGroup(db, prompts)
        break
      case 'info':
        await tableGroupInfo(db, prompts)
        break
      default:
        base.output(`Unknown action: ${action}`)
        base.output('Available actions: list, create, drop, add_table, remove_table, info')
        break
    }
    
    base.end()
  } catch (error) {
    await base.error(error)
  }
}

/**
 * List all table groups in a schema
 * @param {object} db - Database client
 * @param {object} prompts - Prompts containing schema filter
 * @returns {Promise<void>}
 */
async function listTableGroups(db, prompts) {
  const base = await import('../utils/base.js')
  base.debug('listTableGroups')
  
  let schema = await base.dbClass.schemaCalc(prompts, db)
  base.output(base.bundle.getText("log.schemaIndex", [schema, 'table groups']))
  
  let query = `
    SELECT 
      TABLE_GROUP_SCHEMA as SCHEMA_NAME,
      TABLE_GROUP_NAME,
      TABLE_GROUP_TYPE,
      TABLE_GROUP_SUBTYPE,
      COMMENT
    FROM SYS.TABLE_GROUPS
    WHERE TABLE_GROUP_SCHEMA LIKE ?
  `
  
  const params = [schema]
  
  if (prompts.groupName && prompts.groupName !== "*") {
    const groupName = base.dbClass.objectName(prompts.groupName)
    query += ` AND TABLE_GROUP_NAME LIKE ?`
    params.push(groupName)
  } else {
    query += ` AND TABLE_GROUP_NAME LIKE '%'`
  }
  
  query += ` ORDER BY TABLE_GROUP_SCHEMA, TABLE_GROUP_NAME`
  
  const limit = base.validateLimit(prompts.limit || 200)
  if (limit && base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += ` LIMIT ${limit.toString()}`
  }
  
  const results = await db.statementExecPromisified(await db.preparePromisified(query), params)
  base.outputTableFancy(results)
}

/**
 * Create a new table group
 * @param {object} db - Database client
 * @param {object} prompts - Prompts with group definition
 * @returns {Promise<void>}
 */
async function createTableGroupAction(db, prompts) {
  const base = await import('../utils/base.js')
  base.debug('createTableGroupAction')
  
  if (!prompts.groupName) {
    base.output('Group name is required to create a table group')
    return
  }
  
  const groupName = base.dbClass.objectName(prompts.groupName)
  let createStmt = `CREATE TABLE GROUP ${groupName}`
  
  if (prompts.type) {
    createStmt += ` TYPE ${base.dbClass.objectName(prompts.type)}`
  }
  
  if (prompts.subtype) {
    createStmt += ` SUBTYPE ${base.dbClass.objectName(prompts.subtype)}`
  }
  
  base.output(`Executing: ${createStmt}`)
  
  try {
    await db.execPromisified(createStmt)
    base.output(`Table group ${groupName} created successfully`)
  } catch (error) {
    throw error
  }
}

/**
 * Drop a table group
 * @param {object} db - Database client
 * @param {object} prompts - Prompts with group name
 * @returns {Promise<void>}
 */
async function dropTableGroupAction(db, prompts) {
  const base = await import('../utils/base.js')
  base.debug('dropTableGroupAction')
  
  if (!prompts.groupName) {
    base.output('Group name is required to drop a table group')
    return
  }
  
  const groupName = base.dbClass.objectName(prompts.groupName)
  const dropStmt = `DROP TABLE GROUP ${groupName}`
  
  base.output(`Executing: ${dropStmt}`)
  
  try {
    await db.execPromisified(dropStmt)
    base.output(`Table group ${groupName} dropped successfully`)
  } catch (error) {
    throw error
  }
}

/**
 * Add a table to a table group
 * @param {object} db - Database client
 * @param {object} prompts - Prompts with group and table names
 * @returns {Promise<void>}
 */
async function addTableToGroup(db, prompts) {
  const base = await import('../utils/base.js')
  base.debug('addTableToGroup')
  
  if (!prompts.groupName) {
    base.output('Group name is required')
    return
  }
  if (!prompts.table) {
    base.output('Table name is required')
    return
  }
  
  const groupName = base.dbClass.objectName(prompts.groupName)
  const schema = await base.dbClass.schemaCalc(prompts, db)
  const tableName = base.dbClass.objectName(prompts.table)
  
  const alterStmt = `ALTER TABLE GROUP ${groupName} ADD TABLE ${schema}.${tableName}`
  
  base.output(`Executing: ${alterStmt}`)
  
  try {
    await db.execPromisified(alterStmt)
    base.output(`Table ${schema}.${tableName} added to group ${groupName}`)
  } catch (error) {
    throw error
  }
}

/**
 * Remove a table from a table group
 * @param {object} db - Database client
 * @param {object} prompts - Prompts with group and table names
 * @returns {Promise<void>}
 */
async function removeTableFromGroup(db, prompts) {
  const base = await import('../utils/base.js')
  base.debug('removeTableFromGroup')
  
  if (!prompts.groupName) {
    base.output('Group name is required')
    return
  }
  if (!prompts.table) {
    base.output('Table name is required')
    return
  }
  
  const groupName = base.dbClass.objectName(prompts.groupName)
  const schema = await base.dbClass.schemaCalc(prompts, db)
  const tableName = base.dbClass.objectName(prompts.table)
  
  const alterStmt = `ALTER TABLE GROUP ${groupName} REMOVE TABLE ${schema}.${tableName}`
  
  base.output(`Executing: ${alterStmt}`)
  
  try {
    await db.execPromisified(alterStmt)
    base.output(`Table ${schema}.${tableName} removed from group ${groupName}`)
  } catch (error) {
    throw error
  }
}

/**
 * Get information about a table group and its tables
 * @param {object} db - Database client
 * @param {object} prompts - Prompts with group name
 * @returns {Promise<void>}
 */
async function tableGroupInfo(db, prompts) {
  const base = await import('../utils/base.js')
  base.debug('tableGroupInfo')
  
  if (!prompts.groupName) {
    base.output('Group name is required for info action')
    return
  }
  
  const groupName = base.dbClass.objectName(prompts.groupName)
  let schema = await base.dbClass.schemaCalc(prompts, db)
  
  // Get table group info
  let infoQuery = `
    SELECT 
      TABLE_GROUP_SCHEMA,
      TABLE_GROUP_NAME,
      TABLE_GROUP_TYPE,
      TABLE_GROUP_SUBTYPE,
      COMMENT
    FROM SYS.TABLE_GROUPS
    WHERE TABLE_GROUP_SCHEMA LIKE ? AND TABLE_GROUP_NAME LIKE ?
  `
  
  const groupInfo = await db.statementExecPromisified(
    await db.preparePromisified(infoQuery),
    [schema, groupName]
  )
  
  if (groupInfo.length > 0) {
    base.output('--- Table Group Information ---')
    base.outputTableFancy(groupInfo)
  } else {
    base.output(`No table group found: ${schema}.${groupName}`)
    return
  }
  
  // Get tables in group
  let tablesQuery = `
    SELECT 
      TABLE_SCHEMA,
      TABLE_NAME
    FROM SYS.TABLE_GROUP_TABLES
    WHERE TABLE_GROUP_SCHEMA LIKE ? AND TABLE_GROUP_NAME LIKE ?
    ORDER BY TABLE_SCHEMA, TABLE_NAME
  `
  
  const tables = await db.statementExecPromisified(
    await db.preparePromisified(tablesQuery),
    [schema, groupName]
  )
  
  if (tables.length > 0) {
    base.output('')
    base.output('--- Tables in Group ---')
    base.outputTableFancy(tables)
  } else {
    base.output('No tables in this group')
  }
}