// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as dbInspect from '../utils/dbInspect.js'
import dbClass from "sap-hdb-promisfied"
import * as conn from "../utils/connections.js"
import cds from '@sap/cds'
global.__xRef = []

export const command = 'inspectTable [schema] [table]'
export const aliases = ['it', 'table', 'insTbl', 'inspecttable', 'inspectable']
export const describe = baseLite.bundle.getText("inspectTable")

export const builder = baseLite.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    desc: baseLite.bundle.getText("table")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql", "sqlite", "cds", "json", "yaml", "cdl", "annos", "edm", "edmx", "swgr", "openapi", "hdbtable", "hdbmigrationtable", "hdbcds", "jsdoc", "graphql", "postgres"],
    default: "tbl",
    type: 'string',
    desc: baseLite.bundle.getText("outputType")
  },
  useHanaTypes: {
    alias: ['hana'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("useHanaTypes")
  },
  useExists: {
    alias: ['exists', 'persistence'],
    desc: baseLite.bundle.getText("gui.useExists"),
    type: 'boolean',
    default: true
  },
  useQuoted: {
    alias: ['q', 'quoted', 'quotedIdentifiers'],
    desc: baseLite.bundle.getText("gui.useQuoted"),
    type: 'boolean',
    default: false
  },
  noColons: {
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("noColons")
  }
})

export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("table"),
    type: 'string',
    required: true
  },
  schema: {
    description: baseLite.bundle.getText("schema"),
    type: 'string',
    required: true
  },
  output: {
    description: baseLite.bundle.getText("outputType"),
    type: 'string',
    //       validator: /t[bl]*|s[ql]*|c[ds]?/,
    required: true
  },
  useHanaTypes: {
    description: baseLite.bundle.getText("useHanaTypes"),
    type: 'boolean'
  },
  useExists: {
    description: baseLite.bundle.getText("gui.useExists"),
    type: 'boolean'
  },
  useQuoted: {
    description: baseLite.bundle.getText("gui.useQuoted"),
    type: 'boolean'
  },
  noColons: {
    type: 'boolean',
    description: baseLite.bundle.getText("noColons")
  }
}

export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, tableInspect, inputPrompts)
}

export async function tableInspect(prompts) {
  const base = await import('../utils/base.js')
  base.debug('tableInspect')
  const [{ highlight }, yaml, { parse, convert }] = await Promise.all([
    import('cli-highlight'),
    import('js-yaml'),
    import('odata2openapi')
  ])

  try {
    base.setPrompts(prompts)
    let dbConnection = await conn.createConnection(prompts, false)
    const db = new dbClass(dbConnection)
    let schema = await dbClass.schemaCalc(prompts, db)

    base.debug(`${baseLite.bundle.getText("schema")}: ${schema}, ${baseLite.bundle.getText("table")}: ${prompts.table}`)
    dbInspect.options.useHanaTypes = prompts.useHanaTypes
    dbInspect.options.useExists = prompts.useExists
    dbInspect.options.useQuoted = prompts.useQuoted
    dbInspect.options.noColons = prompts.noColons

    let object = await dbInspect.getTable(db, schema, prompts.table)
    let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
    let constraints = await dbInspect.getConstraints(db, object)

    // @ts-ignore
    Object.defineProperty(cds.compile.to, 'openapi', { configurable: true, get: () => base.require('@sap/cds-dk/lib/compile/to_openapi') })

    var results = {}
    switch (prompts.output) {
      case 'tbl':
        console.log(object[0])
        results.basic = object[0]
        console.log("\n")
        base.outputTableFancy(fields)
        results.fields = fields
        base.outputTableFancy(constraints)
        results.constraints = constraints
        break
      case 'sql': {
        let definition = await dbInspect.getDef(db, schema, prompts.table)
        results.sql = definition
        console.log(highlight(definition))
        break
      }
      case 'sqlite': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.sql(cds.parse(cdsSource), { as: 'str', dialect: 'sqlite' })))
        break
      }
      case 'postgres': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.sql(cds.parse(cdsSource), { as: 'str', dialect: 'postgres' })))
        break
      }
      case 'cds': {
        let cdsSource = ""
        if (!dbInspect.options.useExists) {
          let output = await dbInspect.getDef(db, schema, prompts.table)
          output = output.slice(7)
          cdsSource = dbInspect.parseSQLOptions(output, cdsSource)
        }
        cdsSource += await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)

        results.cds = cdsSource
        console.log(highlight(cdsSource))
        break
      }
      case 'json': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        console.log(highlight(cds.compile.to.json(cds.parse(cdsSource))))
        break
      }
      case 'hdbcds': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", schema, null)
        let all = cds.compile.to.hdbcds(cds.parse(cdsSource))
        for (let [src] of all)
          // @ts-ignore
          console.log(highlight(src))
        console.log(`\n`)
        break
      }
      case 'hdbtable': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", schema, null)
        let all = cds.compile.to.hdbtable(cds.parse(cdsSource))
        for (let [src] of all) {
          results.hdbtable = src
          // @ts-ignore
          console.log(highlight(src))
        }
        console.log(`\n`)
        break
      }
      case 'hdbmigrationtable': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", schema, null)
        let all = cds.compile.to.hdbtable(cds.parse(cdsSource))
        for (let [src] of all) {
          let srcOut = `== version = 1 \n` + src
          console.log(highlight(srcOut))
        }
        console.log(`\n`)
        break
      }
      case 'yaml': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        console.log(highlight(cds.compile.to.yaml(cds.parse(cdsSource))))
        break
      }
      case 'cdl': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.cdl(cds.parse(cdsSource))))
        break
      }
      case 'graphql': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.gql(cds.parse(cdsSource))))
        break
      }
      case 'edmx': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        let metadata = await cds.compile.to.edmx(cds.parse(cdsSource), {
          // @ts-ignore
          version: 'v4', newCsn: true
        })
        // @ts-ignore
        console.log(highlight(metadata))
        break
      }
      case 'annos': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
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
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        console.log(highlight(JSON.stringify(cds.compile.to.edm(cds.parse(cdsSource)), null, 4)))
        break
      }
      case 'swgr': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
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
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        try {
          // @ts-ignore
          let metadata = await cds.compile.to.openapi(cds.parse(cdsSource), {
            service: 'HanaCli',
            servicePath: '/odata/v4/opensap.hana.CatalogService/',
            'openapi:url': '/odata/v4/opensap.hana.CatalogService/',
            'openapi:diagram': true,
            to: 'openapi'
          })
          console.log(highlight(JSON.stringify(metadata, null, 2)))
          break
        }
        catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') {
            // Re-throw not "Module not found" errors 
            throw e
          }
          throw baseLite.bundle.getText("cds-dk")
        }
      }
      case 'jsdoc': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        try {
          // @ts-ignore
          let metadata = await cds.compile.to.openapi(cds.parse(cdsSource), {
            service: 'HanaCli',
            servicePath: '/odata/v4/opensap.hana.CatalogService/',
            'openapi:url': '/odata/v4/opensap.hana.CatalogService/',
            'openapi:diagram': true,
            to: 'openapi'
          })

          let data = yaml.dump(metadata)
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
          throw baseLite.bundle.getText("cds-dk")
        }
      }
      default: {
        throw baseLite.bundle.getText("unsupportedFormat")
      }
    }
    db.destroyClient()
    await base.end()
    return results
  } catch (error) {
    await base.error(error)
  }
}
