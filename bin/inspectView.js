const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");
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
    choices: ["tbl", "sql", "cds", "json", "yaml", "cdl", "annos", "edm", "edmx", "swgr"],
    default: "tbl",
    type: 'string',
    desc: bundle.getText("outputType")
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

  let object = await dbInspect.getView(db, schema, result.view);
  let fields = await dbInspect.getViewFields(db, object[0].VIEW_OID);
  const cds = require("@sap/cds");

  switch (result.output) {
    case 'tbl':
      console.log(object[0]);
      console.log("\n")
      console.table(fields);
      break;
    case 'sql': {
      let definition = await dbInspect.getDef(db, schema, result.table);
      console.log(definition);
      break;
    }
    case 'cds': {
      let cdsSource = await dbInspect.formatCDS(object, fields, null, "view");
      console.log(cdsSource);
      break;
    }
    case 'edmx': {
      let cdsSource = await dbInspect.formatCDS(object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      let metadata = await cds.compile.to.edmx(cds.parse(cdsSource), {
				version: 'v4',
			})
      console.log(JSON.stringify(metadata, null, 4));
      break;
    }
    case 'edm': {
      let cdsSource = await dbInspect.formatCDS(object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      console.log(JSON.stringify(cds.compile(cds.parse(cdsSource)).to(result.output), null, 4));
      break;
    }
    case 'swgr': {
      let cdsSource = await dbInspect.formatCDS(object, fields, null, "view");
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
        .then(swagger => console.log(JSON.stringify(swagger, null, 2)))
        .catch(error => console.error(error))
      break;
    }
    default: {
      let cdsSource = await dbInspect.formatCDS(object, fields, null, "view");
      cdsSource = `service HanaCli { ${cdsSource} } `;
      console.log(cds.compile(cds.parse(cdsSource)).to(result.output, { as: 'json' }));
      break;
    }
  }
  global.__spinner.stop()
  return;
}