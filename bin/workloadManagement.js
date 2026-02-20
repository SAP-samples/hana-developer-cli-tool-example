// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'workloadManagement [schema] [group]'
export const aliases = ['wlm', 'workloads', 'workloadClass', 'workloadmgmt']
export const describe = baseLite.bundle.getText("workloadManagement")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  group: {
    alias: ['g'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("workloadClass")
  },
  workload: {
    alias: ['w'],
    type: 'string',
    desc: baseLite.bundle.getText("workloadClass")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  priority: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("workloadPriority")
  },
  activeOnly: {
    alias: ['a'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("workloadActiveOnly")
  },
  showViews: {
    alias: ['sv', 'views'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("workloadShowViews")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: baseLite.bundle.getText("limit")
  }
})).wrap(160).example(
  'hana-cli workloadManagement --showViews',
  baseLite.bundle.getText("workloadShowViews")
).epilog(buildDocEpilogue('workloadManagement', 'system-admin', ['status', 'longRunning', 'healthCheck']))

export let inputPrompts = {
  group: {
    description: baseLite.bundle.getText("workloadClass"),
    type: 'string',
    required: false
  },
  workload: {
    description: baseLite.bundle.getText("workloadClass"),
    type: 'string',
    required: false
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  activeOnly: {
    description: baseLite.bundle.getText("workloadActiveOnly"),
    type: 'boolean',
    required: false,
    ask: () => { return false }
  },
  showViews: {
    description: baseLite.bundle.getText("workloadShowViews"),
    type: 'boolean',
    required: false,
    ask: () => { return false }
  },
  limit: {
    description: baseLite.bundle.getText("limit"),
    type: 'number',
    required: true
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getWorkloadManagement, inputPrompts)
}

/**
 * Get workload management configuration from database
 * @param {object} prompts - Input prompts with schema, workload, and priority
 * @returns {Promise<Array>} - Array of workload objects
 */
export async function getWorkloadManagement(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getWorkloadManagement')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    const workloadName = prompts.group || prompts.workload
    base.output(base.bundle.getText("log.schemaIndex", [schema, workloadName]))

    let results = await getWorkloadManagementInt(
      schema,
      workloadName,
      prompts.priority,
      prompts.activeOnly,
      prompts.showViews,
      db,
      prompts.limit
    )
    base.outputTableFancy(results)
    base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}

/**
 * Internal function to get workload management configuration with filters
 * @param {string} schema - Schema name
 * @param {string} workload - Workload class name pattern
 * @param {string} priority - Priority filter (optional)
 * @param {boolean} activeOnly - Only show groups with active sessions
 * @param {boolean} showViews - Include available workload views and columns
 * @param {object} client - Database client
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of workload objects
 */
async function getWorkloadManagementInt(schema, workload, priority, activeOnly, showViews, client, limit) {
  const base = await import('../utils/base.js')
  limit = base.validateLimit(limit)
  base.debug(`getWorkloadManagementInt ${schema} ${workload} ${priority || ''} ${activeOnly ? 'activeOnly' : ''} ${showViews ? 'showViews' : ''} ${limit}`)
  workload = base.dbClass.objectName(workload)

  const views = await getWorkloadViews(client)
  if (views.length === 0) {
    const noViews = [{ INFO: 'No workload views found in SYS schema.' }]
    if (showViews) {
      return [...buildWorkloadViewsInfo([]), ...noViews]
    }
    return noViews
  }

  const viewInfo = await getWorkloadViewInfo(client, views)
  const configView = pickWorkloadView(viewInfo, WORKLOAD_CONFIG_COLUMNS)
  const runtimeView = pickWorkloadView(viewInfo, WORKLOAD_RUNTIME_COLUMNS)
  const mappingView = pickWorkloadView(viewInfo, WORKLOAD_MAPPING_COLUMNS)

  let configRows = []
  let runtimeRows = []
  let mappingRows = []

  if (activeOnly) {
    runtimeRows = await queryWorkloadView(runtimeView, schema, workload, priority, limit, client, WORKLOAD_RUNTIME_COLUMNS)
  } else {
    configRows = await queryWorkloadView(configView, schema, workload, priority, limit, client, WORKLOAD_CONFIG_COLUMNS)
    runtimeRows = await queryWorkloadView(runtimeView, schema, workload, priority, limit, client, WORKLOAD_RUNTIME_COLUMNS)
    mappingRows = await queryWorkloadView(mappingView, schema, workload, priority, limit, client, WORKLOAD_MAPPING_COLUMNS)
  }

  const merged = mergeWorkloadRows(configRows, runtimeRows, mappingRows)
  const filtered = filterActiveOnly(merged, activeOnly)
  const results = filtered.length === 0 ? buildWorkloadFallback(viewInfo) : filtered

  if (showViews) {
    return [...buildWorkloadViewsInfo(viewInfo), ...results]
  }

  return results
}

const WORKLOAD_CONFIG_COLUMNS = [
  'WORKLOAD_GROUP_NAME',
  'WORKLOAD_CLASS_NAME',
  'GROUP_NAME',
  'CLASS_NAME',
  'PRIORITY',
  'STATEMENT_MEMORY_LIMIT',
  'STATEMENT_TIMEOUT',
  'TOTAL_MEMORY_LIMIT',
  'TOTAL_CPU_LIMIT',
  'DESCRIPTION',
  'REMARKS'
]

const WORKLOAD_RUNTIME_COLUMNS = [
  'WORKLOAD_GROUP_NAME',
  'WORKLOAD_CLASS_NAME',
  'GROUP_NAME',
  'CLASS_NAME',
  'ACTIVE_SESSION_COUNT',
  'ACTIVE_SESSIONS',
  'TOTAL_EXECUTION_COUNT',
  'TOTAL_CPU_TIME',
  'TOTAL_MEMORY_SIZE',
  'LAST_EXECUTION_TIME'
]

const WORKLOAD_MAPPING_COLUMNS = [
  'WORKLOAD_GROUP_NAME',
  'WORKLOAD_CLASS_NAME',
  'GROUP_NAME',
  'CLASS_NAME',
  'USER_NAME',
  'APPLICATION_NAME',
  'CLIENT',
  'CLIENT_HOST',
  'CLIENT_IP'
]

function buildWorkloadFallback(viewInfo) {
  const viewSummary = summarizeWorkloadViews(viewInfo)
  return [{
    INFO: 'No workload groups found with current filters.',
    AVAILABLE_VIEWS: viewSummary.views,
    AVAILABLE_COLUMNS: viewSummary.columns
  }]
}

function buildWorkloadViewsInfo(viewInfo) {
  const viewSummary = summarizeWorkloadViews(viewInfo)
  return [{
    INFO: 'Available workload views and columns.',
    AVAILABLE_VIEWS: viewSummary.views,
    AVAILABLE_COLUMNS: viewSummary.columns
  }]
}

function summarizeWorkloadViews(viewInfo) {
  const viewNames = viewInfo.map(view => view.name)
  const columns = viewInfo.map(view => {
    const cols = Array.from(view.columns)
    const sample = cols.slice(0, 8).join(', ')
    const suffix = cols.length > 8 ? ', ...' : ''
    return `${view.name}: ${sample}${suffix}`
  })
  return {
    views: viewNames.length > 0 ? viewNames.join(', ') : '(none)',
    columns: columns.length > 0 ? columns.join(' | ') : '(none)'
  }
}

async function getWorkloadViews(client) {
  const query = `SELECT TABLE_NAME FROM SYS.TABLES WHERE SCHEMA_NAME = 'SYS' AND (TABLE_NAME LIKE 'WORKLOAD%' OR TABLE_NAME LIKE 'M_WORKLOAD%')`
  const results = await client.statementExecPromisified(await client.preparePromisified(query), [])
  return results.map(row => row.TABLE_NAME)
}

async function getWorkloadViewInfo(client, views) {
  const info = []
  for (const viewName of views) {
    const columns = await getViewColumns(client, viewName)
    const nameColumn = getWorkloadNameColumn(columns)
    info.push({
      name: viewName,
      columns,
      nameColumn
    })
  }
  return info
}

async function getViewColumns(client, viewName) {
  const query = `SELECT COLUMN_NAME FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME = 'SYS' AND TABLE_NAME = ?`
  const results = await client.statementExecPromisified(await client.preparePromisified(query), [viewName])
  return new Set(results.map(row => row.COLUMN_NAME))
}

function getWorkloadNameColumn(columns) {
  const candidates = [
    'WORKLOAD_GROUP_NAME',
    'WORKLOAD_CLASS_NAME',
    'GROUP_NAME',
    'CLASS_NAME',
    'WORKLOAD_NAME',
    'NAME'
  ]
  return candidates.find(candidate => columns.has(candidate))
}

function pickWorkloadView(viewInfo, preferredColumns) {
  return viewInfo.find(view => view.nameColumn && preferredColumns.some(column => view.columns.has(column)))
}

function buildSelectColumns(view, preferredColumns) {
  if (!view) {
    return []
  }
  const columns = preferredColumns.filter(column => view.columns.has(column) && column !== view.nameColumn)
  return [`${view.nameColumn} AS WORKLOAD_NAME`, ...columns]
}

async function queryWorkloadView(view, schema, workload, priority, limit, client, preferredColumns) {
  if (!view) {
    return []
  }
  const base = await import('../utils/base.js')
  const selectColumns = buildSelectColumns(view, preferredColumns)
  if (selectColumns.length === 0) {
    return []
  }

  let query = `SELECT ${selectColumns.join(', ')} FROM SYS.${view.name} WHERE 1=1 `
  const params = []

  if (view.columns.has('SCHEMA_NAME')) {
    query += `AND SCHEMA_NAME LIKE ? `
    params.push(schema)
  }

  if (workload && workload !== '*') {
    query += `AND ${view.nameColumn} LIKE ? `
    params.push(workload)
  }

  if (priority && view.columns.has('PRIORITY')) {
    query += `AND PRIORITY = ? `
    params.push(priority)
  }

  query += `ORDER BY ${view.nameColumn} `

  if (limit || base.sqlInjectionUtils.isAcceptableParameter(limit.toString())) {
    query += `LIMIT ${limit.toString()}`
  }

  return await client.statementExecPromisified(await client.preparePromisified(query), params)
}

function mergeWorkloadRows(configRows, runtimeRows, mappingRows) {
  const byName = new Map()

  const upsert = (row) => {
    if (!row || !row.WORKLOAD_NAME) {
      return
    }
    if (!byName.has(row.WORKLOAD_NAME)) {
      byName.set(row.WORKLOAD_NAME, { WORKLOAD_NAME: row.WORKLOAD_NAME })
    }
    const entry = byName.get(row.WORKLOAD_NAME)
    Object.keys(row).forEach((key) => {
      if (key !== 'WORKLOAD_NAME') {
        entry[key] = row[key]
      }
    })
  }

  configRows.forEach(upsert)
  runtimeRows.forEach(upsert)

  if (mappingRows.length > 0) {
    const mappingByName = new Map()
    mappingRows.forEach(row => {
      if (!row.WORKLOAD_NAME) {
        return
      }
      if (!mappingByName.has(row.WORKLOAD_NAME)) {
        mappingByName.set(row.WORKLOAD_NAME, {
          users: new Set(),
          apps: new Set(),
          clients: new Set(),
          hosts: new Set(),
          ips: new Set()
        })
      }
      const bucket = mappingByName.get(row.WORKLOAD_NAME)
      if (row.USER_NAME) bucket.users.add(row.USER_NAME)
      if (row.APPLICATION_NAME) bucket.apps.add(row.APPLICATION_NAME)
      if (row.CLIENT) bucket.clients.add(row.CLIENT)
      if (row.CLIENT_HOST) bucket.hosts.add(row.CLIENT_HOST)
      if (row.CLIENT_IP) bucket.ips.add(row.CLIENT_IP)
    })

    mappingByName.forEach((value, name) => {
      if (!byName.has(name)) {
        byName.set(name, { WORKLOAD_NAME: name })
      }
      const entry = byName.get(name)
      if (value.users.size > 0) entry.MAPPED_USERS = Array.from(value.users).join(', ')
      if (value.apps.size > 0) entry.MAPPED_APPLICATIONS = Array.from(value.apps).join(', ')
      if (value.clients.size > 0) entry.MAPPED_CLIENTS = Array.from(value.clients).join(', ')
      if (value.hosts.size > 0) entry.MAPPED_HOSTS = Array.from(value.hosts).join(', ')
      if (value.ips.size > 0) entry.MAPPED_IPS = Array.from(value.ips).join(', ')
    })
  }

  return Array.from(byName.values())
}

function filterActiveOnly(rows, activeOnly) {
  if (!activeOnly) {
    return rows
  }
  return rows.filter(row => {
    const active = getActiveCount(row)
    return typeof active === 'number' && active > 0
  })
}

function getActiveCount(row) {
  if (row.ACTIVE_SESSION_COUNT !== undefined) {
    return Number(row.ACTIVE_SESSION_COUNT)
  }
  if (row.ACTIVE_SESSIONS !== undefined) {
    return Number(row.ACTIVE_SESSIONS)
  }
  return undefined
}
