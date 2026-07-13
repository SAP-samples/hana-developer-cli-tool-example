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

  // Allow cross-origin requests from VSCode webviews
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (_req.method === 'OPTIONS') {
      res.sendStatus(204)
      return
    }
    next()
  })

  server = http.createServer()

  // Register all routes via static barrel (bundled by esbuild)
  registerAllRoutes(app, server)

  // Error handler — log and return details for debugging
  app.use((err: any, _req: any, res: any, _next: any) => {
    const msg = err?.message || String(err)
    const stack = err?.stack || ''
    console.error(`[hana-cli server] Error: ${msg}\n${stack}`)
    if (!res.headersSent) {
      res.status(500).json({ error: msg, stack: stack.split('\n').slice(0, 5) })
    }
  })

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
  process.env.HANA_CLI_HOST = conn.host
  process.env.HANA_CLI_PORT = String(conn.port)
  process.env.HANA_CLI_USER = conn.user
  process.env.HANA_CLI_PASSWORD = conn.password
  process.env.HANA_CLI_DATABASE = 'SYSTEMDB'
  // Propagate the container schema so hana-cli issues SET SCHEMA on connect.
  // Without it, CURRENT_SCHEMA stays the empty HDI runtime user schema and
  // schema-filtered commands (tables, views, ...) return no rows. Clear any
  // stale value when the new connection has no schema, to avoid leaking it
  // across connection switches.
  if (conn.schema) {
    process.env.HANA_CLI_SCHEMA = conn.schema
  } else {
    delete process.env.HANA_CLI_SCHEMA
  }
}
