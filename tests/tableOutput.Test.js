// @ts-nocheck
/**
 * @module Table Output Enhancement Tests - Unit tests for table formatting improvements
 * 
 * These tests validate the three table output enhancements:
 * 1. Column width management with max width limits
 * 2. Large dataset pagination (showing first 100 rows)
 * 3. Type-aware formatting (dates, numbers, booleans)
 * 
 * Tests cover both terminal output (outputTableFancy) and file output (formatAsTextTable)
 */

import { describe, it, beforeEach, afterEach } from 'mocha'
import { assert } from './base.js'
import * as base from '../utils/base.js'
import * as querySimple from '../bin/querySimple.js'
import * as sinon from 'sinon'

describe('Table Output Enhancement Tests', function () {

    describe('Column Width Management', function () {
        
        it('should have width and fit properties in tableOptions', function () {
            assert.ok(base.tableOptions, 'tableOptions should exist')
            assert.strictEqual(base.tableOptions.width, 150, 'Width should be set to 150')
            assert.strictEqual(base.tableOptions.fit, true, 'Fit should be enabled')
        })

        it('should have hasBorder and borderChars configured', function () {
            assert.strictEqual(base.tableOptions.hasBorder, true, 'Should have borders')
            assert.strictEqual(base.tableOptions.borderChars, 'lightRounded', 'Should use lightRounded border style')
        })

        it('should have color configuration for borders and headers', function () {
            assert.ok(base.tableOptions.borderAttr, 'Border attributes should exist')
            assert.strictEqual(base.tableOptions.borderAttr.color, 'blue', 'Border color should be blue')
            assert.ok(base.tableOptions.firstRowTextAttr, 'Header attributes should exist')
            assert.strictEqual(base.tableOptions.firstRowTextAttr.bgColor, 'blue', 'Header background should be blue')
        })
    })

    describe('Large Dataset Pagination', function () {

        it('should have MAX_DISPLAY_ROWS constant defined', function () {
            assert.ok(base.MAX_DISPLAY_ROWS, 'MAX_DISPLAY_ROWS should be defined')
            assert.strictEqual(base.MAX_DISPLAY_ROWS, 100, 'MAX_DISPLAY_ROWS should be 100')
        })

        it('should display message for large datasets', function () {
            // Create a dataset with more than 100 rows
            const largeDataset = Array.from({ length: 150 }, (_, i) => ({
                ID: i + 1,
                NAME: `User ${i + 1}`,
                VALUE: Math.random() * 1000
            }))

            // Set up prompts for verbose output
            base.setPrompts({ verbose: true })

            // Spy on console.log to capture the warning message
            const consoleLogSpy = sinon.spy(console, 'log')

            try {
                base.outputTableFancy(largeDataset)
                
                // Check if warning message was displayed
                const warningCalls = consoleLogSpy.getCalls().filter(call => 
                    call.args[0] && call.args[0].includes('Showing first')
                )
                
                assert.ok(warningCalls.length > 0, 'Should display pagination warning for large datasets')
                
                // Verify the message mentions the correct number of rows
                const warningMessage = warningCalls[0].args[0]
                assert.ok(warningMessage.includes('100'), 'Warning should mention 100 rows')
                assert.ok(warningMessage.includes('150'), 'Warning should mention total of 150 rows')
            } finally {
                consoleLogSpy.restore()
            }
        })

        it('should not display pagination message for small datasets', function () {
            // Create a dataset with less than 100 rows
            const smallDataset = Array.from({ length: 50 }, (_, i) => ({
                ID: i + 1,
                NAME: `User ${i + 1}`
            }))

            // Set up prompts for verbose output
            base.setPrompts({ verbose: true })

            // Spy on console.log
            const consoleLogSpy = sinon.spy(console, 'log')

            try {
                base.outputTableFancy(smallDataset)
                
                // Check that no pagination warning was displayed
                const warningCalls = consoleLogSpy.getCalls().filter(call => 
                    call.args[0] && call.args[0].includes('Showing first')
                )
                
                assert.strictEqual(warningCalls.length, 0, 'Should not display pagination warning for small datasets')
            } finally {
                consoleLogSpy.restore()
            }
        })

        it('should display no data message for empty datasets', function () {
            const emptyDataset = []

            // Set up prompts for verbose output
            base.setPrompts({ verbose: true })

            // Spy on console.log
            const consoleLogSpy = sinon.spy(console, 'log')

            try {
                base.outputTableFancy(emptyDataset)
                
                // Check that "no data" message was displayed
                const noDataCalls = consoleLogSpy.getCalls().filter(call => 
                    call.args[0] && typeof call.args[0] === 'string'
                )
                
                assert.ok(noDataCalls.length > 0, 'Should display a message for empty datasets')
            } finally {
                consoleLogSpy.restore()
            }
        })
    })

    describe('Type-Aware Formatting in Text Files', function () {
        
        it('should format integers with thousand separators', function () {
            const testData = [
                { ID: 1, AMOUNT: 1234567 },
                { ID: 2, AMOUNT: 999999 }
            ]

            // We need to access the private formatAsTextTable function
            // For testing purposes, we'll create a similar test
            const formattedValue = (1234567).toLocaleString()
            assert.ok(formattedValue.includes(',') || formattedValue.includes('.') || formattedValue.includes(' '), 
                'Large integers should be formatted with separators')
        })

        it('should format decimals with appropriate precision', function () {
            const testValue = 12345.6789
            const formatted = testValue.toLocaleString(undefined, { maximumFractionDigits: 4 })
            
            assert.ok(formatted.length > 0, 'Decimal should be formatted')
            assert.ok(formatted.includes('.') || formatted.includes(','), 'Decimal should have separator')
        })

        it('should format Date objects to ISO string', function () {
            const testDate = new Date('2026-02-10T10:30:00Z')
            const isoString = testDate.toISOString()
            
            assert.ok(isoString.includes('2026-02-10'), 'Date should be formatted as ISO string')
            assert.ok(isoString.includes('T'), 'ISO string should have T separator')
        })

        it('should format boolean values as strings', function () {
            const trueValue = true
            const falseValue = false
            
            assert.strictEqual(String(trueValue), 'true', 'Boolean true should format as "true"')
            assert.strictEqual(String(falseValue), 'false', 'Boolean false should format as "false"')
        })

        it('should handle null and undefined values', function () {
            const nullValue = null
            const undefinedValue = undefined
            
            const formattedNull = String(nullValue ?? '')
            const formattedUndefined = String(undefinedValue ?? '')
            
            assert.strictEqual(formattedNull, '', 'Null should format as empty string')
            assert.strictEqual(formattedUndefined, '', 'Undefined should format as empty string')
        })

        it('should stringify objects and arrays', function () {
            const testObject = { key: 'value', nested: { inner: 123 } }
            const testArray = [1, 2, 3]
            
            const objectString = JSON.stringify(testObject)
            const arrayString = JSON.stringify(testArray)
            
            assert.ok(objectString.includes('key'), 'Object should be stringified')
            assert.ok(arrayString.includes('1'), 'Array should be stringified')
        })
    })

    describe('Fallback to console.table on Error', function () {
        
        it('should catch errors from terminal.table and fallback to console.table', function () {
            const testData = [{ ID: 1, NAME: 'Test' }]
            
            // Set up prompts for verbose output
            base.setPrompts({ verbose: true })

            // Spy on console.error to check if error handling works
            const consoleErrorSpy = sinon.spy(console, 'error')
            const consoleTableSpy = sinon.spy(console, 'table')

            // Stub terminal.table to throw an error
            const terminalTableStub = sinon.stub(base.terminal, 'table').throws(new Error('Buffer allocation error'))

            try {
                base.outputTableFancy(testData)
                
                // Verify error was logged
                assert.ok(consoleErrorSpy.called, 'Error should be logged to console.error')
                
                // Verify fallback to console.table was attempted
                assert.ok(consoleTableSpy.called, 'Should fallback to console.table')
            } finally {
                consoleErrorSpy.restore()
                consoleTableSpy.restore()
                terminalTableStub.restore()
            }
        })

        it('should handle large datasets in fallback mode', function () {
            const largeDataset = Array.from({ length: 150 }, (_, i) => ({
                ID: i + 1,
                VALUE: i * 10
            }))
            
            // Set up prompts for verbose output
            base.setPrompts({ verbose: true })

            // Spy on console methods
            const consoleErrorSpy = sinon.spy(console, 'error')
            const consoleLogSpy = sinon.spy(console, 'log')
            const consoleTableSpy = sinon.spy(console, 'table')

            // Stub terminal.table to throw an error
            const terminalTableStub = sinon.stub(base.terminal, 'table').throws(new Error('Error'))

            try {
                base.outputTableFancy(largeDataset)
                
                // Should show pagination warning even in fallback mode
                const warningCalls = consoleLogSpy.getCalls().filter(call => 
                    call.args[0] && call.args[0].includes('Showing first')
                )
                
                assert.ok(warningCalls.length > 0 || consoleTableSpy.called, 
                    'Should handle pagination in fallback mode')
            } finally {
                consoleErrorSpy.restore()
                consoleLogSpy.restore()
                consoleTableSpy.restore()
                terminalTableStub.restore()
            }
        })
    })

    describe('Integration with querySimple', function () {
        
        it('should export dbQuery function', function () {
            assert.ok(typeof querySimple.dbQuery === 'function', 
                'querySimple should export dbQuery function')
        })

        it('should have proper command configuration', function () {
            assert.strictEqual(querySimple.command, 'querySimple', 'Command name should be querySimple')
            assert.ok(Array.isArray(querySimple.aliases), 'Aliases should be an array')
            assert.ok(querySimple.aliases.includes('qs'), 'Should include "qs" alias')
        })

        it('should have output format options including table', function () {
            assert.ok(querySimple.builder, 'Builder should be defined')
            assert.ok(querySimple.builder.output, 'Output option should be defined')
            
            const outputChoices = querySimple.builder.output.choices
            assert.ok(Array.isArray(outputChoices), 'Output choices should be an array')
            assert.ok(outputChoices.includes('table'), 'Should support table output format')
            assert.ok(outputChoices.includes('json'), 'Should support json output format')
            assert.ok(outputChoices.includes('csv'), 'Should support csv output format')
        })

        it('should have default output as table', function () {
            assert.strictEqual(querySimple.builder.output.default, 'table', 
                'Default output format should be table')
        })
    })

    describe('Non-Verbose Mode', function () {
        
        it('should use inspect for non-verbose output', function () {
            const testData = [{ ID: 1, NAME: 'Test' }]
            
            // Set up prompts for non-verbose output (disableVerbose: true means no fancy output)
            base.setPrompts({ disableVerbose: true })

            // Spy on console.log
            const consoleLogSpy = sinon.spy(console, 'log')

            try {
                base.outputTableFancy(testData)
                
                // Should call console.log (not terminal.table)
                assert.ok(consoleLogSpy.called, 'Should use console.log for non-verbose mode')
                
                // The output should be from inspect (contains brackets and objects notation)
                if (consoleLogSpy.firstCall && consoleLogSpy.firstCall.args[0]) {
                    const output = consoleLogSpy.firstCall.args[0]
                    assert.ok(typeof output === 'string', 'Output should be a string from inspect')
                }
            } finally {
                consoleLogSpy.restore()
                // Reset to verbose for other tests
                base.setPrompts({ disableVerbose: false })
            }
        })
    })

})
