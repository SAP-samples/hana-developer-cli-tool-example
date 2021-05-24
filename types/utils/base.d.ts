/// <reference types="@sap/textbundle" />
/**
 * - sap-hdbext-promisified module
 */
export type hdbextPromise = typeof import("sap-hdbext-promisfied").default;
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
 * @returns {Promise<hdbextPromise>} - hdbext instanced promisfied
 */
export function createDBConnection(): Promise<hdbextPromise>;
export function getBuilder(input: any, iConn?: boolean, iDebug?: boolean): any;
export function getPrompt(argv: any): any;
export function getPromptSchema(input: any, iConn?: boolean, iDebug?: boolean): {
    properties: any;
};
export function askFalse(): boolean;
export function promptHandler(argv: any, processingFunction: any, input: any, iConn?: boolean, iDebug?: boolean): void;
export function error(error: any): void;
export function end(): void;
export function startSpinner(prompts: any): void;
export function verboseOutput(prompts: any): boolean;
export function isDebug(prompts: any): boolean;
export function outputTable(content: any): void;
export function output(content: any): void;
