import * as vscode from 'vscode'
import * as http from 'http'
import express from 'express'
import { findAvailablePort } from './port.js'
import { registerAllRoutes } from './routes.js'
import type { HanaConnection } from '../connection/resolver.js'

let server: http.Server | null = null
let currentPort: number | null = null
let shutdownTimer: ReturnType<typeof setTimeout> | null = null
let startPromise: Promise<number> | null = null

export function getPort(): number | null {
  return currentPort
}

export function isRunning(): boolean {
  return server !== null && server.listening
}

export async function startServer(_context: vscode.ExtensionContext, conn?: HanaConnection): Promise<number> {
  if (isRunning()) return currentPort!
  if (startPromise) return startPromise

  startPromise = doStart(conn).finally(() => { startPromise = null })
  return startPromise
}

async function doStart(conn?: HanaConnection): Promise<number> {
  cancelShutdownTimer()

  if (conn) {
    injectConnection(conn)
  }

  const port = await findAvailablePort()

  const app = express()
  app.set('x-powered-by', false)
  app.disable('etag')

  server = http.createServer()

  // Register all routes via static barrel (bundled by esbuild)
  registerAllRoutes(app, server)

  server.on('request', app)

  return new Promise((resolve, reject) => {
    server!.listen(port, '127.0.0.1', () => {
      currentPort = port
      resolve(port)
    })
    server!.on('error', reject)
  })
}

export async function stopServer(): Promise<void> {
  cancelShutdownTimer()
  if (server) {
    return new Promise((resolve) => {
      server!.close(() => {
        server = null
        currentPort = null
        resolve()
      })
    })
  }
}

export function scheduleShutdown(delayMs = 30000): void {
  cancelShutdownTimer()
  shutdownTimer = setTimeout(() => stopServer(), delayMs)
  shutdownTimer.unref()
}

function cancelShutdownTimer(): void {
  if (shutdownTimer) {
    clearTimeout(shutdownTimer)
    shutdownTimer = null
  }
}

export function injectConnection(conn: HanaConnection): void {
  process.env.VCAP_SERVICES = JSON.stringify({
    hana: [{
      credentials: {
        host: conn.host,
        port: String(conn.port),
        user: conn.user,
        password: conn.password,
        encrypt: conn.useTLS !== false,
        schema: conn.schema || ''
      }
    }]
  })
}
