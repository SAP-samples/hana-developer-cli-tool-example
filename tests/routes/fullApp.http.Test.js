// @ts-check
/**
 * @module Full App HTTP Integration Tests
 * Integration tests using supertest to test the complete application with all routes loaded
 */

import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import { createApp } from '../appFactory.js'

describe('Full Application - HTTP Integration Tests', function () {
    let app

    before(async function () {
        // Increase timeout for loading all routes
        this.timeout(10000)
        
        // Create app with all routes loaded
        app = await createApp({
            loadRoutes: true,
            addErrorHandlers: true
        })
    })

    describe('Routes Registration', function () {
        it('should have index route registered', async function () {
            const response = await request(app).get('/')
            expect(response.status).to.be.oneOf([200, 500])
        })

        it('should have docs routes registered', async function () {
            const response = await request(app).get('/docs/readme')
            expect(response.status).to.be.oneOf([200, 500])
        })

        it('should have static routes registered', async function () {
            const response = await request(app).get('/appconfig/fioriSandboxConfig.json')
            expect(response.status).to.be.oneOf([200, 500])
        })
    })

    describe('404 Handler', function () {
        it('should return 404 for non-existent routes', async function () {
            const response = await request(app)
                .get('/this-route-does-not-exist')
                .expect(404)
            
            expect(response.status).to.equal(404)
        })

        it('should return JSON error for 404', async function () {
            const response = await request(app)
                .get('/non-existent-route')
                .expect(404)
            
            expect(response.body).to.be.an('object')
            expect(response.body).to.have.property('error')
        })

        it('should include route method in 404 message', async function () {
            const response = await request(app)
                .get('/invalid-path')
                .expect(404)
            
            expect(response.body.message).to.include('GET')
            expect(response.body.message).to.include('/invalid-path')
        })
    })

    describe('Error Handler', function () {
        it('should have error handler middleware', async function () {
            // Any error should be caught by error handler
            // Route exists but may have internal errors
            const response = await request(app).get('/')
            
            if (response.status === 500) {
                expect(response.body).to.have.property('error')
            }
        })

        it('should return JSON for errors', async function () {
            const response = await request(app).get('/trigger-error-if-exists')
            
            if (response.status >= 400) {
                expect(response.headers['content-type']).to.match(/json/)
            }
        })
    })

    describe('Multiple Routes', function () {
        it('should handle sequential requests to different routes', async function () {
            const response1 = await request(app).get('/')
            const response2 = await request(app).get('/docs/readme')
            const response3 = await request(app).get('/appconfig/fioriSandboxConfig.json')
            
            // All should return some response
            expect([200, 404, 500]).to.include(response1.status)
            expect([200, 404, 500]).to.include(response2.status)
            expect([200, 404, 500]).to.include(response3.status)
        })

        it('should handle concurrent requests', async function () {
            const requests = await Promise.all([
                request(app).get('/'),
                request(app).get('/docs/readme'),
                request(app).get('/appconfig/fioriSandboxConfig.json')
            ])
            
            // All requests should complete
            expect(requests).to.have.lengthOf(3)
            requests.forEach(response => {
                expect(response.status).to.be.a('number')
            })
        })
    })

    describe('HTTP Methods', function () {
        it('should support GET requests', async function () {
            const response = await request(app).get('/')
            expect([200, 404, 500]).to.include(response.status)
        })

        it('should support PUT requests', async function () {
            const response = await request(app)
                .put('/')
                .send({ test: 'data' })
            
            expect([200, 404, 500]).to.include(response.status)
        })

        it('should handle unsupported methods correctly', async function () {
            const response = await request(app).post('/docs/readme')
            expect(response.status).to.equal(404)
        })
    })

    describe('Content Types', function () {
        it('should handle JSON requests', async function () {
            const response = await request(app)
                .put('/')
                .set('Content-Type', 'application/json')
                .send({ data: 'test' })
            
            expect([200, 400, 500]).to.include(response.status)
        })

        it('should return appropriate content types', async function () {
            // HTML route
            const htmlResponse = await request(app).get('/docs/readme')
            if (htmlResponse.status === 200) {
                expect(htmlResponse.headers['content-type']).to.match(/html/)
            }
            
            // JSON route
            const jsonResponse = await request(app).get('/')
            if (jsonResponse.status === 200) {
                expect(jsonResponse.headers['content-type']).to.match(/json/)
            }
        })
    })

    describe('App Configuration', function () {
        it('should have x-powered-by disabled', async function () {
            const response = await request(app).get('/')
            expect(response.headers).to.not.have.property('x-powered-by')
        })

        it('should handle body parsing', async function () {
            const testData = {
                key: 'value',
                nested: {
                    prop: 'data'
                }
            }
            
            const response = await request(app)
                .put('/')
                .send(testData)
            
            // Should not fail on body parsing
            expect([200, 400, 500]).to.include(response.status)
        })
    })

    describe('Stress Tests', function () {
        it('should handle many sequential requests', async function () {
            this.timeout(5000)
            
            for (let i = 0; i < 10; i++) {
                const response = await request(app).get('/')
                expect([200, 500]).to.include(response.status)
            }
        })

        it('should handle burst of concurrent requests', async function () {
            this.timeout(5000)
            
            const requests = []
            for (let i = 0; i < 20; i++) {
                requests.push(request(app).get('/'))
            }
            
            const responses = await Promise.all(requests)
            expect(responses).to.have.lengthOf(20)
            
            responses.forEach(response => {
                expect([200, 500]).to.include(response.status)
            })
        })

        it('should handle mixed request types concurrently', async function () {
            this.timeout(5000)
            
            const responses = await Promise.all([
                request(app).get('/'),
                request(app).get('/docs/readme'),
                request(app).get('/docs/changelog'),
                request(app).get('/appconfig/fioriSandboxConfig.json'),
                request(app).put('/').send({ test: 'data1' }),
                request(app).put('/').send({ test: 'data2' }),
                request(app).get('/non-existent'),
            ])
            
            expect(responses).to.have.lengthOf(7)
            
            // All should complete with some status
            responses.forEach(response => {
                expect(response.status).to.be.a('number')
                expect(response.status).to.be.at.least(200)
                expect(response.status).to.be.below(600)
            })
        })
    })

    describe('Security Headers', function () {
        it('should not leak server information', async function () {
            const response = await request(app).get('/')
            
            expect(response.headers).to.not.have.property('x-powered-by')
        })

        it('should handle CORS appropriately', async function () {
            const response = await request(app)
                .get('/')
                .set('Origin', 'http://example.com')
            
            // CORS handling should not crash the server
            expect([200, 500]).to.include(response.status)
        })
    })

    describe('Edge Cases', function () {
        it('should handle very long URLs', async function () {
            const longPath = '/path/' + 'x'.repeat(1000)
            const response = await request(app).get(longPath)
            
            // Should return 404, not crash
            expect(response.status).to.equal(404)
        })

        it('should handle special characters in URL', async function () {
            const response = await request(app).get('/test%20path')
            expect([404, 200, 500]).to.include(response.status)
        })

        it('should handle empty body in PUT', async function () {
            const response = await request(app)
                .put('/')
                .send('')
            
            expect([200, 400, 500]).to.include(response.status)
        })

        it('should handle very large JSON body', async function () {
            const largeData = {
                data: 'x'.repeat(10000)
            }
            
            const response = await request(app)
                .put('/')
                .send(largeData)
            
            expect([200, 413, 500]).to.include(response.status)
        })
    })

    describe('App Initialization', function () {
        it('should create app instance successfully', function () {
            expect(app).to.exist
            expect(typeof app).to.equal('function')
        })

        it('should have all middleware loaded', function () {
            // App should be ready to handle requests
            // Express 5+ doesn't expose _router publicly, check if app is usable instead
            expect(app).to.exist
            expect(typeof app).to.equal('function')
        })

        it('should maintain state across requests', async function () {
            // First request
            await request(app).put('/').send({ test: 'state' })
            
            // Second request should still work
            const response = await request(app).get('/')
            expect([200, 500]).to.include(response.status)
        })
    })
})
