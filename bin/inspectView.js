// @ts-check
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'
import dbClass from "sap-hdb-promisfied"
import * as conn from "../utils/connections.js"
import cds from '@sap/cds'
global.__xRef = []

export const command = 'inspectView [schema] [view]'
export const aliases = ['iv', 'view', 'insVew', 'inspectview']
export const describe = base.bundle.getText("inspectView")

export const builder = base.getBuilder({
  view: {
    alias: ['v', 'View'],
    type: 'string',
    desc: base.bundle.getText("view")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql", "sqlite", "cds", "json", "yaml", "cdl", "annos", "edm", "edmx", "swgr", "openapi", "hdbview", "hdbcds", "jsdoc", "graphql", "postgres"],
    default: "tbl",
    type: 'string',
    desc: base.bundle.getText("outputType")
  },
  useHanaTypes: {
    alias: ['hana'],
    type: 'boolean',
    default: false,
    desc: base.bundle.getText("useHanaTypes")
  },
  useExists: {
    alias: ['exists', 'persistence'],
    desc: base.bundle.getText("gui.useExists"),
    type: 'boolean',
    default: true
  },
  useQuoted: {
    alias: ['q', 'quoted', 'quotedIdentifiers'],
    desc: base.bundle.getText("gui.useQuoted"),
    type: 'boolean',
    default: false
  }
})

export let inputPrompts = {
  view: {
    description: base.bundle.getText("view"),
    type: 'string',
    required: true
  },
  schema: {
    description: base.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  output: {
    description: base.bundle.getText("outputType"),
    type: 'string',
    //       validator: /t[bl]*|s[ql]*|c[ds]?/,
    required: true
  },
  useHanaTypes: {
    description: base.bundle.getText("useHanaTypes"),
    type: 'boolean'
  },
  useExists: {
    description: base.bundle.getText("gui.useExists"),
    type: 'boolean'
  },
  useQuoted: {
    description: base.bundle.getText("gui.useQuoted"),
    type: 'boolean'
  }
}

export function handler(argv) {
  base.promptHandler(argv, viewInspect, inputPrompts)
}

export async function viewInspect(prompts) {
  base.debug('viewInspect')
  const [{ highlight }, YAML, { parse, convert }] = await Promise.all([
    import('cli-highlight'),
    import('json-to-pretty-yaml'),
    import('odata2openapi')
  ])
  try {
    base.setPrompts(prompts)
    let dbConnection = await conn.createConnection(prompts, false)
    const db = new dbClass(dbConnection)
    let schema = await base.dbClass.schemaCalc(prompts, db)

    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("view")}: ${prompts.view}`)
    dbInspect.options.useHanaTypes = prompts.useHanaTypes
    dbInspect.options.useExists = prompts.useExists
    dbInspect.options.useQuoted = prompts.useQuoted

    let object = await dbInspect.getView(db, schema, prompts.view)
    let fields = []
    if (await dbInspect.isCalculationView(db, schema, prompts.view)) {
      fields = await dbInspect.getCalcViewFields(db, schema, prompts.view, object[0].VIEW_OID)
    } else {
      fields = await dbInspect.getViewFields(db, object[0].VIEW_OID)
    }

    // @ts-ignore
    Object.defineProperty(cds.compile.to, 'openapi', { configurable: true, get: () => base.require('@sap/cds-dk/lib/compile/openapi') })

    var results = {}
    switch (prompts.output) {
      case 'tbl':
        console.log(object[0])
        results.basic = object[0]
        console.log("\n")
        base.outputTableFancy(fields)
        results.fields = fields
        break
      case 'sql': {
        let definition = await dbInspect.getDef(db, schema, prompts.view)
        results.sql = definition
        console.log(highlight(definition))
        break
      }
      case 'sqlite': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "hdbview", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.sql(cds.parse(cdsSource), { as: 'str', dialect: 'sqlite' })))
        break
      }
      case 'postgres': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "hdbview", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.sql(cds.parse(cdsSource), { as: 'str', dialect: 'postgres' })))
        break
      }
      case 'cds': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        results.cds = cdsSource
        console.log(highlight(cdsSource))
        break
      }
      case 'json': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        console.log(highlight(cds.compile.to.json(cds.parse(cdsSource))))
        break
      }
      case 'hdbcds': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "hdbview", schema)
        let all = cds.compile.to.hdbcds(cds.parse(cdsSource))
        for (let [src] of all)
          // @ts-ignore
          console.log(highlight(src))
        console.log(`\n`)
        break
      }
      case 'hdbview': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "hdbview", schema)
        let all = cds.compile.to.hdbtable(cds.parse(cdsSource))
        for (let [src] of all){
          results.hdbtable = src
          // @ts-ignore
          console.log(highlight(src))
        }
        console.log(`\n`)
        break
      }
      case 'yaml': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        console.log(highlight(cds.compile.to.yaml(cds.parse(cdsSource))))
        break
      }
      case 'cdl': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.cdl(cds.parse(cdsSource))))
        break
      }
      case 'graphql': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.gql(cds.parse(cdsSource))))
        break
      }
      case 'edmx': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        let metadata = await cds.compile.to.edmx(cds.parse(cdsSource), {
          version: 'v4',
        })
        // @ts-ignore
        console.log(highlight(metadata))
        break
      }
      case 'annos': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        let metadata = await cds.compile.to.edmx(cds.parse(cdsSource), {
          // @ts-ignore
          annos: 'only'
        })
        // @ts-ignore
        console.log(highlight(metadata))
        break
      }
      case 'edm': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        console.log(highlight(JSON.stringify(cds.compile.to.edm(cds.parse(cdsSource)), null, 4)))
        break
      }
      case 'swgr': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        let metadata = await cds.compile.to.edmx(cds.parse(cdsSource), {
          version: 'v4',
        })
        const odataOptions = { basePath: '/odata/v4/opensap.hana.CatalogService/' }
        // @ts-ignore
        parse(metadata)
          // @ts-ignore
          .then(service => convert(service.entitySets, odataOptions, service.version))
          .then(swagger => console.log(highlight(JSON.stringify(swagger, null, 2))))
          .catch(error => console.error(error))
        break
      }
      case 'openapi': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        try {
          // @ts-ignore
          let metadata = await cds.compile.to.openapi(cds.parse(cdsSource), {
            service: 'HanaCli',
            servicePath: '/odata/v4/opensap.hana.CatalogService/',
            'openapi:url': '/odata/v4/opensap.hana.CatalogService/',
            'openapi:diagram': true
          })
          console.log(highlight(JSON.stringify(metadata, null, 2)))
          break
        }
        catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') {
            // Re-throw not "Module not found" errors 
            throw e
          }
          throw base.bundle.getText("cds-dk")
        }
      }
      case 'jsdoc': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema)
        cdsSource = `service HanaCli { ${cdsSource} } `
        try {
          // @ts-ignore
          let metadata = await cds.compile.to.openapi(cds.parse(cdsSource), {
            service: 'HanaCli',
            servicePath: '/odata/v4/opensap.hana.CatalogService/',
            'openapi:url': '/odata/v4/opensap.hana.CatalogService/',
            'openapi:diagram': true
          })
          let data = YAML.stringify(metadata)
          var lines = data.split('\n')
          let output =
            '/**\n' +
            ' * @swagger\n' +
            ' * \n'
          for (let line of lines) {
            output += ' * ' + line + '\n'
          }
          output += ' */ \n'
          console.log(highlight(output))
          break
        }
        catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') {
            // Re-throw not "Module not found" errors 
            throw e
          }
          throw base.bundle.getText("cds-dk")
        }
      }
      default: {
        console.error(base.bundle.getText("unsupportedFormat"))
        break
      }
    }
    db.destroyClient()
    await base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}