// @ts-check
import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'
import dbClass from "sap-hdb-promisfied"
import * as conn from "../utils/connections.js"
import { highlight } from 'cli-highlight'
import cds from '@sap/cds'
// @ts-ignore
import YAML from 'json-to-pretty-yaml'
import {
  parse,
  convert
} from 'odata2openapi'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
global.__xRef = []

export const command = 'inspectTable [schema] [table]'
export const aliases = ['it', 'table', 'insTbl', 'inspecttable', 'inspectable']
export const describe = base.bundle.getText("inspectTable")

export const builder = base.getBuilder({
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    desc: base.bundle.getText("table")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: base.bundle.getText("schema")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql", "sqlite", "cds", "json", "yaml", "cdl", "annos", "edm", "edmx", "swgr", "openapi", "hdbtable", "hdbmigrationtable", "hdbcds", "jsdoc"],
    default: "tbl",
    type: 'string',
    desc: base.bundle.getText("outputType")
  },
  useHanaTypes: {
    alias: ['hana'],
    type: 'boolean',
    default: false,
    desc: base.bundle.getText("useHanaTypes")
  }
})

export let inputPrompts = {
  table: {
    description: base.bundle.getText("table"),
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
  }
}

export function handler(argv) {
  base.promptHandler(argv, tableInspect, inputPrompts)
}

export async function tableInspect(prompts) {
  base.debug('tableInspect')
  try {
    //  base.setPrompts(prompts)
    // const db = await base.createDBConnection()
    let dbConnection = await conn.createConnection(prompts, false)
    const db = new dbClass(dbConnection)
    let schema = await dbClass.schemaCalc(prompts, db)
    base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("table")}: ${prompts.table}`)

    dbInspect.options.useHanaTypes = prompts.useHanaTypes

    let object = await dbInspect.getTable(db, schema, prompts.table)
    let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
    let constraints = await dbInspect.getConstraints(db, object)

    // @ts-ignore
    Object.defineProperty(cds.compile.to, 'openapi', { configurable: true, get: () => require('@sap/cds-dk/lib/compile/openapi') })

    var results = {}
    switch (prompts.output) {
      case 'tbl':
        console.log(object[0])
        results.basic = object[0]
        console.log("\n")
        console.table(fields)
        results.fields = fields
        console.table(constraints)
        results.constraints = constraints
        break
      case 'sql': {
        let definition = await dbInspect.getDef(db, schema, prompts.table)
        results.sql = definition
        console.log(highlight(definition))
        break
      }
      case 'sqlite': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.sql(cds.parse(cdsSource), { as: 'str', names: 'quoted', dialect: 'sqlite' })))
        break
      }
      case 'cds': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
        results.cds = cdsSource
        console.log(highlight(cdsSource))
        break
      }
      case 'json': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        console.log(highlight(cds.compile.to.json(cds.parse(cdsSource))))
        break
      }
      case 'hdbcds': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", null)
        let all = cds.compile.to.hdbcds(cds.parse(cdsSource))
        for (let [src] of all)
          // @ts-ignore
          console.log(highlight(src))
        console.log(`\n`)
        break
      }
      case 'hdbtable': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", null)
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
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable", null)
        let all = cds.compile.to.hdbtable(cds.parse(cdsSource))
        for (let [src] of all) {
          let srcOut = `== version = 1 \n` + src
          console.log(highlight(srcOut))
        }
        console.log(`\n`)
        break
      }
      case 'yaml': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        console.log(highlight(cds.compile.to.yaml(cds.parse(cdsSource))))
        break
      }
      case 'cdl': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        // @ts-ignore
        console.log(highlight(cds.compile.to.cdl(cds.parse(cdsSource))))
        break
      }
      case 'edmx': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
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
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
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
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
        cdsSource = `service HanaCli { ${cdsSource} } `
        console.log(highlight(JSON.stringify(cds.compile.to.edm(cds.parse(cdsSource)), null, 4)))
        break
      }
      case 'swgr': {
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
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
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
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
        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", null)
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
        throw base.bundle.getText("unsupportedFormat")
      }
    }
    db.destroyClient()
    await base.end()
    return results
  } catch (error) {
    base.error(error)
  }
}
