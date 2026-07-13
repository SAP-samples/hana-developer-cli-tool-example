// @ts-check
import { expect } from 'chai'
import request from 'supertest'
import { createMinimalApp } from '../appFactory.js'
import { route } from '../../routes/hanaExport.js'

describe('Export Route - HTTP Integration Tests', function () {
  let app
  before(function () { app = createMinimalApp(route) })

  describe('input validation', function () {
    it('returns 400 when table is missing', async function () {
      const res = await request(app).get('/hana/export').query({ format: 'csv' })
      expect(res.status).to.equal(400)
    })

    it('returns 400 for an invalid (injection) table name', async function () {
      const res = await request(app)
        .get('/hana/export')
        .query({ table: 'FOO; DROP TABLE BAR', format: 'csv' })
      expect(res.status).to.equal(400)
    })

    it('returns 400 for invalid column identifiers', async function () {
      const res = await request(app)
        .get('/hana/export')
        .query({ table: 'VALIDTABLE', columns: 'OK, BAD;--', format: 'csv' })
      expect(res.status).to.equal(400)
    })

    it('returns 400 for a non-integer limit', async function () {
      const res = await request(app)
        .get('/hana/export')
        .query({ table: 'VALIDTABLE', limit: 'abc', format: 'csv' })
      expect(res.status).to.equal(400)
    })
  })
})
