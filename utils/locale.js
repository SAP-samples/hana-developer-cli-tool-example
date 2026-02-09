// @ts-check
/**
 * Get the locale from environment variables
 * @param {NodeJS.ProcessEnv} [env] - Environment variables object, defaults to process.env
 * @returns {string} locale - The detected locale string
 */
export function getLocale (env) {
    env = env || process.env
    let locale = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE
    return locale
}