const base = require("../utils/base")

exports.command = 'massRename'
exports.aliases = ['mr', 'massrename', 'massRN', 'massrn']
exports.describe = base.bundle.getText("massRename")

exports.builder = base.getBuilder({
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

exports.handler = (argv) => {
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
      description: base.bundle.getText("prefix"),
      required: true
    },
    case: {
      type: 'string',
      description: base.bundle.getText("case"),
      required: true
    }
  })
}

async function rename(result) {
  base.debug('rename')
  try {
    base.setPrompts(result)
    let cds = require('@sap/cds')
    let fs = require("fs/promises")
    let convert = require("js-convert-case")


    const csn = await cds.load(result.schema)

    let model = ``
    if (result.namespace) {
      model = `using {${result.namespace}} from './${result.schema.replace(
        ".cds",
        ""
      )}';\n`
    } else {
      model = ` using from './${result.schema.replace(
        ".cds",
        ""
      )}';\n`
    }

    Object.keys(csn.definitions)
      .filter((key) => {
        if (result.namespace) {
          return key.startsWith(`${result.namespace}.`)
        }else{
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
              model += `entity ${key} as projection on ${key} {\n`
            }

            Object.keys(entity.elements).forEach((element, index, array) => {
              // to be extended with more cases if needed
              let alias =
                result.case === "snake" ? convert.toSnakeCase(element) : element
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

    fs.writeFile(`${result.prefix}.cds`, model)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}