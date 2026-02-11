/**
 * Output an error to the console
 * @param {Error} err - Error object or error message
 * @returns {Promise<void>}
 */
export function error(err: Error): Promise<void>;
/**
 * Build yargs options with common connection and debug parameters
 * @param {object} input - Command-specific options
 * @param {boolean} [iConn=true] - Include connection parameters
 * @param {boolean} [iDebug=true] - Include debug parameters
 * @returns {object} Combined options object
 */
export function getBuilder(input: object, iConn?: boolean, iDebug?: boolean): object;
export const require: NodeJS.Require;
export const colors: import("chalk").ChalkInstance;
export const debug: any;
/** @typeof TextBundle - instance of sap/textbundle */
export const bundle: TextBundle;
import TextBundle_1 = require("@sap/textbundle");
import TextBundle = TextBundle_1.TextBundle;
