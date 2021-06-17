const base = require("../utils/base")

exports.command = 'createModule'
exports.aliases = ['createDB', 'createDBModule']
exports.describe = base.bundle.getText("createModule")

exports.builder = base.getBuilder({
    folder: {
        alias: ['f', 'Folder'],
        type: 'string',
        default: 'db',
        desc: base.bundle.getText("folder")
    },
    hanaCloud: {
        alias: ['hc', 'hana-cloud', 'hanacloud'],
        type: 'boolean',
        default: true,
        desc: base.bundle.getText("hanaCloud")
    }
}, false)

exports.handler = (argv) => {
    base.promptHandler(argv, save, {
        folder: {
            description: base.bundle.getText("folder"),
            type: 'string',
            required: true
        },
        hanaCloud: {
            description: base.bundle.getText("hanaCloud"),
            type: 'boolean',
            required: true,
            default: true
        }
    }, false)
}

async function save(prompts) {
    base.debug('save')
    let fs = require('fs')
    let dir = './' + prompts.folder

    !fs.existsSync(dir) && fs.mkdirSync(dir)

    let build = `
// Executes the CDS build depending on whether we have a top-level package.json.
// Package.json is not available when we are called by CF/XSA buildpack.  In this case we don't do anything
// and just assume our model was already built and is available as part of this DB app.
//
// This is a workaround that will be replaced by a solution where CDS generates the DB module along with package.json.

const fs = require('fs');
const childproc = require('child_process');

if (fs.existsSync('../package.json')) {
    // true at build-time, false at CF staging time
    childproc.execSync('npm install && npm run build', {
        cwd: '..',
        stdio: 'inherit'
    });
}
    `
    fs.writeFile(dir + '/.build.js', build, (err) => {
        if (err) throw err
    })

    const latestVersion = require('latest-version')
    let hdiVersion = await latestVersion('@sap/hdi-deploy')
    base.debug(`HDI Version ${hdiVersion}`)
    var packageContent = ``
    if (prompts.hanaCloud) {
        packageContent = `
    {
        "name": "deploy",
        "dependencies": {
          "@sap/hdi-deploy": "^${hdiVersion}"
        },
        "engines": {
          "node": "^10"
        },
        "scripts": {
          "start": "node node_modules/@sap/hdi-deploy/deploy.js  --auto-undeploy"
        }
      }   
    `
    } else {
        packageContent = `
        {
            "name": "deploy",
            "dependencies": {
              "@sap/hdi-deploy": "^${hdiVersion}"
            },
            "engines": {
              "node": "^10"
            },
            "scripts": {
              "postinstall": "node .build.js",                
              "start": "node node_modules/@sap/hdi-deploy/deploy.js  --auto-undeploy"
            }
          }   
        `
    }

    fs.writeFile(dir + '/package.json', packageContent, (err) => {
        if (err) throw err
    })

    !fs.existsSync(dir + '/src') && fs.mkdirSync(dir + '/src')
    let hdiconfig = ""
    if (prompts.hanaCloud) {
        hdiconfig = `
        {
            "minimum_feature_version": "1000",
            "file_suffixes": {
                "hdbapplicationtime": {
                    "plugin_name": "com.sap.hana.di.applicationtime"
                },
                "hdbcalculationview": {
                    "plugin_name": "com.sap.hana.di.calculationview"
                },
                "hdbcollection": {
                    "plugin_name": "com.sap.hana.di.collection"
                },
                "hdbconstraint": {
                    "plugin_name": "com.sap.hana.di.constraint"
                },
                "txt": {
                    "plugin_name": "com.sap.hana.di.copyonly"
                },
                "hdbdropcreatetable": {
                    "plugin_name": "com.sap.hana.di.dropcreatetable"
                },
                "hdbflowgraph": {
                    "plugin_name": "com.sap.hana.di.flowgraph"
                },
                "hdbfunction": {
                    "plugin_name": "com.sap.hana.di.function"
                },
                "hdbgraphworkspace": {
                    "plugin_name": "com.sap.hana.di.graphworkspace"
                },
                "hdbindex": {
                    "plugin_name": "com.sap.hana.di.index"
                },
                "hdblibrary": {
                    "plugin_name": "com.sap.hana.di.library"
                },
                "hdblogicalschema": {
                    "plugin_name": "com.sap.hana.di.logicalschema"
                },
                "hdbprocedure": {
                    "plugin_name": "com.sap.hana.di.procedure"
                },
                "hdbprojectionview": {
                    "plugin_name": "com.sap.hana.di.projectionview"
                },
                "hdbprojectionviewconfig": {
                    "plugin_name": "com.sap.hana.di.projectionview.config"
                },
                "hdbreptask": {
                    "plugin_name": "com.sap.hana.di.reptask"
                },
                "hdbresultcache": {
                    "plugin_name": "com.sap.hana.di.resultcache"
                },
                "hdbrole": {
                    "plugin_name": "com.sap.hana.di.role"
                },
                "hdbroleconfig": {
                    "plugin_name": "com.sap.hana.di.role.config"
                },
                "hdbsearchruleset": {
                    "plugin_name": "com.sap.hana.di.searchruleset"
                },
                "hdbsequence": {
                    "plugin_name": "com.sap.hana.di.sequence"
                },
                "hdbanalyticprivilege": {
                    "plugin_name": "com.sap.hana.di.analyticprivilege"
                },
                "hdbview": {
                    "plugin_name": "com.sap.hana.di.view"
                },
                "hdbstatistics": {
                    "plugin_name": "com.sap.hana.di.statistics"
                },
                "hdbstructuredprivilege": {
                    "plugin_name": "com.sap.hana.di.structuredprivilege"
                },
                "hdbsynonym": {
                    "plugin_name": "com.sap.hana.di.synonym"
                },
                "hdbsynonymconfig": {
                    "plugin_name": "com.sap.hana.di.synonym.config"
                },
                "hdbsystemversioning": {
                    "plugin_name": "com.sap.hana.di.systemversioning"
                },
                "hdbtable": {
                    "plugin_name": "com.sap.hana.di.table"
                },
                "hdbmigrationtable": {
                    "plugin_name": "com.sap.hana.di.table.migration"
                },
                "hdbtabletype": {
                    "plugin_name": "com.sap.hana.di.tabletype"
                },
                "hdbtabledata": {
                    "plugin_name": "com.sap.hana.di.tabledata"
                },
                "csv": {
                    "plugin_name": "com.sap.hana.di.tabledata.source"
                },
                "properties": {
                    "plugin_name": "com.sap.hana.di.tabledata.properties"
                },
                "tags": {
                    "plugin_name": "com.sap.hana.di.tabledata.properties"
                },
                "hdbtrigger": {
                    "plugin_name": "com.sap.hana.di.trigger"
                },
                "hdbvirtualfunction": {
                    "plugin_name": "com.sap.hana.di.virtualfunction"
                },
                "hdbvirtualfunctionconfig": {
                    "plugin_name": "com.sap.hana.di.virtualfunction.config"
                },
                "hdbvirtualpackagehadoop": {
                    "plugin_name": "com.sap.hana.di.virtualpackage.hadoop"
                },
                "hdbvirtualpackagesparksql": {
                    "plugin_name": "com.sap.hana.di.virtualpackage.sparksql"
                },
                "hdbvirtualprocedure": {
                    "plugin_name": "com.sap.hana.di.virtualprocedure"
                },
                "hdbvirtualprocedureconfig": {
                    "plugin_name": "com.sap.hana.di.virtualprocedure.config"
                },
                "hdbvirtualtable": {
                    "plugin_name": "com.sap.hana.di.virtualtable"
                },
                "hdbvirtualtableconfig": {
                    "plugin_name": "com.sap.hana.di.virtualtable.config"
                }
            }
        }
        `
    } else {
        hdiconfig = `
    {
        "file_suffixes": {
         "hdbcollection": {
          "plugin_name": "com.sap.hana.di.collection"
         },
         "hdbsystemversioning": {
          "plugin_name": "com.sap.hana.di.systemversioning"
         },
         "hdbsynonym": {
          "plugin_name": "com.sap.hana.di.synonym"
         },
         "hdbsynonymconfig": {
          "plugin_name": "com.sap.hana.di.synonym.config"
         },
         "hdbtable": {
          "plugin_name": "com.sap.hana.di.table"
         },
         "hdbdropcreatetable": {
          "plugin_name": "com.sap.hana.di.dropcreatetable"
         },
         "hdbvirtualtable": {
          "plugin_name": "com.sap.hana.di.virtualtable"
         },
         "hdbvirtualtableconfig": {
          "plugin_name": "com.sap.hana.di.virtualtable.config"
         },
         "hdbindex": {
          "plugin_name": "com.sap.hana.di.index"
         },
         "hdbfulltextindex": {
          "plugin_name": "com.sap.hana.di.fulltextindex"
         },
         "hdbconstraint": {
          "plugin_name": "com.sap.hana.di.constraint"
         },
         "hdbtrigger": {
          "plugin_name": "com.sap.hana.di.trigger"
         },
         "hdbstatistics": {
          "plugin_name": "com.sap.hana.di.statistics"
         },
         "hdbview": {
          "plugin_name": "com.sap.hana.di.view"
         },
         "hdbcalculationview": {
          "plugin_name": "com.sap.hana.di.calculationview"
         },
         "hdbprojectionview": {
          "plugin_name": "com.sap.hana.di.projectionview"
         },
         "hdbprojectionviewconfig": {
          "plugin_name": "com.sap.hana.di.projectionview.config"
         },
         "hdbresultcache": {
          "plugin_name": "com.sap.hana.di.resultcache"
         },
         "hdbcds": {
          "plugin_name": "com.sap.hana.di.cds"
         },
         "hdbfunction": {
          "plugin_name": "com.sap.hana.di.function"
         },
         "hdbvirtualfunction": {
          "plugin_name": "com.sap.hana.di.virtualfunction"
         },
         "hdbvirtualfunctionconfig": {
          "plugin_name": "com.sap.hana.di.virtualfunction.config"
         },
         "hdbhadoopmrjob": {
          "plugin_name": "com.sap.hana.di.virtualfunctionpackage.hadoop"
         },
         "jar": {
          "plugin_name": "com.sap.hana.di.virtualfunctionpackage.hadoop"
         },
         "hdbtabletype": {
          "plugin_name": "com.sap.hana.di.tabletype"
         },
         "hdbprocedure": {
          "plugin_name": "com.sap.hana.di.procedure"
         },
         "hdbvirtualprocedure": {
          "plugin_name": "com.sap.hana.di.virtualprocedure"
         },
         "hdbvirtualprocedureconfig": {
          "plugin_name": "com.sap.hana.di.virtualprocedure.config"
         },
         "hdbafllangprocedure": {
          "plugin_name": "com.sap.hana.di.afllangprocedure"
         },
         "hdblibrary": {
          "plugin_name": "com.sap.hana.di.library"
         },
         "hdbsequence": {
          "plugin_name": "com.sap.hana.di.sequence"
         },
         "hdbrole": {
          "plugin_name": "com.sap.hana.di.role"
         },
         "hdbroleconfig": {
          "plugin_name": "com.sap.hana.di.role.config"
         },
         "hdbstructuredprivilege": {
          "plugin_name": "com.sap.hana.di.structuredprivilege"
         },
         "hdbanalyticprivilege": {
          "plugin_name": "com.sap.hana.di.analyticprivilege"
         },
         "hdbtabledata": {
          "plugin_name": "com.sap.hana.di.tabledata"
         },
         "csv": {
          "plugin_name": "com.sap.hana.di.tabledata.source"
         },
         "properties": {
          "plugin_name": "com.sap.hana.di.tabledata.properties"
         },
         "tags": {
          "plugin_name": "com.sap.hana.di.tabledata.properties"
         },
         "hdbgraphworkspace": {
          "plugin_name": "com.sap.hana.di.graphworkspace"
         },
         "hdbflowgraph": {
          "plugin_name": "com.sap.hana.di.flowgraph"
         },
         "hdbreptask": {
          "plugin_name": "com.sap.hana.di.reptask"
         },
         "hdbsearchruleset": {
          "plugin_name": "com.sap.hana.di.searchruleset"
         },
         "hdbtextconfig": {
          "plugin_name": "com.sap.hana.di.textconfig"
         },
         "hdbtextdict": {
          "plugin_name": "com.sap.hana.di.textdictionary"
         },
         "hdbtextrule": {
          "plugin_name": "com.sap.hana.di.textrule"
         },
         "hdbtextinclude": {
          "plugin_name": "com.sap.hana.di.textrule.include"
         },
         "hdbtextlexicon": {
          "plugin_name": "com.sap.hana.di.textrule.lexicon"
         },
         "hdbtextminingconfig": {
          "plugin_name": "com.sap.hana.di.textminingconfig"
         },
         "txt": {
          "plugin_name": "com.sap.hana.di.copyonly"
         }
        }
       }   
    `
    }
    fs.writeFile(dir + '/src/.hdiconfig', hdiconfig, (err) => {
        if (err) throw err
    })
    return base.end()
}
