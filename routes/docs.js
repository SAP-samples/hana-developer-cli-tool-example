// @ts-check
import * as base from '../utils/base.js'
import path from 'path'
import { promises as fs } from 'fs'
import showdown from 'showdown'
const {Converter} = showdown

import { fileURLToPath } from 'url'
// @ts-ignore
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export function route(app) {
    app.get('/docs/readme', async (req, res) => {

        try {
            let mdReadMe = await fs.readFile(path.resolve(__dirname, "../README.md"), "utf-8")
            const converter = new Converter
            let html = converter.makeHtml(mdReadMe)
            res.type("text/html").status(200).send(html)
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }

    })

    app.get('/docs/changelog', async (req, res) => {

        try {
            let mdChangeLog = await fs.readFile(path.resolve(__dirname, "../CHANGELOG.md"), "utf-8")
            const converter = new Converter
            let html = converter.makeHtml(mdChangeLog)
            res.type("text/html").status(200).send(html)
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }

    })
}