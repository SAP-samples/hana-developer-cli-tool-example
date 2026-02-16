// @ts-check
import * as baseLite from '../utils/base-lite.js'

export const command = 'massGrant [schema] [object]'
export const aliases = ['mg', 'massgrant', 'massGrn', 'massgrn']
export const describe = baseLite.bundle.getText("massGrant")

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
  grantee: {
    alias: ['g'],
    type: 'string',
    desc: baseLite.bundle.getText("grantee")
  },
  privilege: {
    alias: ['pr'],
    type: 'string',
    desc: baseLite.bundle.getText("privilege")
  },
  objectType: {
    alias: ['t', 'type'],
    type: 'string',
    desc: baseLite.bundle.getText("objectType")
  },
  withGrantOption: {
    alias: ['wgo'],
    type: 'boolean',
    desc: baseLite.bundle.getText("withGrantOption"),
    default: false
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
})).example('hana-cli massGrant --schema MYSCHEMA --object % --grantee DBUSER --privilege SELECT', baseLite.bundle.getText('massGrantExample'))

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, grantPrivileges, {
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
    grantee: {
      type: 'string',
      description: base.bundle.getText("grantee"),
      required: true
    },
    privilege: {
      type: 'string',
      description: base.bundle.getText("privilege"),
      required: true
    },
    objectType: {
      type: 'string',
      description: base.bundle.getText("objectType"),
      required: false
    },
    withGrantOption: {
      type: 'boolean',
      description: base.bundle.getText("withGrantOption"),
      default: false
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

export async function grantPrivileges(prompts) {
  const base = await import('../utils/base.js')
  base.debug('grantPrivileges')
  try {
    base.setPrompts(prompts)
    const massGrantLib = await import('../utils/massGrant.js')
    await massGrantLib.grantPrivileges()
    return base.end()
  } catch (error) {
    await base.error(error)
  }
}
