// @ts-check
/**
 * @module Docs Route HTTP Integration Tests
 * Integration tests using supertest to test the docs route with real HTTP requests
 */

import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import { createMinimalApp } from '../appFactory.js'
import { route } from '../../routes/docs.js'

describe('Docs Route - HTTP Integration Tests', function () {
    let app

    before(async function () {
        // Create app with just the docs route
        app = createMinimalApp(route)
    })

    describe('GET /docs/readme', function () {
        it('should return 200 status code', async function () {
            const response = await request(app)
                .get('/docs/readme')
                .expect(200)
            
            expect(response.status).to.equal(200)
        })

        it('should return HTML content type', async function () {
            const response = await request(app)
                .get('/docs/readme')
                .expect('Content-Type', /html/)
            
            expect(response.headers['content-type']).to.match(/html/)
        })

        it('should return HTML content', async function () {
            const response = await request(app)
                .get('/docs/readme')
                .expect(200)
            
            expect(response.text).to.be.a('string')
            expect(response.text.length).to.be.greaterThan(0)
        })

        it('should contain converted markdown', async function () {
            const response = await request(app)
                .get('/docs/readme')
                .expect(200)
            
            // HTML from markdown should contain HTML tags
            expect(response.text).to.match(/<[^>]+>/)
        })

        it('should contain README content indicators', async function () {
            const response = await request(app)
                .get('/docs/readme')
                .expect(200)
            
            // Should contain typical README elements
            const lowerText = response.text.toLowerCase()
            const hasReadmeContent = 
                lowerText.includes('hana') ||
                lowerText.includes('cli') ||
                lowerText.includes('command') ||
                lowerText.includes('developer')
            
            expect(hasReadmeContent).to.be.true
        })
    })

    describe('GET /docs/changelog', function () {
        it('should return 200 status code', async function () {
            const response = await request(app)
                .get('/docs/changelog')
                .expect(200)
            
            expect(response.status).to.equal(200)
        })

        it('should return HTML content type', async function () {
            const response = await request(app)
                .get('/docs/changelog')
                .expect('Content-Type', /html/)
            
            expect(response.headers['content-type']).to.match(/html/)
        })

        it('should return HTML content', async function () {
            const response = await request(app)
                .get('/docs/changelog')
                .expect(200)
            
            expect(response.text).to.be.a('string')
            expect(response.text.length).to.be.greaterThan(0)
        })

        it('should contain converted markdown', async function () {
            const response = await request(app)
                .get('/docs/changelog')
                .expect(200)
            
            // HTML from markdown should contain HTML tags
            expect(response.text).to.match(/<[^>]+>/)
        })

        it('should contain changelog content indicators', async function () {
            const response = await request(app)
                .get('/docs/changelog')
                .expect(200)
            
            // Should contain typical changelog elements
            const lowerText = response.text.toLowerCase()
            const hasChangelogContent = 
                lowerText.includes('change') ||
                lowerText.includes('version') ||
                lowerText.includes('update') ||
                lowerText.includes('fix') ||
                lowerText.includes('feature')
            
            expect(hasChangelogContent).to.be.true
        })
    })

    describe('HTTP Method Tests', function () {
        it('should return 404 for POST /docs/readme', async function () {
            await request(app)
                .post('/docs/readme')
                .expect(404)
        })

        it('should return 404 for PUT /docs/readme', async function () {
            await request(app)
                .put('/docs/readme')
                .expect(404)
        })

        it('should return 404 for DELETE /docs/changelog', async function () {
            await request(app)
                .delete('/docs/changelog')
                .expect(404)
        })
    })

    describe('Route Not Found', function () {
        it('should return 404 for /docs/invalid', async function () {
            await request(app)
                .get('/docs/invalid')
                .expect(404)
        })

        it('should return 404 for /docs', async function () {
            await request(app)
                .get('/docs')
                .expect(404)
        })

        it('should return 404 for /docs/', async function () {
            await request(app)
                .get('/docs/')
                .expect(404)
        })
    })

    describe('Response Headers', function () {
        it('should include standard response headers for readme', async function () {
            const response = await request(app)
                .get('/docs/readme')
                .expect(200)
            
            expect(response.headers).to.have.property('content-type')
        })

        it('should include standard response headers for changelog', async function () {
            const response = await request(app)
                .get('/docs/changelog')
                .expect(200)
            
            expect(response.headers).to.have.property('content-type')
        })
    })

    describe('Content Length', function () {
        it('should return substantial content for readme', async function () {
            const response = await request(app)
                .get('/docs/readme')
                .expect(200)
            
            // README should have meaningful content (more than 100 characters)
            expect(response.text.length).to.be.greaterThan(100)
        })

        it('should return substantial content for changelog', async function () {
            const response = await request(app)
                .get('/docs/changelog')
                .expect(200)
            
            // Changelog should have meaningful content (more than 100 characters)
            expect(response.text.length).to.be.greaterThan(100)
        })
    })

    describe('Error Handling', function () {
        it('should handle errors gracefully for readme', async function () {
            // Should not crash the server
            const response = await request(app).get('/docs/readme')
            expect(response.status).to.be.oneOf([200, 500])
        })

        it('should handle errors gracefully for changelog', async function () {
            // Should not crash the server
            const response = await request(app).get('/docs/changelog')
            expect(response.status).to.be.oneOf([200, 500])
        })
    })

    describe('Multiple Requests', function () {
        it('should handle multiple sequential requests to readme', async function () {
            for (let i = 0; i < 3; i++) {
                const response = await request(app)
                    .get('/docs/readme')
                    .expect(200)
                
                expect(response.text.length).to.be.greaterThan(0)
            }
        })

        it('should handle alternating requests', async function () {
            await request(app).get('/docs/readme').expect(200)
            await request(app).get('/docs/changelog').expect(200)
            await request(app).get('/docs/readme').expect(200)
        })
    })
})
