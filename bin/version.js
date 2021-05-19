const base = require("../utils/base")

exports.command = 'version'
exports.aliases = 'ver'
exports.describe = base.bundle.getText("version")
exports.builder = base.getBuilder({}, false)
exports.handler = (argv) => {
  base.promptHandler(argv, verOutput, {}, false)
}

function verOutput() {
  const log = console.log
  const highlight = require('cli-highlight').highlight
  const info = version()
  Object.keys(info).forEach(key => log(highlight(`${key}: ${info[key]}`)))
  console.log(`https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/CHANGELOG.md`)

  function version() {
    const info = version4()
    Object.defineProperty(info, 'home', { value: __dirname })
    info['hana-cli home'] = info.home
    Object.defineProperty(info, 'initialHome', { value: global.__hana_bin ? global.__hana_bin : '' })
    if (process.env.DEBUG) info['hana-cli initial home'] = info.initialHome
    return info
  }

  function version4(pkgPath = '..', info = {}, parentPath) {
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