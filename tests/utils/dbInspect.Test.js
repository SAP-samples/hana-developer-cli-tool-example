/*eslint-env node, es6, mocha */
// @ts-nocheck

/**
 * Unit tests for utils/dbInspect.js
 * Testing database inspection and metadata retrieval utilities
 */

import { expect } from 'chai'
import sinon from 'sinon'
import * as dbInspect from '../../utils/dbInspect.js'

describe('dbInspect.js - Database Inspection Functions', () => {
    /**
     * @type {object}
     */
    let mockDb

    beforeEach(() => {
        // Create a comprehensive mock database connection
        mockDb = {
            preparePromisified: sinon.stub(),
            statementExecPromisified: sinon.stub(),
            loadProcedurePromisified: sinon.stub(),
            callProcedurePromisified: sinon.stub()
        }
		dbInspect.resetHANAVersionCache()
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('getHANAVersion()', () => {
        it('should return HANA version information', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137',
                USAGE: 'DEVELOPMENT'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves(mockVersion)

            const result = await dbInspect.getHANAVersion(mockDb)

            expect(result).to.be.an('object')
            expect(result.VERSION).to.equal('2.00.065.00.1649859137')
            expect(result.versionMajor).to.equal('2')
            expect(mockDb.preparePromisified.calledOnce).to.be.true
        })

        it('should extract major version from VERSION string', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '4.00.000.00.1234567890'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves(mockVersion)

            const result = await dbInspect.getHANAVersion(mockDb)

            expect(result.versionMajor).to.equal('4')
        })

        it('should throw error if no database version found', async () => {
            const mockStatement = {}
            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves([])

            try {
                await dbInspect.getHANAVersion(mockDb)
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })

        it('should handle version with single digit major', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '1.00.122.00.1234567890'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves(mockVersion)

            const result = await dbInspect.getHANAVersion(mockDb)

            expect(result.versionMajor).to.equal('1')
        })
    })

    describe('isCalculationView()', () => {
        it('should return false for HANA version < 2', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '1.00.122.00.1234567890'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves(mockVersion)

            const result = await dbInspect.isCalculationView(mockDb, 'MYSCHEMA', 'MY_VIEW', { forceRefresh: true })

            expect(result).to.be.false
        })

        it('should return true when calculation view found by qualified name', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137'
            }]
            const mockCalcView = [{
                CUBE_ID: 'CV123',
                SCHEMA_NAME: 'MYSCHEMA',
                QUALIFIED_NAME: 'MY_CALC_VIEW',
                VIEW_NAME: 'MY_CALC_VIEW'
            }]

            mockDb.preparePromisified.onFirstCall().resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.preparePromisified.onSecondCall().resolves(mockStatement)
            mockDb.statementExecPromisified.onSecondCall().resolves(mockCalcView)

            const result = await dbInspect.isCalculationView(mockDb, 'MYSCHEMA', 'MY_CALC_VIEW', { forceRefresh: true })

            expect(result).to.be.true
        })

        it('should return true when calculation view found by view name', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137'
            }]

            mockDb.preparePromisified.onFirstCall().resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.preparePromisified.onSecondCall().resolves(mockStatement)
            mockDb.statementExecPromisified.onSecondCall().resolves([])
            mockDb.preparePromisified.onThirdCall().resolves(mockStatement)
            mockDb.statementExecPromisified.onThirdCall().resolves([{
                CUBE_ID: 'CV123',
                VIEW_NAME: 'MY_VIEW'
            }])

            const result = await dbInspect.isCalculationView(mockDb, 'MYSCHEMA', 'MY_VIEW', { forceRefresh: true })

            expect(result).to.be.true
        })

        it('should return false when calculation view not found', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.statementExecPromisified.onSecondCall().resolves([])
            mockDb.statementExecPromisified.onThirdCall().resolves([])

            const result = await dbInspect.isCalculationView(mockDb, 'MYSCHEMA', 'NOT_A_CALC_VIEW', { forceRefresh: true })

            expect(result).to.be.false
        })
    })

    describe('getView()', () => {
        it('should return view details for HANA 2+', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137'
            }]
            const mockView = [{
                SCHEMA_NAME: 'MYSCHEMA',
                VIEW_NAME: 'MY_VIEW',
                VIEW_OID: '12345',
                COMMENTS: 'Test view',
                IS_COLUMN_VIEW: 'TRUE',
                VIEW_TYPE: 'CALC',
                HAS_STRUCTURED_PRIVILEGE_CHECK: 'FALSE',
                HAS_PARAMETERS: 'TRUE',
                HAS_CACHE: 'FALSE',
                CREATE_TIME: '2023-01-01 12:00:00'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.statementExecPromisified.onSecondCall().resolves(mockView)

            const result = await dbInspect.getView(mockDb, 'MYSCHEMA', 'MY_VIEW')

            expect(result).to.be.an('array')
            expect(result[0].VIEW_NAME).to.equal('MY_VIEW')
            expect(result[0].SCHEMA_NAME).to.equal('MYSCHEMA')
        })

        it('should return view details for HANA 1', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '1.00.122.00.1234567890'
            }]
            const mockView = [{
                SCHEMA_NAME: 'MYSCHEMA',
                VIEW_NAME: 'MY_VIEW',
                VIEW_OID: '12345',
                IS_COLUMN_VIEW: 'TRUE'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.statementExecPromisified.onSecondCall().resolves(mockView)

            const result = await dbInspect.getView(mockDb, 'MYSCHEMA', 'MY_VIEW')

            expect(result).to.be.an('array')
            expect(result[0].VIEW_NAME).to.equal('MY_VIEW')
        })

        it('should throw error when view not found', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.statementExecPromisified.onSecondCall().resolves([])

            try {
                await dbInspect.getView(mockDb, 'MYSCHEMA', 'NONEXISTENT')
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })
    })

    describe('getDef()', () => {
        it('should return object definition', async () => {
            const mockProcedure = {}
            const mockDefinition = {
                results: [{
                    OBJECT_CREATION_STATEMENT: 'CREATE TABLE "MYSCHEMA"."MYTABLE" (ID INTEGER, NAME VARCHAR(100))'
                }]
            }

            mockDb.loadProcedurePromisified.resolves(mockProcedure)
            mockDb.callProcedurePromisified.resolves(mockDefinition)

            const result = await dbInspect.getDef(mockDb, 'MYSCHEMA', 'MYTABLE')

            expect(result).to.be.a('string')
            expect(result).to.include('CREATE TABLE')
            expect(mockDb.loadProcedurePromisified.calledWith('SYS', 'GET_OBJECT_DEFINITION')).to.be.true
        })

        it('should format definition with line breaks', async () => {
            const mockProcedure = {}
            const mockDefinition = {
                results: [{
                    OBJECT_CREATION_STATEMENT: 'CREATE TABLE "S"."T" (ID INT,NAME VARCHAR(100),AGE INT)'
                }]
            }

            mockDb.loadProcedurePromisified.resolves(mockProcedure)
            mockDb.callProcedurePromisified.resolves(mockDefinition)

            const result = await dbInspect.getDef(mockDb, 'S', 'T')

            expect(result).to.include(',\n')
        })

        it('should throw error when object not found', async () => {
            const mockProcedure = {}
            const mockDefinition = {
                results: []
            }

            mockDb.loadProcedurePromisified.resolves(mockProcedure)
            mockDb.callProcedurePromisified.resolves(mockDefinition)

            try {
                await dbInspect.getDef(mockDb, 'MYSCHEMA', 'NONEXISTENT')
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })
    })

    describe('getTable()', () => {
        it('should return table details for HANA 2+', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137'
            }]
            const mockTable = [{
                SCHEMA_NAME: 'MYSCHEMA',
                TABLE_NAME: 'MY_TABLE',
                TABLE_OID: '12345',
                TABLE_TYPE: 'COLUMN',
                HAS_PRIMARY_KEY: 'TRUE',
                UNLOAD_PRIORITY: 5,
                IS_PRELOAD: 'TRUE',
                CREATE_TIME: '2023-01-01 12:00:00'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.statementExecPromisified.onSecondCall().resolves(mockTable)

            const result = await dbInspect.getTable(mockDb, 'MYSCHEMA', 'MY_TABLE')

            expect(result).to.be.an('array')
            expect(result[0].TABLE_NAME).to.equal('MY_TABLE')
            expect(result[0].TABLE_TYPE).to.equal('COLUMN')
        })

        it('should return table details for HANA 1', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '1.00.122.00.1234567890'
            }]
            const mockTable = [{
                SCHEMA_NAME: 'MYSCHEMA',
                TABLE_NAME: 'MY_TABLE',
                TABLE_OID: '12345',
                TABLE_TYPE: 'ROW'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.statementExecPromisified.onSecondCall().resolves(mockTable)

            const result = await dbInspect.getTable(mockDb, 'MYSCHEMA', 'MY_TABLE')

            expect(result).to.be.an('array')
            expect(result[0].TABLE_NAME).to.equal('MY_TABLE')
        })

        it('should throw error when table not found', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.statementExecPromisified.onSecondCall().resolves([])

            try {
                await dbInspect.getTable(mockDb, 'MYSCHEMA', 'NONEXISTENT')
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })
    })

    describe('getTableFields()', () => {
        it('should return table fields for HANA 2+', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137'
            }]
            const mockFields = [
                {
                    COLUMN_NAME: 'ID',
                    POSITION: 1,
                    DATA_TYPE_NAME: 'INTEGER',
                    LENGTH: 10,
                    IS_NULLABLE: 'FALSE'
                },
                {
                    COLUMN_NAME: 'NAME',
                    POSITION: 2,
                    DATA_TYPE_NAME: 'VARCHAR',
                    LENGTH: 100,
                    IS_NULLABLE: 'TRUE'
                }
            ]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.statementExecPromisified.onSecondCall().resolves(mockFields)

            const result = await dbInspect.getTableFields(mockDb, '12345')

            expect(result).to.be.an('array')
            expect(result.length).to.equal(2)
            expect(result[0].COLUMN_NAME).to.equal('ID')
            expect(result[1].COLUMN_NAME).to.equal('NAME')
        })

        it('should return empty array when no fields found', async () => {
            const mockStatement = {}
            const mockVersion = [{
                VERSION: '2.00.065.00.1649859137'
            }]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockVersion)
            mockDb.statementExecPromisified.onSecondCall().resolves([])

            const result = await dbInspect.getTableFields(mockDb, '12345')

            expect(result).to.be.an('array')
            expect(result.length).to.equal(0)
        })
    })

    describe('getViewFields()', () => {
        it('should return view fields', async () => {
            const mockStatement = {}
            const mockFields = [
                {
                    SCHEMA_NAME: 'MYSCHEMA',
                    VIEW_NAME: 'MY_VIEW',
                    VIEW_OID: '12345',
                    COLUMN_NAME: 'ID',
                    POSITION: 1,
                    DATA_TYPE_NAME: 'INTEGER'
                }
            ]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves(mockFields)

            const result = await dbInspect.getViewFields(mockDb, '12345')

            expect(result).to.be.an('array')
            expect(result[0].COLUMN_NAME).to.equal('ID')
        })

        it('should return empty array when no fields found', async () => {
            const mockStatement = {}

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves([])

            const result = await dbInspect.getViewFields(mockDb, '12345')

            expect(result).to.be.an('array')
            expect(result.length).to.equal(0)
        })
    })

    describe('getCalcViewFields()', () => {
        it('should return calculation view fields', async () => {
            const mockStatement = {}
            const mockFields = [
                {
                    SCHEMA_NAME: 'MYSCHEMA',
                    QUALIFIED_NAME: 'MY_CALC_VIEW',
                    COLUMN_NAME: 'PRODUCT_ID',
                    POSITION: 1,
                    DATA_TYPE_NAME: 'NVARCHAR',
                    SCALE: 0,
                    IS_NULLABLE: 'FALSE'
                }
            ]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.onFirstCall().resolves(mockFields)
            mockDb.statementExecPromisified.onSecondCall().resolves([{
                OFFSET: 0,
                LENGTH: 50,
                DEFAULT_VALUE: null,
                DATA_TYPE_NAME: 'NVARCHAR'
            }])

            const result = await dbInspect.getCalcViewFields(mockDb, 'MYSCHEMA', 'MY_CALC_VIEW', '12345')

            expect(result).to.be.an('array')
            expect(result[0].COLUMN_NAME).to.equal('PRODUCT_ID')
        })
    })

    describe('getCalcViewParameters()', () => {
        it('should return calculation view parameters', async () => {
            const mockStatement = {}
            const mockParams = [
                {
                    SCHEMA_NAME: 'MYSCHEMA',
                    QUALIFIED_NAME: 'MY_CALC_VIEW',
                    VARIABLE_NAME: 'P_YEAR',
                    COLUMN_TYPE: 'INPUT',
                    DATA_TYPE_NAME: 'INTEGER',
                    COLUMN_SQL_TYPE: 'INTEGER(10)',
                    MANDATORY: 'TRUE'
                }
            ]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves(mockParams)

            const result = await dbInspect.getCalcViewParameters(mockDb, 'MYSCHEMA', 'MY_CALC_VIEW', '12345')

            expect(result).to.be.an('array')
            expect(result[0].VARIABLE_NAME).to.equal('P_YEAR')
            expect(result[0].LENGTH).to.equal('10')
        })

        it('should handle VARCHAR type with length', async () => {
            const mockStatement = {}
            const mockParams = [
                {
                    VARIABLE_NAME: 'P_NAME',
                    COLUMN_SQL_TYPE: 'VARCHAR(255)',
                }
            ]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves(mockParams)

            const result = await dbInspect.getCalcViewParameters(mockDb, 'MYSCHEMA', 'MY_VIEW', '12345')

            expect(result[0].LENGTH).to.equal('255')
        })
    })

    describe('getViewParameters()', () => {
        it('should return view parameters', async () => {
            const mockStatement = {}
            const mockParams = [
                {
                    SCHEMA_NAME: 'MYSCHEMA',
                    VIEW_NAME: 'MY_VIEW',
                    VIEW_OID: '12345',
                    PARAMETER_NAME: 'P_ID',
                    DATA_TYPE_NAME: 'INTEGER'
                }
            ]

            mockDb.preparePromisified.resolves(mockStatement)
            mockDb.statementExecPromisified.resolves(mockParams)

            const result = await dbInspect.getViewParameters(mockDb, '12345')

            expect(result).to.be.an('array')
            expect(result[0].PARAMETER_NAME).to.equal('P_ID')
        })
    })
})

describe('dbInspect.js - Module Exports', () => {
    it('should export getHANAVersion function', () => {
        expect(dbInspect.getHANAVersion).to.be.a('function')
    })

    it('should export isCalculationView function', () => {
        expect(dbInspect.isCalculationView).to.be.a('function')
    })

    it('should export getView function', () => {
        expect(dbInspect.getView).to.be.a('function')
    })

    it('should export getDef function', () => {
        expect(dbInspect.getDef).to.be.a('function')
    })

    it('should export getTable function', () => {
        expect(dbInspect.getTable).to.be.a('function')
    })

    it('should export getTableFields function', () => {
        expect(dbInspect.getTableFields).to.be.a('function')
    })

    it('should export getViewFields function', () => {
        expect(dbInspect.getViewFields).to.be.a('function')
    })

    it('should export getCalcViewFields function', () => {
        expect(dbInspect.getCalcViewFields).to.be.a('function')
    })

    it('should export getCalcViewParameters function', () => {
        expect(dbInspect.getCalcViewParameters).to.be.a('function')
    })

    it('should export getViewParameters function', () => {
        expect(dbInspect.getViewParameters).to.be.a('function')
    })
})
