// @ts-check
import * as baseLite from '../utils/base-lite.js'
import dbClientClass from "../utils/database/index.js"

export const command = 'generateDocs'
export const aliases = ['docs', 'gendocs', 'generateDocumentation']
export const describe = baseLite.bundle.getText("generateDocs")

export const builder = baseLite.getBuilder({
  schema: {
    alias: ['s'],
    type: 'string',
    desc: baseLite.bundle.getText("generateDocsSchema")
  },
  objects: {
    alias: ['o'],
    type: 'string',
    choices: ["tables", "views", "procedures", "functions", "all"],
    default: "all",
    desc: baseLite.bundle.getText("generateDocsObjects")
  },
  output: {
    alias: ['f'],
    type: 'string',
    desc: baseLite.bundle.getText("generateDocsOutput")
  },
  format: {
    alias: ['fmt'],
    type: 'string',
    choices: ["markdown", "html", "pdf"],
    default: "markdown",
    desc: baseLite.bundle.getText("generateDocsFormat")
  },
  includeData: {
    alias: ['id'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("generateDocsIncludeData")
  },
  includeGrants: {
    alias: ['ig'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("generateDocsIncludeGrants")
  },
  includeIndexes: {
    alias: ['ii'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("generateDocsIncludeIndexes")
  },
  includeTriggers: {
    alias: ['it'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("generateDocsIncludeTriggers")
  },
  generateTOC: {
    alias: ['toc'],
    type: 'boolean',
    default: true,
    desc: baseLite.bundle.getText("generateDocsTOC")
  },
  profile: {
    alias: ['p'],
    type: 'string',
    desc: baseLite.bundle.getText("profile")
  }
})

export const inputPrompts = {
  schema: {
    description: baseLite.bundle.getText("generateDocsSchema"),
    type: 'string',
    required: false,
    ask: () => false
  },
  objects: {
    description: baseLite.bundle.getText("generateDocsObjects"),
    type: 'string',
    required: false,
    ask: () => false
  },
  output: {
    description: baseLite.bundle.getText("generateDocsOutput"),
    type: 'string',
    required: false,
    ask: () => false
  },
  format: {
    description: baseLite.bundle.getText("generateDocsFormat"),
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
  base.promptHandler(argv, generateDocsMain, inputPrompts, true, true, builder)
}

/**
 * Auto-generate database documentation
 * @param {object} prompts - User prompts
 * @returns {Promise<void>}
 */
export async function generateDocsMain(prompts) {
  const base = await import('../utils/base.js')
  base.debug('generateDocsMain')

  try {
    base.setPrompts(prompts)

    // Connect to database
    const dbClient = await dbClientClass.getNewClient(prompts)
    await dbClient.connect()

    const dbKind = (dbClient.getKind() || 'hana').toLowerCase()

    // Get schema if not provided
    let schema = prompts.schema
    if (!schema && dbKind !== 'sqlite') {
      schema = await getCurrentSchema(dbClient, dbKind)
    }

    // Gather database objects based on requested types
    const docs = {
      schema: schema,
      tables: [],
      views: [],
      procedures: [],
      functions: [],
      generatedAt: new Date().toISOString()
    }

    if (['tables', 'all'].includes(prompts.objects)) {
      docs.tables = await getTables(dbClient, schema, dbKind)
      if (prompts.includeIndexes) {
        for (const table of docs.tables) {
          table.indexes = await getTableIndexes(dbClient, schema, table.NAME, dbKind)
        }
      }
      if (prompts.includeTriggers) {
        for (const table of docs.tables) {
          table.triggers = await getTableTriggers(dbClient, schema, table.NAME, dbKind)
        }
      }
    }

    if (['views', 'all'].includes(prompts.objects)) {
      docs.views = await getViews(dbClient, schema, dbKind)
    }

    if (['procedures', 'all'].includes(prompts.objects)) {
      docs.procedures = await getProcedures(dbClient, schema, dbKind)
    }

    if (['functions', 'all'].includes(prompts.objects)) {
      docs.functions = await getFunctions(dbClient, schema, dbKind)
    }

    // Generate output in requested format
    let output = ''
    if (prompts.format === 'markdown') {
      output = generateMarkdownDocs(docs, prompts.generateTOC)
    } else if (prompts.format === 'html') {
      output = generateHTMLDocs(docs)
    } else if (prompts.format === 'pdf') {
      output = generatePDFDocs(docs)
    }

    // Output results
    if (prompts.output) {
      const fs = await import('fs')
      await fs.promises.writeFile(prompts.output, output, 'utf-8')
      console.log(baseLite.bundle.getText("success.docsWritten", [prompts.output]))
    } else {
      console.log(output)
    }

    console.log(baseLite.bundle.getText("success.documentationGenerated", [schema]))

    await dbClient.disconnect()

  } catch (error) {
    console.error(baseLite.bundle.getText("error.generateDocs", [error.message]))
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
    ? `SELECT TABLE_NAME as NAME, IS_COLUMN_TABLE, COMMENTS FROM TABLES WHERE SCHEMA_NAME = '${schema}' ORDER BY TABLE_NAME`
    : `SELECT table_name as NAME, table_type FROM information_schema.tables WHERE table_schema = '${schema}' ORDER BY table_name`
  
  return await dbClient.execSQL(query)
}

/**
 * Get views in schema
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getViews(dbClient, schema, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT VIEW_NAME as NAME, VIEW_TYPE, COMMENTS FROM VIEWS WHERE SCHEMA_NAME = '${schema}' ORDER BY VIEW_NAME`
    : `SELECT table_name as NAME FROM information_schema.views WHERE table_schema = '${schema}' ORDER BY table_name`
  
  return await dbClient.execSQL(query)
}

/**
 * Get procedures in schema
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getProcedures(dbClient, schema, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT PROCEDURE_NAME as NAME FROM PROCEDURES WHERE SCHEMA_NAME = '${schema}' ORDER BY PROCEDURE_NAME`
    : `SELECT routine_name as NAME FROM information_schema.routines WHERE routine_schema = '${schema}' AND routine_type = 'PROCEDURE' ORDER BY routine_name`
  
  return await dbClient.execSQL(query)
}

/**
 * Get functions in schema
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getFunctions(dbClient, schema, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT FUNCTION_NAME as NAME FROM FUNCTIONS WHERE SCHEMA_NAME = '${schema}' ORDER BY FUNCTION_NAME`
    : `SELECT routine_name as NAME FROM information_schema.routines WHERE routine_schema = '${schema}' AND routine_type = 'FUNCTION' ORDER BY routine_name`
  
  return await dbClient.execSQL(query)
}

/**
 * Get indexes for table
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getTableIndexes(dbClient, schema, table, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT INDEX_NAME, INDEX_TYPE FROM INDEXES WHERE SCHEMA_NAME = '${schema}' AND TABLE_NAME = '${table}'`
    : `SELECT indexname FROM pg_indexes WHERE schemaname = '${schema}' AND tablename = '${table}'`
  
  return await dbClient.execSQL(query)
}

/**
 * Get triggers for table
 * @param {object} dbClient - Database client
 * @param {string} schema - Schema name
 * @param {string} table - Table name
 * @param {string} dbKind - Database kind
 * @returns {Promise<Array>}
 */
async function getTableTriggers(dbClient, schema, table, dbKind) {
  const query = dbKind === 'hana'
    ? `SELECT TRIGGER_NAME FROM TRIGGERS WHERE SCHEMA_NAME = '${schema}' AND TABLE_NAME = '${table}'`
    : `SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = '${schema}' AND event_object_table = '${table}'`
  
  return await dbClient.execSQL(query)
}

/**
 * Generate markdown documentation
 * @param {object} docs - Database documentation
 * @param {boolean} generateTOC - Generate table of contents
 * @returns {string}
 */
function generateMarkdownDocs(docs, generateTOC) {
  let md = `# Database Documentation for ${docs.schema}\n\n`
  md += `**Generated:** ${new Date(docs.generatedAt).toLocaleString()}\n\n`

  if (generateTOC && (docs.tables.length > 0 || docs.views.length > 0 || docs.procedures.length > 0 || docs.functions.length > 0)) {
    md += `## Table of Contents\n\n`
    if (docs.tables.length > 0) md += `- [Tables](#tables)\n`
    if (docs.views.length > 0) md += `- [Views](#views)\n`
    if (docs.procedures.length > 0) md += `- [Procedures](#procedures)\n`
    if (docs.functions.length > 0) md += `- [Functions](#functions)\n\n`
  }

  if (docs.tables.length > 0) {
    md += `## Tables\n\n`
    for (const table of docs.tables) {
      md += `### ${table.NAME}\n`
      md += table.COMMENTS ? `${table.COMMENTS}\n\n` : ''
      if (table.indexes && table.indexes.length > 0) {
        md += `**Indexes:** ${table.indexes.map(i => i.INDEX_NAME || i.indexname).join(', ')}\n`
      }
      if (table.triggers && table.triggers.length > 0) {
        md += `**Triggers:** ${table.triggers.map(t => t.TRIGGER_NAME || t.trigger_name).join(', ')}\n`
      }
      md += '\n'
    }
  }

  if (docs.views.length > 0) {
    md += `## Views\n\n`
    for (const view of docs.views) {
      md += `### ${view.NAME}\n`
      md += view.COMMENTS ? `${view.COMMENTS}\n\n` : ''
    }
  }

  if (docs.procedures.length > 0) {
    md += `## Procedures\n\n`
    for (const proc of docs.procedures) {
      md += `### ${proc.NAME}\n\n`
    }
  }

  if (docs.functions.length > 0) {
    md += `## Functions\n\n`
    for (const func of docs.functions) {
      md += `### ${func.NAME}\n\n`
    }
  }

  return md
}

/**
 * Generate HTML documentation
 * @param {object} docs - Database documentation
 * @returns {string}
 */
function generateHTMLDocs(docs) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Database Documentation - ${docs.schema}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #666; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    h3 { color: #999; }
    table { border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Database Documentation: ${docs.schema}</h1>
  <p><em>Generated: ${new Date(docs.generatedAt).toLocaleString()}</em></p>\n`

  if (docs.tables.length > 0) {
    html += `<h2>Tables</h2>\n<ul>\n`
    for (const table of docs.tables) {
      html += `<li><strong>${table.NAME}</strong></li>\n`
    }
    html += `</ul>\n`
  }

  if (docs.views.length > 0) {
    html += `<h2>Views</h2>\n<ul>\n`
    for (const view of docs.views) {
      html += `<li><strong>${view.NAME}</strong></li>\n`
    }
    html += `</ul>\n`
  }

  if (docs.procedures.length > 0) {
    html += `<h2>Procedures</h2>\n<ul>\n`
    for (const proc of docs.procedures) {
      html += `<li><strong>${proc.NAME}</strong></li>\n`
    }
    html += `</ul>\n`
  }

  if (docs.functions.length > 0) {
    html += `<h2>Functions</h2>\n<ul>\n`
    for (const func of docs.functions) {
      html += `<li><strong>${func.NAME}</strong></li>\n`
    }
    html += `</ul>\n`
  }

  html += `</body>
</html>`

  return html
}

/**
 * Generate PDF documentation (returns JSON placeholder)
 * @param {object} docs - Database documentation
 * @returns {string}
 */
function generatePDFDocs(docs) {
  return JSON.stringify(docs, null, 2)
}

export default { command, aliases, describe, builder, handler }
