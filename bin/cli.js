#!/usr/bin/env node
/*eslint no-console: 0, no-process-exit:0*/
/*eslint-env node, es6, module */

global.__hana_bin = __dirname;

require('console.table');
require('yargonaut')
    .style('blue')
    .helpStyle('green')
    .errorsStyle('red');
const errorHandler = err => { 
    console.error(err)
    global.__spinner.stop()
    process.exit(1) 
}
process.on('uncaughtException', errorHandler);
process.on('unhandledRejection', errorHandler);
const TextBundle = require("@sap/textbundle").TextBundle;
global.__bundle = new TextBundle("../_i18n/messages", require("../utils/locale").getLocale());
const bundle = global.__bundle;
const ora = require('ora');
// eslint-disable-next-line no-unused-vars
global.startSpinner = argv => global.__spinner = ora({type:'clock', text: '\n'}).start()

require('yargs')
    .scriptName('hana-cli')
    .usage(bundle.getText("usage")) //'Usage: $0 <cmd> [options]') 
    .demandCommand(1, "")
    .command(require('./activateHDI'))   
    .command(require('./adminHDI')) 
    .command(require('./adminHDIGroup'))        
    .command(require('./callProcedure'))  
    .command(require('./certificates'))   
    .command(require('./cds')) 
    .command(require('./openChangeLog'))  
    .command(require('./changeLog'))                      
    .command(require('./connect'))
    .command(require('./containers'))      
    .command(require('./copy2DefaultEnv'))  
    .command(require('./copy2Env'))         
    .command(require('./copy2Secrets'))  
    .command(require('./createContainer'))     
    .command(require('./createContainerUsers'))     
    .command(require('./createJWT'))  
    .command(require('./createModule'))     
    .command(require('./createXSAAdmin'))       
    .command(require('./dataTypes'))  
    .command(require('./dataVolumes')) 
    .command(require('./disks'))  
    .command(require('./dropContainer'))     
    .command(require('./features'))  
    .command(require('./featureUsage'))                    
    .command(require('./functions'))  
    .command(require('./hanaCloudHDIInstances'))   
    .command(require('./hanaCloudInstances'))     
    .command(require('./hanaCloudStart'))    
    .command(require('./hanaCloudStop'))   
    .command(require('./hdbsql'))
    .command(require('./hostInformation'))     
    .command(require('./indexes'))       
    .command(require('./iniContents'))  
    .command(require('./iniFiles'))            
    .command(require('./inspectFunction'))  
    .command(require('./inspectIndex'))         
    .command(require('./inspectJWT'))     
    .command(require('./inspectLibMember'))      
    .command(require('./inspectLibrary'))       
    .command(require('./inspectProcedure'))      
    .command(require('./inspectTable')) 
    .command(require('./inspectTrigger')) 
    .command(require('./inspectUser'))             
    .command(require('./inspectView'))
    .command(require('./libraries')) 
    .command(require('./massConvert'))     
    .command(require('./massUsers'))  
    .command(require('./matrix'))             
    .command(require('./objects'))     
    .command(require('./openDBExplorer'))                     
    .command(require('./ports'))
    .command(require('./privilegeError'))       
    .command(require('./procedures')) 
    .command(require('./querySimple'))   
    .command(require('./readMe')) 
    .command(require('./openReadMe'))          
    .command(require('./reclaim'))  
    .command(require('./rick'))           
    .command(require('./roles'))         
    .command(require('./schemas')) 
    .command(require('./connectViaServiceKey'))      
    .command(require('./sequences'))            
    .command(require('./status'))   
    .command(require('./synonyms'))     
    .command(require('./systemInfo'))  
    .command(require('./tables')) 
    .command(require('./traces'))     
    .command(require('./traceContents'))          
    .command(require('./triggers'))   
    .command(require('./hanaCloudUPSInstances'))      
    .command(require('./users'))       
    .command(require('./version'))
    .command(require('./views')) 
    .option('h', {
        alias: 'help',
        description: bundle.getText("help")
    })
    .help('help').alias('help', 'h')
    .example(bundle.getText("example"))
    .epilog(bundle.getText("epilog"))
    .version(false)
    .completion()
  //  .showHelpOnFail(false, bundle.getText("helpFail"))
 //   .middleware([startSpinner])
    .argv;
    
//  console.log(argv);