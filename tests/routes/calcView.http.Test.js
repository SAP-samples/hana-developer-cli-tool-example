// @ts-check
/**
 * @module CalcView Route HTTP Integration Tests
 * Integration tests using supertest to test the calcView route with real HTTP requests
 */

import { expect } from 'chai'
import request from 'supertest'
import { createMinimalApp } from '../appFactory.js'
import { route } from '../../routes/calcView.js'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

describe('CalcView Route - HTTP Integration Tests', function () {
  let app
  let tempDir

  before(async function () {
    app = createMinimalApp(route)
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'calcview-test-'))
    // Create a test fixture
    await fs.writeFile(
      path.join(tempDir, 'TEST.hdbcalculationview'),
      '<?xml version="1.0" encoding="UTF-8"?><Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="TEST" applyPrivilegeType="NONE" dataCategory="CUBE"><descriptions defaultDescription="Test"/><localVariables/><variableMappings/><dataSources/><calculationViews/><logicalModel><attributes/><calculatedAttributes/><baseMeasures/><calculatedMeasures/><restrictedMeasures/></logicalModel><layout><shapes><shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup"><upperLeftCorner x="40" y="85"/></shape></shapes></layout></Calculation:scenario>'
    )
  })

  after(async function () {
    await fs.rm(tempDir, { recursive: true })
  })

  describe('GET /hana/calcview/project/list', function () {
    it('should list .hdbcalculationview files', async function () {
      const response = await request(app)
        .get('/hana/calcview/project/list')
        .query({ path: tempDir })
        .expect(200)

      expect(response.body).to.be.an('array')
      expect(response.body).to.have.lengthOf(1)
      expect(response.body[0].name).to.equal('TEST')
      expect(response.body[0].fileName).to.equal('TEST.hdbcalculationview')
    })

    it('should return 400 if path is missing', async function () {
      await request(app)
        .get('/hana/calcview/project/list')
        .expect(400)
    })

    it('should return empty array for directory with no calcview files', async function () {
      const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'calcview-empty-'))
      try {
        const response = await request(app)
          .get('/hana/calcview/project/list')
          .query({ path: emptyDir })
          .expect(200)

        expect(response.body).to.be.an('array')
        expect(response.body).to.have.lengthOf(0)
      } finally {
        await fs.rm(emptyDir, { recursive: true })
      }
    })
  })

  describe('GET /hana/calcview/project/read', function () {
    it('should read a calculation view file', async function () {
      const filePath = path.join(tempDir, 'TEST.hdbcalculationview')
      const response = await request(app)
        .get('/hana/calcview/project/read')
        .query({ file: filePath })
        .expect(200)

      expect(response.body.xml).to.contain('Calculation:scenario')
      expect(response.body.xml).to.contain('id="TEST"')
    })

    it('should return 400 if file parameter is missing', async function () {
      await request(app)
        .get('/hana/calcview/project/read')
        .expect(400)
    })

    it('should reject non-.hdbcalculationview files', async function () {
      const txtFile = path.join(tempDir, 'test.txt')
      await request(app)
        .get('/hana/calcview/project/read')
        .query({ file: txtFile })
        .expect(403)
    })

    it('should reject paths outside the project root', async function () {
      const filePath = path.resolve(tempDir, '..', 'outside.hdbcalculationview')
      await request(app)
        .get('/hana/calcview/project/read')
        .query({ file: filePath, base: tempDir })
        .expect(403)
    })

    it('should return 404 for non-existent file', async function () {
      const filePath = path.join(tempDir, 'NONEXISTENT.hdbcalculationview')
      await request(app)
        .get('/hana/calcview/project/read')
        .query({ file: filePath })
        .expect(404)
    })
  })

  describe('POST /hana/calcview/project/write', function () {
    it('should write XML to a file', async function () {
      const filePath = path.join(tempDir, 'NEW.hdbcalculationview')
      const xml = '<?xml version="1.0" encoding="UTF-8"?><Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="NEW" applyPrivilegeType="NONE" dataCategory="CUBE"></Calculation:scenario>'

      await request(app)
        .post('/hana/calcview/project/write')
        .send({ file: filePath, xml })
        .expect(200)

      const content = await fs.readFile(filePath, 'utf-8')
      expect(content).to.equal(xml)
    })

    it('should return 400 if file is missing', async function () {
      await request(app)
        .post('/hana/calcview/project/write')
        .send({ xml: '<xml/>' })
        .expect(400)
    })

    it('should return 400 if xml is missing', async function () {
      const filePath = path.join(tempDir, 'MISSING.hdbcalculationview')
      await request(app)
        .post('/hana/calcview/project/write')
        .send({ file: filePath })
        .expect(400)
    })

    it('should reject non-.hdbcalculationview files', async function () {
      await request(app)
        .post('/hana/calcview/project/write')
        .send({ file: path.join(tempDir, 'evil.js'), xml: 'console.log("pwned")' })
        .expect(403)
    })

    it('should reject paths outside the project root', async function () {
      const filePath = path.resolve(tempDir, '..', 'outside.hdbcalculationview')
      await request(app)
        .post('/hana/calcview/project/write')
        .send({ file: filePath, xml: '<xml/>', base: tempDir })
        .expect(403)
    })
  })
})
