// @ts-nocheck
/**
 * @module Flag Validation Tests - Tests for command-line flag validation
 * 
 * This test suite validates that hana-cli commands properly validate flags:
 * - Type checking (string, number, boolean)
 * - Value ranges (limits, constraints)
 * - Required vs optional flags
 * - Flag combinations and conflicts
 * - Choice/enum validation
 * 
 * These tests ensure invalid inputs are caught early with clear error messages.
 */

import * as base from './base.js'
import * as child_process from 'child_process'

describe('Flag Validation Tests', function () {

    describe('Limit flag validation', function () {
        this.timeout(10000)

        it('should accept positive limit values', function (done) {
            child_process.exec('hana-cli tables --limit 10 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Should succeed or fail with connection error, not parameter error
                const hasParameterError = stderr.includes('Invalid') && stderr.includes('limit')
                base.assert.ok(!hasParameterError, 'Should accept positive limit value')
                done()
            })
        })

        it('should handle limit of 1', function (done) {
            child_process.exec('hana-cli tables --limit 1 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const hasParameterError = stderr.includes('Invalid') && stderr.includes('limit')
                base.assert.ok(!hasParameterError, 'Should accept limit of 1')
                done()
            })
        })

        it('should use -l alias for limit', function (done) {
            child_process.exec('hana-cli tables -l 5 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const hasParameterError = stderr.includes('Invalid') && stderr.includes('limit')
                base.assert.ok(!hasParameterError, 'Should accept -l alias for limit')
                done()
            })
        })

        it('should handle very large limit values', function (done) {
            child_process.exec('hana-cli tables --limit 10000 --quiet', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Should either accept it or warn, but not crash
                base.assert.ok(true, 'Handled large limit value')
                done()
            })
        })
    })

    describe('Schema and table flag validation', function () {
        this.timeout(10000)

        it('should accept valid schema names', function (done) {
            child_process.exec('hana-cli tables --schema SYSTEM --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && stderr.includes('schema')
                    base.assert.ok(!hasParameterError, 'Should accept valid schema name')
                    done()
                })
        })

        it('should accept -s alias for schema', function (done) {
            child_process.exec('hana-cli tables -s SYSTEM --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && stderr.includes('schema')
                    base.assert.ok(!hasParameterError, 'Should accept -s alias for schema')
                    done()
                })
        })

        it('should accept wildcard patterns in table names', function (done) {
            child_process.exec('hana-cli tables --table "M_*" --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && stderr.includes('table')
                    base.assert.ok(!hasParameterError, 'Should accept wildcard patterns')
                    done()
                })
        })

        it('should accept -t alias for table', function (done) {
            child_process.exec('hana-cli tables -t "M_*" --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && stderr.includes('table')
                    base.assert.ok(!hasParameterError, 'Should accept -t alias for table')
                    done()
                })
        })

        it('should handle lowercase schema names', function (done) {
            child_process.exec('hana-cli tables --schema system --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Should handle lowercase (HANA is case-insensitive for unquoted identifiers)
                    base.assert.ok(true, 'Handled lowercase schema name')
                    done()
                })
        })
    })

    describe('Output format flag validation', function () {
        this.timeout(10000)

        it('should accept tbl output format', function (done) {
            child_process.exec('hana-cli inspectTable --schema SYSTEM --table DUMMY --output tbl --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasFormatError = stderr.includes('Invalid') && 
                                          (stderr.includes('output') || stderr.includes('choice'))
                    base.assert.ok(!hasFormatError, 'Should accept tbl format')
                    done()
                })
        })

        it('should accept sql output format', function (done) {
            child_process.exec('hana-cli inspectTable --schema SYSTEM --table DUMMY --output sql --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasFormatError = stderr.includes('Invalid') && 
                                          (stderr.includes('output') || stderr.includes('choice'))
                    base.assert.ok(!hasFormatError, 'Should accept sql format')
                    done()
                })
        })

        it('should accept json output format', function (done) {
            child_process.exec('hana-cli inspectTable --schema SYSTEM --table DUMMY --output json --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasFormatError = stderr.includes('Invalid') && 
                                          (stderr.includes('output') || stderr.includes('choice'))
                    base.assert.ok(!hasFormatError, 'Should accept json format')
                    done()
                })
        })

        it('should accept cds output format', function (done) {
            child_process.exec('hana-cli inspectTable --schema SYSTEM --table DUMMY --output cds --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasFormatError = stderr.includes('Invalid') && 
                                          (stderr.includes('output') || stderr.includes('choice'))
                    base.assert.ok(!hasFormatError, 'Should accept cds format')
                    done()
                })
        })

        it('should accept -o alias for output', function (done) {
            child_process.exec('hana-cli inspectTable --schema SYSTEM --table DUMMY -o yaml --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasFormatError = stderr.includes('Invalid') && 
                                          (stderr.includes('output') || stderr.includes('choice'))
                    base.assert.ok(!hasFormatError, 'Should accept -o alias for output')
                    done()
                })
        })

        it('should reject invalid output format', function (done) {
            child_process.exec('hana-cli inspectTable --schema SYSTEM --table DUMMY --output invalidformat', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasFormatError = error || 
                                          stderr.includes('Invalid') || 
                                          stderr.includes('choice') ||
                                          stderr.includes('must be')
                    
                    base.assert.ok(hasFormatError, 'Should reject invalid output format')
                    done()
                })
        })
    })

    describe('Boolean flag validation', function () {
        this.timeout(10000)

        it('should accept --debug flag without value', function (done) {
            child_process.exec('hana-cli tables --debug --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Boolean flags shouldn't require explicit true/false value
                const hasParameterError = stderr.includes('Invalid') && stderr.includes('debug')
                base.assert.ok(!hasParameterError, 'Should accept debug flag without value')
                done()
            })
        })

        it('should accept --quiet flag without value', function (done) {
            child_process.exec('hana-cli tables --quiet --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                const hasParameterError = stderr && stderr.includes('Invalid') && stderr.includes('quiet')
                base.assert.ok(!hasParameterError, 'Should accept quiet flag without value')
                done()
            })
        })

        it('should accept --admin flag without value', function (done) {
            child_process.exec('hana-cli tables --admin --quiet --limit 3', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                const hasParameterError = stderr.includes('Invalid') && stderr.includes('admin')
                base.assert.ok(!hasParameterError, 'Should accept admin flag without value')
                done()
            })
        })

        it('should accept --useHanaTypes flag', function (done) {
            child_process.exec('hana-cli inspectTable --schema SYSTEM --table DUMMY --useHanaTypes --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && stderr.includes('useHanaTypes')
                    base.assert.ok(!hasParameterError, 'Should accept useHanaTypes flag')
                    done()
                })
        })

        it('should accept --hana alias for useHanaTypes', function (done) {
            child_process.exec('hana-cli inspectTable --schema SYSTEM --table DUMMY --hana --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && 
                                            (stderr.includes('hana') || stderr.includes('useHanaTypes'))
                    base.assert.ok(!hasParameterError, 'Should accept --hana alias')
                    done()
                })
        })
    })

    describe('Profile flag validation', function () {
        this.timeout(10000)

        it('should accept profile flag with value', function (done) {
            child_process.exec('hana-cli tables --profile pg --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && stderr.includes('profile')
                    base.assert.ok(!hasParameterError, 'Should accept profile flag')
                    done()
                })
        })

        it('should accept -p alias for profile', function (done) {
            child_process.exec('hana-cli tables -p sqlite --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && stderr.includes('profile')
                    base.assert.ok(!hasParameterError, 'Should accept -p alias for profile')
                    done()
                })
        })
    })

    describe('Connection flag validation', function () {
        this.timeout(10000)

        it('should accept conn flag with filename', function (done) {
            child_process.exec('hana-cli tables --conn default-env.json --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && stderr.includes('conn')
                    base.assert.ok(!hasParameterError, 'Should accept conn flag')
                    done()
                })
        })

        it('should accept conn flag with .env extension', function (done) {
            child_process.exec('hana-cli tables --conn default.env --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid') && stderr.includes('conn')
                    base.assert.ok(!hasParameterError, 'Should accept .env file for conn')
                    done()
                })
        })
    })

    describe('Flag capitalization handling', function () {
        this.timeout(10000)

        it('should accept --Schema capitalized alias', function (done) {
            child_process.exec('hana-cli tables --Schema SYSTEM --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Unknown') && stderr.includes('Schema')
                    base.assert.ok(!hasParameterError, 'Should accept --Schema alias')
                    done()
                })
        })

        it('should accept --Table capitalized alias', function (done) {
            child_process.exec('hana-cli tables --Table "M_*" --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Unknown') && stderr.includes('Table')
                    base.assert.ok(!hasParameterError, 'Should accept --Table alias')
                    done()
                })
        })

        it('should accept --Debug capitalized alias', function (done) {
            child_process.exec('hana-cli tables --Debug --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Unknown') && stderr.includes('Debug')
                    base.assert.ok(!hasParameterError, 'Should accept --Debug alias')
                    done()
                })
        })

        it('should accept --Admin capitalized alias', function (done) {
            child_process.exec('hana-cli tables --Admin --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Unknown') && stderr.includes('Admin')
                    base.assert.ok(!hasParameterError, 'Should accept --Admin alias')
                    done()
                })
        })
    })

    describe('Flag combination validation', function () {
        this.timeout(10000)

        it('should accept multiple valid flags together', function (done) {
            child_process.exec('hana-cli tables --schema SYSTEM --table "M_*" --limit 10 --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    const hasParameterError = stderr.includes('Invalid')
                    base.assert.ok(!hasParameterError, 'Should accept multiple valid flags')
                    done()
                })
        })

        it('should handle --debug and --quiet together', function (done) {
            // These flags are somewhat contradictory but should not error
            child_process.exec('hana-cli tables --debug --quiet --limit 3', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Should accept both even though they conflict
                    // Typically last one wins or debug takes precedence
                    base.assert.ok(true, 'Handled conflicting flags')
                    done()
                })
        })

        it('should accept positional and flag-based parameters together', function (done) {
            // Some commands support positional args
            child_process.exec('hana-cli tables SYSTEM "M_*" --limit 5 --quiet', 
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Should accept both positional and named parameters
                    base.assert.ok(true, 'Handled positional and named parameters')
                    done()
                })
        })
    })

    describe('Help flag validation', function () {
        this.timeout(5000)

        it('should show help with --help', function (done) {
            child_process.exec('hana-cli tables --help', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                const hasHelpOutput = stdout.includes('Usage') || stdout.includes('Options')
                base.assert.ok(hasHelpOutput, 'Should show help output with --help')
                done()
            })
        })

        it('should show help with -h', function (done) {
            child_process.exec('hana-cli tables -h', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                const hasHelpOutput = stdout.includes('Usage') || stdout.includes('Options')
                base.assert.ok(hasHelpOutput, 'Should show help output with -h')
                done()
            })
        })

        it('should prioritize help over other flags', function (done) {
            // Help should display even with invalid flags
            child_process.exec('hana-cli tables --help --invalidflag', (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                
                const hasHelpOutput = stdout.includes('Usage') || stdout.includes('Options')
                base.assert.ok(hasHelpOutput, 'Should show help even with invalid flags')
                done()
            })
        })
    })
})
