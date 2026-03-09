// @ts-check
import { getConnOptions, getCdsrcBindingOptions } from '../../utils/connections.js'

/**
 * @typedef {{
 *  kind: 'hana' | 'postgres' | 'sqlite',
 *  connection?: string,
 *  user?: string,
 *  password?: string,
 *  database?: string,
 *  schema?: string,
 *  raw?: object
 * }} NormalizedCredentials
 */

/**
 * @param {object|undefined|null} options
 * @returns {NormalizedCredentials|null}
 */
function normalizeCredentials(options) {
  if (!options || typeof options !== 'object') {
    return null
  }

  if (options.hana) {
    const { host, port, user, password, database, schema } = options.hana
    if (host && port && user && password) {
      return {
        kind: 'hana',
        connection: `${host}:${port}`,
        user,
        password,
        database,
        schema,
        raw: options.hana
      }
    }
  }

  if (options.postgres) {
    const { host, port, user, password, database, schema } = options.postgres
    return {
      kind: 'postgres',
      connection: host && port ? `${host}:${port}` : undefined,
      user,
      password,
      database,
      schema,
      raw: options.postgres
    }
  }

  if (options.sqlite) {
    const { database, schema } = options.sqlite
    return {
      kind: 'sqlite',
      database,
      schema,
      raw: options.sqlite
    }
  }

  return null
}

/**
 * @param {object} prompts
 * @returns {Promise<object|null>}
 */
async function safeGetConnOptions(prompts) {
  try {
    const result = await getConnOptions(prompts)
    return result || null
  } catch {
    return null
  }
}

/**
 * Resolve local connection credentials for E2E tests.
 * Priority: CDS bind > default-env-admin.json > default-env.json
 * @returns {Promise<NormalizedCredentials|null>}
 */
export async function getLocalConnectionCredentials() {
  try {
    const cdsrcOptions = await getCdsrcBindingOptions({})
    const cdsrcCreds = normalizeCredentials(cdsrcOptions)
    if (cdsrcCreds) {
      return cdsrcCreds
    }
  } catch {
    // Ignore CDS binding failures and continue to env files
  }

  const adminOptions = await safeGetConnOptions({ admin: true })
  const adminCreds = normalizeCredentials(adminOptions)
  if (adminCreds) {
    return adminCreds
  }

  const defaultOptions = await safeGetConnOptions({ admin: false })
  const defaultCreds = normalizeCredentials(defaultOptions)
  if (defaultCreds) {
    return defaultCreds
  }

  return null
}

/**
 * @typedef {{
 *  force: boolean,
 *  isCI: boolean,
 *  forceEnvVarName: string
 * }} LiveTestControl
 */

/**
 * Resolve live test control flags from environment variables.
 * @param {string} forceEnvVarName
 * @returns {LiveTestControl}
 */
export function getLiveTestControl(forceEnvVarName) {
  return {
    force: process.env[forceEnvVarName] === 'true',
    isCI: process.env.CI === 'true',
    forceEnvVarName
  }
}

/**
 * Build a setup hint for optional live tests.
 * @param {LiveTestControl} control
 * @returns {string}
 */
function getLiveTestSetupHint(control) {
  return `Setup hint: configure local HANA credentials via CDS bind (.cdsrc-private.json) or default-env-admin.json/default-env.json, and ensure required CLI commands are available. In CI, set ${control.forceEnvVarName}=true to force live execution.`
}

/**
 * Skip test by default, or fail explicitly in forced-live mode.
 * @param {{ skip: () => void }} testContext
 * @param {(error?: Error) => void} done
 * @param {LiveTestControl} control
 * @param {string} reason
 * @returns {false}
 */
export function skipOrFailLiveTest(testContext, done, control, reason) {
  if (control.force) {
    done(new Error(`${reason} ${getLiveTestSetupHint(control)}`))
    return false
  }

  testContext.skip()
  done()
  return false
}

/**
 * Gate optional live tests in CI unless explicitly forced.
 * @param {{ skip: () => void }} testContext
 * @param {(error?: Error) => void} done
 * @param {LiveTestControl} control
 * @param {string} testName
 * @returns {boolean}
 */
export function gateLiveTestInCI(testContext, done, control, testName) {
  if (control.isCI && !control.force) {
    testContext.skip()
    done()
    return false
  }

  return true
}
