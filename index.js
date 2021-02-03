/*eslint no-console: 0 */
/*eslint-env node, es6 */

async function  init(){
    const cf = require("./utils/cf")
    let data = await cf.getHANAInstanceByName('HANA_Cloud_Trial_TPJ')
  /*  last_operation: [Object],
      relationships: [Object],
      metadata: [Object],
      links: [Object] */
    console.table(data.resources[0].last_operation)
}
init()


//console.info(`Nothing to see here yet`);
//process.exit(1);