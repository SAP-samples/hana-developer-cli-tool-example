/**
 * Get the locale from environment variables
 * @param {NodeJS.ProcessEnv} [env] - Environment variables object, defaults to process.env
 * @returns {string} locale - The detected locale string
 */
export function getLocale(env?: NodeJS.ProcessEnv): string;
