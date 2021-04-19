const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");
const dbInspect = require("../utils/dbInspect");

exports.command = 'inspectView [schema] [view]';
exports.aliases = ['iv', 'view', 'insVew', 'inspectview'];
exports.describe = bundle.getText("inspectView");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  },
  view: {
    alias: ['v', 'View'],
    type: 'string',
    desc: bundle.getText("view")
  },
  schema: {
    alias: ['s', 'Schema'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: bundle.getText("schema")
  },
  output: {
    alias: ['o', 'Output'],
    choices: ["tbl", "sql", "sqlite", "cds", "json", "yaml", "cdl", "annos", "edm", "edmx", "swgr", "openapi", "hdbview", "hdbcds"],
    default: "tbl",
    type: 'string',
    desc: bundle.getText("outputType")
  },
  useHanaTypes: {    
    alias: ['hana'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("useHanaTypes")
  }
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
      view: {
        description: bundle.getText("view"),
        type: 'string',
        required: true
      },
      schema: {
        description: bundle.getText("schema"),
        type: 'string',
        required: true
      },
      output: {
        description: bundle.getText("outputType"),
        type: 'string',
        //  validator: /t[bl]*|s[ql]*|c[ds]?/,
        required: true
      },
      useHanaTypes: {
        description: bundle.getText("useHanaTypes"),
        type: 'boolean'        
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    tableInspect(result);
  });
}


async function tableInspect(result) {
  const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let schema = await dbClass.schemaCalc(result, db);
  console.log(`Schema: ${schema}, View: ${result.view}`);

  dbInspect.options.useHanaTypes = result.useHanaTypes;
  
  let object = await dbInspect.getView(db, schema, result.view);
  let fields = await dbInspect.getViewFields(db, object[0].VIEW_OID);
  const cds = require("@sap/cds");
  const highlight = require('cli-highlight').highlight 

  switch (result.output) {
    case 'tbl':
      console.log(object[0]);
      console.log("\n")
      console.table(fields);
      break;
    case 'sql': {
      let definition = await dbInspect.getDef(db, schema, result.view);
      console.log(highlight(definition))
      break;
    }
    case 'sqlite': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "hdbview");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      console.log(highlight(cds.compile.to.sql(cds.parse(cdsSource), {as: 'str', names: 'quoted', dialect: 'sqlite'})))
      break
    } 
    case 'cds': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view");
      console.log(highlight(cdsSource))
      break;
    }
    case 'json': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      console.log(highlight(cds.compile.to.json(cds.parse(cdsSource))))
      break
    }
    case 'hdbcds': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "hdbview");
      let all = cds.compile.to.hdbcds(cds.parse(cdsSource))

      for (let [src] of all) 
        console.log (highlight(src))
        console.log (`\n`)
      break
    }        
    case 'hdbview': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "hdbview");
      let all = cds.compile.to.hdbtable(cds.parse(cdsSource))

      for (let [src] of all) 
        console.log (highlight(src))
        console.log (`\n`)
      break
    }        
    case 'yaml': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      console.log(highlight(cds.compile.to.yaml(cds.parse(cdsSource))))
      break
    }    
    case 'cdl': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      console.log(highlight(cds.compile.to.cdl(cds.parse(cdsSource))))
      break
    }     
    case 'edmx': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      let metadata = await cds.compile.to.edmx(cds.parse(cdsSource), {
				version: 'v4',
			})
      console.log(highlight(metadata))
      break;
    }
    case 'annos': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      let metadata = await cds.compile.to.edmx(cds.parse(cdsSource), {
				annos: 'only'
			})
      console.log(highlight(metadata))
      break;
    }    
    case 'edm': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      console.log(highlight(JSON.stringify(cds.compile.to.edm(cds.parse(cdsSource)), null, 4)))
      break;
    }
    case 'swgr': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      let metadata = await cds.compile.to.edmx(cds.parse(cdsSource), {
				version: 'v4',
			})
      const odataOptions = {  basePath: '/odata/v4/opensap.hana.CatalogService/'}
      const {
        parse,
        convert
      } = require('odata2openapi')
      parse(metadata)
        .then(service => convert(service.entitySets, odataOptions, service.version))
        .then(swagger => console.log(highlight(JSON.stringify(swagger, null, 2))))
        .catch(error => console.error(error))
      break;
    }
    case 'openapi': {
      let cdsSource = await dbInspect.formatCDS(db, object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      let metadata = await cds.compile.to.openapi(cds.parse(cdsSource), {
        service: 'HanaCli',
        servicePath: '/odata/v4/opensap.hana.CatalogService/',
        'openapi:url': '/odata/v4/opensap.hana.CatalogService/',
        'openapi:diagram': true
      })
      console.log(highlight(JSON.stringify(metadata, null, 2)))   
      break
    }
    default: {
      console.error(`Unsupported Format`)
      break
    }
  }
  global.__spinner.stop()
  return;
}