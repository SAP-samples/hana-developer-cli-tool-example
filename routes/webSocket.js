/*eslint no-console: 0, no-unused-vars: 0, new-cap:0 */
/*eslint-env node, es6 */
// @ts-check
import * as base from '../utils/base.js'
import { WebSocketServer } from 'ws'
import * as massConvertLib from '../utils/massConvert.js'

export function route(app, server) {
	base.debug('WebSockets Route')
	app.get('/websockets', (req, res, next) => {
		try {
			let output =
				`<H1>${base.bundle.getText("websocket")}</H1></br>`
			res.type("text/html")
			   .status(200)
			   .send(output)
		} catch (error) {
			next(error)
		}
	})

	try {
		var wss = new WebSocketServer({
			//server: server
			noServer: true,
			path: "/websockets"
		})

		// Only set up WebSocket upgrade handler if server is provided
		if (server && typeof server.on === 'function') {
			server.on("upgrade", (request, socket, head) => {
				//	const pathname = new URL(request.url).pathname 
				//	if (pathname === "/websockets") {
				wss.handleUpgrade(request, socket, head, (ws) => {
					wss.emit("connection", ws, request)
				})
				//	}
			})
		}

		wss.broadcast = (data, progress) => {
			var message = JSON.stringify({
				text: data,
				progress: progress
			})
			wss.clients.forEach((client) => {
				try {
					client.send(message, (error) => {
						if (error !== null && typeof error !== "undefined") {
							console.error(base.colors.red(`${base.bundle.getText("sendError")}: ${error}`))
							base.debug(`${base.bundle.getText("sendError")}: ${error}`)
						}
					})
				} catch (e) {
					console.error(base.colors.red(`${base.bundle.getText("broadcastError")}: ${e}`))
					base.debug(`${base.bundle.getText("broadcastError")}: ${e}`)
				}
			})
			base.debug(`${base.bundle.getText("sent")}: ${message}`)
		}


		wss.on("error", (error) => {
			console.error(base.colors.red(`${base.bundle.getText("websocketError")}: ${error}`))
			base.debug(`${base.bundle.getText("websocketError")}: ${error}`)
		})

		wss.on("connection", (ws) => {
			base.debug(base.bundle.getText("connected"))

			ws.on("message", (message) => {
				base.debug(`${base.bundle.getText("received")}: ${message}`)
				var data = JSON.parse(message)
				switch (data.action) {
					case "massConvert":
						massConvertLib.convert(wss)
						break
					default:
						console.error(base.colors.red(`${base.bundle.getText("errorUndefinedAction")}: ${data.action}`))
						base.debug(`${base.bundle.getText("errorUndefinedAction")}: ${data.action}`)
						wss.broadcast(`${base.bundle.getText("errorUndefinedAction")}: ${data.action}`)
						break
				}
			})

			ws.on("close", () => {
				base.debug(base.bundle.getText("closed"))
			})

			ws.on("error", (error) => {
				console.error(base.colors.red(`${base.bundle.getText("websocketError")}: ${error}`))
				base.debug(`${base.bundle.getText("websocketError")}: ${error}`)
			})

			ws.send(JSON.stringify({
				text: base.bundle.getText("connectedToProcess")
			}), (error) => {
				if (error !== null && typeof error !== "undefined") {
					console.error(base.colors.red(`${base.bundle.getText("sendError")}: ${error}`))
					base.debug(`${base.bundle.getText("sendError")}: ${error}`)
				}
			})
		})


	} catch (e) {
		console.error(base.colors.red(`${base.bundle.getText("generalError")}: ${e}`))
		base.debug(`${base.bundle.getText("generalError")}: ${e}`)
	}
	return app
}