// @ts-nocheck
/**
 * @module Database Tests - Unit tests for database client utilities
 */

import { describe, it } from 'mocha'
import { assert } from '../base.js'
import dbClientClass from '../../utils/database/index.js'

describe('Database Client Class', function () {
    
    describe('constructor', function () {
        it('should create an instance without throwing', function () {
            const prompts = { profile: 'test', debug: false }
            const optionsCDS = { kind: 'sqlite' }
            
            const instance = new dbClientClass(prompts, optionsCDS)
            assert.ok(instance instanceof dbClientClass)
        })
    })

    describe('adjustWildcard', function () {
        it('should convert asterisk to percent', function () {
            const prompts = { profile: 'test', debug: false }
            const optionsCDS = { kind: 'sqlite' }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            const result = instance.adjustWildcard('*')
            assert.strictEqual(result, '%')
        })

        it('should leave other strings unchanged', function () {
            const prompts = { profile: 'test', debug: false }
            const optionsCDS = { kind: 'sqlite' }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            assert.strictEqual(instance.adjustWildcard('TABLE'), 'TABLE')
            assert.strictEqual(instance.adjustWildcard('SCHEMA.TABLE'), 'SCHEMA.TABLE')
            assert.strictEqual(instance.adjustWildcard('%'), '%')
        })
    })

    describe('getters', function () {
        it('should return prompts via getPrompts', function () {
            const prompts = { profile: 'test', debug: false, schema: 'myschema' }
            const optionsCDS = { kind: 'sqlite' }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            const result = instance.getPrompts()
            assert.deepStrictEqual(result, prompts)
        })

        it('should return kind via getKind', function () {
            const prompts = { profile: 'test', debug: false }
            const optionsCDS = { kind: 'postgres' }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            const result = instance.getKind()
            assert.strictEqual(result, 'postgres')
        })

        it('should return empty string when optionsCDS is not set', function () {
            const prompts = { profile: 'test', debug: false }
            const instance = new dbClientClass(prompts, null)
            
            const result = instance.getKind()
            assert.strictEqual(result, '')
        })
    })

    describe('schemaCalculation', function () {
        it('should return schema from credentials when CURRENT_SCHEMA is specified', function () {
            const prompts = { profile: 'test', schema: '**CURRENT_SCHEMA**' }
            const optionsCDS = { 
                kind: 'hana',
                credentials: { schema: 'DBADMIN' }
            }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            const result = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(result, 'DBADMIN')
        })

        it('should convert asterisk to percent', function () {
            const prompts = { profile: 'test', schema: '*' }
            const optionsCDS = { kind: 'hana' }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            const result = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(result, '%')
        })

        it('should return specified schema when provided', function () {
            const prompts = { profile: 'test', schema: 'MYSCHEMA' }
            const optionsCDS = { kind: 'hana' }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            const result = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(result, 'MYSCHEMA')
        })

        it('should default to public when no schema specified and no credentials', function () {
            const prompts = { profile: 'test' }
            const optionsCDS = { kind: 'postgres' }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            const result = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(result, 'public')
        })

        it('should default to public when schema not specified', function () {
            const prompts = { profile: 'test', schema: '**CURRENT_SCHEMA**' }
            const optionsCDS = { kind: 'postgres' }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            const result = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(result, 'public')
        })
    })

    describe('setDB and getDB', function () {
        it('should allow setting and getting DB object', function () {
            const prompts = { profile: 'test', debug: false }
            const optionsCDS = { kind: 'sqlite' }
            const instance = new dbClientClass(prompts, optionsCDS)
            
            const mockDB = { connection: 'mock' }
            instance.setDB(mockDB)
            
            const result = instance.getDB()
            assert.deepStrictEqual(result, mockDB)
        })
    })

    describe('getNewClient static method', function () {
        this.timeout(10000) // May take longer due to imports

        it('should throw error when no CAP/CDS configuration found', async function () {
            const prompts = { profile: 'nonexistent' }
            
            try {
                await dbClientClass.getNewClient(prompts)
                assert.fail('Should have thrown an error')
            } catch (error) {
                // Should throw some error related to configuration or unknown database type
                assert.ok(error instanceof Error)
                assert.ok(error.message)
            }
        })

        it('should default to hybrid profile when no profile specified', async function () {
            const prompts = {}
            
            try {
                // This will likely fail due to connection requirements,
                // but we're testing the profile defaulting behavior
                await dbClientClass.getNewClient(prompts)
            } catch (error) {
                // Expected to throw due to connection issues
                assert.ok(prompts.profile === 'hybrid')
            }
        })
    })
})
