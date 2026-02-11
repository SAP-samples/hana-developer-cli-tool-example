// @ts-check
import * as base from '../utils/base.js'
import path from 'path'
import { promises as fs } from 'fs'
import { marked } from 'marked'

import { fileURLToPath } from 'url'
// @ts-ignore
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export function route(app) {
    /**
     * @swagger
     * /docs/readme:
     *   get:
     *     tags: [Documentation]
     *     summary: Get README documentation
     *     description: Returns the project README as HTML
     *     responses:
     *       200:
     *         description: README content in HTML format
     *         content:
     *           text/html:
     *             schema:
     *               type: string
     */
    app.get('/docs/readme', async (req, res, next) => {
        try {
            let mdReadMe = await fs.readFile(path.resolve(__dirname, "../README.md"), "utf-8")
            let html = marked.parse(mdReadMe)
            res.type("text/html")
               .status(200)
               .send(html)
        } catch (error) {
            next(error) // Pass to error handler
        }
    })

    /**
     * @swagger
     * /docs/changelog:
     *   get:
     *     tags: [Documentation]
     *     summary: Get CHANGELOG documentation
     *     description: Returns the project CHANGELOG as HTML
     *     responses:
     *       200:
     *         description: CHANGELOG content in HTML format
     *         content:
     *           text/html:
     *             schema:
     *               type: string
     */
    app.get('/docs/changelog', async (req, res, next) => {
        try {
            let mdChangeLog = await fs.readFile(path.resolve(__dirname, "../CHANGELOG.md"), "utf-8")
            let html = marked.parse(mdChangeLog)
            res.type("text/html")
               .status(200)
               .send(html)
        } catch (error) {
            next(error) // Pass to error handler
        }
    })
}