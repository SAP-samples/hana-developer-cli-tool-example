// @ts-check
import { URL } from 'url'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
import * as path from 'path'
import * as fs from 'fs'
import showdown from 'showdown'
const {Converter} = showdown

export function route (app) {
    app.get('/sap/dfa/help/webassistant/catalogue', async (req, res, next) => {
        try {
            let input = JSON.parse(getURLQuery(req))
            if (!input.appUrl) {
                throw new Error("Missing parameter: appUrl")
            }
            let output = {}
            output.status = "OK"
            output.data = []
            input.appUrl.forEach(app => {
                try {
                    let jsonData = require(`../app/dfa/help/catalog/${app}.json`)
                    output.data.push(jsonData)
                } catch (error) {
                    return
                }
            })
            res.type("application/json").status(200).send(output)
        } catch (error) {
            // Return empty OK response for missing catalogs
            res.status(200).json({ status: "OK", data: [] })
        }
    })

    app.get('/sap/dfa/help/webassistant/context', async (req, res, next) => {
        try {
            if (!req.query.id) {
                throw new Error("Missing parameter: id")
            }

            let output = {}
            output.status = "OK"
            output.data = []
            let jsonData = require(`../app/dfa/help/context/${req.query.id}.json`)
            output.data = jsonData
            if (req.query.id === "Shell-home!whatsnew") {
                output.data.tiles = []
                const converter = new Converter()

                let changelog = require("../CHANGELOG.json")
                changelog.forEach(item => {

                    let date = new Date(item.date)
                    let dateString = date.toLocaleDateString()
                    let ChangedInfo = ""
                    item.Changed.forEach(changeItem => {
                        let html = converter.makeHtml(changeItem)
                        ChangedInfo += html + "<br/>"
                    })

                    output.data.tiles.push({
                        "id": item.version,
                        "loio": "",
                        "title": item.version,
                        "summaryText": dateString,
                        "content": ChangedInfo,
                        "lastModifiedDate": "2021-06-08 08:23:46 GMT+0000",
                        "hotspotAssignments": [
                            {
                                "hotspotAnchor": null,
                                "displayProperties": "{\"misc\":{\"hidden\":false,\"bubbleOrientation\":\"auto\",\"bubbleType\":\"action\",\"bubbleOffset\":{\"left\":0,\"top\":0},\"bubbleSize\":\"s\",\"autoProgress\":[\"next\"],\"elementType\":\"unknown\",\"autoSkipStep\":false},\"showTitleBar\":true,\"hotspotSize\":\"2\",\"centered\":false,\"contentStyle\":\"CIRCLE\",\"iconType\":\"info\",\"iconPos\":\"I\",\"rectDelta\":{\"width\":0,\"height\":0},\"manualOffset\":{\"left\":0,\"top\":0},\"offset\":true,\"showArrow\":true}"
                            }
                        ],
                        "tileOrder": 1,
                        "pageUrl": null
                    })
                })
            }
            else {
                output.data.tiles.forEach(tile => {
                    try {
                        let content = fs.readFileSync(path.join(__dirname, `../app/dfa/help/context/${req.query.id}/${tile.id}.html`), "utf8")
                        tile.content = content
                    } catch (error) {
                        return
                    }
                })
            }
            res.type("application/json").status(200).send(output)

        } catch (error) {
            next(error)
        }
    })

}

function getURLQuery(req) {
    const baseURL = 'http://' + req.headers.host + '/'
    const myURL = new URL(req.url, baseURL)
    let query = myURL.search.substr(1)
    return decodeURIComponent(query)
}