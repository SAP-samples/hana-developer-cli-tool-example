import * as path from 'path'
import * as express from 'express'
import * as base from '../utils/base.js'
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import * as version from '../bin/version.js'

export default function (app) {
    app.use('/ui', express.static(path.join(__dirname, '../app/resources')))
    app.use('/sap/dfa/', express.static(path.join(__dirname, '../app/dfa')))
    app.use('/resources/sap/dfa/', express.static(path.join(__dirname, '../app/dfa')))
    app.use('/i18n', express.static(path.join(__dirname, '../_i18n')))
    app.use('/favicon.ico', express.static(path.join(__dirname, '../app/resources/favicon.ico')))
   
    app.get('/appconfig/fioriSandboxConfig.json', async (req, res) => {
        try {
            let jsonData = require('../app/appconfig/fioriSandboxConfig.js')
            const info = version.getVersion()
            jsonData.bootstrapPlugins.BootstrapXrayPlugin.config.version = info['hana-cli']
            res.type("application/json").status(200).send(jsonData)           
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }
    })

}