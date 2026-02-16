// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'massUpdate [schema] [object]'
export const aliases = ['mu', 'massupdate', 'massUpd', 'massupd']
export const describe = baseLite.bundle.getText("massUpdate")

export const builder = (yargs) => yargs.options(baseLite.getBuilder({
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
  setClause: {
    alias: ['c', 'set'],
    type: 'string',
    desc: baseLite.bundle.getText("setClause")
  },
  whereClause: {
    alias: ['w', 'where'],
    type: 'string',
    desc: baseLite.bundle.getText("whereClause")
  },
  limit: {
    alias: ['l'],
    type: 'number',
    default: 1000,
    desc: baseLite.bundle.getText("limit")
  },
  dryRun: {
    alias: ['dr', 'preview'],
    type: 'boolean',
    desc: baseLite.bundle.getText("dryRun"),
    default: false
  },
  log: {
    type: 'boolean',
    desc: baseLite.bundle.getText("mass.log")
  }
})).example('hana-cli massUpdate --schema MYSCHEMA --object % --set "STATUS = \'INACTIVE\'" --where "CREATED_AT < CURRENT_DATE"', baseLite.bundle.getText('massUpdateExample'))

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, updateObjects, {
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
    setClause: {
      type: 'string',
      description: base.bundle.getText("setClause"),
      required: true
    },
    whereClause: {
      type: 'string',
      description: base.bundle.getText("whereClause"),
      required: false
    },
    limit: {
      type: 'number',
      description: base.bundle.getText("limit"),
      default: 1000,
      required: true
    },
    dryRun: {
      type: 'boolean',
      description: base.bundle.getText("dryRun"),
      default: false
    },
    log: {
      type: 'boolean',
      description: base.bundle.getText("mass.log")
    }
  })
}

export async function updateObjects(prompts) {
  const base = await import('../utils/base.js')
  base.debug('updateObjects')
  try {
    base.setPrompts(prompts)
    const massUpdateLib = await import('../utils/massUpdate.js')
    await massUpdateLib.updateObjects()
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}
