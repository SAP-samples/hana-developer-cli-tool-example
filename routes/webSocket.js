/*eslint no-console: 0, no-unused-vars: 0, new-cap:0 */
// @ts-check
import * as base from '../utils/base.js'
import { WebSocketServer } from 'ws'
import * as massConvertLib from '../utils/massConvert.js'
import * as importLib from '../bin/import.js'

export function route(app, server) {
	base.debug('WebSockets Route')
	const isTestMode = process.env.NODE_ENV === 'test'
	const logInfo = (message) => {
		if (!isTestMode) {
			console.log(message)
		}
		base.debug(message)
	}
	const logError = (message) => {
		if (!isTestMode) {
			console.error(base.colors.red(message))
		}
		base.debug(message)
	}
	/**
	 * @swagger
	 * /websockets:
	 *   get:
	 *     tags: [WebSockets]
	 *     summary: WebSocket information endpoint
	 *     description: Returns information about the WebSocket connection endpoint
	 *     responses:
	 *       200:
	 *         description: WebSocket information
	 *         content:
	 *           text/html:
	 *             schema:
	 *               type: string
	 */
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
							logError(`${base.bundle.getText("sendError")}: ${error}`)
						}
					})
				} catch (e) {
					logError(`${base.bundle.getText("broadcastError")}: ${e}`)
				}
			})
			base.debug(`${base.bundle.getText("sent")}: ${message}`)
		}


		wss.on("error", (error) => {
			logError(`${base.bundle.getText("websocketError")}: ${error}`)
		})

		wss.on("connection", (ws) => {
			base.debug(base.bundle.getText("connected"))

			ws.on("message", (message) => {
				base.debug(`${base.bundle.getText("received")}: ${message}`)
				try {
					var data = JSON.parse(message)
					switch (data.action) {
						case "massConvert":
							// Skip massConvert in test environment to avoid terminal output issues
							if (process.env.NODE_ENV === 'test') {
									logInfo(base.bundle.getText("test.skipMassConvert"))
								try {
									ws.send(JSON.stringify({
										text: base.bundle.getText("test.massConvertSkipped")
									}))
								} catch (sendError) {
									// Ignore send errors
								}
								break
							}
							// Run mass convert async, catch any errors
							try {
								massConvertLib.convert(wss).catch((error) => {
										logError(`${base.bundle.getText("generalError")}: ${error}`)
									try {
										wss.broadcast(base.bundle.getText("error.massConvertFailed", [error.message || error]))
									} catch (broadcastError) {
										// Ignore broadcast errors
									}
								})
							} catch (syncError) {
									logError(`${base.bundle.getText("generalError")}: ${syncError}`)
								try {
									wss.broadcast(base.bundle.getText("error.massConvertFailed", [syncError.message || syncError]))
								} catch (broadcastError) {
									// Ignore broadcast errors
								}
							}
							break
						case "import":
							// Skip import in test environment to avoid terminal output issues
							if (process.env.NODE_ENV === 'test') {
									logInfo(base.bundle.getText("test.skipImport"))
								try {
									ws.send(JSON.stringify({
										text: base.bundle.getText("test.importSkipped")
									}))
								} catch (sendError) {
									// Ignore send errors
								}
								break
							}
							// Run import async, catch any errors
							try {
								importLib.importData(base.getPrompts()).then(() => {
									wss.broadcast(base.bundle.getText("success.importComplete"))
								}).catch((error) => {
										logError(`${base.bundle.getText("generalError")}: ${error}`)
									try {
										wss.broadcast(base.bundle.getText("error.import", [error.message || error]))
									} catch (broadcastError) {
										// Ignore broadcast errors
									}
								})
							} catch (syncError) {
									logError(`${base.bundle.getText("generalError")}: ${syncError}`)
								try {
									wss.broadcast(base.bundle.getText("error.import", [syncError.message || syncError]))
								} catch (broadcastError) {
									// Ignore broadcast errors
								}
							}
							break
						default:
								logError(`${base.bundle.getText("errorUndefinedAction")}: ${data.action}`)
							wss.broadcast(`${base.bundle.getText("errorUndefinedAction")}: ${data.action}`)
							break
					}
				} catch (parseError) {
					logError(`${base.bundle.getText("generalError")}: ${parseError.message}`)
					try {
						ws.send(JSON.stringify({
							text: base.bundle.getText("error.parseError", [parseError.message])
						}))
					} catch (sendError) {
						// Ignore send errors
					}
				}
			})

			ws.on("close", () => {
				base.debug(base.bundle.getText("closed"))
			})

			ws.on("error", (error) => {
				logError(`${base.bundle.getText("websocketError")}: ${error}`)
			})

			ws.send(JSON.stringify({
				text: base.bundle.getText("connectedToProcess")
			}), (error) => {
				if (error !== null && typeof error !== "undefined") {
					logError(`${base.bundle.getText("sendError")}: ${error}`)
				}
			})
		})


	} catch (e) {
		logError(`${base.bundle.getText("generalError")}: ${e}`)
	}
	return app
}