// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as certificates from './certificates.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'

export const command = 'certificatesUI'
export const aliases = ['certUI', 'certsUI', 'certificatesui', 'listCertificatesUI', 'listcertificatesui']
export const describe = certificates.describe

export const builder = (yargs) => yargs.options(baseLite.getUIBuilder({})).wrap(160).example('hana-cli certificatesUI', baseLite.bundle.getText("certificatesExample")).wrap(160).epilog(buildDocEpilogue('certificatesUI', 'system-admin', ['certificates']))

export const inputPrompts = {
  port: {
    description: 'Server port (default: 3010)',
    type: 'number',
    required: false,
    ask: () => { }
  },
  host: {
    description: 'Server host (default: localhost)',
    type: 'string',
    required: false,
    ask: () => { }
  }
}

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getCertificates, inputPrompts)
}

export async function getCertificates(prompts) {
  const base = await import('../utils/base.js')
  base.debug('getCertificatesUI')
  try {
    base.setPrompts(prompts)
    await base.webServerSetup('/ui/#certificates-ui')
    // Don't call base.end() - let the web server keep running
  } catch (error) {
    await base.error(error)
  }
}
