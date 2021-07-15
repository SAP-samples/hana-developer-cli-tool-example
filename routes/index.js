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
}