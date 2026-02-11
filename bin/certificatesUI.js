// @ts-check
import * as baseLite from '../utils/base-lite.js'
import * as certificates from './certificates.js'

export const command = 'certificatesUI'
export const aliases = ['certUI', 'certsUI', 'certificatesui', 'listCertificatesUI', 'listcertificatesui']
export const describe = certificates.describe

export const builder = certificates.builder

export async function handler (argv) {
  const base = await import('../utils/base.js')
  base.promptHandler(argv, getCertificates, {})
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
