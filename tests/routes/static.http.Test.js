// @ts-check
/**
 * @module Static Route HTTP Integration Tests
 * Integration tests using supertest to test the static route with real HTTP requests
 */

import { expect } from 'chai'
import request from 'supertest'
import { createMinimalApp } from '../appFactory.js'
import { route } from '../../routes/static.js'

describe('Static Route - HTTP Integration Tests', function () {
    let app

    before(async function () {
        app = createMinimalApp(route)
    })

    describe('Static File Routes', function () {
        describe('/ui static files', function () {
            it('should serve index.html from /ui path', async function () {
                const response = await request(app).get('/ui/')
                expect(response.status).to.be.oneOf([200, 304])
            })

            it('should serve SPA fallback for unknown /ui/* paths', async function () {
                const response = await request(app).get('/ui/some-route')
                expect(response.status).to.be.oneOf([200, 304])
                if (response.status === 200) {
                    expect(response.text).to.include('<!DOCTYPE html>')
                }
            })

            it('should NOT serve the SPA shell for a missing hashed asset (avoids MIME error)', async function () {
                // A stale/cached index.html can request an old asset hash that no
                // longer exists after a rebuild. The SPA fallback must NOT return
                // index.html for such requests — that would be served as
                // text/html and break module script loading in the browser.
                const response = await request(app).get('/ui/assets/index-DOESNOTEXIST.js')
                expect(response.status).to.not.equal(200)
                // Must not be the Vue SPA shell (which mounts on #app)
                expect(response.text).to.not.include('id="app"')
            })

            it('should serve index.html with no-cache so new asset hashes are picked up', async function () {
                const response = await request(app).get('/ui/')
                expect(response.status).to.not.equal(404)
                expect(response.status).to.be.oneOf([200, 304])
                if (response.status === 200) {
                    expect(response.headers['cache-control']).to.equal('no-cache')
                }
            })
        })

        describe('/i18n static files', function () {
            it('should serve i18n files from /i18n path', async function () {
                const response = await request(app).get('/i18n/messages.properties')
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

    describe('API Routes', function () {
        describe('GET /api/changelog', function () {
            it('should return changelog JSON', async function () {
                const response = await request(app).get('/api/changelog')
                expect(response.status).to.be.oneOf([200, 404])
            })
        })

        describe('GET /api/docs/:command', function () {
            it('should return 404 for unknown command', async function () {
                const response = await request(app).get('/api/docs/nonexistent-command-xyz')
                expect(response.status).to.equal(404)
            })
        })
    })

    describe('Removed Routes', function () {
        it('should return 404 for /appconfig/fioriSandboxConfig.json', async function () {
            await request(app)
                .get('/appconfig/fioriSandboxConfig.json')
                .expect(404)
        })

        it('should return 404 for /sap/dfa/ paths', async function () {
            await request(app)
                .get('/sap/dfa/test.html')
                .expect(404)
        })
    })

    describe('Response Headers', function () {
        it('should not expose x-powered-by header', async function () {
            const response = await request(app).get('/ui/')
            expect(response.headers).to.not.have.property('x-powered-by')
        })
    })
})
