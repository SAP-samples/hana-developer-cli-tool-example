// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'erdDiagram'
export const aliases = ['erd', 'er', 'schema-diagram', 'entityrelation']
export const describe = baseLite.bundle.getText("erdDiagram")

const erdDiagramOptions = {
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("erdDiagramSchema")
  },
  tables: {
    alias: ['t'],
    type: 'string',
    desc: baseLite.bundle.getText("erdDiagramTables")
  },
  output: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("erdDiagramOutput")
  },
  format: {
    alias: ['f'],
    type: 'string',
    choices: ["mermaid", "plantuml", "graphviz", "json"],
    default: "mermaid",
    desc: baseLite.bundle.getText("erdDiagramFormat")
  },
  showCardinality: {
    alias: ['c'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("erdDiagramShowCardinality")
  },
  showColumns: {
    alias: ['cols'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("erdDiagramShowColumns")
  },
  excludeColumns: {
    alias: ['ec'],
    type: 'string',
    desc: baseLite.bundle.getText("erdDiagramExcludeColumns")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
}

export const builder = (yargs) => yargs.options(baseLite.getBuilder(erdDiagramOptions)).example('hana-cli erdDiagram --schema MYSCHEMA --format mermaid --output erd.md', baseLite.bundle.getText('erdDiagramExample'))

export const erdDiagramBuilderOptions = baseLite.getBuilder(erdDiagramOptions)

export const inputPrompts = {
  schema: {
    description: baseLite.bundle.getText("erdDiagramSchema"),
    type: 'string',
    required: false,
    ask: () => false
  },
  tables: {
    description: baseLite.bundle.getText("erdDiagramTables"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("erdDiagramOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  format: {
    description: baseLite.bundle.getText("erdDiagramFormat"),
    type: 'string',
    required: false,
    ask: () => false
  },
  showCardinality: {
    description: baseLite.bundle.getText("erdDiagramShowCardinality"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  showColumns: {
    description: baseLite.bundle.getText("erdDiagramShowColumns"),
    type: 'boolean',
    required: false,
    ask: () => false
  },
  excludeColumns: {
    description: baseLite.bundle.getText("erdDiagramExcludeColumns"),
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
  base.promptHandler(argv, erdDiagramMain, inputPrompts, true, true, erdDiagramBuilderOptions)
}

/**
 * Generate ER diagrams from database schema
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function erdDiagramMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('erdDiagramMain')

  try {
    base.setPrompts(prompts)

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get schema if not provided
    let schema = prompts.schema
    if ((!schema || schema === '**CURRENT_SCHEMA**') && dbKind !== 'sqlite') {
      schema = await getCurrentSchema(dbClient, dbKind)
    }

    console.log(baseLite.bundle.getText("info.generatingERDiagram", [schema]))

    // Get tables
    let tables = await getTables(dbClient, schema, dbKind)

    // Filter tables if specified
    if (prompts.tables) {
      const tableNames = prompts.tables.split(',').map(t => t.trim())
      tables = tables.filter(t => tableNames.includes(t.NAME))
    }

    // Get columns for each table
    for (const table of tables) {
      table.columns = await getTableColumns(dbClient, schema, table.NAME, dbKind)
    }

    // Get foreign keys
    const foreignKeys = await getForeignKeys(dbClient, schema, dbKind)

    // Generate output in requested format
    let output = ''
    if (prompts.format === 'mermaid') {
      output = generateMermaidDiagram(schema, tables, foreignKeys, prompts)
    } else if (prompts.format === 'plantuml') {
      output = generatePlantumlDiagram(schema, tables, foreignKeys, prompts)
    } else if (prompts.format === 'graphviz') {
      output = generateGraphvizDiagram(schema, tables, foreignKeys, prompts)
    } else if (prompts.format === 'json') {
      output = JSON.stringify({ tables, foreignKeys }, null, 2)
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
    console.error(baseLite.bundle.getText("error.erdDiagram", [error.message]))
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
 * Get tables in schema
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getTables(dbClient, schema, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT TABLE_NAME as NAME FROM TABLES WHERE SCHEMA_NAME = '${schema}' ORDER BY TABLE_NAME`
    : `SELECT table_name as NAME FROM information_schema.tables WHERE table_schema = '${schema}' AND table_type = 'BASE TABLE' ORDER BY table_name`
  
  return await dbClient.execSQL(query)
}

/**
 * Get columns for a table
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getTableColumns(dbClient, schema, table, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT COLUMN_NAME, DATA_TYPE_NAME, IS_NULLABLE FROM TABLE_COLUMNS WHERE SCHEMA_NAME = '${schema}' AND TABLE_NAME = '${table}' ORDER BY POSITION`
    : `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}' ORDER BY ordinal_position`
  
  return await dbClient.execSQL(query)
}

/**
 * Get foreign keys for schema
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getForeignKeys(dbClient, schema, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM REFERENTIAL_CONSTRAINTS c JOIN KEY_COLUMNS kc ON c.CONSTRAINT_NAME = kc.CONSTRAINT_NAME WHERE c.SCHEMA_NAME = '${schema}'`
    : `SELECT constraint_name, table_name, column_name, referenced_table_name, referenced_column_name FROM information_schema.referential_constraints rc JOIN information_schema.key_column_usage kcu ON rc.constraint_name = kcu.constraint_name WHERE rc.constraint_schema = '${schema}'`
  
  try {
    return await dbClient.execSQL(query)
  } catch (error) {
    return []
  }
}

/**
 * Generate Mermaid ER diagram
 * @param {string} schema - Schema name
 * @param {Array} tables - Tables with columns
 * @param {Array} foreignKeys - Foreign key relationships
 * @param {object} prompts - User options
 * @returns {string}
 */
function generateMermaidDiagram(schema, tables, foreignKeys, prompts) {
  let diagram = `erDiagram\n`

  for (const table of tables) {
    let cols = ''
    if (prompts.showColumns && table.columns) {
      cols = ` {\n`
      for (const col of table.columns) {
        const nullable = (col.IS_NULLABLE === 'Y' || col.is_nullable === 'YES') ? 'O' : '|'
        cols += `    ${nullable} ${col.COLUMN_NAME || col.column_name} : "${col.DATA_TYPE_NAME || col.data_type}"\n`
      }
      cols += `  }`
    }

    diagram += `    ${table.NAME}${cols}\n`
  }

  if (prompts.showCardinality && foreignKeys.length > 0) {
    diagram += `\n`
    const relationships = new Set()
    for (const fk of foreignKeys) {
      const rel = `${fk.TABLE_NAME} ||--o{ ${fk.REFERENCED_TABLE_NAME} : ""` 
      if (!relationships.has(rel)) {
        diagram += `    ${rel}\n`
        relationships.add(rel)
      }
    }
  }

  return diagram
}

/**
 * Generate PlantUML diagram
 * @param {string} schema - Schema name
 * @param {Array} tables - Tables with columns
 * @param {Array} foreignKeys - Foreign key relationships
 * @param {object} prompts - User options
 * @returns {string}
 */
function generatePlantumlDiagram(schema, tables, foreignKeys, prompts) {
  let diagram = `@startuml\n`
  diagram += `title Database Schema: ${schema}\n\n`

  for (const table of tables) {
    diagram += `entity ${table.NAME} {\n`
    if (prompts.showColumns && table.columns) {
      for (const col of table.columns) {
        diagram += `  * ${col.COLUMN_NAME || col.column_name}: ${col.DATA_TYPE_NAME || col.data_type}\n`
      }
    }
    diagram += `}\n\n`
  }

  if (prompts.showCardinality && foreignKeys.length > 0) {
    const relationships = new Set()
    for (const fk of foreignKeys) {
      const rel = `${fk.TABLE_NAME} }o--|| ${fk.REFERENCED_TABLE_NAME}`
      if (!relationships.has(rel)) {
        diagram += `${rel}\n`
        relationships.add(rel)
      }
    }
  }

  diagram += `@enduml`
  return diagram
}

/**
 * Generate Graphviz diagram
 * @param {string} schema - Schema name
 * @param {Array} tables - Tables with columns
 * @param {Array} foreignKeys - Foreign key relationships
 * @param {object} prompts - User options
 * @returns {string}
 */
function generateGraphvizDiagram(schema, tables, foreignKeys, prompts) {
  let diagram = `digraph G {\n`
  diagram += `  graph [label="${schema}", labelloc=t];\n`
  diagram += `  rankdir=LR;\n\n`

  for (const table of tables) {
    let label = `<table border="1" cellborder="1" cellspacing="0">\n`
    label += `<tr><td colspan="2"><b>${table.NAME}</b></td></tr>\n`
    
    if (prompts.showColumns && table.columns) {
      for (const col of table.columns) {
        const dtype = col.DATA_TYPE_NAME || col.data_type || 'UNKNOWN'
        label += `<tr><td>${col.COLUMN_NAME || col.column_name}</td><td>${dtype}</td></tr>\n`
      }
    }
    label += `</table>`

    diagram += `  "${table.NAME}" [shape=plaintext, label=<${label}>];\n`
  }

  diagram += `\n`

  if (prompts.showCardinality && foreignKeys.length > 0) {
    const relationships = new Set()
    for (const fk of foreignKeys) {
      const rel = `"${fk.TABLE_NAME}" -> "${fk.REFERENCED_TABLE_NAME}"`
      if (!relationships.has(rel)) {
        diagram += `  ${rel};\n`
        relationships.add(rel)
      }
    }
  }

  diagram += `}`
  return diagram
}

export default { command, aliases, describe, builder, handler }
