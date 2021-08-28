// @ts-check
import * as base from '../utils/base.js'
import cds from '@sap/cds'
import { promises as fs } from 'fs'
import * as  convert from 'js-convert-case'

export const command = 'massRename'
export const aliases = ['mr', 'massrename', 'massRN', 'massrn']
export const describe = base.bundle.getText("massRename")

export const builder = base.getBuilder({
  schema: {
    alias: ['s', 'schema'],
    type: 'string',
    desc: base.bundle.getText("schemaCDS")
  },
  namespace: {
    alias: ['n', 'namespace'],
    type: 'string',
    desc: base.bundle.getText("namespace")
  },
  prefix: {
    alias: ['p', 'prefix'],
    type: 'string',
    desc: base.bundle.getText("prefix")
  },
  case: {
    alias: ['c', 'case'],
    type: 'string',
    desc: base.bundle.getText("case")
  }
})

export function handler (argv) {
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
  base.debug('rename')
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
                  base.error(base.bundle.getText("caseErr"))
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
    if (result.prefix) {
      fs.writeFile(`${result.prefix}.cds`, model)
    } else {
      fs.writeFile(`rename_${result.schema}.cds`, model)
    }

    return base.end()
  } catch (error) {
    base.error(error)
  }
}