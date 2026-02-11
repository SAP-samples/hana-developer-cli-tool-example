/**
 * Start the Terminal Spinner
 */
export function startSpinnerInt(): Promise<void>;
/**
 * Stop the Terminal Spinner
 */
export function stopSpinnerInt(): void;
/**
 * Output a blank line to the console
 * @returns {void}
 */
export function blankLine(): void;
/**
 *
 * @param {object} newPrompts - processed input prompts
 */
export function setPrompts(newPrompts: object): void;
/**
 *
 * @returns {object} newPrompts - processed input prompts
 */
export function getPrompts(): object;
/**
 * Clear the database connection
 * @returns {Promise<void>}
 */
export function clearConnection(): Promise<void>;
/**
 * @param {object} [options] - override the already set parameters with new connection options
 * @returns {Promise<hdbextPromiseInstance>} - hdbext instanced promisfied
 */
export function createDBConnection(options?: object): Promise<hdbextPromiseInstance>;
/**
 * Initialize Yargs builder
 * @param {import("yargs").CommandBuilder} input - parameters for the command
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 * @returns {import("yargs").CommandBuilder} parameters for the command
 */
export function getBuilder(input: import("yargs").CommandBuilder, iConn?: boolean, iDebug?: boolean): import("yargs").CommandBuilder;
/**
 * Initialize Yargs builder for massConvert Command
 * @param {boolean} [ui=false] - Mass Convert via Browser-based UI
 * @returns {import("yargs").CommandBuilder} parameters for the command
 */
export function getMassConvertBuilder(ui?: boolean): import("yargs").CommandBuilder;
/**
 * Initialize Yargs builder for massConvert Command
 * @param {boolean} [ui=false] - Mass Convert via Browser-based UI
 * @returns {object} - prompts schema object
 */
export function getMassConvertPrompts(ui?: boolean): object;
/**
 * Fill the prompts schema
 * @param {object} inputSchema - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 * @returns {any} prompts schema as json
 */
export function getPromptSchema(inputSchema: object, iConn?: boolean, iDebug?: boolean): any;
/**
 * Function that always retruns false
 * @returns {boolean}
 */
export function askFalse(): boolean;
/**
 * Prompts handler function
 * @param {import("yargs").CommandBuilder} argv - parameters for the command
 * @param {function} processingFunction - Function to call after prompts to continue command processing
 * @param {object} inputSchema - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 */
export function promptHandler(argv: import("yargs").CommandBuilder, processingFunction: Function, inputSchema: object, iConn?: boolean, iDebug?: boolean): Promise<void>;
/**
 * Handle Errors cleanup connections and decide how to alter the user
 * @param {*} error - Error Object
 */
export function error(error: any): Promise<void>;
/**
 * Disconnect database connection without exiting process
 * @returns {Promise<void>}
 */
export function disconnectOnly(): Promise<void>;
/**
 * Normal processing end and cleanup for single command
 */
export function end(): Promise<void>;
/**
 * Start Console UI spinner
 * @param {*} prompts - input parameters and values
 */
export function startSpinner(prompts: any): void;
/**
 * Check for Verbose output
 * @param {*} prompts - input parameters and values
 * @returns {boolean}
 */
export function verboseOutput(prompts: any): boolean;
/**
 * Check if we are in debug mode
 * @param {*} prompts - input parameters and values
 * @returns {boolean}
 */
export function isDebug(prompts: any): boolean;
/**
 * Check if we are in GUI mode
 * @param {*} prompts - input parameters and values
 * @returns {boolean}
 */
export function isGui(prompts: any): boolean;
/**
 * Output JSON content either as a table or as formatted JSON to console
 * @param {*} content - json content often a HANA result set
 * @returns void
 */
export function outputTable(content: any): void;
/**
 * Output JSON content either as a table or as formatted JSON to console
 * @param {*} content - json content often a HANA result set
 * @returns {Promise<void>}
 */
export function outputTableFancy(content: any): Promise<void>;
/**
 * Only output this content to console if in verbose mode
 * @param {*} content - json content often a HANA result set
 * @returns void
 */
export function output(content: any): void;
/**
 * Global error handling middleware for Express
 * Compatible with Express 4.x and prepared for 5.x
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function globalErrorHandler(err: Error, req: any, res: any, next: Function): void;
/**
 * 404 Not Found handler
 * Must be placed after all other route definitions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export function notFoundHandler(req: any, res: any): void;
/**
 * Setup Express and Launch Browser
 * @param {string} urlPath - URL Path to Launch
 * @returns void
 */
export function webServerSetup(urlPath: string): Promise<void>;
/**
 * Store and send results JSON
 * @param {any} res - Express Response object
 * @param {any} results - JSON content
 * @returns void
 */
export function sendResults(res: any, results: any): void;
/**
 * Return the last results JSON
 * @returns lastResults
 */
export function getLastResults(): any;
/**
 * Get the username of the active database connection
 * @returns userName
 */
export function getUserName(): Promise<string>;
export const require: NodeJS.Require;
/**
 * - instance of sap-hdb-promisified module
 */
export type dbClass = dbClassDef;
/** @typedef {dbClassDef} dbClass - instance of sap-hdb-promisified module */
export const dbClass: typeof dbClassDef;
export const sqlInjection: typeof sqlInjectionDef;
export const sqlInjectionUtils: typeof sqlInjectionDef;
export const colors: import("chalk").ChalkInstance;
export const debug: any;
/** @type string */
export let hanaBin: string;
/** @typeof TextBundle - instance of sap/textbundle */
export const bundle: TextBundle;
export function getTerminal(): Promise<any>;
export const terminal: any;
export namespace tableOptions {
    let hasBorder: boolean;
    let contentHasMarkup: boolean;
    let borderChars: string;
    namespace borderAttr {
        let color: string;
    }
    namespace textAttr {
        let bgColor: string;
    }
    namespace firstRowTextAttr {
        let bgColor_1: string;
        export { bgColor_1 as bgColor };
    }
    let width: number;
    let fit: boolean;
}
/** Maximum rows to display in terminal output before truncating */
export const MAX_DISPLAY_ROWS: 100;
/**
 * - instance of sap-hdbext-promisified module
 */
export type hdbextPromiseInstance = dbClass;
export type Ora = typeof import("ora");
import dbClassDef from "sap-hdb-promisfied";
import * as sqlInjectionDef from "../utils/sqlInjection.js";
import TextBundle_1 = require("@sap/textbundle");
import TextBundle = TextBundle_1.TextBundle;
