// @ts-check
import * as baseLite from '../utils/base-lite.js'
import cds from '@sap/cds'

export const command = 'massRename'
export const aliases = ['mr', 'massrename', 'massRN', 'massrn']
export const describe = baseLite.bundle.getText("massRename")

export const builder = baseLite.getBuilder({
  schema: {
    alias: ['s', 'schema'],
    type: 'string',
    desc: baseLite.bundle.getText("schemaCDS")
  },
  namespace: {
    alias: ['n', 'namespace'],
    type: 'string',
    desc: baseLite.bundle.getText("namespace")
  },
  prefix: {
    alias: ['p', 'prefix'],
    type: 'string',
    desc: baseLite.bundle.getText("prefix")
  },
  case: {
    alias: ['c', 'case'],
    type: 'string',
    desc: baseLite.bundle.getText("case")
  }
})

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, rename, {
    schema: {
      type: 'string',
      description: base.bundle.getText("schemaCDS"),
      required: true
    },
    namespace: {
      type: 'string',
      description: base.bundle.getText("namespace")
    },
    prefix: {
      type: 'string',
      description: base.bundle.getText("prefix")
    },
    case: {
      type: 'string',
      description: base.bundle.getText("case"),
      required: true
    }
  })
}

export async function rename(result) {
  const base = await import('../utils/base.js')
  base.debug('rename')
  const convert = await import('js-convert-case')

  try {
    base.setPrompts(result)
     const csn = await cds.load(result.schema)

    let model = ``
    if (result.namespace) {
      model = `using {${result.namespace}} from './${result.schema.replace(
        ".cds",
        ""
      )}';\n`
    } else {
      Object.keys(csn.definitions).forEach((key) => {
        let entity = csn.definitions[key]
        if (entity.kind === "entity") {
          model += ` using {${key}} from './${result.schema.replace(
            ".cds",
            ""
          )}';\n`
        }
      })
    }

    Object.keys(csn.definitions)
      .filter((key) => {
        if (result.namespace) {
          return key.startsWith(`${result.namespace}.`)
        } else {
          return true
        }
      })
      .forEach((key) => {
        let entity = csn.definitions[key]

        switch (entity.kind) {
          case "entity":
            if (result.prefix) {
              model += `entity ${result.prefix}.${key} as projection on ${key} {\n`
            } else {
              model += `entity ${key}2 as projection on ${key} {\n`
            }

            // @ts-ignore
            Object.keys(entity.elements).forEach((element, index, array) => {
              // to be extended with more cases if needed
              let alias
              switch (result.case) {
                case "snake":
                  alias = convert.toSnakeCase(element)
                  break
                case "camel":
                  alias = convert.toCamelCase(element)
                  break
                case "lower":
                  alias = convert.toLowerCase(element)
                  break
                case "upper":
                  alias = convert.toUpperCase(element)
                  break
                case "pacal":
                  alias = convert.toPascalCase(element)
                  break
                case "dot":
                  alias = convert.toDotCase(element)
                  break
                default:
                  base.error(baseLite.bundle.getText("caseErr"))
                  process.exit()
                  break
              }
              //              result.case === "snake" ? convert.toSnakeCase(element) : element
              //tab
              model += "\t"
              // element or alias
              model += element === alias ? element : `${element} as ${alias}`
              // no comma for last element
              index === array.length || (model += ",")
              // line brake
              model += "\n"
            });
            model += "};\n"

            break
          default:
            break
        }
      })
    const {promises:fs} = await import('fs')  
    if (result.prefix) {
      fs.writeFile(`${result.prefix}.cds`, model)
    } else {
      fs.writeFile(`rename_${result.schema}.cds`, model)
    }

    return base.end()
  } catch (error) {
    await base.error(error)
  }
}