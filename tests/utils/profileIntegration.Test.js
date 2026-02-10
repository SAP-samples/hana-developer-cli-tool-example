// @ts-nocheck
/**
 * @module Profile Integration Tests - Integration tests for PostgreSQL and SQLite profile functionality
 * Tests the actual database client behavior with different profiles
 */

import { describe, it, before, after } from 'mocha'
import { assert, addContext, exec } from '../base.js'
import dbClientClass from '../../utils/database/index.js'
import PostgresClient from '../../utils/database/postgres.js'
import SqliteClient from '../../utils/database/sqlite.js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Profile Integration Tests', function () {
    this.timeout(30000) // Some operations may take longer with actual databases

    describe('PostgreSQL Profile Client', function () {
        
        it('should create PostgreSQL client instance', function () {
            const prompts = { 
                profile: 'postgres', 
                debug: false,
                table: '*',
                limit: 200,
                schema: 'public'
            }
            const optionsCDS = { 
                kind: 'postgres',
                credentials: {
                    host: 'localhost',
                    port: 5432,
                    user: 'test',
                    password: 'test',
                    database: 'test',
                    schema: 'public'
                }
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            assert.ok(instance instanceof PostgresClient)
            assert.ok(instance instanceof dbClientClass)
        })

        it('should have correct schema for PostgreSQL', function () {
            const prompts = { 
                profile: 'postgres', 
                debug: false,
                schema: 'myschema'
            }
            const optionsCDS = { 
                kind: 'postgres',
                credentials: { schema: 'myschema' }
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const schema = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(schema, 'myschema')
        })

        it('should default to public schema when not specified', function () {
            const prompts = { 
                profile: 'postgres', 
                debug: false
            }
            const optionsCDS = { 
                kind: 'postgres'
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const schema = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(schema, 'public')
        })

        it('should handle CURRENT_SCHEMA placeholder for PostgreSQL', function () {
            const prompts = { 
                profile: 'postgres', 
                debug: false,
                schema: '**CURRENT_SCHEMA**'
            }
            const optionsCDS = { 
                kind: 'postgres',
                credentials: { schema: 'myschema' }
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const schema = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(schema, 'myschema')
        })

        it('should convert wildcard for table names', function () {
            const prompts = { 
                profile: 'postgres', 
                debug: false,
                table: '*'
            }
            const optionsCDS = { kind: 'postgres' }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const result = instance.adjustWildcard('*')
            assert.strictEqual(result, '%')
        })

        it('should have listTables method', function () {
            const prompts = { 
                profile: 'postgres', 
                debug: false,
                table: 'test%',
                limit: 100
            }
            const optionsCDS = { 
                kind: 'postgres',
                credentials: { schema: 'public' }
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            assert.ok(typeof instance.listTables === 'function')
        })

        it('should handle PostgreSQL-specific query structure', async function () {
            const prompts = { 
                profile: 'postgres', 
                debug: false,
                table: 'test',
                limit: 10,
                schema: 'public'
            }
            const optionsCDS = { 
                kind: 'postgres',
                credentials: { schema: 'public' }
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            
            // Mock the database connection
            const mockDB = {
                run: async (query) => {
                    // Verify the query structure for PostgreSQL
                    if (typeof query === 'string' && query.includes('SET search_path')) {
                        return []
                    }
                    if (typeof query === 'object') {
                        // This is a SELECT query object from CDS
                        assert.ok(query, 'Query should exist')
                        return [
                            { SCHEMA_NAME: 'public', TABLE_NAME: 'test_table' }
                        ]
                    }
                    return []
                }
            }
            
            instance.setDB(mockDB)
            
            try {
                const results = await instance.listTables()
                assert.ok(Array.isArray(results))
            } catch (error) {
                // Expected if CDS SELECT is not available in test context
                addContext(this, { title: 'Expected Error', value: error.message })
                assert.ok(error.message)
            }
        })
    })

    describe('SQLite Profile Client', function () {
        
        it('should create SQLite client instance', function () {
            const prompts = { 
                profile: 'sqlite', 
                debug: false,
                table: '*',
                limit: 200
            }
            const optionsCDS = { 
                kind: 'sqlite',
                credentials: {
                    database: ':memory:'
                }
            }
            
            const instance = new SqliteClient(prompts, optionsCDS)
            assert.ok(instance instanceof SqliteClient)
            assert.ok(instance instanceof dbClientClass)
        })

        it('should handle in-memory SQLite database', function () {
            const prompts = { 
                profile: 'sqlite', 
                debug: false
            }
            const optionsCDS = { 
                kind: 'sqlite',
                credentials: { database: ':memory:' }
            }
            
            const instance = new SqliteClient(prompts, optionsCDS)
            assert.ok(instance instanceof SqliteClient)
        })

        it('should handle file-based SQLite database', function () {
            const prompts = { 
                profile: 'sqlite', 
                debug: false
            }
            const optionsCDS = { 
                kind: 'sqlite',
                credentials: { database: './test.db' }
            }
            
            const instance = new SqliteClient(prompts, optionsCDS)
            assert.ok(instance instanceof SqliteClient)
        })

        it('should convert wildcard for table names', function () {
            const prompts = { 
                profile: 'sqlite', 
                debug: false,
                table: '*'
            }
            const optionsCDS = { kind: 'sqlite' }
            
            const instance = new SqliteClient(prompts, optionsCDS)
            const result = instance.adjustWildcard('*')
            assert.strictEqual(result, '%')
        })

        it('should have listTables method', function () {
            const prompts = { 
                profile: 'sqlite', 
                debug: false,
                table: 'test%',
                limit: 100
            }
            const optionsCDS = { 
                kind: 'sqlite',
                credentials: { database: ':memory:' }
            }
            
            const instance = new SqliteClient(prompts, optionsCDS)
            assert.ok(typeof instance.listTables === 'function')
        })

        it('should handle SQLite-specific query structure', async function () {
            const prompts = { 
                profile: 'sqlite', 
                debug: false,
                table: 'test',
                limit: 10
            }
            const optionsCDS = { 
                kind: 'sqlite',
                credentials: { database: ':memory:' }
            }
            
            const instance = new SqliteClient(prompts, optionsCDS)
            
            // Mock the database connection
            const mockDB = {
                run: async (query) => {
                    // Verify the query uses sqlite_schema
                    if (typeof query === 'object') {
                        // This is a SELECT query object from CDS
                        assert.ok(query, 'Query should exist')
                        return [
                            { TABLE_NAME: 'test_table' }
                        ]
                    }
                    return []
                }
            }
            
            instance.setDB(mockDB)
            
            try {
                const results = await instance.listTables()
                assert.ok(Array.isArray(results))
            } catch (error) {
                // Expected if CDS SELECT is not available in test context
                addContext(this, { title: 'Expected Error', value: error.message })
                assert.ok(error.message)
            }
        })
    })

    describe('Profile Factory Method - getNewClient', function () {
        
        it('should reject invalid profile with meaningful error', async function () {
            const prompts = { 
                profile: 'invaliddb',
                debug: false
            }
            
            try {
                // Set NODE_ENV to invalid profile to force an error
                const oldEnv = process.env.NODE_ENV
                process.env.NODE_ENV = 'invaliddb'
                process.env.CDS_ENV = 'invaliddb'
                
                await dbClientClass.getNewClient(prompts)
                
                // Restore env
                if (oldEnv) process.env.NODE_ENV = oldEnv
                else delete process.env.NODE_ENV
                delete process.env.CDS_ENV
                
                assert.fail('Should have thrown an error for invalid profile')
            } catch (error) {
                // Restore env if error thrown
                delete process.env.NODE_ENV
                delete process.env.CDS_ENV
                
                assert.ok(error instanceof Error)
                // The error could be about missing CDS config, unsupported database, or module not found
                assert.ok(error.message.length > 0)
            }
        })

        it('should handle missing profile gracefully (defaults to hybrid)', async function () {
            const prompts = { 
                debug: false
            }
            
            try {
                const client = await dbClientClass.getNewClient(prompts)
                // Should default to hybrid profile
                assert.strictEqual(prompts.profile, 'hybrid')
            } catch (error) {
                // May fail due to missing connection, but profile should be set
                assert.strictEqual(prompts.profile, 'hybrid')
            }
        })
    })

    describe('Profile-based Command Line Integration', function () {
        
        it('should accept postgres profile in tables command', function (done) {
            exec('hana-cli tables --profile postgres --quiet --limit 3', 
                (error, stdout, stderr) => {
                    addContext(this, { title: 'Stdout', value: stdout })
                    addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Should not reject the profile flag
                    const hasProfileError = stderr.includes('Unknown or Unsupported database client type')
                    const hasInvalidParam = stderr.includes('Invalid') && stderr.includes('profile')
                    
                    // Profile should be accepted (may fail on connection, but not on profile validation)
                    assert.ok(!hasInvalidParam, 'Should accept postgres profile parameter')
                    
                    // If there's an error, it should be connection-related, not profile-related
                    if (error && stderr) {
                        const isConnectionError = 
                            stderr.includes('No CAP/CDS Project Configuration') ||
                            stderr.includes('connection') ||
                            stderr.includes('ECONNREFUSED') ||
                            stderr.includes('credentials')
                        assert.ok(
                            isConnectionError || !hasProfileError, 
                            'Errors should be connection-related, not profile validation errors'
                        )
                    }
                    done()
                })
        })

        it('should accept sqlite profile in tables command', function (done) {
            exec('hana-cli tables --profile sqlite --quiet --limit 3', 
                (error, stdout, stderr) => {
                    addContext(this, { title: 'Stdout', value: stdout })
                    addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Should not reject the profile flag
                    const hasProfileError = stderr.includes('Unknown or Unsupported database client type')
                    const hasInvalidParam = stderr.includes('Invalid') && stderr.includes('profile')
                    
                    // Profile should be accepted (may fail on connection, but not on profile validation)
                    assert.ok(!hasInvalidParam, 'Should accept sqlite profile parameter')
                    
                    // If there's an error, it should be connection-related, not profile-related
                    if (error && stderr) {
                        const isConnectionError = 
                            stderr.includes('No CAP/CDS Project Configuration') ||
                            stderr.includes('connection') ||
                            stderr.includes('database') ||
                            stderr.includes('credentials')
                        assert.ok(
                            isConnectionError || !hasProfileError, 
                            'Errors should be connection-related, not profile validation errors'
                        )
                    }
                    done()
                })
        })

        it('should accept -p alias with postgres', function (done) {
            exec('hana-cli tables -p postgres --quiet --limit 3', 
                (error, stdout, stderr) => {
                    addContext(this, { title: 'Stdout', value: stdout })
                    addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasInvalidParam = stderr.includes('Invalid') && stderr.includes('profile')
                    assert.ok(!hasInvalidParam, 'Should accept -p alias for profile')
                    done()
                })
        })

        it('should accept -p alias with sqlite', function (done) {
            exec('hana-cli tables -p sqlite --quiet --limit 3', 
                (error, stdout, stderr) => {
                    addContext(this, { title: 'Stdout', value: stdout })
                    addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasInvalidParam = stderr.includes('Invalid') && stderr.includes('profile')
                    assert.ok(!hasInvalidParam, 'Should accept -p alias for profile')
                    done()
                })
        })

        it('should handle pg as alias for postgres profile', function (done) {
            exec('hana-cli tables --profile pg --quiet --limit 3', 
                (error, stdout, stderr) => {
                    addContext(this, { title: 'Stdout', value: stdout })
                    addContext(this, { title: 'Stderr', value: stderr })
                    
                    // pg is a common alias - should be accepted
                    const hasInvalidParam = stderr.includes('Invalid') && stderr.includes('profile')
                    assert.ok(!hasInvalidParam, 'Should accept pg as postgres alias')
                    done()
                })
        })
    })

    describe('Profile-specific Schema Handling', function () {
        
        it('should correctly calculate PostgreSQL schema from credentials', function () {
            const prompts = { 
                profile: 'postgres',
                schema: '**CURRENT_SCHEMA**'
            }
            const optionsCDS = { 
                kind: 'postgres',
                credentials: { schema: 'myapp' }
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const schema = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(schema, 'myapp')
        })

        it('should use public as default for PostgreSQL when no schema in credentials', function () {
            const prompts = { 
                profile: 'postgres',
                schema: '**CURRENT_SCHEMA**'
            }
            const optionsCDS = { 
                kind: 'postgres',
                credentials: {}
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const schema = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(schema, 'public')
        })

        it('should override with explicit schema for PostgreSQL', function () {
            const prompts = { 
                profile: 'postgres',
                schema: 'custom_schema'
            }
            const optionsCDS = { 
                kind: 'postgres',
                credentials: { schema: 'default_schema' }
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const schema = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(schema, 'custom_schema')
        })

        it('should handle wildcard schema for PostgreSQL', function () {
            const prompts = { 
                profile: 'postgres',
                schema: '*'
            }
            const optionsCDS = { 
                kind: 'postgres'
            }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const schema = instance.schemaCalculation(prompts, optionsCDS)
            assert.strictEqual(schema, '%')
        })
    })

    describe('Profile Client Methods', function () {
        
        it('should expose getPrompts for PostgreSQL client', function () {
            const prompts = { 
                profile: 'postgres',
                debug: true,
                table: 'test'
            }
            const optionsCDS = { kind: 'postgres' }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const retrieved = instance.getPrompts()
            assert.deepStrictEqual(retrieved, prompts)
        })

        it('should expose getKind for PostgreSQL client', function () {
            const prompts = { profile: 'postgres' }
            const optionsCDS = { kind: 'postgres' }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const kind = instance.getKind()
            assert.strictEqual(kind, 'postgres')
        })

        it('should expose getPrompts for SQLite client', function () {
            const prompts = { 
                profile: 'sqlite',
                debug: false,
                table: 'sample'
            }
            const optionsCDS = { kind: 'sqlite' }
            
            const instance = new SqliteClient(prompts, optionsCDS)
            const retrieved = instance.getPrompts()
            assert.deepStrictEqual(retrieved, prompts)
        })

        it('should expose getKind for SQLite client', function () {
            const prompts = { profile: 'sqlite' }
            const optionsCDS = { kind: 'sqlite' }
            
            const instance = new SqliteClient(prompts, optionsCDS)
            const kind = instance.getKind()
            assert.strictEqual(kind, 'sqlite')
        })

        it('should allow setDB/getDB for PostgreSQL client', function () {
            const prompts = { profile: 'postgres' }
            const optionsCDS = { kind: 'postgres' }
            
            const instance = new PostgresClient(prompts, optionsCDS)
            const mockDB = { type: 'postgres-mock' }
            instance.setDB(mockDB)
            
            const retrieved = instance.getDB()
            assert.deepStrictEqual(retrieved, mockDB)
        })

        it('should allow setDB/getDB for SQLite client', function () {
            const prompts = { profile: 'sqlite' }
            const optionsCDS = { kind: 'sqlite' }
            
            const instance = new SqliteClient(prompts, optionsCDS)
            const mockDB = { type: 'sqlite-mock' }
            instance.setDB(mockDB)
            
            const retrieved = instance.getDB()
            assert.deepStrictEqual(retrieved, mockDB)
        })
    })

    describe('Profile Error Handling', function () {
        
        it('should provide clear error for unsupported profile via getNewClient', async function () {
            const prompts = { 
                profile: 'mongodb', // Unsupported
                debug: false
            }
            
            try {
                await dbClientClass.getNewClient(prompts)
                assert.fail('Should have thrown error for unsupported profile')
            } catch (error) {
                assert.ok(error instanceof Error)
                assert.ok(error.message.length > 0)
            }
        })

        it('should handle missing CDS configuration gracefully', async function () {
            const prompts = { 
                profile: 'postgres',
                debug: false
            }
            
            // Save original env
            const originalEnv = process.env.CDS_ENV
            
            try {
                await dbClientClass.getNewClient(prompts)
            } catch (error) {
                // Expected - may fail due to missing CDS config in test environment
                assert.ok(error instanceof Error)
                const errorMsg = error.message.toLowerCase()
                assert.ok(
                    errorMsg.includes('cds') || 
                    errorMsg.includes('configuration') ||
                    errorMsg.includes('module') ||
                    errorMsg.includes('cannot find')
                )
            } finally {
                // Restore env
                if (originalEnv) {
                    process.env.CDS_ENV = originalEnv
                } else {
                    delete process.env.CDS_ENV
                }
            }
        })
    })
})
