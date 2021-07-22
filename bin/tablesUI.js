const base = require("../utils/base")

exports.command = 'tablesUI [schema] [table]'
exports.aliases = ['tui', 'listTablesUI', 'listtablesui', 'tablesui']
exports.describe = base.bundle.getText("tables")

exports.builder = base.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("table")
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
  base.promptHandler(argv, getTables, {
    table: {
      description: base.bundle.getText("table"),
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

async function getTables(prompts) {
  base.debug('getTablesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#tables-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}