// @ts-check
import { expect } from 'chai'
import request from 'supertest'
import esmock from 'esmock'
import sinon from 'sinon'
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

    it('returns 400 for limit=0', async function () {
      const res = await request(app)
        .get('/hana/export')
        .query({ table: 'VALIDTABLE', limit: '0', format: 'csv' })
      expect(res.status).to.equal(400)
    })
  })

  describe('success paths (mocked DB)', function () {
    let mockedApp

    before(async function () {
      const routeModule = await esmock('../../routes/hanaExport.js', {
        '../../utils/base.js': {
          debug: () => {},
          setPrompts: () => {},
          getPrompts: () => ({}),
          clearConnection: sinon.stub().resolves(),
          createDBConnection: sinon.stub().resolves({
            execSQL: sinon.stub().resolves([{ ID: 1, NAME: 'Alice' }, { ID: 2, NAME: 'Bob' }])
          }),
          dbClass: { schemaCalc: sinon.stub().resolves('MYSCHEMA') },
          sqlInjection: { isAcceptableParameter: () => true }
        }
      })
      mockedApp = createMinimalApp(routeModule.route)
    })

    it('CSV: returns 200 with correct content-type and filename, body has header and data', async function () {
      const res = await request(mockedApp)
        .get('/hana/export')
        .query({ table: 'MYTABLE', format: 'csv' })
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.include('text/csv')
      expect(res.headers['content-disposition']).to.match(/attachment; filename="MYTABLE_.*\.csv"/)
      expect(res.text).to.include('ID,NAME')
      expect(res.text).to.include('Alice')
    })

    it('JSON: returns 200 with application/json content-type and .json filename, body is array', async function () {
      const res = await request(mockedApp)
        .get('/hana/export')
        .query({ table: 'MYTABLE', format: 'json' })
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.include('application/json')
      expect(res.headers['content-disposition']).to.match(/attachment; filename="MYTABLE_.*\.json"/)
      const parsed = JSON.parse(res.text)
      expect(parsed).to.be.an('array').with.length(2)
    })

    it('Excel: returns 200 with spreadsheetml content-type and .xlsx filename, body is non-empty buffer', async function () {
      const res = await request(mockedApp)
        .get('/hana/export')
        .query({ table: 'MYTABLE', format: 'excel' })
        .buffer(true)
        .parse((res, callback) => {
          const chunks = []
          res.on('data', chunk => chunks.push(chunk))
          res.on('end', () => callback(null, Buffer.concat(chunks)))
        })
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.include('spreadsheetml')
      expect(res.headers['content-disposition']).to.match(/attachment; filename="MYTABLE_.*\.xlsx"/)
      expect(res.body.length).to.be.greaterThan(0)
    })

    it('columns plumbing: returns 200 when valid columns are provided', async function () {
      const res = await request(mockedApp)
        .get('/hana/export')
        .query({ table: 'MYTABLE', format: 'csv', columns: 'ID,NAME' })
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.include('text/csv')
    })
  })
})
