const colors = require("colors/safe");
const bundle = global.__bundle;
global.__xRef = [];
const dbClass = require("../utils/dbPromises");
const dbInspect = require("../utils/dbInspect");

exports.command = 'cds [schema] [table]';
exports.aliases = ['cdsPreview'];
exports.describe = bundle.getText("cds");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  table: {
    alias: ['t', 'Table'],
    type: 'string',
    desc: bundle.getText("table")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: bundle.getText("schema")
  },
  view: {
    alias: ['v', 'View'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("viewOpt")
  },
};

exports.handler = function (argv) {
  const prompt = require('prompt');
  prompt.override = argv;
  prompt.message = colors.green(bundle.getText("input"));
  prompt.start();

  var schema = {
    properties: {
      admin: {
        description: bundle.getText("admin"),
        type: 'boolean',
        required: true,
        ask: () => {
          return false;
        }
      },
      table: {
        description: bundle.getText("table"),
        type: 'string',
        required: true
      },
      schema: {
        description: bundle.getText("schema"),
        type: 'string',
        required: true
      },
      view: {
        description: bundle.getText("viewOpt"),
        type: 'boolean',
        required: true,
        ask: () => {
          return false;
        }
      },
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    cds(result);
  });
}


async function cds(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));
  let schema = await dbClass.schemaCalc(result, db);
  let object, fields, constraints, cdsSource;



  if (!result.view) {
    console.log(`Schema: ${schema}, Table: ${result.table}`);
    object = await dbInspect.getTable(db, schema, result.table);
    fields = await dbInspect.getTableFields(db, object[0].TABLE_OID);
    constraints = await dbInspect.getConstraints(db, object);
    cdsSource = await dbInspect.formatCDS(object, fields, constraints, "table");
    cdsSource =
      `service HanaCli { ${cdsSource} } \n`;
    cdsSource +=
      `annotate HanaCli.${object[0].TABLE_NAME} with @(`
  } else {
    console.log(`Schema: ${schema}, View: ${result.table}`);
    object = await dbInspect.getView(db, schema, result.table);
    fields = await dbInspect.getViewFields(db, object[0].VIEW_OID);
    cdsSource = await dbInspect.formatCDS(object, fields, null, "view");
    cdsSource =
      `service HanaCli { ${cdsSource} } \n`;
    cdsSource +=
      `annotate HanaCli.${object[0].VIEW_NAME}  with @(`
  }


  let vcap = JSON.parse(process.env.VCAP_SERVICES);
  vcap.hana[0].credentials.schema = object[0].SCHEMA_NAME;
  vcap.hana.splice(1, 100);
  process.env.VCAP_SERVICES = JSON.stringify(vcap);
  cdsSource +=
    `Capabilities: {
			InsertRestrictions: {Insertable: true},
			UpdateRestrictions: {Updatable: true},
			DeleteRestrictions: {Deletable: true}
    },
    HeaderInfo: {
      TypeName: '${result.table}',
      Title:'${result.table}'
    },
    UI: { 
      LineItem: [ \n`;
  for (let field of fields) {
    cdsSource += `{$Type: 'UI.DataField', Value: ${field.COLUMN_NAME}, "@UI.Importance":#High}, \n`
  }
  cdsSource +=
    `], \n`
  cdsSource +=
    ` Facets: [
    {$Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#Main', "@UI.Importance": #High}			
  ],
  FieldGroup#Main: { \n 
    Data: [ \n`
  for (let field of fields) {
    cdsSource += `{$Type: 'UI.DataField', Value: ${field.COLUMN_NAME}, "@UI.Importance":#High}, \n`
  }
  cdsSource +=
    `] },\n`

  cdsSource += ` SelectionFields: [ `;
  for (let field of fields) {
    cdsSource += `${field.COLUMN_NAME}, \n`
  }
  cdsSource +=
    `] \n`
  cdsSource += `} );\n`;

  // console.log(cdsSource);
  await cdsServerSetup(result, cdsSource);
  return;
}

async function cdsServerSetup(result, cdsSource) {

  const port = process.env.PORT || 3010;
  const server = require("http").createServer();
  const express = require("express");
  var app = express();

  //CDS OData Service
  const cds = require("@sap/cds");
  var options = {
    kind: "hana",
    logLevel: "error"
  };
  cds.connect(options);
  let odataURL = "/odata/v4/opensap.hana.CatalogService/";
  let entity = result.table.replace(/\./g, "_");
  entity = entity.replace(/:/g, "");
  cds.serve('all').from(await cds.parse(cdsSource), {
    crashOnError: false
  })
    .at(odataURL)
    .in(app)
    .to('fiori')
    .with(srv => {
      srv.on('READ', entity, async (req) => {
        //console.log(JSON.stringify(req.query.SELECT));
        req.query.SELECT.from.ref = [result.table];
        const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));
        let query = "SELECT ";
        if (req.query.SELECT.columns[0].func) {
          query += `COUNT(*) AS "counted" FROM "${result.table}"`;
          return (await db.execSQL(query));
        }

        for (let column of req.query.SELECT.columns) {
          for (let xref of global.__xRef) {
            if (column.ref[0] === xref.after) {
              query += ` "${xref.before}" AS "${xref.after}", `;
            }
          }
        }
        query = query.substring(0, query.length - 2);
        query += ` FROM "${result.table}" `;

        //Where
        if (req.query.SELECT.where) {
          query += ` WHERE `
          for (let where of req.query.SELECT.where) {
            if (where.ref) {
              for (let xref of global.__xRef) {

                if (where.ref[0] === xref.after) {
                  query += ` "${xref.before}" `;
                }
              }
            } else if (where.val) {
              query += ` '${where.val}' `;
            } else {
              query += ` ${where} `;
            }
          }
        }

        //Order By
        if (req.query.SELECT.orderBy) {
          query += ` ORDER BY `;
          for (let orderBy of req.query.SELECT.orderBy) {
            for (let xref of global.__xRef) {
              if (orderBy.ref[0] === xref.after) {
                query += ` "${xref.before}" ${orderBy.sort} `;
              }
            }
          }
        }

        //Limit & Offset
        if (req.query.SELECT.limit) {
          if (req.query.SELECT.limit.rows) {
            query += ` LIMIT ${req.query.SELECT.limit.rows.val} `;
            if (req.query.SELECT.limit.offset) {
              query += ` OFFSET ${req.query.SELECT.limit.offset.val} `;
            }
          }
        }
        return (await db.execSQL(query));
      })
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });

  //Swagger UI
  const swaggerUi = require('swagger-ui-express')
  let metadata = await cds.compile.to.edmx(cds.parse(cdsSource), {
    version: 'v4',
  })
  const odataOptions = { basePath: '/odata/v4/opensap.hana.CatalogService/' }
  const {
    parse,
    convert
  } = require('odata2openapi')
  const converter = require('swagger2openapi')
  let convOptions = {}
  parse(metadata)
    .then(service => convert(service.entitySets, odataOptions, service.version))
    .then(swagger => {
      converter.convertObj(swagger, convOptions)
        .then(output => {
          let serveOptions = {
            explorer: true
          }
          app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(output.openapi, serveOptions))
        })
    })
    .catch(error => console.error(error))


  app.get('/', (_, res) => res.send(getIndex(odataURL, entity)));
  app.get('/fiori.html', (_, res) => {
    const manifest = _manifest(odataURL, entity, result.table)
    res.send(fiori(manifest))
  });

  //Start the Server 
  server.on("request", app);
  server.listen(port, function () {
    let serverAddr = `http://localhost:${server.address().port}`
    console.info(`HTTP Server: ${serverAddr}`);
    const open = require('open');
    open(serverAddr);
  });

  return;
}

function getIndex(odataURL, entity) {
  return this._html = `
  <html>
      <head>
          <style>
              body { margin: 44px; font-family: Avenir Next, sans-serif }
              h1 { }
              .small { font-size: 10px }
          </style>
      </head>
      <body>
          <h1>${bundle.getText("cdsIndex")}</h1>
          <p> These are the paths currently served ...
          <h3><a href="/fiori.html">Fiori Test UI</a></h3> 
          <h3><a href="/api/api-docs/">Swagger UI</a></h3> 
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

  const manifest = {
    _version: '1.8.0',
    'sap.app': {
      id: 'preview',
      type: 'application',
      title: `Preview of ${table}`,
      description: 'Preview Application',
      dataSources: {
        mainService: {
          uri: `${odataURL}/`,
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
          'sap.fe': {}
        }
      },
      models: {
        '': {
          dataSource: 'mainService',
          preload: true,
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
  return manifest
}

function fiori(manifest) {
  let ui5Version //= cds.env.preview && cds.env.preview.ui5 && cds.env.preview.ui5.version
  ui5Version = ui5Version ? ui5Version + '/' : ''
  return `
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${manifest['sap.app'].title}</title>
    <script src="https://sapui5.hana.ondemand.com/${ui5Version}test-resources/sap/ushell/bootstrap/sandbox.js"></script>
    <script src="https://sapui5.hana.ondemand.com/${ui5Version}resources/sap-ui-core.js"
        data-sap-ui-libs="sap.m, sap.ushell, sap.collaboration, sap.ui.layout" data-sap-ui-compatVersion="edge"
        data-sap-ui-theme="sap_fiori_3" data-sap-ui-frameOptions="allow"></script>
    <script>
        sap.ui.getCore().attachInit(() => {
            sap.ui.require(["sap/fe/AppComponent", "sap/m/Shell", "sap/ui/core/ComponentContainer"], function (AppComponent, Shell, ComponentContainer) {
                var GenericComponent = AppComponent.extend("preview.Component", {
                    metadata: { manifest: ${JSON.stringify(manifest, null, 2)} }
                });
                new Shell({
                    app: new ComponentContainer({
                        height: "100%",
                        component: new GenericComponent({
                            id: "preview.Component"
                        }),
                        async: true
                    }),
                    appWidthLimited: false
                }).placeAt("content");
            })
        })
    </script>
</head>
<body class="sapUiBody" id="content"></body>
</html>
`
}
