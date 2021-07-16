const base = require("../utils/base")

module.exports = (app) => {
    app.get('/', async (req, res) => {
        try {

            res.type("application/json").status(200).send(base.getPrompts())
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }

    })
    let bodyParser = require('body-parser')
    var jsonParser = bodyParser.json()

    app.put('/', jsonParser, async (req, res) => {
        try {
            let body = req.body
            await base.setPrompts(body)
            return res.status(200).send({ status: 'ok' })
        } catch (error) {
            base.error(error)
            res.status(500).send(error.toString())
        }
    })
}