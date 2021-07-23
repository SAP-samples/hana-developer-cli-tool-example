const base = require("../utils/base")

exports.command = 'schemasUI [schema]'
exports.aliases = ['schui', 'getSchemasUI', 'listSchemasUI', 'schemasui', 'getschemasui', 'listschemasui']
exports.describe = base.bundle.getText("schemas")

exports.builder = base.getBuilder({
  schema: {
    alias: ['s', 'schemas'],
    type: 'string',
    default: "*",
    desc: base.bundle.getText("schema")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 200,
    desc: base.bundle.getText("limit")
  },
  all: {
    alias: ['al', 'allSchemas'],
    type: 'boolean',
    default: false,
    desc: base.bundle.getText("allSchemas")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, getSchemas, {
    schema: {
      description: base.bundle.getText("schema"),
      type: 'string',
      required: true
    },
    all: {
      description: base.bundle.getText("allSchemas"),
      type: 'boolean',
      required: true,
      ask: () => {
        return false
      }
    },
    limit: {
      description: base.bundle.getText("limit"),
      type: 'number',
      required: true
    }
  })
}

async function getSchemas(prompts) {
  base.debug('getSchemasUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#schemas-ui')
    return base.end()
  } catch (error) {
    base.error(error)
  }
}
