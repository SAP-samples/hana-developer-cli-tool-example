/*eslint no-console: 0 */
/*eslint-env node, es6 */
// @ts-check

import * as btp from "./utils/btp.js"
//import * as cf from "./utils/cf.js"

/**
 * Initialize and test BTP connectivity
 * @returns {Promise<void>}
 */
export async function  init(){

   // let data = await btp.getBTPConfig()
   let data = await btp.getInfo()
    console.log(data)

 /*   let data = await cf.getHANAInstanceByName('HANA_CLOUD_2')
    last_operation: [Object],
      relationships: [Object],
      metadata: [Object],
      links: [Object]
    console.table(data.resources[0].last_operation) */
}
init()


//console.info(`Nothing to see here yet`);
//process.exit(1);