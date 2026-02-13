// @ts-check
import * as base from '../utils/base.js'
import express from 'express'

const jsonParser = express.json()

export function route (app) {
    base.debug('Index Route')
    
    /**
     * @swagger
     * /:
     *   get:
     *     tags: [Configuration]
     *     summary: Get current application prompts and configuration
     *     description: Returns the current prompts/configuration settings for the HANA CLI
     *     responses:
     *       200:
     *         description: Current configuration object
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 schema:
     *                   type: string
     *                 table:
     *                   type: string
     *                 view:
     *                   type: string
     *                 port:
     *                   type: number
     */
    app.get('/', async (req, res, next) => {
        try {
            res.type("application/json")
               .status(200)
               .json(base.getPrompts())
        } catch (error) {
            next(error) // Pass to error handler instead of direct send
        }
    })
 
    /**
     * @swagger
     * /:
     *   put:
     *     tags: [Configuration]
     *     summary: Update application prompts and configuration
     *     description: Sets new configuration values for the HANA CLI
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               schema:
     *                 type: string
     *               table:
     *                 type: string
     *               view:
     *                 type: string
     *               port:
     *                 type: number
     *     responses:
     *       200:
     *         description: Configuration updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: ok
     */
    app.put('/', jsonParser, async (req, res, next) => {
        try {
            let body = req.body
            body.isGui = true
            await base.setPrompts(body)
            return res.status(200)
                      .json({ status: base.bundle.getText("api.status.ok") })
        } catch (error) {
            next(error) // Pass to error handler
        }
    }) 
}