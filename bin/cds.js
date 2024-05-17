import * as base from '../utils/base.js'
import * as dbInspect from '../utils/dbInspect.js'

//import * as conn from '../utils/connections.js'

// @ts-ignore
import cds from '@sap/cds'

global.__xRef = []

export const command = 'cds [schema] [table]'
export const aliases = ['cdsPreview']
export const describe = base.bundle.getText("cds")
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
  view: {
    alias: ['v', 'View'],
    type: 'boolean',
    default: false,
    desc: base.bundle.getText("viewOpt")
  },
  useHanaTypes: {
    alias: ['hana'],
    type: 'boolean',
    default: false,
    desc: base.bundle.getText("useHanaTypes")
  },
  useQuoted: {
    alias: ['q', 'quoted', 'quotedIdentifiers'],
    desc: base.bundle.getText("gui.useQuoted"),
    type: 'boolean',
    default: false
  },
  port: {
    alias: ['p'],
    type: 'number',
    default: false,
    desc: base.bundle.getText("port")
  }
})

export async function handler(argv) {
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
      let tableSource = await dbInspect.formatCDS(db, object, fields, constraints, "table", "preview")
      cdsSource +=

        `@cds.persistence.skip\n ${tableSource} \n }`
    } else {
      console.log(`Schema: ${schema}, View: ${prompts.table}`)
      object = await dbInspect.getView(db, schema, prompts.table)
      fields = await dbInspect.getViewFields(db, object[0].VIEW_OID)
      let viewSource = await dbInspect.formatCDS(db, object, fields, null, "view", "preview")
      cdsSource +=
        `${viewSource} \n }`
    }

    await cdsServerSetup(prompts, cdsSource)
    return base.end()
  } catch (error) {
    base.error(error)
  }

}

async function cdsServerSetup(prompts, cdsSource) {

  base.debug('cdsServerSetup')
  const { default: Server } = await import('http')
  const port = process.env.PORT || prompts.port || 3010

  if (!(/^[1-9]\d*$/.test(port) && 1 <= 1 * port && 1 * port <= 65535)) {
    return base.error(`${port} ${base.bundle.getText("errPort")}`)
  }

  const server = Server.createServer()
  const express = base.require('express')
  var app = express()

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

  // @ts-ignore
  cds.connect()//options)

  let odataURL = "/odata/v4/opensap.hana.CatalogService/"
  let entity = prompts.table
  base.debug(`Entity Before ${entity}`)
  entity = entity.replace(/\./g, "_")
  entity = entity.replace(/::/g, "_")
  let graphQLEntity = entity.replace(/_/g, ".")
  base.debug(`GraphQL Entity After ${graphQLEntity}`)
  // entity = entity.replace(/:/g, "")
  base.debug(cdsSource)
  // @ts-ignore
  cds.serve('all').from(await cds.parse(cdsSource), {
    crashOnError: false
  })
    .at(odataURL)
    .in(app)
    //.to('fiori')

    .with(srv => {
      // @ts-ignore
      srv.on(['READ'], [entity, `HanaCli.${graphQLEntity}`], async (req) => {
        base.debug(`In Read Exit ${prompts.table}`)

        let query1 = await cds.parse.cql(`SELECT from ${prompts.table}`)
        // @ts-ignore
        base.debug(req.query)
        // @ts-ignore
        query1.SELECT.one = req.query.SELECT.one
        // @ts-ignore
        req.query.SELECT.from = query1.SELECT.from

        // query1.SELECT = req.query.SELECT
        // @ts-ignore
        query1.SELECT.limit = req.query.SELECT.limit
        //query1.SELECT.search = req.query.SELECT.search
        // @ts-ignore
        query1.SELECT.where = req.query.SELECT.where
        //query1.SELECT.count = req.query.SELECT.count
        // @ts-ignore
        query1.SELECT.orderBy = req.query.SELECT.orderBy
        //query1.SELECT.columns = req.query.SELECT.columns  
        req.query = query1

        //let query = "SELECT "

        /*         if (req.query.SELECT.count === true){
                  // @ts-ignore
                    const db = new base.dbClass(await conn.createConnection(prompts))
                    query += `COUNT(*) AS "counted" FROM "${prompts.table}"`
                    base.debug(query)
                    let count = await db.execSQL(query)
                    base.debug(count)
                    return (count)
                } */
        // @ts-ignore
        base.debug(JSON.stringify(req.query))
        // @ts-ignore
        if (req.query.SELECT.columns) { //&& req.query.SELECT.columns[0].func) {
          // @ts-ignore
          for (let column of req.query.SELECT.columns) {
            for (let xref of global.__xRef) {
              if (column.ref[0] === xref.after) {
                column.ref[0] = xref.after
              }
            }
          }
        }


        //Req Parameters for Single Record GET
        if (req.params) {
          if (req.params.length > 0) {
            // @ts-ignore
            const { SELECT } = req.query
            SELECT.where = []
            //  for (let param of req.params) {
            // @ts-ignore
            //  for (let property in param) {
            SELECT.where.push({ "ref": ["ID"] })
            SELECT.where.push("=")
            SELECT.where.push({ "val": req.params[0] })
            //  SELECT.where.push("and")
            //  }
            // }
            // SELECT.where.splice(-1, 1)
          }
        }

        //Where
        // @ts-ignore
        if (req.query.SELECT.where) {
          // @ts-ignore
          for (let where of req.query.SELECT.where) {
            if (where.ref) {
              for (let xref of global.__xRef) {
                if (where.ref[0] === xref.after) {
                  where.ref[0] = xref.after
                }
              }
            }
          }
        }



        //Order By
        // @ts-ignore
        if (req.query.SELECT.orderBy) {
          //query += ` ORDER BY `
          // @ts-ignore
          for (let orderBy of req.query.SELECT.orderBy) {
            for (let xref of global.__xRef) {
              if (orderBy.ref[0] === xref.after) {
                orderBy.ref[0] = xref.after
              }
            }
          }
        }
        base.debug(req.query)
        req.reply(await cds.tx(req).run(req.query))
      })
    })
    .catch((err) => {
      console.log(err)
      process.exit(1)
    })

  //Swagger UI

  Object.defineProperty(cds.compile.to, 'openapi', { configurable: true, get: () => base.require('@sap/cds-dk/lib/compile/openapi') })
  try {
    // @ts-ignore
    let metadata = await cds.compile.to.openapi(cds.parse(cdsSource), {
      service: 'HanaCli',
      servicePath: '/odata/v4/opensap.hana.CatalogService/',
      'openapi:url': '/odata/v4/opensap.hana.CatalogService/',
      'openapi:diagram': true,
      to: 'openapi'
    })

    let serveOptions = {
      explorer: true
    }
    const swaggerUi = await import('swagger-ui-express')
    app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(metadata, serveOptions))

    app.get('/', (_, res) => res.send(getIndex(odataURL, entity)))
    app.get('/fiori.html', (_, res) => {
      const manifest = _manifest(odataURL, entity, prompts.table)
      res.send(fiori(manifest, odataURL, entity))
    })

    app.get('/app/Component.js', (_, res) => {
      const manifest = _manifest(odataURL, entity, prompts.table)
      const content = `sap.ui.define(["sap/fe/core/AppComponent"], function(AppComponent) {
      "use strict";
      return AppComponent.extend("preview.Component", {
        metadata: { manifest: ${JSON.stringify(manifest, null, 2)} }
      });
    });`
      res.send(content)
    })

    //Start the Server 
    server.on("request", app)
    server.listen(port, async () => {
      // @ts-ignore
      let serverAddr = `http://localhost:${server.address().port}`
      console.info(`HTTP Server: ${serverAddr}`)

      //GraphQL 
      /*  const GraphQLAdapter = base.require('@cap-js/graphql/lib/GraphQLAdapter') //require('@sap/cds-graphql/lib')
       const adapter = new GraphQLAdapter(cds.services, { graphiql: true, path: '/graphql' })
       app.use('/graphql', adapter) */
      // app.use(new GraphQLAdapter(cds.services, { graphiql: true }))
      // console.log("serving GraphQL endpoint for all services { at: '/graphql' }")
      const { default: open } = await import('open')
      open(serverAddr)
    })
  }
  catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      // Re-throw not "Module not found" errors 
      throw e
    }
    throw base.bundle.getText("cds-dk")
  }
  return
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
          <h1>${base.bundle.getText("cdsIndex")}</h1>
          <p class="subtitle"> These are the paths currently served ...

          <h2> Web Applications: </h2>
          <h3><a href="/fiori.html">Fiori Test UI</a></h3> 
          <h3><a href="/api/api-docs/">Swagger UI</a></h3> 

          <h2> Service Endpoints: </h2>
              <h3>
                  <a href="${odataURL}">${odataURL}</a> /
                  <a href="${odataURL}$metadata">$metadata</a>
              </h3>
              <ul>
                  <li>
                      <a href="/odata/v4/opensap.hana.CatalogService/${entity}">${entity}</a>                    
                  </li>
              </ul>
      </body>
  </html>`
}

export function _manifest(odataURL, entity, table) {
  base.debug(`_manifest ${odataURL} ${entity} ${table}`)
  //const serviceProv = odataURL
  const serviceInfo = entity

  const manifest = {
    _version: '1.8.0',
    'sap.app': {
      id: 'preview',
      type: 'application',
      title: `Preview of ${table}`,
      description: 'Preview Application',
      dataSources: {
        mainService: {
          uri: `${odataURL}`,
          type: 'OData',
          settings: {
            odataVersion: '4.0'
          }
        }
      },
    },
    'sap.ui5': {
      dependencies: {
        libs: {
          'sap.fe.templates': {}
        }
      },
      models: {
        '': {
          dataSource: 'mainService',
          //preload: true,
          settings: {
            synchronizationMode: 'None',
            operationMode: 'Server',
            autoExpandSelect: true,
            earlyRequests: true,
            groupProperties: {
              default: {
                submit: 'Auto'
              }
            }
          }
        }
      },
      routing: {
        routes: [
          {
            name: `${entity}ListRoute`,
            target: `${entity}ListTarget`,
            pattern: ':?query:',
          },
          {
            name: `${entity}DetailsRoute`,
            target: `${entity}DetailsTarget`,
            pattern: `${entity}({key}):?query:`,
          }
        ],
        targets: {
          [`${entity}ListTarget`]: {
            type: 'Component',
            id: `${entity}ListTarget`,
            name: 'sap.fe.templates.ListReport',
            options: {
              settings: {
                entitySet: `${entity}`,
                initialLoad: true,
                navigation: {
                  [`${entity}`]: {
                    detail: {
                      route: `${entity}DetailsRoute`
                    }
                  }
                }
              }
            }
          },
          [`${entity}DetailsTarget`]: {
            type: 'Component',
            id: `${entity}DetailsTarget`,
            name: 'sap.fe.templates.ObjectPage',
            options: {
              settings: {
                entitySet: `${entity}`,
                navigation: {}
              }
            }
          }
        }
      },
    },
    contentDensities: {
      compact: true,
      cozy: true
    },
    'sap.ui': {
      technology: 'UI5',
      fullWidth: true
    },
    'sap.fiori': {
      registrationIds: [],
      archeType: 'transactional'
    },
  }

  const { routing } = manifest['sap.ui5']
  for (const { navProperty, targetEntity } of serviceInfo) {
    // add a route for the navigation property
    routing.routes.push(
      {
        name: `${navProperty}Route`,
        target: `${navProperty}Target`,
        pattern: `${entity}({key})/${navProperty}({key2}):?query:`,
      }
    )
    // add a route target leading to the target entity
    routing.targets[`${navProperty}Target`] = {
      type: 'Component',
      id: `${navProperty}Target`,
      name: 'sap.fe.templates.ObjectPage',
      options: {
        // @ts-ignore
        settings: {
          entitySet: targetEntity
        }
      }
    }
    // wire the new route from the source entity's navigation (see above)
    routing.targets[`${entity}DetailsTarget`].options.settings.navigation[navProperty] = {
      detail: {
        route: `${navProperty}Route`
      }
    }
  }

  return manifest
}

export function fiori(manifest, odataURL, entity,) {
  base.debug(`fiori ${odataURL} ${entity}`)
  // @ts-ignore
  let ui5Version = cds.env.preview && cds.env.preview.ui5 && cds.env.preview.ui5.version
  ui5Version = ui5Version ? ui5Version + '/' : ''
  base.debug(`SAPUI5 Version ${ui5Version}`)
  return `
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${manifest['sap.app'].title}</title>
    <script>
    window["sap-ushell-config"] = {
      defaultRenderer: "fiori2",
      applications: {
        "hanacli-preview": {
          title: "Browse ${entity}",
          description: "from ${odataURL}",
          additionalInformation: "SAPUI5.Component=app",
          applicationType : "URL",
          url: "./app",
          navigationMode: "embedded"
        }
      }
    }
  </script>    
    <script id="sap-ushell-bootstrap" src="https://ui5.sap.com/${ui5Version}test-resources/sap/ushell/bootstrap/sandbox.js"></script>
    <script id="sap-ui-bootstrap" src="https://ui5.sap.com/${ui5Version}resources/sap-ui-core.js"
        data-sap-ui-libs="sap.m, sap.ushell, sap.collaboration, sap.ui.layout" data-sap-ui-compatVersion="edge"
        data-sap-ui-theme="sap_horizon" data-sap-ui-frameOptions="allow"></script>
        <script src="https://ui5.sap.com/${ui5Version}test-resources/sap/ushell/bootstrap/standalone.js"></script>        

        <script>
        // load and register Fiori2 icon font
        jQuery.sap.require("sap.ushell.iconfonts");
        jQuery.sap.require("sap.ushell.services.AppConfiguration");
        sap.ushell.iconfonts.registerFiori2IconFont();
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          sap.ui.getCore().applyTheme( "sap_horizon_dark" )
        }
        sap.ui.getCore().attachInit(function() { sap.ushell.Container.createRenderer().placeAt("content") })
    </script>
    </head>
<body class="sapUiBody sapUShellFullHeight" id="content"></body>
</html>
`
}
