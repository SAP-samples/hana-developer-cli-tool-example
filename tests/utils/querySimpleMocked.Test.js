// @ts-check
/**
 * Unit tests for querySimple DML/DDL handling using mocked database client.
 * These tests exercise the new code paths deterministically without requiring
 * a live HANA connection.
 */

import { expect } from 'chai'
import esmock from 'esmock'
import sinon from 'sinon'

describe('querySimple - mocked DML/DDL paths', function () {
  let consoleLogStub

  beforeEach(() => {
    consoleLogStub = sinon.stub(console, 'log')
  })

  afterEach(() => {
    consoleLogStub.restore()
  })

  describe('DML: numeric result (rows affected)', function () {
    it('should return rowsAffected object when execSQL returns a number', async function () {
      const disconnectStub = sinon.stub().resolves()
      const querySimple = await esmock('../../bin/querySimple.js', {
        '../../utils/database/index.js': {
          default: {
            getNewClient: () => ({
              connect: sinon.stub().resolves(),
              execSQL: sinon.stub().resolves(5),
              disconnect: disconnectStub
            })
          }
        }
      })

      const result = await querySimple.dbQuery({ query: 'INSERT INTO T VALUES(1)', output: 'table' })

      expect(result).to.deep.equal({ rowsAffected: 5 })
      expect(disconnectStub.calledOnce).to.be.true
      expect(consoleLogStub.calledOnce).to.be.true
    })

    it('should output JSON when output format is json', async function () {
      const querySimple = await esmock('../../bin/querySimple.js', {
        '../../utils/database/index.js': {
          default: {
            getNewClient: () => ({
              connect: sinon.stub().resolves(),
              execSQL: sinon.stub().resolves(3),
              disconnect: sinon.stub().resolves()
            })
          }
        }
      })

      const result = await querySimple.dbQuery({ query: 'UPDATE T SET X=1', output: 'json' })

      expect(result).to.deep.equal({ rowsAffected: 3 })
      const output = consoleLogStub.firstCall.args[0]
      const parsed = JSON.parse(output)
      expect(parsed.rowsAffected).to.equal(3)
    })

    it('should handle zero rows affected', async function () {
      const querySimple = await esmock('../../bin/querySimple.js', {
        '../../utils/database/index.js': {
          default: {
            getNewClient: () => ({
              connect: sinon.stub().resolves(),
              execSQL: sinon.stub().resolves(0),
              disconnect: sinon.stub().resolves()
            })
          }
        }
      })

      const result = await querySimple.dbQuery({ query: 'DELETE FROM T WHERE 1=0', output: 'table' })

      expect(result).to.deep.equal({ rowsAffected: 0 })
    })
  })

  describe('DDL: non-array/empty result', function () {
    it('should return success object when execSQL returns undefined', async function () {
      const disconnectStub = sinon.stub().resolves()
      const querySimple = await esmock('../../bin/querySimple.js', {
        '../../utils/database/index.js': {
          default: {
            getNewClient: () => ({
              connect: sinon.stub().resolves(),
              execSQL: sinon.stub().resolves(undefined),
              disconnect: disconnectStub
            })
          }
        }
      })

      const result = await querySimple.dbQuery({ query: 'CREATE TABLE T (ID INT)', output: 'table' })

      expect(result).to.have.property('success', true)
      expect(result).to.have.property('message').that.is.a('string')
      expect(disconnectStub.calledOnce).to.be.true
    })

    it('should return success object when execSQL returns empty array', async function () {
      const querySimple = await esmock('../../bin/querySimple.js', {
        '../../utils/database/index.js': {
          default: {
            getNewClient: () => ({
              connect: sinon.stub().resolves(),
              execSQL: sinon.stub().resolves([]),
              disconnect: sinon.stub().resolves()
            })
          }
        }
      })

      const result = await querySimple.dbQuery({ query: 'DROP TABLE T', output: 'table' })

      expect(result).to.have.property('success', true)
      expect(result).to.have.property('message').that.is.a('string')
    })

    it('should output JSON for DDL when output format is json', async function () {
      const querySimple = await esmock('../../bin/querySimple.js', {
        '../../utils/database/index.js': {
          default: {
            getNewClient: () => ({
              connect: sinon.stub().resolves(),
              execSQL: sinon.stub().resolves(undefined),
              disconnect: sinon.stub().resolves()
            })
          }
        }
      })

      const result = await querySimple.dbQuery({ query: 'ALTER TABLE T ADD COL INT', output: 'json' })

      expect(result).to.have.property('success', true)
      const output = consoleLogStub.firstCall.args[0]
      const parsed = JSON.parse(output)
      expect(parsed.success).to.be.true
      expect(parsed.message).to.be.a('string')
    })
  })

  describe('SELECT: normal array result (regression check)', function () {
    it('should return results array for SELECT queries', async function () {
      const mockResults = [{ ID: 1, NAME: 'test' }, { ID: 2, NAME: 'other' }]
      const querySimple = await esmock('../../bin/querySimple.js', {
        '../../utils/database/index.js': {
          default: {
            getNewClient: () => ({
              connect: sinon.stub().resolves(),
              execSQL: sinon.stub().resolves(mockResults),
              disconnect: sinon.stub().resolves()
            })
          }
        }
      })

      const result = await querySimple.dbQuery({ query: 'SELECT * FROM T', output: 'json' })

      const parsed = JSON.parse(result)
      expect(parsed).to.deep.equal(mockResults)
    })
  })
})
