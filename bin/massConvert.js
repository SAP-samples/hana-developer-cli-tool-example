const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'massConvert [schema] [table]';
exports.aliases = ['mc', 'massconvert', 'massConv', 'massconv'];
exports.describe = bundle.getText("massConvert");


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
        default: "*",
        desc: bundle.getText("table")
    },
    schema: {
        alias: ['s', 'Schema'],
        type: 'string',
        default: '**CURRENT_SCHEMA**',
        desc: bundle.getText("schema")
    },
    limit: {
        alias: ['l'],
        type: 'number',
        default: 200,
        desc: bundle.getText("limit")
    },
    folder: {
        alias: ['f', 'Folder'],
        type: 'string',
        default: './',
        desc: bundle.getText("folder")
    },
    output: {
        alias: ['o', 'Output'],
        choices: ["hdbtable", "cds"],
        default: "cds",
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
            limit: {
                description: bundle.getText("limit"),
                type: 'number',
                required: true
            },
            folder: {
                description: bundle.getText("folder"),
                type: 'string',
                required: true
            },
            output: {
                description: bundle.getText("outputType"),
                type: 'string',
                //       validator: /t[bl]*|s[ql]*|c[ds]?/,
                required: true
            }
        }
    };

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message);
        }
        //    global.startSpinner()
        getTables(result);
    });
}


async function getTables(result) {
    const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

    let schema = await dbClass.schemaCalc(result, db);
    console.log(`Schema: ${schema}, Table: ${result.table}`);

    let results = await getTablesInt(schema, result.table, db, result.limit);

    const dbInspect = require("../utils/dbInspect")

    switch (result.output) {
        case 'hdbtable': {
            let zip = new require("node-zip")()
            for (let table of results) {
                let output = await dbInspect.getDef(db, schema, table.TABLE_NAME)
                output = output.slice(7)
                await zip.file(table.TABLE_NAME.toString() + ".hdbtable", output + "\n\n");
            }
            let fs = require('fs');
            let dir = result.folder;
            !fs.existsSync(dir) && fs.mkdirSync(dir);
            let data = await zip.generate({
                base64: false,
                compression: "DEFLATE"
            });
            fs.writeFile(dir + 'export.zip', data, 'binary', (err) => {
                if (err) throw err;
            });
            console.log(`Content written to: ${dir}export.zip`);
            break
        }
        default: {
            var cdsSource = ""
            for (let table of results) {
                let object = await dbInspect.getTable(db, schema, table.TABLE_NAME);
                let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID);
                let constraints = await dbInspect.getConstraints(db, object);
                cdsSource += await dbInspect.formatCDS(object, fields, constraints, "table") + '\n';
            }
            let fs = require('fs');
            let dir = result.folder;
            !fs.existsSync(dir) && fs.mkdirSync(dir);
            fs.writeFile(dir + 'export.cds', cdsSource, (err) => {
                if (err) throw err;
            });
            console.log(`Content written to: ${dir}export.cds`);
            break
        }
    }
    return;
}


async function getTablesInt(schema, table, client, limit) {
    table = dbClass.objectName(table);

    var query =
        `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
  WHERE SCHEMA_NAME LIKE ? 
    AND TABLE_NAME LIKE ? 
  ORDER BY SCHEMA_NAME, TABLE_NAME `;
    if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
        query += `LIMIT ${limit.toString()}`;
    }
    return await client.statementExecPromisified(await client.preparePromisified(query), [schema, table]);
}