// @ts-check
import * as base from '../utils/base.js'
import bodyParser from 'body-parser'

const jsonParser = bodyParser.json()

export function route (app) {
    base.debug('Index Route')
    
    app.get('/', async (req, res, next) => {
        try {
            res.type("application/json")
               .status(200)
               .json(base.getPrompts())
        } catch (error) {
            base.error(error)
            next(error) // Pass to error handler instead of direct send
        }
    })
 
    app.put('/', jsonParser, async (req, res, next) => {
        try {
            let body = req.body
            body.isGui = true
            await base.setPrompts(body)
            return res.status(200)
                      .json({ status: 'ok' })
        } catch (error) {
            base.error(error)
            next(error) // Pass to error handler
        }
    }) 
}