// @ts-check
import * as baseLite from '../utils/base-lite.js'

import { buildDocEpilogue } from '../utils/doc-linker.js'
export const command = 'systemInfoUI'
export const aliases = ['sysUI', 'sysinfoui', 'sysInfoUI', 'systeminfoui']
export const describe = baseLite.bundle.getText("systemInfoUI")
export const builder = (yargs) => yargs.options(baseLite.getBuilder({})).wrap(160).example(
  'hana-cli systemInfoUI',
  baseLite.bundle.getText("systemInfoUIExample")
).epilog(buildDocEpilogue('systemInfoUI', 'system-admin', ['systemInfo', 'healthCheck']))
export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, sysInfo, {})
}

export async function sysInfo(prompts) {
  const base = await import('../utils/base.js')
  base.debug('sysInfoUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#systeminfo-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }

}