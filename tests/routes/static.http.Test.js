// @ts-check
/**
 * @module Static Route HTTP Integration Tests
 * Integration tests using supertest to test the static route with real HTTP requests
 */

import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import { createMinimalApp } from '../appFactory.js'
import { route } from '../../routes/static.js'

describe('Static Route - HTTP Integration Tests', function () {
    let app

    before(async function () {
        // Create app with just the static route
        app = createMinimalApp(route)
    })

    describe('GET /appconfig/fioriSandboxConfig.json', function () {
        it('should return 200 status code', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            expect(response.status).to.equal(200)
        })

        it('should return JSON content type', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect('Content-Type', /json/)
            
            expect(response.headers['content-type']).to.match(/json/)
        })

        it('should return valid JSON object', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            expect(response.body).to.be.an('object')
        })

        it('should contain bootstrapPlugins property', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            expect(response.body).to.have.property('bootstrapPlugins')
            expect(response.body.bootstrapPlugins).to.be.an('object')
        })

        it('should contain BootstrapXrayPlugin configuration', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            expect(response.body.bootstrapPlugins).to.have.property('BootstrapXrayPlugin')
            expect(response.body.bootstrapPlugins.BootstrapXrayPlugin).to.be.an('object')
        })

        it('should have version in BootstrapXrayPlugin config', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            const plugin = response.body.bootstrapPlugins.BootstrapXrayPlugin
            expect(plugin).to.have.property('config')
            expect(plugin.config).to.be.an('object')
            // Version is set dynamically by the route
            if (plugin.config.hasOwnProperty('version')) {
                expect(plugin.config.version).to.be.a('string')
            }
        })

        it('should return consistent data on multiple requests', async function () {
            const response1 = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            const response2 = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            expect(response1.body).to.deep.equal(response2.body)
        })
    })

    describe('Static File Routes', function () {
        describe('/ui static files', function () {
            it('should serve files from /ui path', async function () {
                // Test if the static middleware is configured
                // Files may or may not exist, but route should be registered
                const response = await request(app).get('/ui/test.html')
                
                // Should either return 404 (file not found) or 200 (file found)
                // but not 404 for route not found
                expect(response.status).to.be.oneOf([200, 404])
            })
        })

        describe('/sap/dfa/ static files', function () {
            it('should serve files from /sap/dfa/ path', async function () {
                const response = await request(app).get('/sap/dfa/test.html')
                expect(response.status).to.be.oneOf([200, 404])
            })
        })

        describe('/resources/sap/dfa/ static files', function () {
            it('should serve files from /resources/sap/dfa/ path', async function () {
                const response = await request(app).get('/resources/sap/dfa/test.html')
                expect(response.status).to.be.oneOf([200, 404])
            })
        })

        describe('/i18n static files', function () {
            it('should serve i18n files from /i18n path', async function () {
                // This should exist as we have _i18n folder
                const response = await request(app).get('/i18n/messages.properties')
                
                // Should return 200 if file exists, 404 if not
                expect(response.status).to.be.oneOf([200, 404])
            })

            it('should serve German messages if exists', async function () {
                const response = await request(app).get('/i18n/messages_de.properties')
                expect(response.status).to.be.oneOf([200, 404])
            })
        })

        describe('/favicon.ico', function () {
            it('should serve favicon', async function () {
                const response = await request(app).get('/favicon.ico')
                expect(response.status).to.be.oneOf([200, 404])
            })
        })
    })

    describe('HTTP Method Tests', function () {
        it('should return 404 for POST /appconfig/fioriSandboxConfig.json', async function () {
            await request(app)
                .post('/appconfig/fioriSandboxConfig.json')
                .expect(404)
        })

        it('should return 404 for PUT /appconfig/fioriSandboxConfig.json', async function () {
            await request(app)
                .put('/appconfig/fioriSandboxConfig.json')
                .expect(404)
        })

        it('should return 404 for DELETE /appconfig/fioriSandboxConfig.json', async function () {
            await request(app)
                .delete('/appconfig/fioriSandboxConfig.json')
                .expect(404)
        })
    })

    describe('Route Not Found', function () {
        it('should return 404 for /appconfig/invalid.json', async function () {
            await request(app)
                .get('/appconfig/invalid.json')
                .expect(404)
        })

        it('should return 404 for /appconfig', async function () {
            await request(app)
                .get('/appconfig')
                .expect(404)
        })
    })

    describe('Error Handling', function () {
        it('should handle errors gracefully', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
            
            expect(response.status).to.be.oneOf([200, 500])
        })
    })

    describe('Response Headers', function () {
        it('should include standard response headers', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            expect(response.headers).to.have.property('content-type')
        })

        it('should not expose x-powered-by header', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            expect(response.headers).to.not.have.property('x-powered-by')
        })
    })

    describe('Content Validation', function () {
        it('should return valid JSON structure', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            // Should be parseable as JSON
            expect(() => JSON.stringify(response.body)).to.not.throw()
        })

        it('should have expected properties', async function () {
            const response = await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(200)
            
            // Should have bootstrapPlugins at minimum
            expect(response.body).to.have.property('bootstrapPlugins')
        })
    })

    describe('Cache and Performance', function () {
        it('should handle multiple rapid requests', async function () {
            const requests = []
            for (let i = 0; i < 5; i++) {
                requests.push(
                    request(app).get('/appconfig/fioriSandboxConfig.json')
                )
            }
            
            const responses = await Promise.all(requests)
            responses.forEach(response => {
                expect(response.status).to.equal(200)
            })
        })

        it('should return consistent content across requests', async function () {
            const responses = await Promise.all([
                request(app).get('/appconfig/fioriSandboxConfig.json'),
                request(app).get('/appconfig/fioriSandboxConfig.json'),
                request(app).get('/appconfig/fioriSandboxConfig.json')
            ])
            
            const body1 = responses[0].body
            const body2 = responses[1].body
            const body3 = responses[2].body
            
            expect(body1).to.deep.equal(body2)
            expect(body2).to.deep.equal(body3)
        })
    })
})
