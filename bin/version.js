const base = require("../utils/base")

exports.command = 'version'
exports.aliases = 'ver'
exports.describe = base.bundle.getText("version")
exports.builder = base.getBuilder({}, false)
exports.handler = (argv) => {
  base.promptHandler(argv, verOutput, {}, false)
}

 async function verOutput() {
  base.debug('verOutput')
  const colors = require("colors/safe")
  const log = console.log
  const highlight = require('cli-highlight').highlight
  const info = version()
  Object.keys(info).forEach(key => log(highlight(`${key}: ${info[key]}`)))
  console.log(`https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/CHANGELOG.md`)
  const latestVersion = require('latest-version')
  let selfVersion = await latestVersion('hana-cli')
  console.log(`Latest hana-cli version available on npmjs.com: ${colors.green(selfVersion)}`)
  if (info['hana-cli'] < selfVersion){
    console.log(`${colors.red('Local version of hana-cli is out of date.')} Consider upgrading with "${colors.green('npm upgrade -g hana-cli')}"`)
  }

  function version() {
    base.debug('version')
    const info = version4()
    Object.defineProperty(info, 'home', { value: __dirname })
    info['hana-cli home'] = info.home
    Object.defineProperty(info, 'initialHome', { value: global.__hana_bin ? global.__hana_bin : '' })
    if (process.env.DEBUG) info['hana-cli initial home'] = info.initialHome
    return info
  }

  function version4(pkgPath = '..', info = {}, parentPath) {
    base.debug('version4')
    try {
      const pkj = require(pkgPath + '/package.json')
      const name = pkj.name || pkgPath
      if (info[name]) return // safeguard against circular dependencies
      info[name] = pkj.version
      // recurse sap packages in dependencies...
      for (let dep in pkj.dependencies) if (dep.startsWith('@sap/') || dep.startsWith('sap-hdbext-promisfied')) version4(dep, info, pkgPath)
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') info[pkgPath] = '-- missing --'  // unknown error
      else if (parentPath) version4(parentPath + '/node_modules/' + pkgPath, info)
    }
    return info
  }
}