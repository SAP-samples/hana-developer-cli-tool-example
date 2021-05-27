const base = require("../utils/base")
global.__xRef = []

exports.command = 'cds [schema] [table]'
exports.aliases = ['cdsPreview']
exports.describe = base.bundle.getText("cds")

exports.builder = base.getBuilder({
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
  port: {
    alias: ['p'],
    type: 'integer',
    default: false,
    desc: base.bundle.getText("port")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, cds, {
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
    port: {
      description: base.bundle.getText("port"),
      required: false,
      ask: () => {
        return false
      }
    },
  })
}


async function cds(prompts) {
  base.debug('cds')
  try {
    base.setPrompts(prompts)
    const dbClass = require("sap-hdbext-promisfied")
    const dbInspect = require("../utils/dbInspect")
    const db = await base.createDBConnection()

    let schema = await dbClass.schemaCalc(prompts, db)
    let object, fields, constraints, cdsSource
    dbInspect.options.useHanaTypes = prompts.useHanaTypes
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
      `service HanaCli { `

    let vcap = JSON.parse(process.env.VCAP_SERVICES)
    vcap.hana[0].credentials.schema = object[0].SCHEMA_NAME
    vcap.hana.splice(1, 100)
    process.env.VCAP_SERVICES = JSON.stringify(vcap)
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
      cdsSource += `{$Type: 'UI.DataField', Value: ![${field.COLUMN_NAME}], ![@UI.Importance]:#High}, \n`
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
        `${tableSource} \n }`
    } else {
      console.log(`Schema: ${schema}, View: ${prompts.table}`)
      object = await dbInspect.getView(db, schema, prompts.table)
      fields = await dbInspect.getViewFields(db, object[0].VIEW_OID)
      let viewSource = await dbInspect.formatCDS(db, object, fields, null, "view", "preview")
      cdsSource +=
        `${viewSource} \n }`
    }

    // console.log(cdsSource);
    await cdsServerSetup(prompts, cdsSource)
    return base.end()
  } catch (error) {
    base.error(error)
  }

}

async function cdsServerSetup(prompts, cdsSource) {

  base.debug('cdsServerSetup')
  const port = process.env.PORT || prompts.port || 3010

  if (!(/^[1-9]\d*$/.test(port) && 1 <= 1 * port && 1 * port <= 65535)){
    return base.error(`${port} ${base.bundle.getText("errPort")}`)
   }

  const server = require("http").createServer()
  const express = require("express")
  var app = express()

  //CDS OData Service
  const cds = require("@sap/cds")
  let options = {
    kind: "hana",
    logLevel: "error",
  }
  cds.connect(options)
  cds.env.requires.db = {}
  cds.env.requires.db.multiTenant = false

  const dbClass = require("sap-hdbext-promisfied")
  const conn = require("../utils/connections")

  let odataURL = "/odata/v4/opensap.hana.CatalogService/"
  let entity = prompts.table
  entity = entity.replace(/\./g, "_")
  entity = entity.replace(/::/g, "_")
 // entity = entity.replace(/:/g, "")
  cds.serve('all').from(await cds.parse(cdsSource), {
    crashOnError: false
  })
    .at(odataURL)
    .in(app)
    .to('fiori')
    .with(srv => {
      srv.on(['READ'], entity, async (req) => {
        req.query.SELECT.from.ref = [`"${prompts.table}"`]
        const db = new dbClass(await conn.createConnection(prompts))
        let query = "SELECT "
        if (req.query.SELECT.columns[0].func) {
          query += `COUNT(*) AS "counted" FROM "${prompts.table}"`
          return (await db.execSQL(query))
        }

        for (let column of req.query.SELECT.columns) {
          for (let xref of global.__xRef) {
            if (column.ref[0] === xref.after) {
              column.ref[0] = xref.after
            }
          }
        }

        //Req Paramers for Single Record GET
        if (req.params) {
          if (req.params.length > 0) {
            const { SELECT } = req.query
            SELECT.where = []
            for (let param of req.params) {
              for (let property in param) {
                SELECT.where.push({ "ref": [property] })
                SELECT.where.push("=")
                SELECT.where.push({ "val": param[property] })
                SELECT.where.push("and")
              }
            }
            SELECT.where.splice(-1, 1)
          }
        }

        //Where
        if (req.query.SELECT.where) {
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
        if (req.query.SELECT.orderBy) {
          query += ` ORDER BY `
          for (let orderBy of req.query.SELECT.orderBy) {
            for (let xref of global.__xRef) {
              if (orderBy.ref[0] === xref.after) {
                orderBy.ref[0] = xref.after
              }
            }
          }
        }
        return (req.query)
      })
    })
    .catch((err) => {
      console.log(err)
      process.exit(1)
    })

  //Swagger UI
  const swaggerUi = require('swagger-ui-express')
  Object.defineProperty(cds.compile.to, 'openapi', { configurable: true, get: () => require('@sap/cds-dk/lib/compile/openapi') })
  let metadata = await cds.compile.to.openapi(cds.parse(cdsSource), {
    service: 'HanaCli',
    servicePath: '/odata/v4/opensap.hana.CatalogService/',
    'openapi:url': '/odata/v4/opensap.hana.CatalogService/',
    'openapi:diagram': true
  })
  let serveOptions = {
    explorer: true
  }
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
  server.listen(port, function () {
    let serverAddr = `http://localhost:${server.address().port}`
    console.info(`HTTP Server: ${serverAddr}`)
    const open = require('open')
    open(serverAddr)
  })

  return
}

function getIndex(odataURL, entity) {
  base.debug('getIndex')
  return this._html = `
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

function _manifest(odataURL, entity, table) {
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

function fiori(manifest, odataURL, entity,) {
  base.debug(`fiori ${odataURL} ${entity}`)
  let ui5Version = '1.89.0' //'1.85.3' //= cds.env.preview && cds.env.preview.ui5 && cds.env.preview.ui5.version
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
    <script id="sap-ushell-bootstrap" src="https://sapui5.hana.ondemand.com/${ui5Version}test-resources/sap/ushell/bootstrap/sandbox.js"></script>
    <script id="sap-ui-bootstrap" src="https://sapui5.hana.ondemand.com/${ui5Version}resources/sap-ui-core.js"
        data-sap-ui-libs="sap.m, sap.ushell, sap.collaboration, sap.ui.layout" data-sap-ui-compatVersion="edge"
        data-sap-ui-theme="sap_fiori_3_dark" data-sap-ui-frameOptions="allow"></script>
        <script src="https://sapui5.hana.ondemand.com/${ui5Version}test-resources/sap/ushell/bootstrap/standalone.js"></script>        

        <script>
        // load and register Fiori2 icon font
        jQuery.sap.require("sap.ushell.iconfonts");
        jQuery.sap.require("sap.ushell.services.AppConfiguration");
        sap.ushell.iconfonts.registerFiori2IconFont();
        sap.ui.getCore().attachInit(function() { sap.ushell.Container.createRenderer().placeAt("content") })
    </script>
    </head>
<body class="sapUiBody sapUShellFullHeight" id="content"></body>
</html>
`
}
