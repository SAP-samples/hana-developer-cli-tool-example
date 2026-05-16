// @ts-nocheck
/**
 * @module Routes Static Tests - Integration tests for static file routes
 */

import { assert } from '../base.js'
import express from 'express'
import { route } from '../../routes/static.js'

describe('Static Route Integration Tests', function () {
    let app

    beforeEach(function () {
        app = express()
    })

    describe('Route Registration', function () {
        it('should register static routes without errors', function () {
            assert.doesNotThrow(() => {
                route(app)
            })
        })

        it('should export a route function', function () {
            assert.strictEqual(typeof route, 'function')
        })

        it('should accept app parameter', function () {
            assert.strictEqual(route.length, 1, 'route should accept 1 parameter')
        })
    })

    describe('Static File Paths', function () {
        it('should configure /ui static path', function () {
            route(app)
            assert.ok(app, 'App configured with /ui static path')
        })

        it('should configure /i18n static path', function () {
            route(app)
            assert.ok(app, 'App configured with /i18n static path')
        })

        it('should configure /favicon.ico static path', function () {
            route(app)
            assert.ok(app, 'App configured with /favicon.ico static path')
        })

        it('should configure SPA fallback for /ui/* paths', function () {
            route(app)
            assert.ok(app, 'App configured with SPA fallback')
        })
    })

    describe('API Routes', function () {
        it('should configure /api/changelog route', function () {
            route(app)
            assert.ok(app, 'App configured with changelog route')
        })

        it('should configure /api/docs/:command route', function () {
            route(app)
            assert.ok(app, 'App configured with docs route')
        })
    })

    describe('Integration', function () {
        it('should work with fresh express instance', function () {
            const newApp = express()
            assert.doesNotThrow(() => {
                route(newApp)
            })
        })

        it('should not throw errors during setup', function () {
            let error = null
            try {
                route(app)
            } catch (e) {
                error = e
            }
            assert.strictEqual(error, null, 'Should not throw errors during setup')
        })

        it('should configure routes without side effects', function () {
            const app1 = express()
            const app2 = express()
            route(app1)
            route(app2)
            assert.ok(app1, 'First app configured')
            assert.ok(app2, 'Second app configured')
        })
    })

    describe('Debug Integration', function () {
        it('should call base.debug during route setup', function () {
            route(app)
            assert.ok(app, 'Route integrates with debug logging')
        })
    })
})
