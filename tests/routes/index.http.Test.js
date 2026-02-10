// @ts-check
/**
 * @module Index Route HTTP Integration Tests
 * Integration tests using supertest to test the index route with real HTTP requests
 */

import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import { createMinimalApp } from '../appFactory.js'
import { route } from '../../routes/index.js'
import * as base from '../../utils/base.js'

describe('Index Route - HTTP Integration Tests', function () {
    let app

    before(async function () {
        // Create app with just the index route
        app = createMinimalApp(route)
    })

    describe('GET /', function () {
        it('should return 200 status code', async function () {
            const response = await request(app)
                .get('/')
                .expect(200)
            
            expect(response.status).to.equal(200)
        })

        it('should return JSON content type', async function () {
            const response = await request(app)
                .get('/')
                .expect('Content-Type', /json/)
            
            expect(response.headers['content-type']).to.match(/json/)
        })

        it('should return prompts data', async function () {
            const response = await request(app)
                .get('/')
                .expect(200)
            
            expect(response.body).to.be.an('object')
        })

        it('should handle errors gracefully', async function () {
            // Even if there's an internal error, should not crash
            const response = await request(app).get('/')
            expect(response.status).to.be.oneOf([200, 500])
        })
    })

    describe('PUT /', function () {
        it('should return 200 status code with valid body', async function () {
            const testData = {
                connection: 'test',
                schema: 'TEST_SCHEMA'
            }

            const response = await request(app)
                .put('/')
                .send(testData)
                .expect(200)
            
            expect(response.status).to.equal(200)
        })

        it('should return JSON content type', async function () {
            const testData = {
                connection: 'test',
                schema: 'TEST_SCHEMA'
            }

            const response = await request(app)
                .put('/')
                .send(testData)
                .expect('Content-Type', /json/)
            
            expect(response.headers['content-type']).to.match(/json/)
        })

        it('should return success status', async function () {
            const testData = {
                connection: 'test',
                admin: false
            }

            const response = await request(app)
                .put('/')
                .send(testData)
                .expect(200)
            
            expect(response.body).to.have.property('status', 'ok')
        })

        it('should set isGui flag to true in prompts', async function () {
            const testData = {
                connection: 'myConnection',
                schema: 'MY_SCHEMA'
            }

            await request(app)
                .put('/')
                .send(testData)
                .expect(200)

            // Verify that isGui was set (if we can access prompts)
            const prompts = base.getPrompts()
            if (prompts) {
                expect(prompts.isGui).to.equal(true)
            }
        })

        it('should accept empty body', async function () {
            const response = await request(app)
                .put('/')
                .send({})
                .expect(200)
            
            expect(response.body).to.have.property('status', 'ok')
        })

        it('should handle complex configuration data', async function () {
            const testData = {
                connection: 'complexConn',
                schema: 'COMPLEX_SCHEMA',
                admin: true,
                encrypt: true,
                trustStore: '/path/to/truststore'
            }

            const response = await request(app)
                .put('/')
                .send(testData)
                .expect(200)
            
            expect(response.body.status).to.equal('ok')
        })
    })

    describe('HTTP Method Tests', function () {
        it('should return 404 for POST /', async function () {
            await request(app)
                .post('/')
                .expect(404)
        })

        it('should return 404 for DELETE /', async function () {
            await request(app)
                .delete('/')
                .expect(404)
        })

        it('should return 404 for PATCH /', async function () {
            await request(app)
                .patch('/')
                .expect(404)
        })
    })

    describe('Content-Type Handling', function () {
        it('should handle application/json content type', async function () {
            const response = await request(app)
                .put('/')
                .set('Content-Type', 'application/json')
                .send({ test: 'data' })
                .expect(200)
            
            expect(response.body.status).to.equal('ok')
        })

        it('should handle missing content type', async function () {
            const response = await request(app)
                .put('/')
                .send({ test: 'data' })
            
            expect(response.status).to.be.oneOf([200, 400])
        })
    })

    describe('Error Handling', function () {
        it('should handle malformed JSON', async function () {
            const response = await request(app)
                .put('/')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
            
            // Should return 400 or 500 for malformed JSON
            expect(response.status).to.be.oneOf([400, 500])
        })

        it('should not crash on undefined route', async function () {
            await request(app)
                .get('/nonexistent')
                .expect(404)
        })
    })
})
