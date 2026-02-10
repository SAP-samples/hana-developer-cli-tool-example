import * as baseLite from '../utils/base-lite.js'
import * as dbInspect from '../utils/dbInspect.js'
import { createRequire } from 'module'

// @ts-ignore
import cds from '@sap/cds'

global.__xRef = []

export const command = 'cds [schema] [table]'
export const aliases = ['cdsPreview']
export const describe = baseLite.bundle.getText("cds")
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
  view: {
    alias: ['v', 'View'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("viewOpt")
  },
  useHanaTypes: {
    alias: ['hana'],
    type: 'boolean',
    default: false,
    desc: baseLite.bundle.getText("useHanaTypes")
  },
  useQuoted: {
    alias: ['q', 'quoted', 'quotedIdentifiers'],
    desc: baseLite.bundle.getText("gui.useQuoted"),
    type: 'boolean',
    default: false
  },
  port: {
    alias: ['p'],
    type: 'number',
    default: false,
    desc: baseLite.bundle.getText("port")
  }
})

export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, cdsBuild, {
    table: {
      description: base.bundle.getText("table"),
      type: 'string',
      required: true,
      ask: () => {
        return false
      }
    },
    schema: {
      description: base.bundle.getText("schema"),
      type: 'string',
      required: true
    },
    view: {
      description: base.bundle.getText("viewOpt"),
      type: 'boolean',
      required: true,
      ask: () => {
        return false
      }
    },
    useHanaTypes: {
      description: base.bundle.getText("useHanaTypes"),
      type: 'boolean'
    },
    useQuoted: {
      description: base.bundle.getText("gui.useQuoted"),
      type: 'boolean'
    },
    port: {
      description: base.bundle.getText("port"),
      required: false,
      ask: () => {
        return false
      }
    }
  })
}


export async function cdsBuild(prompts) {
  const base = await import('../utils/base.js')
  base.debug('cds')
  try {
    base.setPrompts(prompts)
    const db = await base.createDBConnection()

    let schema = await base.dbClass.schemaCalc(prompts, db)
    let object, fields, constraints, cdsSource
    dbInspect.options.useHanaTypes = prompts.useHanaTypes
    dbInspect.options.useQuoted = prompts.useQuoted
    dbInspect.options.noColons = true

    if (!prompts.view) {
      object = await dbInspect.getTable(db, schema, prompts.table)
      fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
      constraints = await dbInspect.getConstraints(db, object)
    } else {
      object = await dbInspect.getView(db, schema, prompts.table)
      fields = await dbInspect.getViewFields(db, object[0].VIEW_OID)
    }

    cdsSource =
      // 
      `
      @protocol: ['odata-v4', 'graphql']
      service HanaCli { `

    if (process.env.VCAP_SERVICES) {
      let vcap = JSON.parse(process.env.VCAP_SERVICES)
      vcap.hana[0].credentials.schema = object[0].SCHEMA_NAME
      vcap.hana.splice(1, 100)
      process.env.VCAP_SERVICES = JSON.stringify(vcap)
    }

    if (!cds.env.requires.db.credentials) {
      const settings = db.client._settings
      let out = {}
      out.schema = object[0].SCHEMA_NAME
      out.url = settings.url
      out.certificate = settings.certificate
      out.database_id = settings.database_id
      out.driver = settings.driver
      out.hdi_user = settings.hdi_user
      out.hdi_password = settings.hdi_password
      out.host = settings.host
      out.user = settings.user
      out.password = settings.password
      out.port = settings.port
      out.pooling = settings.pooling
      out.encrypt = true
      out.sslValidateCertificate = false
      out.useTLS = true
      cds.env.requires.db.credentials = out
    }

    cdsSource +=
      `@(Capabilities: {
			InsertRestrictions: {Insertable: true},
			UpdateRestrictions: {Updatable: true},
			DeleteRestrictions: {Deletable: true}
    },
    HeaderInfo: {
      TypeName: '${prompts.table}',
      Title:'${prompts.table}'
    },
    UI: { 
      LineItem: [ \n`;
    for (let field of fields) {
      if (prompts.useQuoted) {
        cdsSource += `{$Type: 'UI.DataField', Value: ![${field.COLUMN_NAME}], ![@UI.Importance]:#High}, \n`
      } else {
        cdsSource += `{$Type: 'UI.DataField', Value: ${field.COLUMN_NAME}, ![@UI.Importance]:#High}, \n`
      }

    }
    cdsSource +=
      `], \n`
    cdsSource +=
      ` Facets: [
    {$Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#Main', ![@UI.Importance]: #High}			
  ],
  FieldGroup#Main: { \n 
    Data: [ \n`
    for (let field of fields) {
      cdsSource += `{$Type: 'UI.DataField', Value: ${field.COLUMN_NAME}, ![@UI.Importance]:#High}, \n`
    }
    cdsSource +=
      `] },\n`

    cdsSource += ` SelectionFields: [ `;
    for (let field of fields) {
      cdsSource += `${field.COLUMN_NAME}, \n`
    }
    cdsSource +=
      `] \n`
    cdsSource += `} )\n`


    if (!prompts.view) {
      console.log(`Schema: ${schema}, Table: ${prompts.table}`)
      object = await dbInspect.getTable(db, schema, prompts.table)
      fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
      constraints = await dbInspect.getConstraints(db, object)
      let tableSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", schema, "preview")
      cdsSource +=

        `@cds.persistence.skip\n ${tableSource} \n }`
    } else {
      console.log(`Schema: ${schema}, View: ${prompts.table}`)
      object = await dbInspect.getView(db, schema, prompts.table)
      fields = await dbInspect.getViewFields(db, object[0].VIEW_OID)
      let viewSource = await dbInspect.formatCDS(db, object, fields, null, "view", schema, "preview")
      cdsSource +=
        `${viewSource} \n }`
    }

    await cdsServerSetup(prompts, cdsSource)
    // Don't call base.end() - let the CDS server keep running
  } catch (error) {
    await base.error(error)
  }

}

async function cdsServerSetup(prompts, cdsSource) {
  const base = await import('../utils/base.js')

  base.debug('cdsServerSetup')
  const { default: Server } = await import('http')
  const port = process.env.PORT || prompts.port || 3010

  if (!(/^[1-9]\d*$/.test(port) && 1 <= 1 * port && 1 * port <= 65535)) {
    return base.error(`${port} ${baseLite.bundle.getText("errPort")}`)
  }

  const server = Server.createServer()
  const express = base.require('express')
  var app = express()

  // Assign Express app to CDS so plugins can use it
  cds.app = app

  // Load @sap/cds-fiori plugin manually since auto-loading isn't working
  // This bridges the ES module / CommonJS gap
  try {
    const require = createRequire(import.meta.url)
    console.log('✓ Loading @sap/cds-fiori plugin via CommonJS require...')
    
    // Get the plugin's preview functionality
    const preview = require('@sap/cds-fiori/app/preview')
    console.log('✓ @sap/cds-fiori plugin loaded successfully')
    console.log('✓ Preview module:', typeof preview)
  } catch (pluginErr) {
    console.warn(`Warning: Failed to load @sap/cds-fiori plugin: ${pluginErr.message}`)
  }

  // Handle server-level errors gracefully
  server.on('error', (err) => {
    base.debug(`Server Error: ${err.message}`)
    console.error(`Server Error: ${err.message}`)
  })

  // Handle any unhandled promise rejections in the server context
  process.on('unhandledRejection', (reason, promise) => {
    base.debug(`Unhandled Rejection: ${reason}`)
    console.error(`Unhandled Rejection:`, reason)
  })

  //CDS OData Service
  let vcap = ''
  let options = {
    "db": {
      kind: "hana",
      logLevel: "error"
    }
  }
  if (process.env.VCAP_SERVICES) {
    vcap = JSON.parse(process.env.VCAP_SERVICES)
    // @ts-ignore
    options.db.credentials = vcap.hana[0].credentials
  }

  // Configure CDS Fiori plugin for preview BEFORE cds.serve()
  if (!cds.env.fiori) {
    cds.env.fiori = {}
  }
  cds.env.fiori.preview = true
  console.log('✓ CDS Fiori preview enabled: cds.env.fiori.preview =', cds.env.fiori.preview)

  // Listen for the 'served' event to verify it fires
  cds.on('served', (services) => {
    console.log('✓ CDS "served" event fired')
    console.log('  Services:', Object.keys(services))
    console.log('  cds.env.fiori:', JSON.stringify(cds.env.fiori, null, 2))
    
    // Check if Fiori preview routes were registered
    if (app._router && app._router.stack) {
      const fioriRoutes = app._router.stack.filter(layer => 
        layer.route && layer.route.path && layer.route.path.includes('$fiori-preview')
      )
      console.log('  Fiori preview routes found:', fioriRoutes.length)
      if (fioriRoutes.length > 0) {
        console.log('  Route paths:', fioriRoutes.map(r => r.route.path))
      } else {
        console.warn('  WARNING: No $fiori-preview routes found in Express app')
      }
    }
  })

  // @ts-ignore
  cds.connect()

  let entity = prompts.table
  base.debug(`Entity Before ${entity}`)
  entity = entity.replace(/\./g, "_")
  entity = entity.replace(/::/g, "_")
  let graphQLEntity = entity.replace(/_/g, ".")
  base.debug(`GraphQL Entity After ${graphQLEntity}`)
  base.debug('CDS Source:')
  base.debug(cdsSource)
  console.log(`✓ Entity name for routes: ${entity}`)
  console.log('✓ CDS Source preview:')
  console.log(cdsSource.substring(0, 500) + '...')

  // @ts-ignore
  let compiledModel
  let odataURL = "/odata/v4/HanaCli"

  try {
    // Parse and compile the CDS source to get proper CSN model
    const parsedModel = await cds.parse(cdsSource)
    compiledModel = cds.compile(parsedModel)
    
    // Debug: show what's in the compiled model
    console.log('✓ Compiled model definitions:')
    Object.keys(compiledModel.definitions || {}).forEach(key => {
      console.log(`  - ${key}`)
    })

    // Ensure model is properly registered in CDS
    if (!cds.model) {
      cds.model = compiledModel
    }

    // Use CDS's built-in Fiori UI generation (powered by @sap/cds-fiori internally)
    // No need to maintain local manifest/fiori HTML copies
    let actualEntityName = entity // Will be updated from service
    const services = await cds.serve('all').from(compiledModel, {
      crashOnError: false
    })
      .at(odataURL)
      .in(app)
      .with(srv => {
        // Log the actual entity names in the service for debugging
        const entityNames = Object.keys(srv.entities || {})
        base.debug(`Service entities: ${entityNames.join(', ')}`)
        console.log(`✓ Service entities: ${entityNames.join(', ')}`)
        
        // Use the actual entity name from the service (first entity)
        // This ensures we match what CDS actually registered
        actualEntityName = entityNames.length > 0 ? entityNames[0] : entity
        console.log(`✓ Using entity name: ${actualEntityName}`)
        
        // @ts-ignore
        srv.on(['READ'], [actualEntityName], async (req) => {

          base.debug(`In Read Exit ${prompts.table}`)

          // Build a new query targeting the actual HANA table
          let query1 = await cds.parse.cql(`SELECT from ${prompts.table}`)
          
          // Copy important properties from the original query
          // @ts-ignore
          query1.SELECT.one = req.query.SELECT.one
          // @ts-ignore
          query1.SELECT.limit = req.query.SELECT.limit
          // @ts-ignore
          query1.SELECT.columns = req.query.SELECT.columns
          // @ts-ignore
          query1.SELECT.orderBy = req.query.SELECT.orderBy
          
          // Handle WHERE clause - check if it's in SELECT.where or in from.ref[0].where
          // @ts-ignore
          if (req.query.SELECT.where) {
            // @ts-ignore
            query1.SELECT.where = req.query.SELECT.where
          } 
          // @ts-ignore
          else if (req.query.SELECT.from && req.query.SELECT.from.ref && 
                   // @ts-ignore
                   req.query.SELECT.from.ref[0] && req.query.SELECT.from.ref[0].where) {
            // WHERE clause is nested in from.ref[0].where (common for single entity reads)
            // @ts-ignore
            query1.SELECT.where = req.query.SELECT.from.ref[0].where
          }

          // Apply xref transformations for columns
          // @ts-ignore
          if (query1.SELECT.columns) {
            // @ts-ignore
            for (let column of query1.SELECT.columns) {
              for (let xref of global.__xRef) {
                if (column.ref && column.ref[0] === xref.after) {
                  column.ref[0] = xref.after
                }
              }
            }
          }

          // Apply xref transformations for WHERE clause
          // @ts-ignore
          if (query1.SELECT.where) {
            // @ts-ignore
            for (let where of query1.SELECT.where) {
              if (where.ref) {
                for (let xref of global.__xRef) {
                  if (where.ref[0] === xref.after) {
                    where.ref[0] = xref.after
                  }
                }
              }
            }
          }

          // Apply xref transformations for ORDER BY
          // @ts-ignore
          if (query1.SELECT.orderBy) {
            // @ts-ignore
            for (let orderBy of query1.SELECT.orderBy) {
              for (let xref of global.__xRef) {
                if (orderBy.ref && orderBy.ref[0] === xref.after) {
                  orderBy.ref[0] = xref.after
                }
              }
            }
          }

          base.debug(query1)
          req.reply(await cds.tx(req).run(query1))
        })
      })

    // Manually emit the 'served' event since it's not firing automatically
    // The @sap/cds-fiori plugin listens for this event to register its routes
    console.log('✓ Manually emitting CDS "served" event...')
    cds.emit('served', services)

    // CDS OData - add homepage for preview
    // Serve homepage with links to available endpoints
    app.get('/', (_, res) => res.send(getIndex(odataURL, actualEntityName)))

    // Setup Swagger UI for API documentation
    try {
      Object.defineProperty(cds.compile.to, 'openapi', { configurable: true, get: () => base.require('@sap/cds-dk/lib/compile/to_openapi') })
      // @ts-ignore
      let metadata = await cds.compile.to.openapi(compiledModel, {
        service: 'HanaCli',
        servicePath: odataURL,
        'openapi:url': odataURL,
        'openapi:diagram': true,
        to: 'openapi'
      })

      let serveOptions = {
        explorer: true
      }
      const swaggerUi = await import('swagger-ui-express')
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(metadata, serveOptions))
    } catch (swaggerErr) {
      base.debug(`Swagger setup skipped: ${swaggerErr.message}`)
    }

    // Add error handling middleware
    app.use((err, req, res, next) => {
      base.debug(`Express Error Handler: ${err.message}`)
      console.error(`Request Error: ${err.message}`)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error', message: err.message })
      }
    })

    //Start the Server 
    server.on("request", app)
    server.listen(port, async () => {
      // @ts-ignore
      let serverAddr = `http://localhost:${server.address().port}`
      console.info(`HTTP Server: ${serverAddr}`)
      const { default: open } = await import('open')
      await open(serverAddr, {wait: true})
    })
  }
  catch (err) {
    base.debug(`CDS Setup Error: ${err.code} - ${err.message}`)
    console.log(err)
    if (err.code === 'MODULE_NOT_FOUND') {
      throw baseLite.bundle.getText("cds-dk")
    }
    process.exit(1)
  }
}

export function getIndex(odataURL, entity) {
  base.debug('getIndex')
  return `
  <html>
      <head>
      <meta name="color-scheme" content="dark light">
      <style>
          body {
              font-family: Avenir Next, sans-serif;
              margin: 44px;
              line-height: 1.5em;
          }
          h1 {
              margin-bottom: 0
          }
          h1 + .subtitle {
              margin: .2em;
              font-weight: 300;
          }
          h1, h2, h3 {
              font-weight: 400;
          }
          h1, a {
              text-decoration: none;
          }
          a.preview {
              font-size: 90%;
          }
          footer {
              border-top: .5px solid;
              margin-top: 44px;
              padding-top: 22px;
              width: 400px;
              font-size: 90%;
          }
      @media (prefers-color-scheme: dark) {
          body {
              background:#001119;
              color: #789;
          }
          h1 + .subtitle {
              color:#fb0;
          }
          h1, a {
              color:#fb0;
          }
          h2, h3 {
              color:#89a;
          }
          a.preview {
              color: #678;
          }
          footer {
              border-top: .5px solid #456;
              color: #567;
          }
      }
      </style>
      </head>
      <body>
          <h1>${baseLite.bundle.getText("cdsIndex")}</h1>
          <p class="subtitle"> These are the paths currently served ...

          <h2> Web Applications: </h2>
          <h3><a href="/api-docs/">Swagger UI</a></h3>
          <h3><a href="/$fiori-preview/HanaCli/${entity}">Fiori Preview</a></h3>

          <h2> Service Endpoints: </h2>
              <h3>
                  <a href="${odataURL}">${odataURL}</a> /
                  <a href="${odataURL}/$metadata">$metadata</a>
              </h3>
              <ul>
                  <li>
                      <a href="${odataURL}/${entity}">${entity}</a>                    
                  </li>
              </ul>
      </body>
  </html>`
}