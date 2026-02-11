// @ts-check

import * as path from 'path'
import express from 'express'
import * as base from '../utils/base.js'
import * as locale from '../utils/locale.js'
import { fileURLToPath } from 'url'
// @ts-ignore
const __dirname = fileURLToPath(new URL('.', import.meta.url)) 
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import * as version from '../bin/version.js' 
const TextBundle = require('@sap/textbundle').TextBundle

const resolveI18nStrings = (value, bundle) => {
    if (Array.isArray(value)) {
        return value.map((item) => resolveI18nStrings(item, bundle))
    }
    if (value && typeof value === 'object') {
        const result = {}
        for (const [key, item] of Object.entries(value)) {
            result[key] = resolveI18nStrings(item, bundle)
        }
        return result
    }
    if (typeof value === 'string' && value.startsWith('i18n.')) {
        const i18nKey = value.slice('i18n.'.length)
        try {
            return bundle.getText(i18nKey)
        } catch {
            return value
        }
    }
    return value
}

const getRequestLocale = (req) => {
    const headerLocale = req.headers['accept-language']
    if (typeof headerLocale === 'string' && headerLocale.trim()) {
        return headerLocale.split(',')[0].trim()
    }
    return locale.getLocale()
}

export function route (app) {
     base.debug('Static Route')
    /**
     * Static file routes - these serve UI resources and are not included in Swagger docs
     * - /ui - Main UI resources
     * - /sap/dfa/ - Digital First Adoption resources
     * - /resources/sap/dfa/ - Alternate DFA path
     * - /i18n - Internationalization files
     * - /favicon.ico - Site favicon
     */
    app.use('/ui', express.static(path.join(__dirname, '../app/resources')))
    app.use('/sap/dfa/', express.static(path.join(__dirname, '../app/dfa')))
    app.use('/resources/sap/dfa/', express.static(path.join(__dirname, '../app/dfa')))
    app.use('/i18n', express.static(path.join(__dirname, '../_i18n')))
    app.use('/favicon.ico', express.static(path.join(__dirname, '../app/resources/favicon.ico')))
   
    /**
     * @swagger
     * /appconfig/fioriSandboxConfig.json:
     *   get:
     *     tags: [Configuration]
     *     summary: Get Fiori Launchpad sandbox configuration
     *     description: Returns the Fiori Launchpad sandbox configuration with version info
     *     responses:
     *       200:
     *         description: Fiori sandbox configuration
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     */
    app.get('/appconfig/fioriSandboxConfig.json', async (req, res, next) => {
        try {
                const jsonData = require('../app/appconfig/fioriSandboxConfig.json')
                const config = JSON.parse(JSON.stringify(jsonData))
            const info = version.getVersion()
                config.bootstrapPlugins.BootstrapXrayPlugin.config.version = info['hana-cli']
                const i18nBundle = new TextBundle(path.join(__dirname, '..', '/_i18n/messages'), getRequestLocale(req))
                const resolvedConfig = resolveI18nStrings(config, i18nBundle)
            res.type("application/json")
               .status(200)
                    .json(resolvedConfig)           
        } catch (error) {
            next(error) // Pass to error handler
        }
    }) 

}