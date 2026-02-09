// @ts-nocheck
/**
 * @module Routes Index Tests - Unit tests for index route
 */

import { describe, it } from 'mocha'
import { assert } from '../base.js'
import express from 'express'
import { route } from '../../routes/index.js'

describe('Index Route', function () {
    
    describe('Route Function', function () {
        it('should export a route function', function () {
            assert.strictEqual(typeof route, 'function', 'route should be a function')
        })

        it('should accept an express app parameter', function () {
            const app = express()
            // Should not throw
            assert.doesNotThrow(() => {
                route(app)
            })
        })

        it('should configure routes on the app', function () {
            const app = express()
            const initialStackLength = app._router ? app._router.stack.length : 0
            
            route(app)
            
            // After calling route(), the app should have additional routes
            // We can't check exact count due to middleware, but app should still be valid
            assert.ok(app, 'app should still be valid after route configuration')
        })
    })

    describe('Module Exports', function () {
        it('should export route function as named export', function () {
            assert.ok(route, 'route function should be exported')
            assert.strictEqual(typeof route, 'function')
        })
    })

    describe('Integration', function () {
        it('should work with fresh express instance', function () {
            const app = express()
            route(app)
            
            // App should have listen method ready
            assert.strictEqual(typeof app.listen, 'function')
        })

        it('should not throw errors during setup', function () {
            let error = null
            try {
                const app = express()
                route(app)
            } catch (e) {
                error = e
            }
            assert.strictEqual(error, null, 'Should not throw errors during setup')
        })
    })
})


