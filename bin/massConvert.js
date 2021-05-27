const base = require("../utils/base")

const fsp = require('fs/promises')
const path = require("path")


exports.command = 'massConvert [schema] [table]'
exports.aliases = ['mc', 'massconvert', 'massConv', 'massconv']
exports.describe = base.bundle.getText("massConvert")

exports.builder = base.getBuilder({
    table: {
        alias: ['t', 'Table'],
        type: 'string',
        default: "*",
        desc: base.bundle.getText("table")
    },
    schema: {
        alias: ['s', 'Schema'],
        type: 'string',
        default: '**CURRENT_SCHEMA**',
        desc: base.bundle.getText("schema")
    },
    limit: {
        alias: ['l'],
        type: 'number',
        default: 200,
        desc: base.bundle.getText("limit")
    },
    folder: {
        alias: ['f', 'Folder'],
        type: 'string',
        default: './',
        desc: base.bundle.getText("folder")
    },
    filename: {
        alias: ['n', 'Filename'],
        type: 'string',
        desc: base.bundle.getText("filename")
    },
    output: {
        alias: ['o', 'Output'],
        choices: ["hdbtable", "cds", "hdbmigrationtable"],
        default: "cds",
        type: 'string',
        desc: base.bundle.getText("outputType")
    },
    useHanaTypes: {
        alias: ['hana'],
        type: 'boolean',
        default: false,
        desc: base.bundle.getText("useHanaTypes")
    },
    useCatalogPure: {
        alias: ['catalog', 'pure'],
        type: 'boolean',
        default: false,
        desc: base.bundle.getText("useCatalogPure")
    },
    namespace: {
        alias: ['ns'],
        type: 'string',        
        desc: base.bundle.getText("namespace"),
        default: ''
    },
    synonyms: {
        type: 'string',        
        desc: base.bundle.getText("synonyms"),
        default: ''
    },
    keepPath: {        
        type: 'boolean',
        default: false,
        desc: base.bundle.getText("keepPath")
    },
    noColons: {        
        type: 'boolean',
        default: false,
        desc: base.bundle.getText("noColons")
    },
})

exports.handler = (argv) => {
    base.promptHandler(argv, getTables, {
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
        limit: {
            description: base.bundle.getText("limit"),
            type: 'number',
            required: true
        },
        folder: {
            description: base.bundle.getText("folder"),
            type: 'string',
            required: true
        },
        filename: {
            description: base.bundle.getText("filename"),
            type: 'string',
            required: true,
            ask: () => {
                return false
            }
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
        useCatalogPure: {
            description: base.bundle.getText("useCatalogPure"),
            type: 'boolean'
        },
        namespace:{
            description: base.bundle.getText("namespace"),
            type: 'string',
            required: false
        },
        synonyms:{
            description: base.bundle.getText("synonyms"),
            type: 'string',
            required: false
        },
        keepPath: {        
            type: 'boolean',            
            description: base.bundle.getText("keepPath")
        },
        noColons: {        
            type: 'boolean',            
            description: base.bundle.getText("noColons")
        }
    })
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

async function getTables(prompts) {
    base.debug('getTables')
    try {
        base.setPrompts(prompts)
        const db = await base.createDBConnection()
        const dbClass = require("sap-hdbext-promisfied")
        const cds = require('@sap/cds')

        let schema = await dbClass.schemaCalc(prompts, db)
        base.debug(`${base.bundle.getText("schema")}: ${schema}, ${base.bundle.getText("table")}: ${prompts.table}`)

        let results = await getTablesInt(schema, prompts.table, db, prompts.limit)
        const dbInspect = require("../utils/dbInspect")
        dbInspect.options.useHanaTypes = prompts.useHanaTypes
        dbInspect.options.keepPath = prompts.keepPath
        dbInspect.options.noColons = prompts.noColons

        const search = `"${schema}".`  
        const replacer = 
        new RegExp(escapeRegExp(search), 'g')

        switch (prompts.output) {
            case 'hdbtable': {
                let zip = new require("node-zip")()
                if (prompts.useCatalogPure) {
                for (let table of results) {
                    let output = await dbInspect.getDef(db, schema, table.TABLE_NAME)
                    output = output.slice(7)
                    output = output.replace(replacer, '')
                    await zip.file(table.TABLE_NAME.toString() + ".hdbtable", output + "\n\n")
                }} else {
                    for (let table of results) {
                        let object = await dbInspect.getTable(db, schema, table.TABLE_NAME)
                        let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
                        let constraints = await dbInspect.getConstraints(db, object)
                        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable")
                        let all = cds.compile.to.hdbtable(cds.parse(cdsSource))
                        let output
                        for (let [src] of all) {
                            output = src
                        }
                        await zip.file(table.TABLE_NAME.toString() + ".hdbtable", output + "\n\n")
                    }
                }
                let fs = require('fs')
                let dir = prompts.folder
                !fs.existsSync(dir) && fs.mkdirSync(dir)
                let data = await zip.generate({
                    base64: false,
                    compression: "DEFLATE"
                })
                let filename = prompts.filename || dir + 'export.zip'
                fs.writeFile(filename, data, 'binary', (err) => {
                    if (err) throw err
                })
                console.log(`${base.bundle.getText("contentWritten")}: ${filename}`)
                break
            }
            case 'hdbmigrationtable': {
                let zip = new require("node-zip")()

                if (prompts.useCatalogPure) {
                    for (let table of results) {
                        let output = await dbInspect.getDef(db, schema, table.TABLE_NAME)
                        output = output.slice(7)
                        output = `== version = 1 \n` + output
                        output = output.replace(replacer, '')
                        await zip.file(table.TABLE_NAME.toString() + ".hdbmigrationtable", output + "\n\n")
                    }
                } else {
                    for (let table of results) {
                        let object = await dbInspect.getTable(db, schema, table.TABLE_NAME)
                        let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
                        let constraints = await dbInspect.getConstraints(db, object)
                        let cdsSource = await dbInspect.formatCDS(db, object, fields, constraints, "hdbtable")
                        let all = cds.compile.to.hdbtable(cds.parse(cdsSource))
                        let output
                        for (let [src] of all) {
                            output = `== version = 1 \n` + src
                        }
                        await zip.file(table.TABLE_NAME.toString() + ".hdbmigrationtable", output + "\n\n")
                    }
                }

                let fs = require('fs')
                let dir = prompts.folder
                !fs.existsSync(dir) && fs.mkdirSync(dir)
                let data = await zip.generate({
                    base64: false,
                    compression: "DEFLATE"
                })
                let filename = prompts.filename || dir + 'export.zip'
                fs.writeFile(filename, data, 'binary', (err) => {
                    if (err) throw err
                })
                console.log(`${base.bundle.getText("contentWritten")}: ${filename}`)
                break
            }
            default: {
                var cdsSource = prompts.namespace && `namespace ${prompts.namespace};\n` || ""
                for (let table of results) {
                    let object = await dbInspect.getTable(db, schema, table.TABLE_NAME)
                    let fields = await dbInspect.getTableFields(db, object[0].TABLE_OID)
                    let constraints = await dbInspect.getConstraints(db, object)                    
                    cdsSource += await dbInspect.formatCDS(db, object, fields, constraints, "table") + '\n'
                }
                let fs = require('fs')
                let dir = prompts.folder
                !fs.existsSync(dir) && fs.mkdirSync(dir)
                let filename = prompts.filename || dir + 'export.cds'
                fs.writeFile(filename, cdsSource, (err) => {
                    if (err) throw err
                })
                console.log(`${base.bundle.getText("contentWritten")}: ${filename}`);             
                
                // store synonyms if filename is provided
                if (prompts.synonyms) {    
                    if(!prompts.synonyms.includes('hdbsynonym')){
                        prompts.synonyms += '.hdbsynonym'
                    }
                    await fsp.mkdir(path.dirname(prompts.synonyms), {recursive:true})
                    await fsp.writeFile(
                        prompts.synonyms,
                        JSON.stringify(dbInspect.results.synonyms, null, '\t')
                        )
                    console.log(`Synonyms are written to ${prompts.synonyms} file`)
                }

                break

            }
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}


async function getTablesInt(schema, table, client, limit) {
    base.debug(`getTablesInt ${schema} ${table} ${limit}`)
    const dbClass = require("sap-hdbext-promisfied")
    table = dbClass.objectName(table)
    var query =
        `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
  WHERE SCHEMA_NAME LIKE ? 
    AND TABLE_NAME LIKE ? 
    AND IS_USER_DEFINED_TYPE = 'FALSE'
  ORDER BY SCHEMA_NAME, TABLE_NAME `
    if (limit !== null | require("@sap/hdbext").sqlInjectionUtils.isAcceptableParameter(limit)) {
        query += `LIMIT ${limit.toString()}`
    }
    return await client.statementExecPromisified(await client.preparePromisified(query), [schema, table])
}