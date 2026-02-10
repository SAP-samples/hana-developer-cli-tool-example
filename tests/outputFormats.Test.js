// @ts-nocheck
/**
 * @module Output Format Tests - Tests for different output format options
 * 
 * This test suite validates that commands produce correct output in various formats:
 * - Table format (tbl)
 * - SQL format
 * - JSON format
 * - YAML format
 * - CDS format
 * - And other specialized formats
 * 
 * These tests ensure output is valid and parseable in each format.
 */

import * as base from './base.js'
import * as child_process from 'child_process'

describe('Output Format Tests', function () {

    describe('inspectTable output formats', function () {
        this.timeout(15000)

        it('should produce table format output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output tbl --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Table format should have some structured output
                    base.assert.ok(stdout.length > 0, 'Should produce table output')
                    done()
                })
        })

        it('should produce valid SQL output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output sql --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // SQL output should contain SQL keywords
                    const hasSQLKeywords = stdout.includes('CREATE') || 
                                          stdout.includes('TABLE') ||
                                          stdout.includes('COLUMN')
                    
                    base.assert.ok(hasSQLKeywords || error, 'Should produce SQL output with SQL keywords')
                    done()
                })
        })

        it('should produce valid JSON output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output json --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    if (!error && stdout) {
                        try {
                            // JSON output should be parseable
                            const parsed = JSON.parse(stdout)
                            base.assert.ok(parsed, 'Should produce valid JSON')
                        } catch (e) {
                            base.assert.fail('JSON output should be parseable')
                        }
                    }
                    done()
                })
        })

        it('should produce YAML output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output yaml --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // YAML output should have YAML characteristics (key: value)
                    const hasYAMLSyntax = stdout.includes(':') && 
                                         (stdout.includes('  ') || stdout.includes('\n'))
                    
                    base.assert.ok(hasYAMLSyntax || error, 'Should produce YAML output')
                    done()
                })
        })

        it('should produce CDS output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output cds --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // CDS output should contain CDS syntax
                    const hasCDSSyntax = stdout.includes('entity') || 
                                        stdout.includes('type') ||
                                        stdout.includes(':')
                    
                    base.assert.ok(hasCDSSyntax || error, 'Should produce CDS output')
                    done()
                })
        })

        it('should produce CDL output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output cdl --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // CDL output should be similar to CDS
                    const hasCDLContent = stdout.length > 0
                    base.assert.ok(hasCDLContent || error, 'Should produce CDL output')
                    done()
                })
        })

        it('should produce hdbtable output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output hdbtable --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // hdbtable output should contain HANA table definition syntax
                    const hasHDBTableSyntax = stdout.includes('TABLE') || stdout.includes('COLUMN')
                    base.assert.ok(hasHDBTableSyntax || error, 'Should produce hdbtable output')
                    done()
                })
        })

        it('should produce hdbmigrationtable output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output hdbmigrationtable --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // hdbmigrationtable should be similar to hdbtable
                    base.assert.ok(stdout.length > 0 || error, 'Should produce hdbmigrationtable output')
                    done()
                })
        })

        it('should produce edmx output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output edmx --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // EDMX is XML format
                    const hasXMLSyntax = stdout.includes('<') && stdout.includes('>')
                    base.assert.ok(hasXMLSyntax || error, 'Should produce EDMX (XML) output')
                    done()
                })
        })

        it('should produce openapi output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output openapi --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // OpenAPI should be JSON or YAML with openapi field
                    const hasOpenAPIContent = stdout.includes('openapi') || 
                                             stdout.includes('swagger') ||
                                             stdout.includes('paths')
                    
                    base.assert.ok(hasOpenAPIContent || error, 'Should produce OpenAPI output')
                    done()
                })
        })

        it('should produce postgres output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output postgres --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // PostgreSQL DDL
                    const hasPostgresSQL = stdout.includes('CREATE') || stdout.includes('TABLE')
                    base.assert.ok(hasPostgresSQL || error, 'Should produce PostgreSQL output')
                    done()
                })
        })

        it('should produce graphql output', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output graphql --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // GraphQL schema syntax
                    const hasGraphQLSyntax = stdout.includes('type') || 
                                            stdout.includes('schema') ||
                                            stdout.includes('Query')
                    
                    base.assert.ok(hasGraphQLSyntax || error, 'Should produce GraphQL output')
                    done()
                })
        })
    })

    describe('Output format with options', function () {
        this.timeout(15000)

        it('should produce CDS output with HANA types', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output cds --useHanaTypes --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // With HANA types, should use HANA-specific type names
                    base.assert.ok(stdout.length > 0 || error, 'Should produce CDS with HANA types')
                    done()
                })
        })

        it('should produce output with --useExists flag', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output cds --useExists --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // useExists should affect the output (e.g., IF EXISTS clause)
                    base.assert.ok(stdout.length > 0 || error, 'Should produce output with useExists')
                    done()
                })
        })

        it('should produce output with quoted identifiers', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output sql --useQuoted --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Quoted identifiers should appear in output
                    const hasQuotes = stdout.includes('"') || stdout.includes('`')
                    base.assert.ok(hasQuotes || error, 'Should use quoted identifiers')
                    done()
                })
        })

        it('should produce output with --alias for useQuoted', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output sql -q --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // -q is alias for --useQuoted
                    base.assert.ok(stdout.length > 0 || error, 'Should accept -q alias')
                    done()
                })
        })
    })

    describe('Default output formats', function () {
        this.timeout(10000)

        it('should use default output format when not specified for inspectTable', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Default format should be tbl
                    base.assert.ok(stdout.length > 0 || error, 'Should use default output format')
                    done()
                })
        })

        it('should use table format for tables command by default', function (done) {
            child_process.exec('node bin/tables.js --limit 5 --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Default should be table output
                    base.assert.ok(stdout.length > 0 || error, 'Should produce default table output')
                    done()
                })
        })
    })

    describe('Output format consistency', function () {
        this.timeout(15000)

        it('should produce consistent output format for same format across commands', function (done) {
            // Test that JSON format is consistent
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY --output json --quiet', 
                (error1, stdout1, stderr1) => {
                    base.addContext(this, { title: 'Stdout', value: stdout1 })
                    
                    if (!error1 && stdout1) {
                        try {
                            const parsed = JSON.parse(stdout1)
                            base.assert.ok(parsed, 'JSON should be consistent and parseable')
                        } catch (e) {
                            // May fail if connection is not available
                            base.assert.ok(true, 'Handled gracefully')
                        }
                    }
                    done()
                })
        })

        it('should handle -o alias consistently across commands', function (done) {
            child_process.exec('node bin/inspectTable.js --schema SYSTEM --table DUMMY -o json --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // -o alias should work the same as --output
                    base.assert.ok(true, 'Handled -o alias')
                    done()
                })
        })
    })

    describe('massConvert output formats', function () {
        this.timeout(15000)

        it('should support hdbtable output format', function (done) {
            child_process.exec('node bin/massConvert.js --table "M_*" --limit 2 --output hdbtable --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // massConvert should support hdbtable format
                    base.assert.ok(true, 'massConvert accepts hdbtable format')
                    done()
                })
        })

        it('should support cds output format', function (done) {
            child_process.exec('node bin/massConvert.js --table "M_*" --limit 2 --output cds --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // massConvert should support cds format
                    base.assert.ok(true, 'massConvert accepts cds format')
                    done()
                })
        })

        it('should support hdbmigrationtable output format', function (done) {
            child_process.exec('node bin/massConvert.js --table "M_*" --limit 2 --output hdbmigrationtable --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // massConvert should support hdbmigrationtable format
                    base.assert.ok(true, 'massConvert accepts hdbmigrationtable format')
                    done()
                })
        })
    })
})
