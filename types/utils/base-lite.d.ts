/**
 * Set global configuration (called from cli.js at startup)
 * @param {Object} config Configuration object
 */
export function setConfig(config: Object): void;
/**
 * Get global configuration
 * @returns {Object} Configuration object
 */
export function getConfig(): Object;
/**
 * Get a specific configuration value with dot notation support
 * @param {string} key Configuration key (supports dot notation for nested access)
 * @param {*} defaultValue Default value if key not found
 * @returns {*} Configuration value or default
 */
export function getConfigValue(key: string, defaultValue?: any): any;
/**
 * Output an error to the console
 * @param {Error} err - Error object or error message
 * @returns {Promise<void>}
 */
export function error(err: Error): Promise<void>;
/**
 * Build yargs options with common connection and debug parameters
 * Applies configuration defaults from .hana-cli-config or hana-cli.config.js
 * @param {object} input - Command-specific options
 * @param {boolean} [iConn=true] - Include connection parameters
 * @param {boolean} [iDebug=true] - Include debug parameters
 * @returns {object} Combined options object
 */
export function getBuilder(input: object, iConn?: boolean, iDebug?: boolean): object;
export const require: NodeJS.Require;
export const colors: import("chalk").ChalkInstance;
export function debug(...args: any[]): any;
/** @typeof TextBundle - instance of sap/textbundle */
export const bundle: TextBundle;
import TextBundle_1 = require("@sap/textbundle");
import TextBundle = TextBundle_1.TextBundle;
