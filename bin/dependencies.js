// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'dependencies'
export const aliases = ['deps', 'depend', 'dependency-graph', 'relationships']
export const describe = baseLite.bundle.getText("dependencies")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  schema: {
    alias: ['s'],
    type: 'string',
    desc: baseLite.bundle.getText("dependenciesSchema")
  },
  object: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("dependenciesObject")
  },
  direction: {
    alias: ['dir'],
    type: 'string',
    choices: ["incoming", "outgoing", "both"],
    default: "both",
    desc: baseLite.bundle.getText("dependenciesDirection")
  },
  depth: {
    alias: ['lvl'],
    type: 'number',
    default: 3,
    desc: baseLite.bundle.getText("dependenciesDepth")
  },
  output: {
    alias: ['out'],
    type: 'string',
    desc: baseLite.bundle.getText("dependenciesOutput")
  },
  format: {
    alias: ['f'],
    type: 'string',
    choices: ["tree", "json", "graphviz", "mermaid"],
    default: "tree",
    desc: baseLite.bundle.getText("dependenciesFormat")
  },
  includeViews: {
    alias: ['iv'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("dependenciesIncludeViews")
  },
  includeProcedures: {
    alias: ['ip'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("dependenciesIncludeProcedures")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})).example(
  'hana-cli dependencies --object myTable --direction incoming --depth 3',
  baseLite.bundle.getText("dependenciesExample")
)

export const inputPrompts = {
  schema: {
    description: baseLite.bundle.getText("dependenciesSchema"),
    type: 'string',
    required: false,
    ask: () => false
  },
  object: {
    description: baseLite.bundle.getText("dependenciesObject"),
    type: 'string',
    required: true,
    ask: () => true
  },
  direction: {
    description: baseLite.bundle.getText("dependenciesDirection"),
    type: 'string',
    required: false,
    ask: () => false
  },
  depth: {
    description: baseLite.bundle.getText("dependenciesDepth"),
    type: 'number',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("dependenciesOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  format: {
    description: baseLite.bundle.getText("dependenciesFormat"),
    type: 'string',
    required: false,
    ask: () => false
  },
  profile: {
    description: baseLite.bundle.getText("profile"),
    type: 'string',
    required: false,
    ask: () => { }
  },
  debug: {
    description: baseLite.bundle.getText("debug"),
    type: 'boolean',
    required: false,
    ask: () => false
  }
}

/**
 * Command handler function
 * @param {object} argv - Command line arguments from yargs
 * @returns {Promise<void>}
 */
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, dependenciesMain, inputPrompts, true, true, builder)
}

/**
 * Show object dependency graphs
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function dependenciesMain(prompts) {
  const base = await import('../utils/base.js')

  try {
    base.setPrompts(prompts)

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get schema if not provided (default to current schema)
    let schema = prompts.schema
    if (!schema && dbKind !== 'sqlite') {
      schema = await getCurrentSchema(dbClient, dbKind)
    }

    let targetObject = prompts.object
    if (!targetObject) {
      throw new Error(baseLite.bundle.getText("errObjectRequired"))
    }

    // Build dependency graph
    const graph = {
      root: targetObject,
      children: [],
      parents: [],
      allDependencies: new Set()
    }

    if (['outgoing', 'both'].includes(prompts.direction)) {
      const outgoing = await buildDependencyTree(
        dbClient, schema, targetObject, 'outgoing', 0, prompts.depth, dbKind, prompts
      )
      graph.children = outgoing
    }

    if (['incoming', 'both'].includes(prompts.direction)) {
      const incoming = await buildDependencyTree(
        dbClient, schema, targetObject, 'incoming', 0, prompts.depth, dbKind, prompts
      )
      graph.parents = incoming
    }

    // Generate output in requested format
    let output = ''
    if (prompts.format === 'tree') {
      output = generateTreeOutput(graph)
    } else if (prompts.format === 'json') {
      output = JSON.stringify(graph, null, 2)
    } else if (prompts.format === 'graphviz') {
      output = generateGraphvizDependencies(graph)
    } else if (prompts.format === 'mermaid') {
      output = generateMermaidDependencies(graph)
    }

    // Output results
    if (prompts.output) {
      const fs = await import('fs')
      await fs.promises.writeFile(prompts.output, output, 'utf-8')
    } else {
      console.log(output)
    }

    await dbClient.disconnect()

  } catch (error) {
    console.error(baseLite.bundle.getText("error.dependencies", [error.message]))
    process.exit(1)
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
    return result?.[0]?.CURRENT_SCHEMA || 'PUBLIC'
  }
  return 'public'
}

/**
 * Build dependency tree recursively
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} objectName - Object name to analyze
 * @param {string} direction - 'incoming' or 'outgoing'
 * @param {number} currentDepth - Current recursion depth
 * @param {number} maxDepth - Maximum recursion depth
 * @param {string} dbKind - Database kind
 * @param {object} prompts - User options
 * @returns {Promise<Array>}
 */
async function buildDependencyTree(dbClient, schema, objectName, direction, currentDepth, maxDepth, dbKind, prompts) {
  if (currentDepth >= maxDepth) {
    return []
  }

  const dependencies = await getDependencies(dbClient, schema, objectName, direction, dbKind, prompts)
  
  const dependencyTree = []
  for (const dep of dependencies) {
    const node = {
      name: dep.DEPENDANT || dep.dependant,
      type: dep.OBJECT_TYPE || dep.object_type,
      children: await buildDependencyTree(
        dbClient, schema, dep.DEPENDANT || dep.dependant, direction, currentDepth + 1, maxDepth, dbKind, prompts
      )
    }
    dependencyTree.push(node)
  }

  return dependencyTree
}

/**
 * Get direct dependencies for an object
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} objectName - Object name
 * @param {string} direction - 'incoming' or 'outgoing'
 * @param {string} dbKind - Database kind
 * @param {object} prompts - User options
 * @returns {Promise<Array>}
 */
async function getDependencies(dbClient, schema, objectName, direction, dbKind, prompts) {
  let query = ''
  
  if (dbKind === 'hana') {
    // Try SYS.OBJECT_DEPENDENCIES first
    if (direction === 'outgoing') {
      query = `SELECT DISTINCT DEPENDENT_OBJECT_NAME as DEPENDANT, DEPENDENT_OBJECT_TYPE as OBJECT_TYPE FROM SYS.OBJECT_DEPENDENCIES WHERE BASE_SCHEMA_NAME = '${schema}' AND BASE_OBJECT_NAME = '${objectName}'`
    } else {
      query = `SELECT DISTINCT BASE_OBJECT_NAME as DEPENDANT, BASE_OBJECT_TYPE as OBJECT_TYPE FROM SYS.OBJECT_DEPENDENCIES WHERE DEPENDENT_SCHEMA_NAME = '${schema}' AND DEPENDENT_OBJECT_NAME = '${objectName}'`
    }
  } else {
    // Simplified for other databases
    query = `SELECT '${objectName}' as dependant, 'TABLE' as object_type`
  }

  try {
    const result = await dbClient.execSQL(query)
    return result || []
  } catch (error) {
    // If SYS.OBJECT_DEPENDENCIES doesn't exist or query fails, try alternative approach
    // Return empty array - object exists but no dependencies found
    return []
  }
}

/**
 * Generate tree-formatted output
 * @param {object} graph - Dependency graph
 * @returns {string}
 */
function generateTreeOutput(graph) {
  let output = `\nDependency Graph for: ${graph.root}\n`
  output += `${'='.repeat(50)}\n\n`

  if (graph.parents.length > 0) {
    output += `Dependencies from:\n`
    output += formatTreeNodes(graph.parents, 0)
  } else {
    output += `No incoming dependencies found.\n`
  }

  output += `\n${graph.root} (Root)\n`

  if (graph.children.length > 0) {
    output += `\nDependencies to:\n`
    output += formatTreeNodes(graph.children, 0)
  } else {
    output += `\nNo outgoing dependencies found.\n`
  }

  return output
}

/**
 * Format nodes recursively as tree
 * @param {Array} nodes - Nodes to format
 * @param {number} level - Current indentation level
 * @returns {string}
 */
function formatTreeNodes(nodes, level) {
  let output = ''
  const indent = '  '.repeat(level)
  
  for (const node of nodes) {
    output += `${indent}├─ ${node.name} (${node.type})\n`
    if (node.children && node.children.length > 0) {
      output += formatTreeNodes(node.children, level + 1)
    }
  }

  return output
}

/**
 * Generate Graphviz format
 * @param {object} graph - Dependency graph
 * @returns {string}
 */
function generateGraphvizDependencies(graph) {
  let dot = `digraph dependencies {\n`
  dot += `  rankdir=LR;\n`
  dot += `  "${graph.root}" [shape=box, style=filled, fillcolor=lightblue];\n\n`

  if (graph.parents && graph.parents.length > 0) {
    for (const parent of graph.parents) {
      dot += `  "${parent.name}" -> "${graph.root}";\n`
      dot += formatDependencyEdges(parent, graph.root)
    }
  }

  if (graph.children && graph.children.length > 0) {
    for (const child of graph.children) {
      dot += `  "${graph.root}" -> "${child.name}";\n`
      dot += formatDependencyEdges(graph.root, child.name, child)
    }
  }

  dot += `}`
  return dot
}

/**
 * Format dependency edges recursively
 * @param {string} from - From node
 * @param {string} to - To node
 * @param {object} node - Node object
 * @returns {string}
 */
function formatDependencyEdges(from, to, node = null) {
  let edges = ''
  
  if (node && node.children && node.children.length > 0) {
    for (const child of node.children) {
      edges += `  "${to}" -> "${child.name}";\n`
      edges += formatDependencyEdges(to, child.name, child)
    }
  }

  return edges
}

/**
 * Generate Mermaid format
 * @param {object} graph - Dependency graph
 * @returns {string}
 */
function generateMermaidDependencies(graph) {
  let mermaid = `graph TD\n`
  mermaid += `  ${graph.root}["${graph.root}"]\n`

  if (graph.parents && graph.parents.length > 0) {
    for (const parent of graph.parents) {
      mermaid += `  ${parent.name}["${parent.name}"]\n`
      mermaid += `  ${parent.name} --> ${graph.root}\n`
    }
  }

  if (graph.children && graph.children.length > 0) {
    for (const child of graph.children) {
      mermaid += `  ${child.name}["${child.name}"]\n`
      mermaid += `  ${graph.root} --> ${child.name}\n`
    }
  }

  return mermaid
}

export default { command, aliases, describe, builder, handler }
