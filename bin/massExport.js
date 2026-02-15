// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'massExport [schema] [object]'
export const aliases = ['me', 'mexport', 'massExp', 'massexp']
export const describe = baseLite.bundle.getText("massExport")

export const builder = baseLite.getBuilder({
  schema: {
    alias: ['s', 'schema'],
    type: 'string',
    desc: baseLite.bundle.getText("schema")
  },
  object: {
    alias: ['o', 'object'],
    type: 'string',
    desc: baseLite.bundle.getText("object")
  },
  objectType: {
    alias: ['t', 'type'],
    type: 'string',
    desc: baseLite.bundle.getText("objectType")
  },
  limit: {
    alias: ['l', 'limit'],
    type: 'number',
    default: 1000,
    desc: baseLite.bundle.getText("limit")
  },
  format: {
    alias: ['f', 'format'],
    type: 'string',
    default: 'csv',
    desc: baseLite.bundle.getText("exportFormat")
  },
  folder: {
    alias: ['d', 'directory'],
    type: 'string',
    desc: baseLite.bundle.getText("folder")
  },
  includeData: {
    alias: ['data'],
    type: 'boolean',
    desc: baseLite.bundle.getText("includeData"),
    default: false
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, exportObjects, {
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
    objectType: {
      type: 'string',
      description: base.bundle.getText("objectType"),
      required: false
    },
    limit: {
      type: 'number',
      description: base.bundle.getText("limit"),
      default: 1000,
      required: true
    },
    format: {
      type: 'string',
      description: base.bundle.getText("exportFormat"),
      default: 'csv',
      required: true
    },
    folder: {
      type: 'string',
      description: base.bundle.getText("folder"),
      required: true
    },
    includeData: {
      type: 'boolean',
      description: base.bundle.getText("includeData"),
      default: false
    }
  })
}

export async function exportObjects(prompts) {
  const base = await import('../utils/base.js')
  base.debug('exportObjects')
  try {
    base.setPrompts(prompts)
    const massExportLib = await import('../utils/massExport.js')
    await massExportLib.exportObjects()
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}
