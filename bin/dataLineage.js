// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'dataLineage'
export const aliases = ['lineage', 'dataFlow', 'traceLineage']
export const describe = baseLite.bundle.getText("dataLineage")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("dataLineageTable")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("dataLineageSchema")
  },
  direction: {
    alias: ['d'],
    choices: ["upstream", "downstream", "bidirectional"],
    default: "upstream",
    type: 'string',
    desc: baseLite.bundle.getText("dataLineageDirection")
  },
  depth: {
    alias: ['dp'],
    type: 'number',
    default: 5,
    desc: baseLite.bundle.getText("dataLineageDepth")
  },
  includeTransformations: {
    alias: ['it'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("dataLineageIncludeTransformations")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("dataLineageOutput")
  },
  format: {
    alias: ['f'],
    choices: ["json", "csv", "graphml", "summary"],
    default: "summary",
    type: 'string',
    desc: baseLite.bundle.getText("dataLineageFormat")
  },
  timeout: {
    alias: ['to'],
    type: 'number',
    default: 3600,
    desc: baseLite.bundle.getText("dataLineageTimeout")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).example('hana-cli dataLineage --table myTable --depth 3', baseLite.bundle.getText("dataLineageExample"))

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("dataLineageTable"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("dataLineageSchema"),
    type: 'string',
    required: false
  },
  direction: {
    description: baseLite.bundle.getText("dataLineageDirection"),
    type: 'string',
    required: false,
    ask: () => false
  },
  depth: {
    description: baseLite.bundle.getText("dataLineageDepth"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("dataLineageOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  format: {
    description: baseLite.bundle.getText("dataLineageFormat"),
    type: 'string',
    required: false,
    ask: () => false
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
  base.promptHandler(argv, dataLineageMain, inputPrompts)
}

/**
 * Trace data lineage and transformations
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function dataLineageMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('dataLineageMain')

  try {
    base.setPrompts(prompts)

    // Set operation timeout
    const timeoutHandle = prompts.timeout > 0
      ? setTimeout(() => process.exit(1), prompts.timeout * 1000)
      : null

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get schema if not provided
    let schema = prompts.schema

    if (!schema && dbKind !== 'sqlite') {
      schema = await getCurrentSchema(dbClient, dbKind)
    }

    const table = prompts.table
    const depth = prompts.depth || 5
    const direction = prompts.direction || 'upstream'

    console.log(baseLite.bundle.getText("info.startingLineageTrace", [table, direction]))

    // Get lineage information
    const lineage = await traceLineage(
      dbClient,
      schema,
      table,
      direction,
      depth,
      dbKind
    )

    // Output results
    if (prompts.output) {
      await outputResults(prompts.output, lineage, prompts.format)
    } else {
      displayResults(lineage, prompts.format)
    }

    console.log(baseLite.bundle.getText("success.lineageTraceComplete", [
      lineage.sourceCount,
      lineage.transformationCount,
      lineage.targetCount
    ]))

    await dbClient.disconnect()
    if (timeoutHandle) clearTimeout(timeoutHandle)

  } catch (error) {
    console.error(baseLite.bundle.getText("error.dataLineage", [error.message]))
    base.debug(error)
    throw error
  }
}

/**
 * Get current schema
 * @param {object} dbClient - Database client
 * @param {string} dbKind - Database kind
 * @returns {Promise<string>}
 */
async function getCurrentSchema(dbClient, dbKind) {
  if (dbKind === 'hana') {
    const result = await dbClient.execSQL('SELECT CURRENT_SCHEMA FROM DUMMY')
    return result[0]?.CURRENT_SCHEMA || 'PUBLIC'
  } else if (dbKind === 'postgres') {
    const result = await dbClient.execSQL('SELECT current_schema()')
    return result[0]?.current_schema || 'public'
  }
  return 'public'
}

/**
 * Trace data lineage
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {string} direction - Lineage direction (upstream, downstream, bidirectional)
 * @param {number} depth - Lineage depth
 * @param {string} dbKind - Database kind
 * @returns {Promise<object>}
 */
async function traceLineage(dbClient, schema, table, direction, depth, dbKind) {
  const lineage = {
    rootTable: table,
    direction: direction,
    depth: depth,
    sourceCount: 0,
    targetCount: 0,
    transformationCount: 0,
    nodes: [],
    edges: [],
    transformations: []
  }

  const visited = new Set()
  const queue = []

  // Add root node
  const rootNode = {
    id: `${schema}.${table}`,
    name: table,
    schema: schema,
    type: 'table',
    level: 0
  }

  lineage.nodes.push(rootNode)
  visited.add(rootNode.id)
  queue.push({ node: rootNode, level: 0 })

  while (queue.length > 0 && lineage.nodes.length < 100) {
    const current = queue.shift()
    if (current.level >= depth) continue

    try {
      if (direction === 'upstream' || direction === 'bidirectional') {
        // Find source tables
        const sources = await getSourceTables(dbClient, schema, table, dbKind)
        for (const source of sources) {
          const sourceNodeId = `${source.schema}.${source.name}`
          if (!visited.has(sourceNodeId)) {
            const sourceNode = {
              id: sourceNodeId,
              name: source.name,
              schema: source.schema,
              type: 'table',
              level: current.level + 1
            }
            lineage.nodes.push(sourceNode)
            visited.add(sourceNodeId)
            lineage.edges.push({
              source: sourceNodeId,
              target: current.node.id,
              type: 'data_flow',
              label: source.joinType || 'join'
            })
            queue.push({ node: sourceNode, level: current.level + 1 })
            lineage.sourceCount++
          }
        }

        // Find views/transformations
        const transforms = await getTransformations(dbClient, schema, table, dbKind)
        for (const transform of transforms) {
          lineage.transformations.push({
            source: table,
            transformation: transform.name,
            type: transform.type,
            definition: transform.definition
          })
          lineage.transformationCount++
        }
      }

      if (direction === 'downstream' || direction === 'bidirectional') {
        // Find target tables
        const targets = await getTargetTables(dbClient, schema, table, dbKind)
        for (const target of targets) {
          const targetNodeId = `${target.schema}.${target.name}`
          if (!visited.has(targetNodeId)) {
            const targetNode = {
              id: targetNodeId,
              name: target.name,
              schema: target.schema,
              type: 'table',
              level: current.level + 1
            }
            lineage.nodes.push(targetNode)
            visited.add(targetNodeId)
            lineage.edges.push({
              source: current.node.id,
              target: targetNodeId,
              type: 'data_flow',
              label: 'depends_on'
            })
            queue.push({ node: targetNode, level: current.level + 1 })
            lineage.targetCount++
          }
        }
      }
    } catch (err) {
      baseLite.debug(`Error tracing lineage: ${err.message}`)
    }
  }

  return lineage
}

/**
 * Get source tables (upstream dependencies)
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array<object>>}
 */
async function getSourceTables(dbClient, schema, table, dbKind) {
  const sources = []

  if (dbKind === 'hana') {
    try {
      const query = `
        SELECT DISTINCT 
          DEPENDENT_SCHEMA_NAME AS schema_name,
          DEPENDENT_OBJECT_NAME AS table_name
        FROM SYS.OBJECT_DEPENDENCIES
        WHERE BASE_SCHEMA_NAME = ?
          AND BASE_OBJECT_NAME = ?
          AND BASE_OBJECT_NAME != DEPENDENT_OBJECT_NAME
        LIMIT 50
      `
      const result = await dbClient.execSQL(query, [schema || 'PUBLIC', table.toUpperCase()])
      return result.map(r => ({
        name: r.table_name,
        schema: r.schema_name,
        joinType: 'reference'
      }))
    } catch (err) {
      baseLite.debug(`Error getting source tables: ${err.message}`)
    }
  } else if (dbKind === 'postgres') {
    try {
      const query = `
        SELECT DISTINCT 
          t.table_schema,
          t.table_name
        FROM information_schema.tables t
        WHERE t.table_schema = ?
        LIMIT 50
      `
      const result = await dbClient.execSQL(query, [schema || 'public'])
      return result.map(r => ({
        name: r.table_name,
        schema: r.table_schema,
        joinType: 'reference'
      }))
    } catch (err) {
      baseLite.debug(`Error getting source tables: ${err.message}`)
    }
  }

  return sources
}

/**
 * Get target tables (downstream dependencies)
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array<object>>}
 */
async function getTargetTables(dbClient, schema, table, dbKind) {
  const targets = []

  if (dbKind === 'hana') {
    try {
      const query = `
        SELECT DISTINCT 
          BASE_SCHEMA_NAME AS schema_name,
          BASE_OBJECT_NAME AS table_name
        FROM SYS.OBJECT_DEPENDENCIES
        WHERE DEPENDENT_SCHEMA_NAME = ?
          AND DEPENDENT_OBJECT_NAME = ?
          AND BASE_OBJECT_NAME != DEPENDENT_OBJECT_NAME
        LIMIT 50
      `
      const result = await dbClient.execSQL(query, [schema || 'PUBLIC', table.toUpperCase()])
      return result.map(r => ({
        name: r.table_name,
        schema: r.schema_name,
        joinType: 'reference'
      }))
    } catch (err) {
      baseLite.debug(`Error getting target tables: ${err.message}`)
    }
  } else if (dbKind === 'postgres') {
    try {
      const query = `
        SELECT DISTINCT 
          t.table_schema,
          t.table_name
        FROM information_schema.tables t
        WHERE t.table_schema = ?
        LIMIT 50
      `
      const result = await dbClient.execSQL(query, [schema || 'public'])
      return result.map(r => ({
        name: r.table_name,
        schema: r.table_schema,
        joinType: 'reference'
      }))
    } catch (err) {
      baseLite.debug(`Error getting target tables: ${err.message}`)
    }
  }

  return targets
}

/**
 * Get transformations (views, procedures, functions)
 * @param {object} dbClient - Database client
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array<object>>}
 */
async function getTransformations(dbClient, schema, table, dbKind) {
  const transformations = []

  if (dbKind === 'hana') {
    try {
      // Get views that reference this table
      const query = `
        SELECT 
          VIEW_NAME,
          VIEW_DEFINITION,
          'VIEW' AS type
        FROM SYS.VIEWS
        WHERE SCHEMA_NAME = ?
          AND VIEW_DEFINITION LIKE ?
        LIMIT 50
      `
      const result = await dbClient.execSQL(query, [
        schema || 'PUBLIC',
        `%${table.toUpperCase()}%`
      ])
      return result.map(r => ({
        name: r.VIEW_NAME,
        type: r.type,
        definition: r.VIEW_DEFINITION
      }))
    } catch (err) {
      baseLite.debug(`Error getting transformations: ${err.message}`)
    }
  }

  return transformations
}

/**
 * Format qualified table name
 * @param {string|null} schema - Schema name
 * @param {string} table - Table name
 * @returns {string}
 */
function formatQualifiedName(schema, table) {
  if (schema) {
    return `"${schema}"."${table}"`
  }
  return `"${table}"`
}

/**
 * Output results to file
 * @param {string} filePath - Output file path
 * @param {object} lineage - Lineage data
 * @param {string} format - Output format
 * @returns {Promise<void>}
 */
async function outputResults(filePath, lineage, format) {
  const fsModule = await import('fs')
  const fs = fsModule.promises

  let content

  if (format === 'json') {
    content = JSON.stringify(lineage, null, 2)
  } else if (format === 'csv') {
    content = 'Source,Target,Type,Label\n'
    for (const edge of lineage.edges) {
      content += `"${edge.source}","${edge.target}","${edge.type}","${edge.label}"\n`
    }
  } else if (format === 'graphml') {
    content = generateGraphML(lineage)
  } else {
    content = formatSummaryReport(lineage)
  }

  await fs.writeFile(filePath, content)
}

/**
 * Generate GraphML format for lineage
 * @param {object} lineage - Lineage data
 * @returns {string}
 */
function generateGraphML(lineage) {
  let graphml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  graphml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n'
  graphml += '<graph edgedefault="directed">\n'

  // Add nodes
  for (const node of lineage.nodes) {
    graphml += `  <node id="${node.id}" label="${node.name}"/>\n`
  }

  // Add edges
  for (const edge of lineage.edges) {
    graphml += `  <edge source="${edge.source}" target="${edge.target}" label="${edge.label}"/>\n`
  }

  graphml += '</graph>\n'
  graphml += '</graphml>\n'

  return graphml
}

/**
 * Format summary report
 * @param {object} lineage - Lineage data
 * @returns {string}
 */
function formatSummaryReport(lineage) {
  let report = 'Data Lineage Report\n'
  report += '===================\n\n'
  report += `Root Table: ${lineage.rootTable}\n`
  report += `Direction: ${lineage.direction}\n`
  report += `Depth: ${lineage.depth}\n\n`
  report += `Source Tables: ${lineage.sourceCount}\n`
  report += `Target Tables: ${lineage.targetCount}\n`
  report += `Transformations: ${lineage.transformationCount}\n\n`

  if (lineage.nodes.length > 0) {
    report += 'Nodes:\n'
    for (const node of lineage.nodes.slice(0, 20)) {
      report += `  ${node.id} (Level ${node.level})\n`
    }
    if (lineage.nodes.length > 20) {
      report += `  ... and ${lineage.nodes.length - 20} more nodes\n`
    }
  }

  if (lineage.transformations.length > 0) {
    report += '\nTransformations:\n'
    for (const t of lineage.transformations.slice(0, 10)) {
      report += `  ${t.type}: ${t.transformation}\n`
    }
    if (lineage.transformations.length > 10) {
      report += `  ... and ${lineage.transformations.length - 10} more transformations\n`
    }
  }

  return report
}

/**
 * Display results in console
 * @param {object} lineage - Lineage data
 * @param {string} format - Display format
 * @returns {void}
 */
function displayResults(lineage, format) {
  if (format === 'json') {
    console.log(JSON.stringify(lineage, null, 2))
  } else if (format === 'csv') {
    console.log('Source,Target,Type,Label')
    for (const edge of lineage.edges) {
      console.log(`"${edge.source}","${edge.target}","${edge.type}","${edge.label}"`)
    }
  } else if (format === 'graphml') {
    console.log(generateGraphML(lineage))
  } else {
    console.log(formatSummaryReport(lineage))
  }
}
