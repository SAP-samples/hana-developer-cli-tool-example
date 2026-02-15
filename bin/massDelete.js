// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'massDelete [schema] [object]'
export const aliases = ['md', 'massdelete', 'massDel', 'massdel']
export const describe = baseLite.bundle.getText("massDelete")

export const builder = baseLite.getBuilder({
  schema: {
    alias: ['s'],
    type: 'string',
    desc: baseLite.bundle.getText("schema")
  },
  object: {
    alias: ['o'],
    type: 'string',
    desc: baseLite.bundle.getText("object")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 1000,
    desc: baseLite.bundle.getText("limit")
  },
  objectType: {
    alias: ['t', 'type'],
    type: 'string',
    desc: baseLite.bundle.getText("objectType")
  },
  includeSystem: {
    alias: ['i', 'system'],
    type: 'boolean',
    desc: baseLite.bundle.getText("includeSystemObjects"),
    default: false
  },
  dry: {
    alias: ['d', 'dryrun'],
    type: 'boolean',
    desc: baseLite.bundle.getText("dryRun"),
    default: false
  },
  force: {
    alias: ['f'],
    type: 'boolean',
    desc: baseLite.bundle.getText("force"),
    default: false
  },
  log: {
    alias: ['log'],
    type: 'boolean',
    desc: baseLite.bundle.getText("mass.log")
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, deleteObjects, {
    schema: {
      type: 'string',
      description: base.bundle.getText("schema"),
      required: true
    },
    object: {
      type: 'string',
      description: base.bundle.getText("object"),
      required: true
    },
    limit: {
      type: 'number',
      description: base.bundle.getText("limit"),
      default: 1000,
      required: true
    },
    objectType: {
      type: 'string',
      description: base.bundle.getText("objectType"),
      required: false
    },
    includeSystem: {
      type: 'boolean',
      description: base.bundle.getText("includeSystemObjects"),
      default: false
    },
    dry: {
      type: 'boolean',
      description: base.bundle.getText("dryRun"),
      default: false
    },
    force: {
      type: 'boolean',
      description: base.bundle.getText("force"),
      default: false
    },
    log: {
      type: 'boolean',
      description: base.bundle.getText("mass.log")
    }
  })
}

export async function deleteObjects(prompts) {
  const base = await import('../utils/base.js')
  base.debug('deleteObjects')
  try {
    base.setPrompts(prompts)
    const massDeleteLib = await import('../utils/massDelete.js')
    await massDeleteLib.deleteObjects()
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}
