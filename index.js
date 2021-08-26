/*eslint no-console: 0 */
/*eslint-env node, es6 */


import * as cf from "./utils/cf.js"

async function  init(){

    let data = await cf.getHANAInstanceByName('HANA_CLOUD_2')
  /*  last_operation: [Object],
      relationships: [Object],
      metadata: [Object],
      links: [Object] */
    console.table(data.resources[0].last_operation)
}
init()


//console.info(`Nothing to see here yet`);
//process.exit(1);