// @ts-nocheck
/**
 * @module Routes hanaAnalytics Tests
 * Validation tests for POST /hana/analytics-ui
 * These tests focus on input validation — no database connection is required.
 */

import { expect } from 'chai'
import request from 'supertest'
import { createApp } from '../appFactory.js'
import { buildAnalyticsSQL } from '../../routes/hanaAnalytics.js'

describe('POST /hana/analytics-ui', function () {
    let app

    before(async function () {
        this.timeout(10000)
        app = await createApp()
    })

    // ------------------------------------------------------------------
    // HTTP-level validation tests (400 responses without DB interaction)
    // ------------------------------------------------------------------

    describe('Validation — missing schema', function () {
        it('should return 400 when schema is missing', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    object: 'SALES',
                    dimensions: ['REGION'],
                    measures: [{ column: 'AMOUNT', aggregation: 'SUM' }]
                })
                .expect(400)

            expect(response.body).to.have.property('error')
            expect(response.body.error).to.match(/schema/i)
        })

        it('should return 400 when schema is an empty string', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: '',
                    object: 'SALES',
                    dimensions: ['REGION']
                })
                .expect(400)

            expect(response.body).to.have.property('error')
        })
    })

    describe('Validation — missing object', function () {
        it('should return 400 when object is missing', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    dimensions: ['REGION'],
                    measures: [{ column: 'AMOUNT', aggregation: 'SUM' }]
                })
                .expect(400)

            expect(response.body).to.have.property('error')
            expect(response.body.error).to.match(/object/i)
        })

        it('should return 400 when object is an empty string', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    object: '',
                    dimensions: ['REGION']
                })
                .expect(400)

            expect(response.body).to.have.property('error')
        })
    })

    describe('Validation — empty dimensions and measures', function () {
        it('should return 400 when both dimensions and measures are empty arrays', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    object: 'SALES',
                    dimensions: [],
                    measures: []
                })
                .expect(400)

            expect(response.body).to.have.property('error')
            expect(response.body.error).to.match(/dimension|measure/i)
        })

        it('should return 400 when dimensions and measures are omitted', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    object: 'SALES'
                })
                .expect(400)

            expect(response.body).to.have.property('error')
        })
    })

    describe('Validation — invalid aggregation function', function () {
        it('should return 400 for an unknown aggregation function', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    object: 'SALES',
                    dimensions: ['REGION'],
                    measures: [{ column: 'AMOUNT', aggregation: 'STDDEV' }]
                })
                .expect(400)

            expect(response.body).to.have.property('error')
            expect(response.body.error).to.match(/aggregation/i)
        })

        it('should return 400 for SQL-injection-style aggregation', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    object: 'SALES',
                    dimensions: ['REGION'],
                    measures: [{ column: 'AMOUNT', aggregation: 'SUM); DROP TABLE SALES; --' }]
                })
                .expect(400)

            expect(response.body).to.have.property('error')
        })
    })

    describe('Validation — SQL injection in column names', function () {
        it('should return 400 for SQL injection in dimension column name', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    object: 'SALES',
                    dimensions: ['REGION; DROP TABLE SALES; --'],
                    measures: [{ column: 'AMOUNT', aggregation: 'SUM' }]
                })
                .expect(400)

            expect(response.body).to.have.property('error')
            expect(response.body.error).to.match(/invalid identifier/i)
        })

        it('should return 400 for SQL injection attempt using quotes in dimension', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    object: 'SALES',
                    dimensions: ['"REGION" UNION SELECT * FROM PASSWORDS--'],
                    measures: [{ column: 'AMOUNT', aggregation: 'SUM' }]
                })
                .expect(400)

            expect(response.body).to.have.property('error')
        })

        it('should return 400 for SQL injection in measure column name', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    object: 'SALES',
                    dimensions: ['REGION'],
                    measures: [{ column: '1 FROM DUAL UNION SELECT password', aggregation: 'SUM' }]
                })
                .expect(400)

            expect(response.body).to.have.property('error')
            expect(response.body.error).to.match(/invalid identifier/i)
        })

        it('should return 400 for SQL injection in schema name', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA; DROP TABLE users --',
                    object: 'SALES',
                    dimensions: ['REGION'],
                    measures: [{ column: 'AMOUNT', aggregation: 'SUM' }]
                })
                .expect(400)

            expect(response.body).to.have.property('error')
        })

        it('should return 400 for SQL injection in object name', async function () {
            const response = await request(app)
                .post('/hana/analytics-ui')
                .send({
                    schema: 'MY_SCHEMA',
                    object: 'SALES UNION SELECT * FROM CREDENTIALS--',
                    dimensions: ['REGION'],
                    measures: [{ column: 'AMOUNT', aggregation: 'SUM' }]
                })
                .expect(400)

            expect(response.body).to.have.property('error')
        })
    })

    // ------------------------------------------------------------------
    // Unit-level tests for buildAnalyticsSQL (no HTTP, no DB)
    // ------------------------------------------------------------------

    describe('buildAnalyticsSQL — unit tests', function () {
        it('should return an error object for missing schema', function () {
            const result = buildAnalyticsSQL({ object: 'T', dimensions: ['A'] })
            expect(result).to.have.property('status', 400)
            expect(result.error).to.match(/schema/i)
        })

        it('should return an error object for missing object', function () {
            const result = buildAnalyticsSQL({ schema: 'S', dimensions: ['A'] })
            expect(result).to.have.property('status', 400)
            expect(result.error).to.match(/object/i)
        })

        it('should return an error for empty dimensions and measures', function () {
            const result = buildAnalyticsSQL({ schema: 'S', object: 'T', dimensions: [], measures: [] })
            expect(result).to.have.property('status', 400)
        })

        it('should return an error for invalid aggregation', function () {
            const result = buildAnalyticsSQL({
                schema: 'S', object: 'T',
                measures: [{ column: 'VAL', aggregation: 'VARIANCE' }]
            })
            expect(result).to.have.property('status', 400)
            expect(result.error).to.match(/aggregation/i)
        })

        it('should return an error for an identifier with spaces', function () {
            const result = buildAnalyticsSQL({
                schema: 'S', object: 'T',
                dimensions: ['col with spaces']
            })
            expect(result).to.have.property('status', 400)
            expect(result.error).to.match(/invalid identifier/i)
        })

        it('should return an error for an identifier starting with a digit', function () {
            const result = buildAnalyticsSQL({
                schema: 'S', object: 'T',
                dimensions: ['1invalid']
            })
            expect(result).to.have.property('status', 400)
            expect(result.error).to.match(/invalid identifier/i)
        })

        it('should build valid SQL for dimensions only', function () {
            const result = buildAnalyticsSQL({
                schema: 'MY_SCHEMA', object: 'SALES',
                dimensions: ['REGION', 'YEAR']
            })
            expect(result).to.have.property('sql')
            expect(result).to.have.property('params')
            expect(result.sql).to.include('"MY_SCHEMA"."SALES"')
            expect(result.sql).to.include('"REGION"')
            expect(result.sql).to.include('"YEAR"')
            expect(result.sql).to.include('GROUP BY')
        })

        it('should build valid SQL for measures with SUM', function () {
            const result = buildAnalyticsSQL({
                schema: 'S', object: 'T',
                measures: [{ column: 'AMOUNT', aggregation: 'SUM', alias: 'TOTAL' }]
            })
            expect(result.sql).to.include('SUM("AMOUNT") AS "TOTAL"')
            expect(result.sql).to.not.include('GROUP BY') // no dimensions
        })

        it('should use parameterized placeholders for filter values', function () {
            const result = buildAnalyticsSQL({
                schema: 'S', object: 'T',
                dimensions: ['REGION'],
                filters: [{ column: 'STATUS', operator: '=', value: 'ACTIVE' }]
            })
            expect(result.sql).to.include('WHERE "STATUS" = ?')
            expect(result.params).to.deep.equal(['ACTIVE'])
        })

        it('should handle IN operator with array values', function () {
            const result = buildAnalyticsSQL({
                schema: 'S', object: 'T',
                dimensions: ['REGION'],
                filters: [{ column: 'STATUS', operator: 'IN', value: ['A', 'B', 'C'] }]
            })
            expect(result.sql).to.include('"STATUS" IN (?, ?, ?)')
            expect(result.params).to.deep.equal(['A', 'B', 'C'])
        })

        it('should handle BETWEEN operator', function () {
            const result = buildAnalyticsSQL({
                schema: 'S', object: 'T',
                dimensions: ['REGION'],
                filters: [{ column: 'PRICE', operator: 'BETWEEN', value: [10, 100] }]
            })
            expect(result.sql).to.include('"PRICE" BETWEEN ? AND ?')
            expect(result.params).to.deep.equal([10, 100])
        })

        it('should enforce a maximum row limit of 10000', function () {
            const result = buildAnalyticsSQL({
                schema: 'S', object: 'T',
                dimensions: ['REGION'],
                limit: 999999
            })
            expect(result.sql).to.include('LIMIT 10000')
        })

        it('should default the row limit to 1000 when not specified', function () {
            const result = buildAnalyticsSQL({
                schema: 'S', object: 'T',
                dimensions: ['REGION']
            })
            expect(result.sql).to.include('LIMIT 1000')
        })

        it('should accept all five valid aggregation functions', function () {
            const aggs = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX']
            for (const agg of aggs) {
                const result = buildAnalyticsSQL({
                    schema: 'S', object: 'T',
                    measures: [{ column: 'VAL', aggregation: agg }]
                })
                expect(result).to.have.property('sql', result.sql)
                expect(result).to.not.have.property('error')
            }
        })
    })
})
