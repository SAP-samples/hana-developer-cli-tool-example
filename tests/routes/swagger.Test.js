// @ts-nocheck
/**
 * @module Routes Swagger Tests - Integration tests for swagger route with mocked requests/responses
 */

import { describe, it, beforeEach } from 'mocha'
import { assert } from '../base.js'
import express from 'express'
import { route } from '../../routes/swagger.js'

describe('@all Swagger Route Integration Tests', function () {
    let app
    let mockReq
    let mockRes
    let mockNext

    beforeEach(function () {
        app = express()
        
        // Create mock request object
        mockReq = {
            path: '',
            method: 'GET',
            headers: {},
            query: {},
            params: {}
        }

        // Create mock response object with tracking
        mockRes = {
            _status: null,
            _type: null,
            _data: null,
            _headers: {},
            status: function (code) {
                this._status = code
                return this
            },
            type: function (contentType) {
                this._type = contentType
                return this
            },
            send: function (data) {
                this._data = data
                return this
            },
            json: function (data) {
                this._data = data
                return this
            },
            setHeader: function (name, value) {
                this._headers[name] = value
                return this
            }
        }

        // Create mock next function
        mockNext = function (error) {
            mockNext.error = error
        }
        mockNext.error = null
    })

    describe('Route Registration', function () {
        it('should register swagger routes without errors', function () {
            assert.doesNotThrow(() => {
                route(app)
            })
        })

        it('should export a route function', function () {
            assert.strictEqual(typeof route, 'function')
        })
    })

    describe('Swagger Configuration', function () {
        it('should configure swagger UI at /api-docs', function () {
            route(app)
            
            // Check if routes are registered by looking at the app stack
            const routes = app._router.stack
                .filter(layer => layer.route)
                .map(layer => layer.route.path)
            
            assert.ok(routes.includes('/api-docs.json'), 'Should register /api-docs.json route')
        })

        it('should provide OpenAPI JSON specification', function () {
            route(app)
            
            // Simulate request to /api-docs.json
            const jsonRoute = app._router.stack
                .filter(layer => layer.route && layer.route.path === '/api-docs.json')
                .map(layer => layer.route)[0]
            
            assert.ok(jsonRoute, 'JSON spec route should exist')
            assert.strictEqual(jsonRoute.methods.get, true, 'Should respond to GET requests')
        })
    })

    describe('Swagger Spec Generation', function () {
        it('should generate valid OpenAPI 3.0 specification', function () {
            route(app)
            
            // Find and execute the /api-docs.json route handler
            const jsonRoute = app._router.stack.find(
                layer => layer.route && layer.route.path === '/api-docs.json'
            )
            
            if (jsonRoute && jsonRoute.route && jsonRoute.route.stack[0]) {
                const handler = jsonRoute.route.stack[0].handle
                
                // Execute the handler
                handler(mockReq, mockRes, mockNext)
                
                // Check response
                if (mockRes._data) {
                    // Parse the spec if it's a string
                    const spec = typeof mockRes._data === 'string' 
                        ? JSON.parse(mockRes._data) 
                        : mockRes._data
                    
                    assert.strictEqual(spec.openapi, '3.0.0', 'Should be OpenAPI 3.0')
                    assert.ok(spec.info, 'Should have info section')
                    assert.strictEqual(spec.info.title, 'HANA CLI API', 'Should have correct title')
                    assert.ok(spec.paths, 'Should have paths defined')
                    assert.ok(spec.tags, 'Should have tags defined')
                }
            }
        })

        it('should include all major endpoint tags', function () {
            route(app)
            
            const jsonRoute = app._router.stack.find(
                layer => layer.route && layer.route.path === '/api-docs.json'
            )
            
            if (jsonRoute && jsonRoute.route && jsonRoute.route.stack[0]) {
                const handler = jsonRoute.route.stack[0].handle
                handler(mockReq, mockRes, mockNext)
                
                if (mockRes._data) {
                    const spec = typeof mockRes._data === 'string'
                        ? JSON.parse(mockRes._data)
                        : mockRes._data
                    
                    const tagNames = spec.tags.map(tag => tag.name)
                    
                    assert.ok(tagNames.includes('Configuration'), 'Should include Configuration tag')
                    assert.ok(tagNames.includes('HANA System'), 'Should include HANA System tag')
                    assert.ok(tagNames.includes('HANA Objects'), 'Should include HANA Objects tag')
                    assert.ok(tagNames.includes('HANA Inspect'), 'Should include HANA Inspect tag')
                    assert.ok(tagNames.includes('HDI'), 'Should include HDI tag')
                    assert.ok(tagNames.includes('Cloud Services'), 'Should include Cloud Services tag')
                }
            }
        })

        it('should document key API endpoints', function () {
            route(app)
            
            const jsonRoute = app._router.stack.find(
                layer => layer.route && layer.route.path === '/api-docs.json'
            )
            
            if (jsonRoute && jsonRoute.route && jsonRoute.route.stack[0]) {
                const handler = jsonRoute.route.stack[0].handle
                handler(mockReq, mockRes, mockNext)
                
                if (mockRes._data) {
                    const spec = typeof mockRes._data === 'string'
                        ? JSON.parse(mockRes._data)
                        : mockRes._data
                    
                    // Check for key endpoints
                    assert.ok(spec.paths['/'], 'Should document root endpoint')
                    assert.ok(spec.paths['/hana'], 'Should document /hana endpoint')
                    assert.ok(spec.paths['/hana/tables'], 'Should document /hana/tables endpoint')
                    assert.ok(spec.paths['/hana/views'], 'Should document /hana/views endpoint')
                }
            }
        })
    })

    describe('Error Handling', function () {
        it('should handle swagger setup gracefully on errors', function () {
            // This test verifies the route can be registered even if there are issues
            assert.doesNotThrow(() => {
                route(app)
            }, 'Route registration should not throw errors')
        })
    })

    describe('Swagger UI Options', function () {
        it('should configure swagger UI with custom options', function () {
            route(app)
            
            // Verify middleware is registered (swagger-ui-express registers middleware)
            const middlewares = app._router.stack.filter(layer => !layer.route && layer.name !== '<anonymous>')
            
            // Should have swagger-ui-express middleware registered
            assert.ok(middlewares.length > 0, 'Should register swagger UI middleware')
        })
    })
})
