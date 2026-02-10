// @ts-check
/**
 * @module base-lite - Lightweight utilities for CLI initialization (no heavy dependencies)
 */

import { fileURLToPath } from 'url'
import { URL } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
import { createRequire } from 'module'
export const require = createRequire(import.meta.url)

import * as path from 'path'

/** @type {typeof import("chalk")} */
import chalk from 'chalk'
export const colors = chalk

/** @type {typeof import("debug") } */
import debugModule from 'debug'
export const debug = new debugModule('hana-cli')

import * as locale from "./locale.js"
const TextBundle = require('@sap/textbundle').TextBundle
/** @typeof TextBundle - instance of sap/textbundle */
export const bundle = new TextBundle(path.join(__dirname, '..', '/_i18n/messages'), locale.getLocale())

/**
 * Output an error to the console
 * @param {Error} err - Error object or error message
 * @returns {void}
 */
export async function error(err) {
    console.error(colors.red(`ERROR: ${err.toString()}`))
    if (err.stack) {
        console.error(colors.red(err.stack))
    }
}

/**
 * Build yargs options with common connection and debug parameters
 * @param {object} input - Command-specific options
 * @param {boolean} [iConn=true] - Include connection parameters
 * @param {boolean} [iDebug=true] - Include debug parameters
 * @returns {object} Combined options object
 */
export function getBuilder(input, iConn = true, iDebug = true) {

    let grpConn = {}
    let grpDebug = {}

    if (iConn) {
        grpConn = {
            admin: {
                alias: ['a', 'Admin'],
                type: 'boolean',
                default: false,
                group: bundle.getText("grpConn"),
                desc: bundle.getText("admin")
            },
            conn: {
                group: bundle.getText("grpConn"),
                desc: bundle.getText("connFile")
            },
        }
    }

    if (iDebug) {
        grpDebug = {
            disableVerbose: {
                alias: ['quiet'],
                group: bundle.getText("grpDebug"),
                type: 'boolean',
                default: false,
                desc: bundle.getText("disableVerbose")
            },
            debug: {
                alias: ['Debug'],
                group: bundle.getText("grpDebug"),
                type: 'boolean',
                default: false,
                desc: bundle.getText("debug")
            }
        }
    }
    let builder = {
        ...input,
        ...grpConn,
        ...grpDebug
    }
    return builder
}
