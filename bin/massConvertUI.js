const base = require("../utils/base")

//const fsp = require('fs').promises
const path = require("path")
const glob = require('glob')

exports.command = 'massConvertUI [schema] [table]'
exports.aliases = ['mcui', 'massconvertui', 'massConvUI', 'massconvui']
exports.describe = base.bundle.getText("massConvertUI")


exports.builder = base.getMassConvertBuilder(true)


exports.handler = (argv) => {
    base.promptHandler(argv, startWebServer, base.getMassConvertPrompts(true))
}

async function startWebServer(prompts) {
    base.debug('startWebServer')
    try {
        base.setPrompts(prompts)
        await serverSetup(prompts)
        return base.end()
    } catch (error) {
        base.error(error)
    }
}

async function serverSetup(prompts) {

    base.debug('serverSetup')
    const port = process.env.PORT || prompts.port || 3010

    if (!(/^[1-9]\d*$/.test(port) && 1 <= 1 * port && 1 * port <= 65535)) {
        return base.error(`${port} ${base.bundle.getText("errPort")}`)
    }
    const server = require("http").createServer()
    const express = require("express")
    var app = express()

     //Load routes
     let routesDir = path.join(__dirname, '..', '/routes/**/*.js')
     let files = glob.sync(routesDir)
     if (files.length !== 0) {
         for (let file of files) {
             await require(file)(app)
         }
     }

    //Start the Server 
    server.on("request", app)
    server.listen(port, function () {
        let serverAddr = `http://localhost:${server.address().port}`
        console.info(`HTTP Server: ${serverAddr}`)
        const open = require('open')
        open(serverAddr)
    })

    return

}