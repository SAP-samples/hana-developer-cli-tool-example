// @ts-check
import * as base from '../utils/base.js'

import {highlight} from 'cli-highlight'
import latestVersion from 'latest-version'
import { createRequire } from 'module'
// @ts-ignore
const require = createRequire(import.meta.url)
import { URL } from 'url'
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const command = 'version'
export const aliases = 'ver'
export const describe = base.bundle.getText("version")
export const builder = base.getBuilder({}, false)
export let handler = function (argv) {
  base.promptHandler(argv, verOutput, {}, false)
}

export async function verOutput() {
  base.debug('verOutput')
  const colors = base.colors
  const log = console.log

  const info = getVersion()
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

export function getVersion() {
  base.debug('version')
  const info = version4()
  Object.defineProperty(info, 'home', { value: __dirname })
  info['hana-cli home'] = info.home
  Object.defineProperty(info, 'initialHome', { value: base.hanaBin ? base.hanaBin : '' })
  if (process.env.DEBUG) info['hana-cli initial home'] = info.initialHome
  return info
}
