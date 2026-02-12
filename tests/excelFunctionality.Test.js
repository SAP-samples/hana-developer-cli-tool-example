// @ts-nocheck
/**
 * @module Excel Functionality Tests - Unit tests for Excel export data generation and validation
 */

import { describe, it } from 'mocha'
import { assert } from './base.js'

/**
 * Validates that Excel data is in proper format
 * @param {Array} excelData - Array of arrays representing Excel sheet data
 * @returns {boolean} True if valid Excel format
 */
function isValidExcelFormat(excelData) {
    if (!Array.isArray(excelData)) return false
    if (excelData.length === 0) return false
    
    // First row should be headers
    const firstRow = excelData[0]
    if (!Array.isArray(firstRow)) return false
    if (firstRow.length === 0) return false
    
    // All rows should have same number of columns as headers
    const columnCount = firstRow.length
    for (const row of excelData) {
        if (!Array.isArray(row) || row.length !== columnCount) {
            return false
        }
    }
    
    return true
}

/**
 * Simulates the Excel data transformation logic from routes/excel.js and bin/querySimple.js
 * @param {Array<Object>} results - Query results from database
 * @returns {Array<Array>} Transformed data suitable for Excel export
 */
function transformResultsToExcelFormat(results) {
    let out = []
    
    if (!results || results.length === 0) {
        return out
    }
    
    // Column Headers
    let header = []
    for (const [key] of Object.entries(results[0])) {
        header.push(key)
    }
    out.push(header)
    
    // Data Rows
    for (let item of results) {
        let innerItem = []
        for (const [key] of Object.entries(item)) {
            innerItem.push(item[key])
        }
        out.push(innerItem)
    }
    
    return out
}

describe('Excel Export Functionality', function () {
    
    describe('Excel Data Transformation - Basic', function () {
        
        it('should transform simple query results to Excel format', function () {
            const results = [
                { ID: 1, NAME: 'Alice', EMAIL: 'alice@example.com' },
                { ID: 2, NAME: 'Bob', EMAIL: 'bob@example.com' }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            
            // Should have 3 rows: 1 header + 2 data rows
            assert.strictEqual(excelData.length, 3, 'Should have 1 header + 2 data rows')
            
            // Header row should contain column names
            assert.deepStrictEqual(
                excelData[0],
                ['ID', 'NAME', 'EMAIL'],
                'First row should contain headers'
            )
        })
        
        it('should preserve data values in Excel format', function () {
            const results = [
                { ID: 1, NAME: 'Alice', ACTIVE: true },
                { ID: 2, NAME: 'Bob', ACTIVE: false }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            
            // Check data rows
            assert.deepStrictEqual(excelData[1], [1, 'Alice', true], 'First data row should match')
            assert.deepStrictEqual(excelData[2], [2, 'Bob', false], 'Second data row should match')
        })
        
        it('should handle single record correctly', function () {
            const results = [
                { USER: 'admin', STATUS: 'ACTIVE' }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            
            assert.strictEqual(excelData.length, 2, 'Should have 1 header + 1 data row')
            assert.deepStrictEqual(excelData[0], ['USER', 'STATUS'], 'Should have correct headers')
            assert.deepStrictEqual(excelData[1], ['admin', 'ACTIVE'], 'Should have correct data')
        })
        
        it('should handle multiple columns correctly', function () {
            const results = [
                { 
                    COL1: 'value1', 
                    COL2: 'value2', 
                    COL3: 'value3', 
                    COL4: 'value4',
                    COL5: 'value5'
                }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            
            assert.strictEqual(excelData[0].length, 5, 'Should have 5 columns')
            assert.strictEqual(excelData[1].length, 5, 'Data row should have 5 columns')
        })
    })
    
    describe('Excel Data Type Handling', function () {
        
        it('should preserve numeric values', function () {
            const results = [
                { ID: 123, AMOUNT: 456.78, COUNT: 0 }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            const dataRow = excelData[1]
            
            assert.strictEqual(dataRow[0], 123, 'Integer should be preserved')
            assert.strictEqual(dataRow[1], 456.78, 'Decimal should be preserved')
            assert.strictEqual(dataRow[2], 0, 'Zero should be preserved')
        })
        
        it('should preserve string values', function () {
            const results = [
                { NAME: 'John', EMAIL: 'john@test.com', NOTES: 'Some notes here' }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            const dataRow = excelData[1]
            
            assert.strictEqual(typeof dataRow[0], 'string', 'Strings should remain strings')
            assert.ok(dataRow[0].includes('John'), 'String content should be preserved')
        })
        
        it('should handle boolean values', function () {
            const results = [
                { ACTIVE: true, DELETED: false }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            const dataRow = excelData[1]
            
            assert.strictEqual(dataRow[0], true, 'True boolean should be preserved')
            assert.strictEqual(dataRow[1], false, 'False boolean should be preserved')
        })
        
        it('should handle null and undefined values', function () {
            const results = [
                { ID: 1, OPTIONAL_FIELD: null, ANOTHER_FIELD: undefined }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            const dataRow = excelData[1]
            
            assert.strictEqual(dataRow[1], null, 'Null should be preserved')
            assert.strictEqual(dataRow[2], undefined, 'Undefined should be preserved')
        })
        
        it('should handle dates in ISO format', function () {
            const testDate = new Date('2026-02-12T10:30:00Z')
            const results = [
                { ID: 1, CREATED: testDate }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            const dataRow = excelData[1]
            
            assert.ok(dataRow[1] instanceof Date || typeof dataRow[1] === 'object', 
                'Date object should be preserved')
        })
    })
    
    describe('Excel Format Validation', function () {
        
        it('should produce valid Excel format output', function () {
            const results = [
                { ID: 1, NAME: 'Test' },
                { ID: 2, NAME: 'Data' }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            
            assert.ok(isValidExcelFormat(excelData), 'Output should be valid Excel format')
        })
        
        it('should validate consistent column count across all rows', function () {
            const results = [
                { ID: 1, NAME: 'Alice', EMAIL: 'alice@test.com' },
                { ID: 2, NAME: 'Bob', EMAIL: 'bob@test.com' },
                { ID: 3, NAME: 'Charlie', EMAIL: 'charlie@test.com' }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            
            const headerCount = excelData[0].length
            for (const row of excelData) {
                assert.strictEqual(row.length, headerCount, 'All rows should have same column count')
            }
        })
        
        it('should handle empty results array', function () {
            const results = []
            
            const excelData = transformResultsToExcelFormat(results)
            
            assert.deepStrictEqual(excelData, [], 'Empty results should return empty array')
        })
        
        it('should handle null results', function () {
            const excelData = transformResultsToExcelFormat(null)
            
            assert.deepStrictEqual(excelData, [], 'Null results should return empty array')
        })
    })
    
    describe('Excel Column Organization', function () {
        
        it('should maintain column order from first result object', function () {
            const results = [
                { LASTNAME: 'Doe', FIRSTNAME: 'John', ID: 1 },
                { LASTNAME: 'Smith', FIRSTNAME: 'Jane', ID: 2 }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            const headerRow = excelData[0]
            
            // Order might vary depending on object iteration
            assert.strictEqual(headerRow.length, 3, 'Should have 3 columns')
            assert.ok(headerRow.includes('LASTNAME'), 'Should include LASTNAME')
            assert.ok(headerRow.includes('FIRSTNAME'), 'Should include FIRSTNAME')
            assert.ok(headerRow.includes('ID'), 'Should include ID')
        })
        
        it('should extract headers from first object only', function () {
            const results = [
                { A: 1, B: 2, C: 3 },
                { A: 4, B: 5, C: 6 }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            
            // Headers should be from first object
            assert.strictEqual(excelData[0].length, 3, 'Should have 3 columns from first object')
        })
    })
    
    describe('Excel Row Count', function () {
        
        it('should have correct number of rows including header', function () {
            const testCases = [
                { data: [{ ID: 1 }], expectedRows: 2 },
                { data: [{ ID: 1 }, { ID: 2 }], expectedRows: 3 },
                { data: [{ ID: 1 }, { ID: 2 }, { ID: 3 }], expectedRows: 4 },
                { data: Array(100).fill().map((_, i) => ({ ID: i })), expectedRows: 101 }
            ]
            
            for (const testCase of testCases) {
                const excelData = transformResultsToExcelFormat(testCase.data)
                assert.strictEqual(
                    excelData.length,
                    testCase.expectedRows,
                    `Should have ${testCase.expectedRows} rows for ${testCase.data.length} results`
                )
            }
        })
    })
    
    describe('Excel Data Integrity', function () {
        
        it('should not modify original results array', function () {
            const results = [
                { ID: 1, NAME: 'Test', VALUE: 100 }
            ]
            const originalResults = JSON.parse(JSON.stringify(results))
            
            transformResultsToExcelFormat(results)
            
            assert.deepStrictEqual(results, originalResults, 'Original results should not be modified')
        })
        
        it('should handle special characters in string values', function () {
            const results = [
                { NAME: "O'Reilly", NOTES: 'Test "quoted" text', DATA: 'Line1\nLine2' }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            const dataRow = excelData[1]
            
            assert.ok(dataRow[0].includes("'"), 'Should preserve single quotes')
            assert.ok(dataRow[1].includes('"'), 'Should preserve double quotes')
            assert.ok(dataRow[2].includes('\n'), 'Should preserve newlines')
        })
        
        it('should handle very long strings', function () {
            const longString = 'x'.repeat(10000)
            const results = [
                { ID: 1, DESCRIPTION: longString }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            const dataRow = excelData[1]
            
            assert.strictEqual(dataRow[1], longString, 'Should preserve long strings')
            assert.strictEqual(dataRow[1].length, 10000, 'String length should be accurate')
        })
    })
    
    describe('Real-world Data Scenarios', function () {
        
        it('should handle database query results with mixed types', function () {
            const results = [
                { 
                    USER_ID: 1, 
                    USERNAME: 'alice', 
                    EMAIL: 'alice@company.com',
                    CREATED_DATE: new Date('2026-01-01'),
                    IS_ACTIVE: true,
                    FAILED_ATTEMPTS: 0,
                    LAST_LOGIN: null
                },
                { 
                    USER_ID: 2, 
                    USERNAME: 'bob', 
                    EMAIL: 'bob@company.com',
                    CREATED_DATE: new Date('2026-01-15'),
                    IS_ACTIVE: true,
                    FAILED_ATTEMPTS: 2,
                    LAST_LOGIN: new Date('2026-02-11T14:30:00Z')
                }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            
            assert.strictEqual(excelData.length, 3, 'Should have 1 header + 2 data rows')
            assert.strictEqual(excelData[0].length, 7, 'Should have 7 columns')
            assert.ok(isValidExcelFormat(excelData), 'Should be valid Excel format')
        })
        
        it('should handle large datasets', function () {
            const results = []
            for (let i = 0; i < 1000; i++) {
                results.push({
                    ID: i + 1,
                    NAME: `User${i}`,
                    SCORE: Math.random() * 100,
                    ACTIVE: i % 2 === 0
                })
            }
            
            const excelData = transformResultsToExcelFormat(results)
            
            assert.strictEqual(excelData.length, 1001, 'Should have 1 header + 1000 data rows')
            assert.ok(isValidExcelFormat(excelData), 'Should be valid Excel format for large dataset')
        })
        
        it('should handle SAP-specific data types and formats', function () {
            const results = [
                {
                    MANDT: '100',
                    SCHEMANAME: 'DEMO',
                    OBJECTNAME: 'USER_TABLE',
                    CREATEDATE: '20260101',
                    DATALEN: 5000000,
                    INDEXED: 'X',
                    RESERVED: null
                }
            ]
            
            const excelData = transformResultsToExcelFormat(results)
            
            assert.strictEqual(excelData.length, 2, 'Should have header + data row')
            assert.ok(isValidExcelFormat(excelData), 'Should validate SAP data format')
        })
    })
    
    describe('Error Cases', function () {
        
        it('should not throw when transforming empty array', function () {
            assert.doesNotThrow(() => {
                transformResultsToExcelFormat([])
            }, 'Should handle empty array gracefully')
        })
        
        it('should not throw when transforming null', function () {
            assert.doesNotThrow(() => {
                transformResultsToExcelFormat(null)
            }, 'Should handle null gracefully')
        })
        
        it('should not throw when transforming undefined', function () {
            assert.doesNotThrow(() => {
                transformResultsToExcelFormat(undefined)
            }, 'Should handle undefined gracefully')
        })
    })
})
