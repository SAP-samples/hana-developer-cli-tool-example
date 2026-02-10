// @ts-nocheck
/**
 * @module appFactory - Factory for creating Express app instances for testing
 * This module provides a helper function to create an Express app with all routes loaded
 * for use in integration tests with supertest.
 */

import express from 'express'
import path from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Creates an Express app with all routes loaded for testing
 * @param {Object} options - Configuration options
 * @param {boolean} options.loadRoutes - Whether to load all routes (default: true)
 * @param {boolean} options.addErrorHandlers - Whether to add error handlers (default: true)
 * @returns {Promise<express.Application>} Express app instance
 */
export async function createApp(options = {}) {
    const {
        loadRoutes = true,
        addErrorHandlers = true
    } = options

    const app = express()
    
    // Configure Express settings for compatibility
    app.set('x-powered-by', false)
    app.disable('etag')
    
    // Add body parser middleware
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Load routes if requested
    if (loadRoutes) {
        const routesDir = path.posix.join(__dirname.split(path.sep).join(path.posix.sep), '..', 'routes', '**', '*.js')
        const files = await glob(routesDir)
        
        if (files.length !== 0) {
            for (const file of files) {
                const Route = await import(`file://${file}`)
                // Pass app (and optional server for WebSocket routes)
                Route.route(app, null)
            }
        }
    }

    // Add error handling middleware if requested
    if (addErrorHandlers) {
        // 404 handler
        app.use((req, res, next) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Cannot ${req.method} ${req.path}`
            })
        })

        // Global error handler
        app.use((err, req, res, next) => {
            console.error('Error:', err)
            res.status(err.status || 500).json({
                error: err.message || 'Internal Server Error',
                ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
            })
        })
    }

    return app
}

/**
 * Creates a minimal Express app with just the specified route
 * @param {Function} routeFunction - Route function to load
 * @returns {express.Application} Express app instance
 */
export function createMinimalApp(routeFunction) {
    const app = express()
    
    app.set('x-powered-by', false)
    app.disable('etag')
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Load the specified route
    routeFunction(app, null)

    // Add simple error handler
    app.use((err, req, res, next) => {
        res.status(err.status || 500).json({
            error: err.message || 'Internal Server Error'
        })
    })

    return app
}
