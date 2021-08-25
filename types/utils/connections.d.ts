/**
 * Check parameter folders to see if the input file exists there
 * @param {string} filename
 * @returns {string} - the file path if found
 */
export function getFileCheckParents(filename: string): string;
/**
 * Check current and parent directories for a package.json
 * @returns {string} - the file path if found
 */
export function getPackageJSON(): string;
/**
 * Check current and parent directories for a mta.yaml
 * @returns {string} - the file path if found
 */
export function getMTA(): string;
/**
 * Check current and parent directories for a default-env.json
 * @returns {string} - the file path if found
 */
export function getDefaultEnv(): string;
/**
 * Check current and parent directories for a default-env-admin.json
 * @returns {string} - the file path if found
 */
export function getDefaultEnvAdmin(): string;
/**
 * Check current and parent directories for a .env
 * @returns {string} - the file path if found
 */
export function getEnv(): string;
/**
 * Resolve Environment by deciding which option between default-env and default-env-admin we should take
 * @param {*} options
 * @returns {string} - the file path if found
 */
export function resolveEnv(options: any): string;
/**
 * Get Connection Options from input prompts
 * @param {object} prompts - input prompts
 * @returns {object} connection options
 */
export function getConnOptions(prompts: object): object;
/**
 * Create Databse Connection
 * @param {object} prompts - input prompt values
 * @param {boolean} directConnect - Direct Connection parameters are supplied in prompts
 * @returns {Promise<object>} HANA DB conneciton of type sap/hdbext
 */
export function createConnection(prompts: object, directConnect?: boolean): Promise<object>;
