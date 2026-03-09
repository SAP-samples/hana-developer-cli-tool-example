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

/**
 * Normalize locale string to format expected by @sap/textbundle
 * Removes encoding suffixes like .UTF-8, .ISO-8859-1, etc.
 * Example: 'de_DE.UTF-8' -> 'de_DE', 'en_US.iso88591' -> 'en_US'
 * @param {string} [locale] - The locale string to normalize
 * @returns {string} normalized locale string
 */
export function normalizeLocale (locale) {
    if (!locale) {
        return locale
    }
    
    // Remove everything after (and including) the first dot
    // This handles cases like 'de_DE.UTF-8', 'en_US.iso88591', etc.
    return locale.split('.')[0]
}