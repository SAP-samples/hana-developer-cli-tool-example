// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as cf from '../utils/cf.js'
import * as btp from '../utils/btp.js'

export const command = 'version'
export const aliases = 'ver'
export const describe = baseLite.bundle.getText("version")
export const builder = baseLite.getBuilder({}, false)
export async function handler(argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, verOutput, {}, false)
}

export async function verOutput() {
  const base = await import('../utils/base.js')
  base.debug('verOutput')
  base.startSpinnerInt()
  const [{ highlight }, { default: latestVersion }] =
    await Promise.all([
      import('cli-highlight'),
      import('latest-version')
    ])
  const colors = baseLite.colors
  const log = console.log

  const info = await getVersion()
  base.stopSpinnerInt()
  Object.keys(info).forEach(key => log(highlight(`${key}: ${info[key]}`)))
  console.log(baseLite.bundle.getText("version.node", [colors.green(process.version)]))
  console.log(baseLite.bundle.getText("version.changelog", [colors.blue('https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/CHANGELOG.md')]))


  let selfVersion = await latestVersion('hana-cli')
  console.log(baseLite.bundle.getText("version.latestAvailable", [colors.green(selfVersion)]))
  if (info['hana-cli'] < selfVersion) {
    console.log(`${colors.red(baseLite.bundle.getText("version.outOfDate"))} ${baseLite.bundle.getText("version.upgradeHint", [colors.green('npm upgrade -g hana-cli')])}`)
  }
  // No need to call base.end() as there's no DB connection to clean up
  // Let the process exit naturally to avoid Windows libuv assertion errors
}

export function version4(pkgPath = '..', info = {}, parentPath) {
  baseLite.debug('version4')
  try {
    const pkj = baseLite.require(pkgPath + '/package.json')
    const name = pkj.name || pkgPath
    if (info[name]) return // safeguard against circular dependencies
    info[name] = pkj.version
    // recurse sap packages in dependencies...
    for (let dep in pkj.dependencies) if (
      dep.startsWith('@sap/') || dep === 'sap-hdb-promisfied' || dep === 'hdb' || dep.startsWith('@cap-js')
    ) version4(dep, info, pkgPath)
    for (let dep in pkj.peerDependencies) if (
      dep.startsWith('@sap/') || dep === 'sap-hdb-promisfied' || dep === 'hdb' || dep.startsWith('@cap-js')
    ) version4(dep, info, pkgPath)
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') info[pkgPath] = '-- missing --'  // unknown error
    else if (parentPath) version4(parentPath + '/node_modules/' + pkgPath, info)
  }
  return info
}

export async function getVersion() {
  const base = await import('../utils/base.js')
  base.debug('version')
  const [{ URL }, { fileURLToPath }] = await Promise.all([
    import('url'),
    import('url')
  ])

  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const info = version4()
  try {
    let cfVer = await cf.getVersion()
    cfVer = cfVer.replace(/(\r\n|\n|\r)/gm, "")
    info['cf-cli'] = cfVer
  } catch (error) {
    info['cf-cli'] = baseLite.bundle.getText("version.cfCliMissing")
  }
  try {
    let btpVer = await btp.getVersion()
    btpVer = btpVer.replace(/(\r\n|\n|\r)/gm, "")
    info['btp-cli'] = btpVer
  } catch (error) {
    info['btp-cli'] = baseLite.bundle.getText("version.btpCliMissing")
  }
  Object.defineProperty(info, 'home', { value: __dirname })
  info['hana-cli home'] = info.home
  Object.defineProperty(info, 'initialHome', { value: base.hanaBin ? base.hanaBin : '' })
  if (process.env.DEBUG) info['hana-cli initial home'] = info.initialHome

  return info
}

export async function getVersionUI() {
  const info = await getVersion()
  const { default: latestVersion } = await import('latest-version')
  
  // Add Node.js version
  info['Node.js'] = process.version
  
  // Add latest version
  try {
    let selfVersion = await latestVersion('hana-cli')
    info['latestVersion'] = selfVersion
  } catch (error) {
    info['latestVersion'] = baseLite.bundle.getText("version.latestUnavailable")
  }
  
  return info
}
