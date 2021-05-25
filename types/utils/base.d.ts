/// <reference types="@sap/textbundle" />
/**
 * - sap-hdbext-promisified module
 */
export type hdbextPromise = typeof import("sap-hdbext-promisfied");
/**
 * - instance of sap-hdbext-promisified module
 */
export type hdbextPromiseInstance = import("sap-hdbext-promisfied");
/**
 * - sap/textbundle
 */
export type TextBundle = typeof import("@sap/textbundle").TextBundle;
export type Ora = typeof import("ora");
/** @type {typeof import("colors/safe")} */
export const colors: typeof import("colors/safe");
/** @type {typeof import("debug") } */
export let debug: any;
/** @type string */
export let hanaBin: string;
/** @typeof TextBundle - instance of sap/textbundle */
export const bundle: import("@sap/textbundle").TextBundle;
/**
 *
 * @param {object} newPrompts - processed input prompts
 */
export function setPrompts(newPrompts: object): void;
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
 * Get Prompts from the yargs current values and adjust
 * @param {import("yargs").CommandBuilder} argv - parameters for the command
 * @returns {typeof import("prompt")} - prompts output
 */
export function getPrompt(argv: import("yargs").CommandBuilder): any;
/**
 * Fill the prompts schema
 * @param {typeof import("prompt")} input - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 * @returns {any} prompts schema as json
 */
export function getPromptSchema(input: any, iConn?: boolean, iDebug?: boolean): any;
/**
 * Function that always retruns false
 * @returns {boolean}
 */
export function askFalse(): boolean;
/**
 * Prompts handler function
 * @param {import("yargs").CommandBuilder} argv - parameters for the command
 * @param {function} processingFunction - Function to call after prompts to continue command processing
 * @param {typeof import("prompt")} input - prompts current value
 * @param {boolean} [iConn=true] - Add Connection Group
 * @param {boolean} [iDebug=true] - Add Debug Group
 */
export function promptHandler(argv: import("yargs").CommandBuilder, processingFunction: Function, input: any, iConn?: boolean, iDebug?: boolean): void;
/**
 * Handle Errors cleanup connections and decide how to alter the user
 * @param {*} error - Error Object
 */
export function error(error: any): void;
/**
 * Normal processing end and cleanup for single comand
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
 * Output JSON content either as a table or as formatted JSON to console
 * @param {*} content - json content often a HANA result set
 * @returns void
 */
export function outputTable(content: any): void;
/**
 * Only output this content to console if in verbose mode
 * @param {*} content - json content often a HANA result set
 * @returns void
 */
export function output(content: any): void;
