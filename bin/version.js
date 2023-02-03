// @ts-check
import * as base from '../utils/base.js'
import * as cf from '../utils/cf.js'
import * as btp from '../utils/btp.js'

export const command = 'version'
export const aliases = 'ver'
export const describe = base.bundle.getText("version")
export const builder = base.getBuilder({}, false)
export let handler = function (argv) {
  base.promptHandler(argv, verOutput, {}, false)
}

export async function verOutput() {
  base.debug('verOutput')
  base.startSpinnerInt()
  const [{ highlight }, { default: latestVersion }] =
    await Promise.all([
      import('cli-highlight'),
      import('latest-version')
    ])
  const colors = base.colors
  const log = console.log

  const info = await getVersion()
  base.stopSpinnerInt()
  Object.keys(info).forEach(key => log(highlight(`${key}: ${info[key]}`)))
  console.log(`Node.js: ${colors.green(process.version)}`)
  console.log(`Change Log: ${colors.blue('https://github.com/SAP-samples/hana-developer-cli-tool-example/blob/main/CHANGELOG.md')}`)


  let selfVersion = await latestVersion('hana-cli')
  console.log(`Latest hana-cli version available on npmjs.com: ${colors.green(selfVersion)}`)
  if (info['hana-cli'] < selfVersion) {
    console.log(`${colors.red('Local version of hana-cli is out of date.')} Consider upgrading with "${colors.green('npm upgrade -g hana-cli')}"`)
  }
  base.end()
}

export function version4(pkgPath = '..', info = {}, parentPath) {
  base.debug('version4')
  try {
    const pkj = base.require(pkgPath + '/package.json')
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
    info['cf-cli'] = `Cloud Foundry CLI not installed`
  }
  try {
    let btpVer = await btp.getVersion()
    btpVer = btpVer.replace(/(\r\n|\n|\r)/gm, "")
    info['btp-cli'] = btpVer
  } catch (error) {
    info['btp-cli'] = `btp CLI not installed`
  }
  Object.defineProperty(info, 'home', { value: __dirname })
  info['hana-cli home'] = info.home
  Object.defineProperty(info, 'initialHome', { value: base.hanaBin ? base.hanaBin : '' })
  if (process.env.DEBUG) info['hana-cli initial home'] = info.initialHome

  return info
}
