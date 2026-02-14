/**
 * Check parameter folders to see if the input file exists there
 * @param {string} filename
 * @param {number} maxDepth - Maximum directory depth to search (default: 5)
 * @returns {string|undefined} - the file path if found
 */
export function getFileCheckParents(filename: string, maxDepth?: number): string | undefined;
/**
 * Resolve Environment by deciding which option between default-env and default-env-admin we should take
 * @param {object} options
 * @returns {string} - the file path if found
 */
export function resolveEnv(options: object): string;
/**
 * Get Connection Options from input prompts
 * @param {object} prompts - input prompts
 * @returns {Promise<object>} connection options
 */
export function getConnOptions(prompts: object): Promise<object>;
/**
 * Create Database Connection
 * @param {object} prompts - input prompt values
 * @param {boolean} directConnect - Direct Connection parameters are supplied in prompts
 * @returns {Promise<object>} HANA DB connection of type hdb
 */
export function createConnection(prompts: object, directConnect?: boolean): Promise<object>;
export function getPackageJSON(): string | undefined;
export function getMTA(): string | undefined;
export function getDefaultEnv(): string | undefined;
export function getDefaultEnvAdmin(): string | undefined;
export function getEnv(): string | undefined;
export function getCdsrcPrivate(): string | undefined;
