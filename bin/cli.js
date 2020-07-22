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
    .demandCommand()
    .command(require('./connect'))
    .command(require('./status'))    
    .command(require('./hdbsql'))
    .command(require('./version'))
    .command(require('./ports'))
    .command(require('./systemInfo'))        
    .command(require('./schemas'))       
    .command(require('./tables')) 
    .command(require('./inspectTable'))  
    .command(require('./views'))      
    .command(require('./inspectView'))         
    .command(require('./objects'))    
    .command(require('./procedures')) 
    .command(require('./inspectProcedure'))     
    .command(require('./callProcedure'))     
    .command(require('./functions'))   
    .command(require('./inspectFunction'))      
    .command(require('./libraries'))  
    .command(require('./inspectLibrary'))  
    .command(require('./inspectLibMember'))  
    .command(require('./inspectJWT')) 
    .command(require('./createJWT'))                
    .command(require('./sequences'))   
    .command(require('./synonyms')) 
    .command(require('./triggers'))    
    .command(require('./inspectTrigger'))     
    .command(require('./indexes'))  
    .command(require('./inspectIndex'))         
    .command(require('./users'))    
    .command(require('./inspectUser'))    
    .command(require('./roles'))            
    .command(require('./privilegeError'))     
    .command(require('./certificates'))    
    .command(require('./dataTypes')) 
    .command(require('./dataVolumes'))    
    .command(require('./disks'))       
    .command(require('./features'))  
    .command(require('./featureUsage')) 
    .command(require('./hostInformation'))    
    .command(require('./iniFiles'))      
    .command(require('./iniContents')) 
    .command(require('./traces'))     
    .command(require('./traceContents'))                                     
    .command(require('./activateHDI'))    
    .command(require('./adminHDI')) 
    .command(require('./adminHDIGroup')) 
    .command(require('./createXSAAdmin'))    
    .command(require('./createContainer'))     
    .command(require('./createContainerUsers'))          
    .command(require('./dropContainer'))    
    .command(require('./reclaim'))   
    .command(require('./massUsers')) 
    .command(require('./querySimple'))    
    .command(require('./cds')) 
    .command(require('./createModule')) 
    .command(require('./massConvert')) 
    .command(require('./connectViaServiceKey'))   
    .command(require('./containers'))     
    .command(require('./openDBExplorer'))   
    .option('h', {
        alias: 'help',
        description: bundle.getText("help")
    })
    .help('help').alias('help', 'h')
    .example(bundle.getText("example"))
    .epilog(bundle.getText("epilog"))
    .version(false)
    .completion()
    .showHelpOnFail(false, bundle.getText("helpFail"))
 //   .middleware([startSpinner])
    .argv;
    
//  console.log(argv);