/**
 * Get the locale from environment variables
 * @param {NodeJS.ProcessEnv} [env] - Environment variables object, defaults to process.env
 * @returns {string} locale - The detected locale string
 */
export function getLocale(env?: NodeJS.ProcessEnv): string;
/**
 * Normalize locale string to format expected by @sap/textbundle
 * Removes encoding suffixes like .UTF-8, .ISO-8859-1, etc.
 * Example: 'de_DE.UTF-8' -> 'de_DE', 'en_US.iso88591' -> 'en_US'
 * @param {string} [locale] - The locale string to normalize
 * @returns {string} normalized locale string
 */
export function normalizeLocale(locale?: string): string;
